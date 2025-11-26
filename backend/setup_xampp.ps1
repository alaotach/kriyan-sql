# XAMPP MariaDB Setup for Kriyan AI

Write-Host "🚀 Kriyan AI - XAMPP MariaDB Setup" -ForegroundColor Cyan
Write-Host ""

# Check if XAMPP MySQL/MariaDB is running
Write-Host "Checking XAMPP MariaDB..." -ForegroundColor Yellow
$xamppMysql = Get-Process "mysqld" -ErrorAction SilentlyContinue
if (-not $xamppMysql) {
    Write-Host "⚠️  MariaDB is not running. Please start it from XAMPP Control Panel." -ForegroundColor Yellow
    Write-Host "   1. Open XAMPP Control Panel" -ForegroundColor White
    Write-Host "   2. Click 'Start' next to MySQL" -ForegroundColor White
    Write-Host "   3. Re-run this script" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Press Enter to continue anyway or Ctrl+C to exit"
}

# XAMPP default settings
$mysqlUser = "root"
$mysqlPassword = ""  # XAMPP default is empty password
$dbName = "kriyan_ai"
$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"

# Check if mysql.exe exists
if (-not (Test-Path $mysqlPath)) {
    Write-Host "⚠️  MySQL not found at default XAMPP location" -ForegroundColor Yellow
    Write-Host "Looking for mysql.exe..." -ForegroundColor Yellow
    
    # Try to find mysql in PATH
    $mysqlCmd = Get-Command mysql -ErrorAction SilentlyContinue
    if ($mysqlCmd) {
        $mysqlPath = $mysqlCmd.Source
        Write-Host "✅ Found MySQL at: $mysqlPath" -ForegroundColor Green
    } else {
        Write-Host "❌ Could not find mysql.exe" -ForegroundColor Red
        Write-Host "Please ensure XAMPP is installed correctly" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "✅ Using MySQL at: $mysqlPath" -ForegroundColor Green
Write-Host ""

# Create database
Write-Host "Creating database '$dbName'..." -ForegroundColor Yellow
$createDbCmd = "CREATE DATABASE IF NOT EXISTS $dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

try {
    if ([string]::IsNullOrEmpty($mysqlPassword)) {
        echo $createDbCmd | & $mysqlPath -u $mysqlUser 2>&1 | Out-Null
    } else {
        echo $createDbCmd | & $mysqlPath -u $mysqlUser -p"$mysqlPassword" 2>&1 | Out-Null
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Database might already exist" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to create database: $_" -ForegroundColor Red
    exit 1
}

# Initialize schema
Write-Host ""
Write-Host "Initializing database schema..." -ForegroundColor Yellow
$schemaPath = Join-Path $PSScriptRoot "schema.sql"

if (-not (Test-Path $schemaPath)) {
    Write-Host "❌ schema.sql not found at: $schemaPath" -ForegroundColor Red
    exit 1
}

try {
    if ([string]::IsNullOrEmpty($mysqlPassword)) {
        Get-Content $schemaPath | & $mysqlPath -u $mysqlUser $dbName 2>&1 | Out-Null
    } else {
        Get-Content $schemaPath | & $mysqlPath -u $mysqlUser -p"$mysqlPassword" $dbName 2>&1 | Out-Null
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Schema initialized successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to initialize schema" -ForegroundColor Red
        Write-Host "You can manually run: mysql -u root kriyan_ai < schema.sql" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Failed to initialize schema: $_" -ForegroundColor Red
    exit 1
}

# Create .env file
Write-Host ""
Write-Host "Creating .env configuration file..." -ForegroundColor Yellow
$envContent = @"
# AI Provider Configuration
USE_HACKCLUB=false
HACKCLUB_API_KEY=

# MySQL Database Configuration (XAMPP MariaDB)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=kriyan_ai
"@

$envPath = Join-Path $PSScriptRoot ".env"
$envContent | Out-File -FilePath $envPath -Encoding UTF8 -Force

Write-Host "✅ .env file created" -ForegroundColor Green

# Install Python dependencies
Write-Host ""
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
$pythonPath = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonPath) {
    Write-Host "❌ Python not found! Please install Python 3.8+" -ForegroundColor Red
    Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Using Python: $($pythonPath.Source)" -ForegroundColor White

try {
    pip install -r requirements.txt --quiet
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Some dependencies may have failed to install" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to install dependencies: $_" -ForegroundColor Red
}

# Test database connection
Write-Host ""
Write-Host "Testing database connection..." -ForegroundColor Yellow

$testScript = @"
import os
import sys

os.environ['MYSQL_HOST'] = 'localhost'
os.environ['MYSQL_PORT'] = '3306'
os.environ['MYSQL_USER'] = 'root'
os.environ['MYSQL_PASSWORD'] = ''
os.environ['MYSQL_DATABASE'] = 'kriyan_ai'

try:
    import pymysql
    connection = pymysql.connect(
        host='localhost',
        port=3306,
        user='root',
        password='',
        database='kriyan_ai',
        charset='utf8mb4'
    )
    cursor = connection.cursor()
    cursor.execute('SELECT COUNT(*) FROM users')
    cursor.close()
    connection.close()
    print('✅ Database connection successful!')
    print('✅ Tables verified!')
    sys.exit(0)
except Exception as e:
    print(f'❌ Connection test failed: {e}')
    sys.exit(1)
"@

$testScript | python
$testSuccess = $LASTEXITCODE -eq 0

# Summary
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
if ($testSuccess) {
    Write-Host "🎉 Setup Complete!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Setup Completed with Warnings" -ForegroundColor Yellow
}
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database: $dbName" -ForegroundColor White
Write-Host "User: $mysqlUser" -ForegroundColor White
Write-Host "Password: (empty - XAMPP default)" -ForegroundColor White
Write-Host "Host: localhost:3306" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure XAMPP MySQL is running" -ForegroundColor White
Write-Host "2. Start the backend: python main.py" -ForegroundColor White
Write-Host "3. Start the frontend: cd .. ; npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Useful XAMPP commands:" -ForegroundColor Cyan
Write-Host "- Access phpMyAdmin: http://localhost/phpmyadmin" -ForegroundColor White
Write-Host "- View database: mysql -u root kriyan_ai" -ForegroundColor White
Write-Host ""
Write-Host "Documentation: README_MYSQL.md" -ForegroundColor Yellow
Write-Host ""
