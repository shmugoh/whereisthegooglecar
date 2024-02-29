import discord
from discord import app_commands
from discord.ext import commands
from discord.ext.commands import Context
from asyncpg import exceptions as ps

import os, sys, json
import asyncio

from utils.spotting import spotting
from utils.database import DatabaseManager

config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "config.json"))
if not os.path.isfile(config_path):
  sys.exit("'config.json' not found! Please add it and try again.")
else:
    with open(config_path) as file:
        config = json.load(file)
guild_id = int(config.get("guild_id"))
# this is a very funny workaround of grabbing the guild_id from config instead of hard-coding it
# as i can't call self.bot.guild_id within the decorator
# i personally hate hard-coding so this is a good workaround for now, that will stay

class Sync(commands.Cog, name="sync"):
    def __init__(self, bot) -> None:
      self.bot = bot    
      
      self.database: DatabaseManager
      self.spotting = spotting()
      
      # embed colors
      self.embed_success = 0x2BE02B
      self.embed_orange = 0xFFA500
      self.embed_error = 0xE02B2B
      
      # embed
      self.embed = discord.Embed(
        title="Database Sync",
        description="Syncs channels and threads to the database.",
        color=self.embed_orange
      )
    
    @commands.hybrid_command(
      name="add_channel",
      description="Adds a channel to listen to for new spottings.",
    )
    @app_commands.describe(
      channel="The channel to add", 
      thread="The thread to add", 
      sync="Whether to sync the content to the database or not. Default: True",
      company="The company that the spottings are from. Default: 'Google",  
    )
    @app_commands.guilds(discord.Object(id=guild_id))
    @commands.has_guild_permissions(manage_messages=True)
    async def add(self, context: Context, *, 
      channel: discord.TextChannel = None, 
      thread: discord.Thread = None, 
      sync: bool = True,
      company: str = "google"
      ) -> None:
      
      # if no channel or thread is provided
      if channel is None and thread is None:
        self.embed.description="No channel or thread provided. Please provide one."
        self.embed.color = self.embed_error
        
        await context.send(embed=self.embed, ephemeral=True)
        return
      # if both channel and thread are provided
      if channel and thread:
        self.embed.description="Please provide either a channel or a thread, not both"
        self.embed.color = self.embed_error
        
        await context.send(embed=self.embed, ephemeral=True)
        return
      
      # sets the target to the channel or thread
      if channel is not None:
        target = channel
        target_company = company
        target_string = target.__class__.__name__
      if thread is not None:
        target = thread
        target_company = company
        target_string = target.__class__.__name__

      # adds the channel or thread to the database
      try:
        await self.bot.database.add_channel(target.id, target_string, company)
        
        self.embed.description=f"Added <#{target.id}> to the database!"
        self.embed.color = self.embed_success
      
        await context.send(embed=self.embed, ephemeral=True) 
      except ps.UniqueViolationError:
        self.embed.description=f"Failed to add <#{target.id}> - already exists in the database."
        self.embed.color = self.embed_error
        
        await context.send(embed=self.embed, ephemeral=True)
        return
      
      # if sync is True, sync messages from channel to the database
      if sync:
        self.embed.title=f"<#{target.id}> - Database Sync"
        self.embed.description = "Getting messages..."
        self.embed.set_footer(text="This may take a while.")
        self.embed.color = self.embed_orange

        bot_message = await context.send(embed=self.embed, ephemeral=True)

        # get messages
        target_messages = []
        counter = 0
        await bot_message.edit(embed=self.embed)
        async for message in target.history(limit=None):
          if message.attachments:
            target_messages.append(message)
            counter += 1
            if counter % 10 == 0: # update every 10 messages to prevent rate limiting
              self.embed.set_footer(text=f"This may take a while - {counter} messages obtained.")
              await bot_message.edit(embed=self.embed)

        # save messages
        length = len(target_messages)
        counter = 0
        minusCounter = 0
        self.embed.description = "Saving messages..."
        self.embed.set_footer(text="This may take a while.")
        await bot_message.edit(embed=self.embed)
        for msg in target_messages:
          try:
            await self.spotting.add_spotting(msg, {"id": target.id, "company": company}, self.bot.database, self.bot.s3)
            self.bot.logger.info(f"Synced [{msg.author.name} - {msg.author.id}]'s spotting ({msg.id}) to the database")
          except IndexError:
            minusCounter -= 1
            pass
          except Exception as e:
            self.embed.description = f"Failed to sync <#{target.id}> - {e}"
            self.embed.set_footer(text=f"Last Synced Message ID: {msg.id}")
            self.embed.color = self.embed_error
            await bot_message.edit(embed=self.embed)
            return
            
          counter += 1
          if counter % 5 == 0: # update every 5 messages to prevent rate limiting
            self.embed.set_footer(text=f"This may take a while - {counter}/{length - minusCounter} messages saved...")
            await bot_message.edit(embed=self.embed)
      
        # # success
        self.embed.description = f"Synced <#{target.id}>!"
        self.embed.color = self.embed_success
        self.embed.set_footer(text=f"Synced {length} messages.")
        await bot_message.edit(embed=self.embed)
    
    @commands.hybrid_command(
      name="remove_channel",
      description="Removes a channel from the database.",
    )
    @app_commands.describe(
      channel="The channel to remove", 
      thread="The thread to remove", 
      unsync="Whether to sync the content to the database or not. Default: True",
      company="The company that the spottings are from. Default: 'Google",  
    )
    @app_commands.guilds(discord.Object(id=guild_id))
    @commands.has_guild_permissions(manage_messages=True)
    async def remove(self, context: Context, *, 
      channel: discord.TextChannel = None, 
      thread: discord.Thread = None, 
      unsync: bool = False,
      company: str = "google"
      ) -> None:
      
      # if no channel or thread is provided
      if channel is None and thread is None:
        self.embed.description="No channel or thread provided. Please provide one."
        self.embed.color = self.embed_error
        
        await context.send(embed=self.embed, ephemeral=True)
        return
      # if both channel and thread are provided
      if channel and thread:
        self.embed.description="Please provide either a channel or a thread, not both"
        self.embed.color = self.embed_error
        
        await context.send(embed=self.embed, ephemeral=True)
        return
      
      # sets the target to the channel or thread
      if channel is not None:
        target = channel
      if thread is not None:
        target = thread

      # removes the channel or thread from the database
      try:
        await self.bot.database.remove_channel(target.id)
        
        self.embed.description=f"Removed <#{target.id}> from the database!"
        self.embed.color = self.embed_success
        await context.send(embed=self.embed, ephemeral=True)
        
      except ps.UniqueViolationError:
        self.embed.description=f"Failed to remove <#{target.id}> - does not exist in the database."
        self.embed.color = self.embed_error
        await context.send(embed=self.embed, ephemeral=True)
        return
      
      # if unsync is True, remove channel messages from the database
      if unsync:
        self.embed.title=f"<#{target.id}> - Database Unsync"
        self.embed.description = "Removing messages..."
        self.embed.color = self.embed_orange

        bot_message = await context.send(embed=self.embed, ephemeral=True)
        
        try:
          self.database.delete_spottings(target.id)
        except Exception as e:
          self.embed.description = f"Failed to unsync <#{target.id}> - {e}"
          self.embed.color = self.embed_error
          await bot_message.edit(embed=self.embed)
          return
        self.embed.description = f"Removed messages from <#{target.id}>!"
        self.embed.color = self.embed_success
        await bot_message.edit(embed=self.embed)

async def setup(bot) -> None:
    await bot.add_cog(Sync(bot))
