"""
Quick database viewer
Run: python view_db.py
"""
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

# Connect to database
conn = pymysql.connect(
    host=os.getenv('MYSQL_HOST', 'localhost'),
    port=int(os.getenv('MYSQL_PORT', '3306')),
    user=os.getenv('MYSQL_USER', 'root'),
    password=os.getenv('MYSQL_PASSWORD', ''),
    database=os.getenv('MYSQL_DATABASE', 'kriyan_ai'),
    charset='utf8mb4'
)

cursor = conn.cursor()

print("=" * 60)
print("📊 KRIYAN AI DATABASE")
print("=" * 60)

# Show all tables
cursor.execute("SHOW TABLES")
tables = cursor.fetchall()
print(f"\n📋 Tables in database:")
for table in tables:
    print(f"  - {table[0]}")

# Show counts for each table
print(f"\n📈 Record counts:")
for table in tables:
    table_name = table[0]
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    count = cursor.fetchone()[0]
    print(f"  {table_name}: {count} records")

# Show users
print(f"\n👥 USERS:")
cursor.execute("SELECT id, email, display_name, subscription, created_at FROM users")
users = cursor.fetchall()
if users:
    for user in users:
        print(f"  - {user[2]} ({user[1]}) - {user[3]} - Created: {user[4]}")
else:
    print("  (no users yet)")

# Show conversations
print(f"\n💬 CONVERSATIONS:")
cursor.execute("SELECT id, user_id, persona_name, title, created_at FROM conversations ORDER BY created_at DESC LIMIT 10")
convs = cursor.fetchall()
if convs:
    for conv in convs:
        print(f"  - [{conv[2]}] {conv[3][:50]}... - {conv[4]}")
else:
    print("  (no conversations yet)")

# Show recent messages
print(f"\n📝 RECENT MESSAGES:")
cursor.execute("SELECT role, content, created_at FROM messages ORDER BY created_at DESC LIMIT 5")
msgs = cursor.fetchall()
if msgs:
    for msg in msgs:
        content = msg[1][:60] + "..." if len(msg[1]) > 60 else msg[1]
        print(f"  [{msg[0]}] {content} - {msg[2]}")
else:
    print("  (no messages yet)")

# Show memories
print(f"\n🧠 USER MEMORIES:")
cursor.execute("SELECT content, category, created_at FROM user_memories ORDER BY created_at DESC LIMIT 5")
mems = cursor.fetchall()
if mems:
    for mem in mems:
        print(f"  [{mem[1]}] {mem[0][:60]}... - {mem[2]}")
else:
    print("  (no memories yet)")

print("\n" + "=" * 60)

cursor.close()
conn.close()
