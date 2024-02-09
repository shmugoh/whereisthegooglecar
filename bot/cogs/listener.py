import discord
from discord import app_commands
from discord.ext import commands
from discord.ext.commands import Context

from asyncpg import exceptions as ps

class Listener(commands.Cog, name="sync"):
    def __init__(self, bot) -> None:
      self.bot = bot
      
    @commands.Cog.listener()
    async def on_message(self, message: discord.Message) -> None:
      """
      The code in this event is executed every time someone sends a message within
      a channel that the bot synchronizes with.
      """
      if message.author == self.bot.user or message.author.bot:
        return
      
      channels = await self.bot.database.get_channels()
      if message.channel.id == channels['id'] or message.channel.id in channels['id']:
        print("[NEW]: Process Spotting Here")
        # process_spotting(message)
    
    @commands.Cog.listener()
    async def on_message_edit(self, before: discord.Message, after: discord.Message) -> None:
      """
      The code in this event is executed every time someone edits a message within
      a channel that the bot synchronizes with.
      """
      if after.author == self.bot.user or after.author.bot:
        return

      channels = await self.bot.database.get_channels()
      if after.channel.id == channels['id'] or after.channel.id in channels['id']:
        print("[EDIT]: Process Spotting Here")
        print(after.id)
        # process_spotting(after)
        
    @commands.Cog.listener()
    async def on_message_delete(self, message: discord.Message) -> None:
      """
      The code in this event is executed every time someone sends a message within
      a channel that the bot synchronizes with.
      """
      if message.author == self.bot.user or message.author.bot:
        return
      
      channels = await self.bot.database.get_channels()
      if message.channel.id == channels['id'] or message.channel.id in channels['id']:
        print("[DELETE]: Delete spotting from DB here")
        # process_spotting(message)


async def setup(bot) -> None:
    await bot.add_cog(Listener(bot))