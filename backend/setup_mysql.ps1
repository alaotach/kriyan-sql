# Kriyan AI - MySQL Setup Script for Windows
# Run this script after installing MySQL

Write-Host "🚀 Kriyan AI - MySQL Setup" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is installed
Write-Host "Checking MySQL installation..." -ForegroundColor Yellow
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlPath) {
    Write-Host "❌ MySQL not found! Please install MySQL first." -ForegroundColor Red
    Write-Host "Download from: https://dev.mysql.com/downloads/installer/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ MySQL found at: $($mysqlPath.Source)" -ForegroundColor Green
Write-Host ""

# Get MySQL credentials
Write-Host "MySQL Configuration" -ForegroundColor Cyan
$mysqlUser = Read-Host "MySQL username (default: root)"
if ([string]::IsNullOrWhiteSpace($mysqlUser)) { $mysqlUser = "root" }

$mysqlPassword = Read-Host "MySQL password" -AsSecureString
$mysqlPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword))

$dbName = "kriyan_ai"

# Create database
Write-Host ""
Write-Host "Creating database '$dbName'..." -ForegroundColor Yellow
$createDbCmd = "CREATE DATABASE IF NOT EXISTS $dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
$createDbCmd | mysql -u $mysqlUser -p"$mysqlPasswordPlain" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database created successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database might already exist or there was an error" -ForegroundColor Yellow
}

# Initialize schema
Write-Host ""
Write-Host "Initializing database schema..." -ForegroundColor Yellow
$schemaPath = Join-Path $PSScriptRoot "schema.sql"

if (Test-Path $schemaPath) {
    Get-Content $schemaPath | mysql -u $mysqlUser -p"$mysqlPasswordPlain" $dbName 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Schema initialized successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to initialize schema" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ schema.sql not found at: $schemaPath" -ForegroundColor Red
    exit 1
}

# Create .env file
Write-Host ""
Write-Host "Creating .env configuration file..." -ForegroundColor Yellow
$envContent = @"
# AI Provider Configuration
USE_HACKCLUB=false
HACKCLUB_API_KEY=

# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=$mysqlUser
MYSQL_PASSWORD=$mysqlPasswordPlain
MYSQL_DATABASE=$dbName
"@

$envPath = Join-Path $PSScriptRoot ".env"
$envContent | Out-File -FilePath $envPath -Encoding UTF8

Write-Host "✅ .env file created" -ForegroundColor Green

# Install Python dependencies
Write-Host ""
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
$pythonPath = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonPath) {
    Write-Host "❌ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Python dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Test database connection
Write-Host ""
Write-Host "Testing database connection..." -ForegroundColor Yellow
$testPython = @"
import os
os.environ['MYSQL_HOST'] = 'localhost'
os.environ['MYSQL_PORT'] = '3306'
os.environ['MYSQL_USER'] = '$mysqlUser'
os.environ['MYSQL_PASSWORD'] = '$mysqlPasswordPlain'
os.environ['MYSQL_DATABASE'] = '$dbName'

try:
    import pymysql
    connection = pymysql.connect(
        host='localhost',
        user='$mysqlUser',
        password='$mysqlPasswordPlain',
        database='$dbName'
    )
    print('✅ Connection successful!')
    connection.close()
except Exception as e:
    print(f'❌ Connection failed: {e}')
    exit(1)
"@

$testPython | python

# Summary
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database: $dbName" -ForegroundColor White
Write-Host "User: $mysqlUser" -ForegroundColor White
Write-Host "Host: localhost:3306" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the backend: python main.py" -ForegroundColor White
Write-Host "2. Start the frontend: cd .. ; npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Documentation: README_MYSQL.md" -ForegroundColor Yellow
Write-Host "Migration info: ../MIGRATION_COMPLETE.md" -ForegroundColor Yellow
Write-Host ""
