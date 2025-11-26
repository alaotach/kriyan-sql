"""
MySQL Database Utilities
"""
import os
import aiomysql
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
import uuid
from datetime import datetime

# Database configuration from environment
DB_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'port': int(os.getenv('MYSQL_PORT', '3306')),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'db': os.getenv('MYSQL_DATABASE', 'kriyan_ai'),
    'autocommit': True,
    'charset': 'utf8mb4',
}

# Connection pool
_pool: Optional[aiomysql.Pool] = None

async def init_db_pool():
    """Initialize database connection pool"""
    global _pool
    if _pool is None:
        _pool = await aiomysql.create_pool(
            minsize=1,
            maxsize=10,
            **DB_CONFIG
        )
        print(f"✅ MySQL connection pool created: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['db']}")

async def close_db_pool():
    """Close database connection pool"""
    global _pool
    if _pool:
        _pool.close()
        await _pool.wait_closed()
        _pool = None
        print("✅ MySQL connection pool closed")

@asynccontextmanager
async def get_db_connection():
    """Get database connection from pool"""
    if _pool is None:
        await init_db_pool()
    
    async with _pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            yield cursor
            await conn.commit()

# ============ USER FUNCTIONS ============

async def create_user(user_id: str, email: str, display_name: str, photo_url: Optional[str] = None):
    """Create a new user"""
    async with get_db_connection() as cursor:
        await cursor.execute(
            """INSERT INTO users (id, email, display_name, photo_url, subscription)
               VALUES (%s, %s, %s, %s, 'free')
               ON DUPLICATE KEY UPDATE 
               display_name = VALUES(display_name),
               photo_url = VALUES(photo_url),
               updated_at = CURRENT_TIMESTAMP""",
            (user_id, email, display_name, photo_url)
        )

async def get_user(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    async with get_db_connection() as cursor:
        await cursor.execute(
            "SELECT * FROM users WHERE id = %s",
            (user_id,)
        )
        return await cursor.fetchone()

async def update_user(user_id: str, updates: Dict[str, Any]):
    """Update user profile"""
    if not updates:
        return
    
    set_clause = ", ".join([f"{key} = %s" for key in updates.keys()])
    query = f"UPDATE users SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
    
    async with get_db_connection() as cursor:
        await cursor.execute(query, (*updates.values(), user_id))

# ============ CONVERSATION FUNCTIONS ============

async def create_conversation(
    user_id: str,
    persona_name: str,
    title: str,
    model: str,
    encrypted: bool = False
) -> str:
    """Create a new conversation"""
    conversation_id = str(uuid.uuid4())
    
    async with get_db_connection() as cursor:
        await cursor.execute(
            """INSERT INTO conversations (id, user_id, persona_name, title, model, encrypted)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (conversation_id, user_id, persona_name, title, model, encrypted)
        )
    
    return conversation_id

async def get_conversation(conversation_id: str) -> Optional[Dict[str, Any]]:
    """Get conversation by ID"""
    async with get_db_connection() as cursor:
        await cursor.execute(
            "SELECT * FROM conversations WHERE id = %s",
            (conversation_id,)
        )
        return await cursor.fetchone()

async def get_user_conversations(user_id: str) -> List[Dict[str, Any]]:
    """Get all conversations for a user"""
    async with get_db_connection() as cursor:
        await cursor.execute(
            """SELECT * FROM conversations 
               WHERE user_id = %s 
               ORDER BY updated_at DESC""",
            (user_id,)
        )
        return await cursor.fetchall()

async def update_conversation(conversation_id: str, updates: Dict[str, Any]):
    """Update conversation"""
    if not updates:
        return
    
    set_clause = ", ".join([f"{key} = %s" for key in updates.keys()])
    query = f"UPDATE conversations SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
    
    async with get_db_connection() as cursor:
        await cursor.execute(query, (*updates.values(), conversation_id))

async def delete_conversation(conversation_id: str):
    """Delete conversation and its messages"""
    async with get_db_connection() as cursor:
        await cursor.execute(
            "DELETE FROM conversations WHERE id = %s",
            (conversation_id,)
        )

# ============ MESSAGE FUNCTIONS ============

async def add_message(
    conversation_id: str,
    role: str,
    content: str,
    encrypted: bool = False
) -> str:
    """Add a message to a conversation"""
    message_id = str(uuid.uuid4())
    
    async with get_db_connection() as cursor:
        await cursor.execute(
            """INSERT INTO messages (id, conversation_id, role, content, encrypted)
               VALUES (%s, %s, %s, %s, %s)""",
            (message_id, conversation_id, role, content, encrypted)
        )
        
        # Update conversation timestamp
        await cursor.execute(
            "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = %s",
            (conversation_id,)
        )
    
    return message_id

async def get_conversation_messages(conversation_id: str) -> List[Dict[str, Any]]:
    """Get all messages for a conversation"""
    async with get_db_connection() as cursor:
        await cursor.execute(
            """SELECT * FROM messages 
               WHERE conversation_id = %s 
               ORDER BY created_at ASC""",
            (conversation_id,)
        )
        return await cursor.fetchall()

async def delete_conversation_messages(conversation_id: str):
    """Delete all messages for a conversation"""
    async with get_db_connection() as cursor:
        await cursor.execute(
            "DELETE FROM messages WHERE conversation_id = %s",
            (conversation_id,)
        )

# ============ MEMORY FUNCTIONS ============

async def create_memory(user_id: str, content: str, category: str = 'general') -> str:
    """Create a new user memory"""
    memory_id = str(uuid.uuid4())
    
    async with get_db_connection() as cursor:
        await cursor.execute(
            """INSERT INTO user_memories (id, user_id, content, category)
               VALUES (%s, %s, %s, %s)""",
            (memory_id, user_id, content, category)
        )
    
    return memory_id

async def get_user_memories(user_id: str) -> List[Dict[str, Any]]:
    """Get all memories for a user"""
    async with get_db_connection() as cursor:
        await cursor.execute(
            """SELECT * FROM user_memories 
               WHERE user_id = %s 
               ORDER BY updated_at DESC""",
            (user_id,)
        )
        return await cursor.fetchall()

async def update_memory(memory_id: str, content: str):
    """Update a memory"""
    async with get_db_connection() as cursor:
        await cursor.execute(
            """UPDATE user_memories 
               SET content = %s, updated_at = CURRENT_TIMESTAMP 
               WHERE id = %s""",
            (content, memory_id)
        )

async def delete_memory(memory_id: str):
    """Delete a memory"""
    async with get_db_connection() as cursor:
        await cursor.execute(
            "DELETE FROM user_memories WHERE id = %s",
            (memory_id,)
        )

# ============ SETTINGS FUNCTIONS ============

async def get_user_settings(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user settings"""
    async with get_db_connection() as cursor:
        await cursor.execute(
            "SELECT * FROM user_settings WHERE user_id = %s",
            (user_id,)
        )
        result = await cursor.fetchone()
        
        # Create default settings if not exists
        if not result:
            await cursor.execute(
                """INSERT INTO user_settings (user_id, memory_enabled)
                   VALUES (%s, FALSE)""",
                (user_id,)
            )
            return {'user_id': user_id, 'memory_enabled': False, 'theme': 'dark'}
        
        return result

async def update_user_settings(user_id: str, settings: Dict[str, Any]):
    """Update user settings"""
    if not settings:
        return
    
    # Ensure settings exist first
    await get_user_settings(user_id)
    
    set_clause = ", ".join([f"{key} = %s" for key in settings.keys()])
    query = f"UPDATE user_settings SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = %s"
    
    async with get_db_connection() as cursor:
        await cursor.execute(query, (*settings.values(), user_id))
