import asyncpg
from datetime import datetime
from upstash_redis import Redis

class DatabaseManager:
    """
    A class that manages the database operations for the bot.

    Args:
        connection (asyncpg.Connection): The connection to the database.
        redis (Redis): The connection to the Redis database.

    Attributes:
        database (asyncpg.Connection): The connection to the database.
        redis (Redis): The connection to the Redis database.

    """

    def __init__(self, *, connection: asyncpg.Connection, redis: Redis) -> None:
        self.database = connection
        self.redis = redis
    
    # 
    # -- Channel Management --
    #
    async def add_channel(self, id: int, type: str, company: str) -> None:
        await self.database.execute("INSERT INTO channel (id, type, company) VALUES ($1, $2, $3)", id, type, company)
        
    async def remove_channel(self, id: int) -> None:
        return await self.database.execute("DELETE FROM channel WHERE id=$1", id)
        
    async def get_channels(self) -> dict:
        return await self.database.fetch("SELECT * FROM channel")
        
    #
    # -- Submission Management --
    ##
    
    async def add_submission(
        self,
        message_id: int,
        date: datetime,
        town: str,
        country: str,
        imageUrl: str | None,
        sourceUrl: str,
        locationUrl: str,
        company: str,
        mode: str,
    ) -> None:
        """
        Add a new submission to the database
        """
        # add to database
        await self.database.execute(
            "INSERT INTO submissions (date, town, country, \"imageUrl\", \"sourceUrl\", \"locationUrl\", mode, company, message_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
            date,
            town,
            country,
            imageUrl,
            sourceUrl,
            locationUrl,
            mode,
            company,
            message_id
        )
        
    async def edit_submission(self, id: int, **kwargs) -> None:
        """
        Edit a submission record in the database.
        """
        columns = kwargs.keys()
        values = kwargs.values()
        query = "UPDATE submissions SET " + ", ".join(f"\"{column}\"=${i+1}" for i, column in enumerate(columns)) + " WHERE message_id=$" + str(len(columns) + 1)
        await self.database.execute(query, *values, id)

    async def delete_submission(self, id: int) -> None:
        """
        Delete a submission record in the database.
        """
        await self.database.execute("DELETE FROM submissions WHERE message_id=$1", id)
        
    async def get_submission(self, id: int) -> None:
        return await self.database.fetchrow("SELECT * FROM submissions WHERE message_id=$1", id)
        
    #
    # -- Spotting Management --
    #
    async def add_spotting(
        self,
        message_id: int,
        channel_id: int,
        date: datetime,
        town: str,
        country: str,
        countryEmoji: str,
        imageUrl: str,
        sourceUrl: str,
        locationUrl: str,
        company: str,
        width: int,
        height: int,
    ) -> None:
        """
        Add a new spotting to the database.
        """
        
        # add to database
        await self.database.execute(
            "INSERT INTO spottings (message_id, channel_id, date, town, country, \"countryEmoji\", \"imageUrl\", \"sourceUrl\", \"locationUrl\", company, width, height) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
            str(message_id),
            channel_id,
            date,
            town,
            country,
            countryEmoji,
            imageUrl,
            sourceUrl,
            locationUrl,
            company,
            width,
            height,
        )

        # remove month data from cache (redis)
        self.clear_cache_month(company, date)
        
    async def update_spotting(self, id: int, **kwargs) -> None:
        """
        Update a spotting record in the database.
        """
        columns = kwargs.keys()
        values = kwargs.values()
        query = "UPDATE spottings SET " + ", ".join(f"\"{column}\"=${i+1}" for i, column in enumerate(columns)) + " WHERE message_id=$" + str(len(columns) + 1)
        await self.database.execute(query, *values, str(id))
        
        # remove from cache (redis)
        service = await self.database.fetchval("SELECT company FROM spottings WHERE message_id=$1", str(id))
        date = await self.database.fetchval("SELECT date FROM spottings WHERE message_id=$1", str(id))
        
        self.clear_cache_spotting(str(id))
        self.clear_cache_month(service, date)
        
    async def delete_spotting(self, id: int) -> None:
        """
        Deletes a spotting from the database based on the given ID.
        """
        
        # get month before purging from database
        date = await self.database.fetchval("SELECT date FROM spottings WHERE message_id=$1", str(id))
        # get service as well
        service = await self.database.fetchval("SELECT company FROM spottings WHERE message_id=$1", str(id))
        
        # delete from database
        await self.database.execute("DELETE FROM spottings WHERE message_id=$1", str(id))
        
        self.clear_cache_spotting(str(id))
        self.clear_cache_month(service, date)
            
    async def delete_spottings(self, channel_id: int) -> None:
        """
        Deletes all spottings from the database based on the given channel ID.
        """
        await self.database.execute("DELETE FROM spottings WHERE channel_id=$1", channel_id)
        # as we're removing all spottings, it would take a long time to remove each cache
        # per message_id, so we'll just flush the entire cache
        # i'm sorry please be nice
        self.redis.flushall()

    async def find_spotting(self, id: int) -> dict:
        """
        Retrieves a spotting record from the database based on the given ID.
            """
        return await self.database.fetchrow("SELECT * FROM spottings WHERE message_id=$1", str(id))

    def clear_cache_month(self, service, date) -> None:
        """
        Clears the cache for a specific month and service.
        """
        service = service.lower() # lowercase to match the key in redis
        date = self.generate_cache_month(date)
        
        if service not in ["google", "yandex", "apple"]:
            service = "others_rest"
        
        # delete all available months from cache
        self.redis.hdel(f"months:{service}", "data")
        
        # delete month from cache
        self.redis.delete(f"spottings:{service}:{date}")
        self.redis.delete(f"spottings:all:{date}")
        
    def clear_cache_spotting(self, id: str) -> None:
        '''
        Clears the cache for a specific spotting message.
        '''
        self.redis.hdel(f"spottings:{id}", "renamed_data")

    def generate_cache_month(self, date: datetime) -> str:
        """
        Generate a cache key for a given month and year.
        """
        month = date.strftime("%m")
        if month.startswith("0"): # using a single digit here as REDIS' keys are registered with no leading zeros
            month = month.lstrip("0")
        return f"{month}:{date.strftime('%Y')}"
