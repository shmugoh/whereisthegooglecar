import discord
from discord import app_commands
from discord.ext import commands
from discord.ext.commands import Context

class Sync(commands.Cog, name="sync"):
    def __init__(self, bot) -> None:
      self.bot = bot
    
    @commands.hybrid_command(
      name="add_channel",
      description="Adds a channel to listen to for new spottings.",
    )
    @app_commands.describe(channel="The channel to add", thread="The thread to add", sync="Default: True - Whether to sync the content to the database or not.")
    # only for server admins
    async def add(self, context: Context, *, channel: discord.TextChannel = None, thread: discord.Thread = None, sync: bool = True) -> None:
      if channel is None and thread is None:
        await context.send("Please provide either a channel or a thread.")
        return
        
      if channel and thread:
        await context.send("Please provide either a channel or a thread, not both.")
        return
      
      if channel is not None:
        target = channel
      if thread is not None:
        target = thread
      
      await context.send(f"Adding {target}...")
      # logic to remove the database from postgres
      await context.send(f"Added {target}!")
      
      if sync:
        await context.send(f"Syncing {target}...")
        async for message in target.history(limit=100):
          print(message.content)
          # print(message.attachments[0].url)
          
    @commands.hybrid_command(
      name="remove_channel",
      description="Removes a channel to listen to for new spottings.",
    )
    @app_commands.describe(channel="The channel to add", thread="The thread to remove", unsync="Default: False - Whether to remove the content from the database or not.")
    # only for server admins
    async def remove(self, context: Context, *, channel: discord.TextChannel = None, thread: discord.Thread = None, sync: bool = False) -> None:
      if channel is None and thread is None:
        await context.send("Please provide either a channel or a thread.")
        return
        
      if channel and thread:
        await context.send("Please provide either a channel or a thread, not both.")
        return
      
      if channel is not None:
        target = channel
      if thread is not None:
        target = thread
      
      await context.send(f"Removing {target}...")
      # logic to remove the database from postgres
      await context.send(f"Removed {target}!")
      
      if sync:
        await context.send(f"Unsyncing {target}...")
        # remove from database

async def setup(bot) -> None:
    await bot.add_cog(Sync(bot))
