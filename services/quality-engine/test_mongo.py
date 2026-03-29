import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    c = AsyncIOMotorClient('mongodb://datasonar:datasonar_secret@localhost:27018/datasonar?authSource=admin', serverSelectionTimeoutMS=5000)
    try:
        res = await c.admin.command('ping')
        print("Connected:", res)
    except Exception as e:
        print("Error:", e)
    finally:
        c.close()

asyncio.run(test())
