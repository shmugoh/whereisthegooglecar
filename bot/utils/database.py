import asyncpg
from datetime import datetime

class DatabaseManager:
    """
    A class that manages the database operations for the bot.

    Args:
        connection (asyncpg.Connection): The connection to the database.

    Attributes:
        database (asyncpg.Connection): The connection to the database.

    """

    def __init__(self, *, connection: asyncpg.Connection) -> None:
        self.database = connection
    
    async def add_channel(self, id: int, type: str, company: str) -> None:
        await self.database.execute("INSERT INTO channel (id, type, company) VALUES ($1, $2, $3)", id, type, company)
        
    async def remove_channel(self, id: int) -> None:
        return await self.database.execute("DELETE FROM channel WHERE id=$1", id)
        
    async def get_channels(self) -> dict:
        return await self.database.fetch("SELECT * FROM channel")

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
            
            await self.database.execute(
                "INSERT INTO spottings (message_id, channel_id, date, town, country, \"countryEmoji\", \"imageUrl\", \"sourceUrl\", \"locationUrl\", company) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
                message_id,
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
        await self.database.execute(query, *values, id)
        
    async def delete_spotting(self, id: int) -> None:
            """
            Deletes a spotting from the database based on the given ID.

            Args:
                id (int): The Message ID of the spotting to be deleted.

            Returns:
                None
            """
            await self.database.execute("DELETE FROM spottings WHERE message_id=$1", id)

    async def find_spotting(self, id: int) -> dict:
            """
            Retrieves a spotting record from the database based on the given ID.

            Args:
                id (int): The Message ID of the spotting record to retrieve.

            Returns:
                dict: A dictionary containing the details of the spotting record.
            """
            return await self.database.fetchrow("SELECT * FROM spottings WHERE message_id=$1", id)
