import discord
from discord import app_commands
from discord.ext import commands
from discord.ext.commands import Context

from asyncpg import exceptions as ps
from utils.spotting import spotting
from utils.database import DatabaseManager
from utils.s3_upload import ImageUpload

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
      try:
        if message.guild.id != self.bot.guild_id:
          return
      except AttributeError: # possibly interaction
        return
      
      # get channel index from channels db
      # this is used to check if message's channel is in db, and
      # to get the service name
      channels: dict = await self.bot.database.get_channels()
      
      try:
        channel_index = [channel['id'] for channel in channels].index(message.channel.id)
      except ValueError:
        return
            
      if channels[channel_index]['id'] != -1 and message.attachments:
        try:
          channel_map = {
            "id": message.channel.id,
            "company": channels[channel_index]['company'] 
          }
          spotting = await self.spotting.add_spotting(message, channel_map, self.bot.database, self.bot.s3)
          self.bot.logger.info(f"Added [{message.author.name} - {message.author.id}]'s spotting ({message.id}) to the database: {spotting['date']} - {spotting['town']}")
          
        except IndexError:
          # not a spotting, we skip it
          pass
          # self.bot.logger.error(f"Failed to parse spotting: {message.content}")
          
        except Exception as e:
          # log the error
          self.bot.logger.error(f"Failed to add the following spotting {message.id} to the database: {e}")
          self.bot.logger.error(f"[{message.author.name} - {message.author.id}]: {message.content} - {message.attachments[0].url}")
    
    @commands.Cog.listener()
    async def on_raw_message_edit(self, payload: discord.RawMessageUpdateEvent) -> None:
      """
      The code in this event is executed every time someone edits a message within
      a channel that the bot synchronizes with.
      """
      if payload.guild_id != self.bot.guild_id:
        return

      # attempts to skip if message has been cached and is the same
      if payload.cached_message and payload.cached_message.content == payload.data.get('content'):
        return

      # checks if message has been already logged
      try:
        message_db = await self.bot.database.find_spotting(payload.message_id)
      except ValueError:
        return
      
      if message_db and payload.data.get('attachments'):
        try:
          channels: dict = await self.bot.database.get_channels() # for service
          channel_index = [channel['id'] for channel in channels].index(payload.channel_id)
          spotting = self.spotting.process_spotting(payload.data.get('content'))
          
          # get spotting meta information
          spotting_message_id = payload.message_id
          
          # process source
          if spotting['source'] == None:
            spotting['source'] = payload.data.get('author').get('username')
            
          # process service
          if spotting['service'] == None:
            spotting['service'] = channels[channel_index]['company']
          spotting['service'] = str(spotting['service']).lower()
            
          # remove month cache if date has changed
          before_date = message_db['date']
          after_date = spotting['date']
          if before_date != after_date:
            service = channels[channel_index]['company']            
            self.bot.database.clear_cache_month(service, before_date)
            self.bot.database.clear_cache_month(service, after_date)
            # no need to clear the spotting cache, as it'll be automatically deleted when updating the database
          
          # add the spotting to the database
          await self.bot.database.update_spotting(
            spotting_message_id,
            date=after_date, 
            town=spotting['town'], 
            country=spotting['country']['country'], 
            countryEmoji=spotting['country']['countryEmoji'], 
            sourceUrl=spotting['source'], 
            locationUrl=spotting['location'], 
            company=spotting['service']
          )
          
      #     # log the spotting
          self.bot.logger.info(f"Edited [{payload.data.get('author').get('username')} - {payload.data.get('author').get('id')}]'s spotting ({payload.message_id}) to the database: {spotting['date']} - {spotting['town']} - {spotting['service']}")
          
        except IndexError:
          self.bot.logger.error(f"Failed to parse spotting {payload.message_id} to RegEx: {payload.data.get('content')}")
          pass
          # self.bot.logger.error(f"Failed to parse spotting: {message.content}")
          
        except Exception as e:
          # log the error
          self.bot.logger.error(f"Failed to edit spotting {payload.message_id} to the database: {e}")
          
          if payload.cached_message:
            self.bot.logger.error(f"Before: [{payload.cached_message.author.name} - {payload.cached_message.author.id}]: {payload.cached_message.content} - {payload.cached_message.attachments[0].url}")
          self.bot.logger.error(f"After: [{payload.data.get('author').get('username')} - {payload.data.get('author').get('id')}]: {payload.data.get('content')} - {payload.data.get('attachments')[0].url}")

        
    @commands.Cog.listener()
    async def on_raw_message_delete(self, payload: discord.RawMessageDeleteEvent) -> None:
      """
      The code in this event is executed every time someone sends a message within
      a channel that the bot synchronizes with.
      """      
      if payload.guild_id != self.bot.guild_id:
        return
      
      # removes the spotting based off the message id
      message_db = await self.bot.database.find_spotting(payload.message_id)
      if message_db:
        # removes image from S3
        self.bot.s3.delete(payload.message_id)
        
        # removes entry from database
        await self.bot.database.delete_spotting(payload.message_id)
        
        # uses cached message data if available
        if payload.cached_message:
          self.bot.logger.info(f"Deleted [{payload.cached_message.author.name} - {payload.cached_message.author.id}]'s spotting ({payload.cached_message.id}) from the database - {payload.cached_message.content}")
        else:
          self.bot.logger.info(f"Deleted spotting {payload.message_id} from the database")

async def setup(bot) -> None:
    await bot.add_cog(Listener(bot))