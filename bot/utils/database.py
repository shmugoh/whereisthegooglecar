import asyncpg

class DatabaseManager:
    def __init__(self, *, connection: asyncpg.Connection) -> None:
        self.database = connection
    
    async def add_channel(self, id: int, type: str) -> None:
        await self.database.execute("INSERT INTO channel (id, type) VALUES ($1, $2)", id, type)
        
    async def remove_channel(self, id: int) -> None:
        return await self.database.execute("DELETE FROM channel WHERE id=$1", id)
        
    async def get_channels(self) -> dict:
        return await self.database.fetchrow("SELECT * FROM channel")

    # async def add_warn(
    #     self, user_id: int, server_id: int, moderator_id: int, reason: str
    # ) -> int:
    #     result = await self.connection.fetch(
    #         "SELECT id FROM warns WHERE user_id=$1 AND server_id=$2 ORDER BY id DESC LIMIT 1",
    #         user_id,
    #         server_id,
    #     )
    #     warn_id = result[0]['id'] + 1 if result else 1
    #     await self.connection.execute(
    #         "INSERT INTO warns(id, user_id, server_id, moderator_id, reason) VALUES ($1, $2, $3, $4, $5)",
    #         warn_id,
    #         user_id,
    #         server_id,
    #         moderator_id,
    #         reason,
    #     )
    #     return warn_id

    # async def remove_warn(self, warn_id: int, user_id: int, server_id: int) -> int:
    #     await self.connection.execute(
    #         "DELETE FROM warns WHERE id=$1 AND user_id=$2 AND server_id=$3",
    #         warn_id,
    #         user_id,
    #         server_id,
    #     )
    #     result = await self.connection.fetchval(
    #         "SELECT COUNT(*) FROM warns WHERE user_id=$1 AND server_id=$2",
    #         user_id,
    #         server_id,
    #     )
    #     return result if result is not None else 0

    # async def get_warnings(self, user_id: int, server_id: int) -> list:
    #     result = await self.connection.fetch(
    #         "SELECT user_id, server_id, moderator_id, reason, EXTRACT(EPOCH FROM created_at), id FROM warns WHERE user_id=$1 AND server_id=$2",
    #         user_id,
    #         server_id,
    #     )
    #     return [dict(row) for row in result]