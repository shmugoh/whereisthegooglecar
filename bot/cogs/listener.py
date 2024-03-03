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
      if message.author == self.bot.user or message.guild.id != self.bot.guild_id:
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
    async def on_message_edit(self, before: discord.Message, after: discord.Message) -> None:
      """
      The code in this event is executed every time someone edits a message within
      a channel that the bot synchronizes with.
      """
      if after.author == self.bot.user or after.guild.id != self.bot.guild_id:
        return
        
      # checks if edited message is the same as the original message
      # usually happens when embedded is triggered
      if before.content == after.content:
        return

      # checks if message has been already logged
      try:
        message_db = await self.bot.database.find_spotting(before.id)
      except ValueError:
        return
      
      if message_db and after.attachments:
        try:
          channels: dict = await self.bot.database.get_channels() # for service
          channel_index = [channel['id'] for channel in channels].index(after.channel.id)
          spotting = self.spotting.process_spotting(after.content)
          
          # get spotting meta information
          spotting_message_id = after.id
          
          # process source
          if spotting['source'] == None:
            spotting['source'] = after.author.name
            
          # process service
          if spotting['service'] == None:
            spotting['service'] = channels[channel_index]['company']
          
          # add the spotting to the database
          await self.bot.database.update_spotting(
            spotting_message_id,
            date=spotting['date'], 
            town=spotting['town'], 
            country=spotting['country']['country'], 
            countryEmoji=spotting['country']['countryEmoji'], 
            sourceUrl=spotting['source'], 
            locationUrl=spotting['location'], 
            company=spotting['service']
          )
          
          # log the spotting
          self.bot.logger.info(f"Edited [{after.author.name} - {after.author.id}]'s spotting ({after.id}) to the database: {spotting['date']} - {spotting['town']}")
          
        except IndexError:
          self.bot.logger.error(f"Failed to parse spotting {after.id} to RegEx: {after.content}")
          pass
          # self.bot.logger.error(f"Failed to parse spotting: {message.content}")
          
        except Exception as e:
          # log the error
          self.bot.logger.error(f"Failed to edit spotting {after.id} to the database: {e}")
          self.bot.logger.error(f"Before: [{before.author.name} - {before.author.id}]: {before.content} - {before.attachments[0].url}")
          self.bot.logger.error(f"After: [{after.author.name} - {after.author.id}]: {after.content} - {after.attachments[0].url}")

        
    @commands.Cog.listener()
    async def on_message_delete(self, message: discord.Message) -> None:
      """
      The code in this event is executed every time someone sends a message within
      a channel that the bot synchronizes with.
      """
      if message.author == self.bot.user or message.guild.id != self.bot.guild_id:
        return
      
      # removes the spotting based off the message id
      message_db = await self.bot.database.find_spotting(message.id)
      if message_db:
        # removes image from S3
        self.bot.s3.delete(message.id)
        
        # removes entry from database
        await self.bot.database.delete_spotting(message.id)
        self.bot.logger.info(f"Deleted [{message.author.name} - {message.author.id}]'s spotting ({message.id}) from the database - {message.content}")

async def setup(bot) -> None:
    await bot.add_cog(Listener(bot))