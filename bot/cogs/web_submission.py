import discord
from discord import app_commands
from discord.ext import commands
from discord.ext.commands import Context
from discord.ext.commands import check_any, has_guild_permissions, is_owner

import os
from utils.spotting import spotting
from utils.database import DatabaseManager
import re

guild_id = os.getenv("GUILD_ID")
channel_id = os.getenv("CHANNEL_SUBMISSION_ID")
webhook_id = os.getenv("WEBHOOK_SUBMISSION_ID")
# i can't call self.bot.guild_id within the @app_commands.guilds decorator, so i have to hard-code it

class WebSubmission(commands.Cog, name="web_submission"):
    def __init__(self, bot) -> None:
      self.bot = bot
      self.database: DatabaseManager
      self.spotting = spotting()
      
    # Listener
    @commands.Cog.listener()
    async def on_message(self, message: discord.Message) -> None:
      # checks if message's metadata matches web_submission ids
      if message.author.id != int(webhook_id) and message.channel.id != int(channel_id):
        return
        
      print(message.embeds[0].fields[0])
        
      # TODO: check if embeds follow proper structure
      if message.embeds[0] and message.embeds[0]:
        embed = message.embeds[0]
        date = embed.fields[0].value
        town = embed.fields[1].value
        await message.create_thread(name=f"{date} in {town}")
      
    # @commands.hybrid_command(
    #   name="add",
    #   description="Scan (or rescan) a spotting that is either in the database or not.",
    # )
    # @app_commands.describe(
    #   id="The (Message) ID of the spotting to rescan",
    #   channel="The channel to rescan the spotting from",
    #   thread="The thread to rescan the spotting from",
    # )
    # @app_commands.guilds(discord.Object(id=guild_id))
    # @commands.check_any(is_owner(), has_guild_permissions(manage_messages=True))
    # async def scan(self, context: Context, id: str, channel: discord.TextChannel = None, thread: discord.Thread = None) -> None:
    #   Context.send("hello")
        
    # @commands.hybrid_command(
    #   name="delete",
    #   description="Deletes a spotting from the database.",
    # )
    # @app_commands.describe(
    #   id="The ID of the spotting to delete",
    # )
    # @app_commands.guilds(discord.Object(id=guild_id))
    # @commands.check_any(is_owner(), has_guild_permissions(manage_messages=True))
    # async def delete(self, context: Context, id: str) -> None:      
    #   Context.send("delete")

async def setup(bot) -> None:
    await bot.add_cog(WebSubmission(bot))
