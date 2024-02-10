import discord
from discord import app_commands
from discord.ext import commands
from discord.ext.commands import Context

from asyncpg import exceptions as ps
from utils.spotting import spotting
from utils.database import DatabaseManager

class Listener(commands.Cog, name="listener"):
    def __init__(self, bot) -> None:
      self.bot = bot
      self.database: DatabaseManager
      self.spotting = spotting()
      
    @commands.Cog.listener()
    async def on_message(self, message: discord.Message) -> None:
      """
      The code in this event is executed every time someone sends a message within
      a channel that the bot synchronizes with.
      """
      if message.author == self.bot.user or message.author.bot or message.guild.id != self.bot.guild_id:
        return
      
      # get channel index from channels db
      # this is used to check if message's channel is in db, and
      # to get the service name
      channels: dict = await self.bot.database.get_channels()
      channel_index = [channel['id'] for channel in channels].index(message.channel.id)
      
      if channels[channel_index]['id'] != -1 and message.attachments:
        try:
          spotting = self.spotting.process_spotting(message.content)
          
          # get spotting meta information
          spotting_message_id = message.id
          spotting_channel_id = message.channel.id
          spotting_image = message.attachments[0].url
          
          if spotting['source'] == None:
            spotting['source'] = message.author.name
            
          # process service
          if spotting['service'] == None:
            spotting['service'] = channels[channel_index]['company']
          
          # add the spotting to the database
          await self.bot.database.add_spotting(
            spotting_message_id, 
            spotting_channel_id, 
            spotting['date'], 
            spotting['town'], 
            spotting['country']['country'], 
            spotting['country']['countryEmoji'], 
            spotting_image, 
            spotting['source'], 
            spotting['location'], 
            spotting['service']
          )
          
          # log the spotting
          self.bot.logger.info(f"Added spotting to the database: {spotting['date']} - {spotting['country']['country']} - {spotting['town']} - {spotting['service']}")
          
        except IndexError:
          # not a spotting, we skip it
          pass
          # self.bot.logger.error(f"Failed to parse spotting: {message.content}")
          
        except Exception as e:
          # log the error
          self.bot.logger.error(f"Failed to add spotting to the database: {e}")
          self.bot.logger.error(f"Spotting: {message.content} - {message.attachments[0].url}")
    
    @commands.Cog.listener()
    async def on_message_edit(self, before: discord.Message, after: discord.Message) -> None:
      """
      The code in this event is executed every time someone edits a message within
      a channel that the bot synchronizes with.
      """
      if after.author == self.bot.user or after.author.bot or after.guild.id != self.bot.guild_id:
        return

      # check if the channel is in the database
      channels = await self.bot.database.get_channels()
      if after.channel.id == channels['id'] or after.channel.id in channels['id']:
        # process the spotting
        spotting = self.spotting.process_spotting(after.message)
        
        # get spotting meta information
        spotting_id = after.message.id
        spotting_channel_id = after.message.channel.id
        spotting_image = after.message.attachments[0].url
        
        # edit the spotting to the database
        # here we are assuming that everything has been edited
        # as it is not possible to know what has been edited (it could be possible but it would be a lot of work for a small app)
        self.database.update_spotting(
          spotting_id, 
          channel_id=spotting_channel_id, 
          date=spotting.date, 
          town=spotting.town, 
          country=spotting.country['country'], 
          countryEmoji=spotting.countryEmoji['countryEmoji'], 
          imageUrl=spotting_image, 
          sourceUrl=spotting.source, 
          locationUrl=spotting.location, 
          company=spotting.service
        )
        
    @commands.Cog.listener()
    async def on_message_delete(self, message: discord.Message) -> None:
      """
      The code in this event is executed every time someone sends a message within
      a channel that the bot synchronizes with.
      """
      if message.author == self.bot.user or message.author.bot or message.guild.id != self.bot.guild_id:
        return
      
      # removes the spotting from the database based off the message id
      message_db = await self.bot.database.find_spotting(message.id)
      if message_db:
        await self.bot.database.delete_spotting(message.id)


async def setup(bot) -> None:
    await bot.add_cog(Listener(bot))