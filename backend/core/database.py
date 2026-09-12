import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Production Logging Setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("Database")

# Load environment variables securely
load_dotenv()

class Database:
    """Singleton Database Pattern for Connection Pooling"""
    client: AsyncIOMotorClient = None

    @classmethod
    def connect_db(cls):
        uri = os.getenv("MONGO_URI")
        if not uri or "REPLACE_WITH_YOUR_PASSWORD" in uri:
            logger.error("CRITICAL: MONGO_URI missing or password not updated in backend/.env!")
            return
        
        logger.info("Initializing MongoDB Connection Pool...")
        # Production connection settings
        cls.client = AsyncIOMotorClient(
            uri,
            maxPoolSize=50,
            minPoolSize=10,
            serverSelectionTimeoutMS=5000
        )
        logger.info("MongoDB Connection Pool established successfully.")

    @classmethod
    def close_db(cls):
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connections closed securely.")

    @classmethod
    def get_db(cls):
        if cls.client is None:
            cls.connect_db()
        return cls.client.rail_samay

# Dependency Injection function for FastAPI
def get_database():
    return Database.get_db()
