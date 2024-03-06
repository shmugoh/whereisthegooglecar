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
        company: str
    ) -> None:
        """
        Add a new spotting to the database.

        Args:
            id (int): The Message ID of the spotting.
            channel_id (int): The ID of the channel where the spotting was made.
            date (datetime): The date of the spotting.
            town (str): The town where the spotting was made.
            country (str): The country where the spotting was made.
            countryEmoji (str): The emoji representing the country.
            imageUrl (str): The URL of the image associated with the spotting.
            sourceUrl (str): The URL of the source of the spotting.
            locationUrl (str): The URL of the location of the spotting.
            company (str): The company associated with the spotting.

        Returns:
            None
        """
        
        # add to database
        await self.database.execute(
            "INSERT INTO spottings (message_id, channel_id, date, town, country, \"countryEmoji\", \"imageUrl\", \"sourceUrl\", \"locationUrl\", company) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
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
        )

        # remove month data from cache (redis)
        self.clear_cache_month(company, date)
        
    async def update_spotting(self, id: int, **kwargs) -> None:
        """
        Update a spotting record in the database.

        Args:
            id (int): The Message ID of the spotting record to update.
            **kwargs: Keyword arguments representing the columns and their new values.

        Returns:
            None
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

        Args:
            id (int): The Message ID of the spotting to be deleted.

        Returns:
            None
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

        Args:
            channel_id (int): The ID of the channel where the spottings were made.

        Returns:
            None
        """
        await self.database.execute("DELETE FROM spottings WHERE channel_id=$1", channel_id)
        # as we're removing all spottings, it would take a long time to remove each cache
        # per message_id, so we'll just flush the entire cache
        # i'm sorry please be nice
        self.redis.flushall()

    async def find_spotting(self, id: int) -> dict:
        """
        Retrieves a spotting record from the database based on the given ID.

        Args:
            id (int): The Message ID of the spotting record to retrieve.

        Returns:
            dict: A dictionary containing the details of the spotting record.
            """
        return await self.database.fetchrow("SELECT * FROM spottings WHERE message_id=$1", str(id))

    def clear_cache_month(self, service, date) -> None:
        """
        Clears the cache for a specific month and service.

        Args:
            service (str): The name of the service.
            date (datetime): The date in the format "MM:YYYY".

        Returns:
            None
        """
        service = service.lower() # lowercase to match the key in redis
        date = self.generate_cache_month(date)
        self.redis.hdel(f"spottings:{service}:{date}", "data")
        if service != "google":
            self.redis.hdel(f"spottings:others:{date}", "data")
            self.redis.hdel(f"spottings:{service}:{date}", "data")
        self.redis.hdel(f"spottings:all:{date}", "data")
        
    def clear_cache_spotting(self, id: str) -> None:
        '''
        Clears the cache for a specific spotting message.

        Args:
            id (str): The message ID of the spotting.

        Returns:
            None
        '''
        self.redis.hdel(f"spotting:{id}", "data")

    def generate_cache_month(self, date: datetime) -> str:
        """
        Generate a cache key for a given month and year.

        Args:
            date (datetime): The date for which the cache key is generated.

        Returns:
            str: The cache key in the format "month:year".
        """
        month = date.strftime("%m")
        if month.startswith("0"): # using a single digit here as REDIS' keys are registered with no leading zeros
            month = month.lstrip("0")
        return f"{month}:{date.strftime('%Y')}"
