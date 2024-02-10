import discord
from discord import app_commands
from discord.ext import commands
from discord.ext.commands import Context
from asyncpg import exceptions as ps

# for some reason i can't seem to import the guild_id directly
# from the bot instance within @app_comands.guilds(), so i'm hardcoding them instead
# sorry

class Sync(commands.Cog, name="sync"):
    def __init__(self, bot) -> None:
      self.bot = bot
    
    @commands.hybrid_command(
      name="add_channel",
      description="Adds a channel to listen to for new spottings.",
    )
    @app_commands.describe(
      channel="The channel to add", 
      thread="The thread to add", 
      sync="Whether to sync the content to the database or not. Default: True",
      company="The company that the spottings are from. Note that this will only be used for syncing spottings. Default: 'Google",  
    )
    @app_commands.guilds(discord.Object(id=977037849025204324))
    @commands.has_guild_permissions(manage_messages=True)
    async def add(self, context: Context, *, 
      channel: discord.TextChannel = None, 
      thread: discord.Thread = None, 
      sync: bool = True,
      company: str = "google"
      ) -> None:
      
      # if no channel or thread is provided
      if channel is None and thread is None:
        await context.send("Please provide either a channel or a thread.")
        return
      # if both channel and thread are provided
      if channel and thread:
        await context.send("Please provide either a channel or a thread, not both.")
        return
      
      # sets the target to the channel or thread
      if channel is not None:
        target = channel
        target_string = target.__class__.__name__
      if thread is not None:
        target = thread
        target_string = target.__class__.__name__

      # adds the channel or thread to the database
      try:
        await self.bot.database.add_channel(target.id, target_string, company)
      except ps.UniqueViolationError:
        await context.send(f"Failed to add {target} - already exists in the database.")
        return
      await context.send(f"Added {target}!")
      
      # if sync is True, sync messages from channel to the database
      if sync:
        await context.send(f"Syncing {target}...")
        async for message in target.history():
          if message.attachments:
            print(message.content)
            print(message.attachments[0].url)
    
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
    @app_commands.guilds(discord.Object(id=977037849025204324))
    @commands.has_guild_permissions(manage_messages=True)
    async def remove(self, context: Context, *, 
      channel: discord.TextChannel = None, 
      thread: discord.Thread = None, 
      unsync: bool = True,
      company: str = "google"
      ) -> None:
      
      # if no channel or thread is provided
      if channel is None and thread is None:
        await context.send("Please provide either a channel or a thread.")
        return
      # if both channel and thread are provided
      if channel and thread:
        await context.send("Please provide either a channel or a thread, not both.")
        return
      
      # sets the target to the channel or thread
      if channel is not None:
        target = channel
      if thread is not None:
        target = thread

      # removes the channel or thread from the database
      try:
        await self.bot.database.remove_channel(target.id)
      except ps.UniqueViolationError:
        await context.send(f"Failed to remove {target} - does not exist in the database.")
        return
      await context.send(f"Removed {target}!")
      
      # if sync is True, sync messages from channel to the database
      if unsync:
        await context.send(f"Removing {target} spottings from database...")
        # TODO: logic to remove spottings from the database

async def setup(bot) -> None:
    await bot.add_cog(Sync(bot))
