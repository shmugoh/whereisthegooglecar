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
      await self.submission.delete(id=message_id)
      
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
      
      # listener will be in charge of handling the rest
      try:
        await message.delete()
        await interaction.response.send_message("deleted message")
      except Exception as e:
        await interaction.response.send_message("cannot delete message")
        
    # Slash Commands
    @commands.hybrid_command(
      name="edit_submission",
      description="Edits a submission in the database.",
    )
    @app_commands.describe(
      id="The Message ID of the spotting to edit",
      date="The date of the spotting - Must follow the format: YYYY/MM/DD",
      town="The town of the spotting",
      country="The emoji country of the spotting",
      source="The source of the spotting - URL if available; otherwise, the name of the source",
      location="The location of the spotting - URL if available",
      service="The service of the spotting - Must be a valid service in the database",
      output_channel="The Channel to post it to",
      output_thread="The thread to post it to"
    )
    @app_commands.guilds(discord.Object(id=guild_id))
    # @commands.check_any(is_owner(), has_guild_permissions(manage_messages=True))
    async def edit(self, context: Context, *, 
      id: str = None,
      date: str = None,
      town: str = None,
      country: str = None,
      source: str = None,
      location: str = None,
      service: str = None,
      channel: discord.TextChannel = None, 
      thread: discord.Thread = None
      ) -> None:
      # checks if message's metadata matches web_submission ids
      if context.channel.parent_id != submission_channel_id or context.channel.id != submission_channel_id:
        context.send("wrong channel!")
        return
      
      # checks if input's parent is thread (submission) or not
      if id == None and context.channel.type == "public_thread" or "private_thread":
        id = context.channel.id
      else:
        context.send("fail")
        return
      
      # checks if channel and thread are not overlapping
      if channel is None and thread is None:
        await context.send("No channel or thread provided. Please provide one.")
        return
      # if both channel and thread are provided
      if channel and thread:
        await context.send("No channel or thread provided. Please provide one.")
        return
      
      # sets the target to the channel or thread
      if channel is not None:
        target = channel
      if thread is not None:
        target = thread
        
      # grab defaults if some parameters haven't been parsed
      submission_data = await self.database.get_submission(id=id)
      if date == None:
        date = submission_data['date']
      if town == None:
        town = submission_data['town']
      if country == None:
        country = submission_data['country']
      if source == None:
        source = submission_data['sourceUrl']
      if location == None: 
        location = submission_data['locationUrl']
      if service == None:
        service = submission_data['company']
        
      # edit straight to database
      self.database.edit_submission(id=id, date=date, town=town, country=country, sourceUrl=source, locationUrl=location, company=service, output_channel_id=target.id)
        
async def setup(bot) -> None:
    await bot.add_cog(WebSubmission(bot))
