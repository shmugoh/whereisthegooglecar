import discord
from discord import app_commands
from discord.ext import commands
from discord.ext.commands import Context
from discord.ext.commands import check_any, has_guild_permissions, is_owner

import os
from utils.spotting import spotting
from utils.database import DatabaseManager
from utils.submission import Submission
import re

guild_id = int(os.getenv("GUILD_ID"))
submission_channel_id = int(os.getenv("CHANNEL_SUBMISSION_ID"))
submission_webhook_id = int(os.getenv("WEBHOOK_SUBMISSION_ID"))
# i can't call self.bot.guild_id within the @app_commands.guilds decorator, so i have to hard-code it

class WebSubmission(commands.Cog, name="web_submission"):
    def __init__(self, bot) -> None:
      self.bot = bot
      self.database: DatabaseManager
      self.spotting = spotting()
      self.submission = Submission()
      
      # context menu configuration
      self.add_ctx_menu = app_commands.ContextMenu(
        name='Approve Submission',
        callback=self.approve_submission_ctx
      )
      self.bot.tree.add_command(self.add_ctx_menu)
      
      self.remove_ctx_menu = app_commands.ContextMenu(
        name='Delete Submission',
        callback=self.delete_submission_ctx
      )
      self.bot.tree.add_command(self.remove_ctx_menu)
      
    # Listener
    ## on_message
    @commands.Cog.listener()
    async def on_message(self, message: discord.Message) -> None:
      # checks if message's metadata matches web_submission ids
      if message.author.id != submission_webhook_id and message.channel.id != submission_channel_id:
        return
        
      # process embed
      submission_data = self.submission.process_embed(discord.Message)
      
      # submit to database
      await self.database.add_submission(
        message_id=message.id, 
        date=submission_data.date, 
        town=submission_data.town, 
        country=submission_data.country, 
        countryEmoji=submission_data.country, 
        sourceUrl=submission_data.source, 
        locationUrl=submission_data.location, 
        company=submission_data.service, 
        imageUrl=message.attachments[0].url
      )
      
      # generate thread & preview
      submission_thread = await message.create_thread(name=f"{submission_data.date} in {submission_data.town}")
      preview_message = await submission_thread.send(submission_data.preview)
      
      # submit preview id to database
      await self.database.edit_submission(id=message.id, preview_message_id=preview_message.id)
        
      
    # on submission delete
    @commands.Cog.listener()
    async def on_raw_message_delete(self, payload: discord.RawMessageDeleteEvent) -> None:
      # checks if message's metadata matches web_submission ids
      channel_id = payload.channel_id
      if channel_id != submission_channel_id:
        return
      message_id = payload.message_id
      # await self.submission.delete(id=message_id)
      
    # App Commands
    ## Approve Submission
    async def approve_submission_ctx(self, interaction: discord.Interaction, message: discord.Message) -> None:
      # checks if message's metadata matches web_submission ids
      if message.author.id != submission_webhook_id and message.channel.id != submission_channel_id:
        await interaction.response.send_message("cannot process message")
        return
      
      await interaction.response.send_message('hii')
    
    ## Delete Submission
    async def delete_submission_ctx(self, interaction: discord.Interaction, message: discord.Message) -> None:
      # checks if message's metadata matches web_submission ids
      if message.author.id != submission_webhook_id and message.channel.id != submission_channel_id:
        await interaction.response.send_message("cannot delete message", ephemeral=True)
        return
      
      try:
        await message.delete()
        await interaction.response.send_message("deleted message")
      except Exception as e:
        await interaction.response.send_message("cannot delete message")
        
async def setup(bot) -> None:
    await bot.add_cog(WebSubmission(bot))
