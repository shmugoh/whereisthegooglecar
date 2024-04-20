import discord
from discord import app_commands, ui
from discord.ext import commands
from discord.ext.commands import Context
from discord.ext.commands import check_any, has_guild_permissions, is_owner

import os
from utils.spotting import spotting
from utils.database import DatabaseManager
from utils.submission import Submission
import utils.date_utils as date_utils

import requests
from io import BytesIO

import flag

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
      try:
        submission_data = self.submission.process_embed(message=message)
      except IndexError:
        # not an embed
        return
      
      # submit to database
      await self.bot.database.add_submission(
        message_id=message.id, 
        date=submission_data.date, 
        town=submission_data.town, 
        country=submission_data.country, 
        sourceUrl=submission_data.source, 
        locationUrl=submission_data.location, 
        company=submission_data.service, 
        imageUrl=submission_data.image,
        mode=submission_data.mode
      )
            
      # generate thread & preview
      submission_thread = await message.create_thread(name=f"{date_utils.stringify_date(submission_data.date)} in {submission_data.town}")
      preview_message = await submission_thread.send(submission_data.preview)
      
      # new handling - submit preview to thread & database
      if submission_data.mode == 'new':
        await self.bot.database.edit_submission(id=message.id, output_message_id=preview_message.id)
      
      # edit handling - submit output message_id from embed
      if submission_data.mode == 'edit':
        # get original channel id
        original_submission = await self.bot.database.find_spotting(id=submission_data.output_message_id)
        original_channel_id = original_submission['channel_id']
        
        # submit to database
        await self.bot.database.edit_submission(id=message.id, output_message_id=int(submission_data.output_message_id), output_channel_id=int(original_channel_id))
        # asyncpg would break if i don't make these two integers WITHIN the function itself
      
    # on submission delete
    @commands.Cog.listener()
    async def on_raw_message_delete(self, payload: discord.RawMessageDeleteEvent) -> None:
      # checks if message's metadata matches web_submission ids
      channel_id = payload.channel_id
      if channel_id != submission_channel_id:
        return
      message_id = payload.message_id
      
      # attempt to delete submission
      try: await self.submission.delete_submission(id=message_id, database=self.bot.database, s3=self.bot.s3)
      
      # if message wasn't originally a submission or not on database
      except NameError: pass
      
    # App Commands
    ## Approve Submission  
    async def approve_submission_ctx(self, interaction: discord.Interaction, message: discord.Message) -> None:    
      # checks if message's metadata matches web_submission ids
      if (message.author.id != submission_webhook_id and message.channel.id != submission_channel_id):
        await interaction.response.send_message("cannot process message")
        return
        
      # grab database (as the modal's class will not have access to self.bot)
      bot_submission = self.submission
      bot_database = self.bot.database
      bot_s3 = self.bot.s3 # for deleting
        
      # get submission type
      submission_embed = self.submission.process_embed(message)
      
      # check if compatible modes are set
      if submission_embed.mode == "new" or "edit":
        # pre-handling grab set channel/thread to submit to
        submission_data = await bot_database.get_submission(id=message.id)
        channel_data = await bot_database.get_channels()
        submission_output_channel_id = submission_data['output_channel_id']        
        ## see if channel is in database
        try:
          channel_index = [channel['id'] for channel in channel_data].index(submission_output_channel_id)
        except ValueError:
          await interaction.response.send_message(f"cannot upload to channel <#{submission_channel_id}> - not in database")
          return
        ## grab channel type
        submission_output_channel_type = channel_data[channel_index]['type']
        if submission_output_channel_type == 'TextChannel':
          submission_output_channel = interaction.guild.get_channel(submission_output_channel_id)
        elif submission_output_channel_type == 'Thread':
          submission_output_channel = interaction.guild.get_thread(submission_output_channel_id)
      # if no mode is set
      else:
        await interaction.response.send('invalid submission mode');
        return

      # build modal with data
      class ModalApproval(discord.ui.Modal, title="New Submission - Final Changes"):
        date = ui.TextInput(label="Date - Format must be YYYY/MM/DD", required=True, default=date_utils.stringify_date(submission_data['date']))
        town = ui.TextInput(label="Town", required=True, default=submission_data['town'])
        country = ui.TextInput(label="Country - must be a Flag Emoji", required=True, default=submission_data['country'])
        sourceUrl = ui.TextInput(label="Source - must be either an URL or username", required=True, default=submission_data['sourceUrl'])
        locationUrl = ui.TextInput(label="Location - must be GMaps link - Optional", default=submission_data['locationUrl'])
        
        async def on_submit(self, interaction: discord.Interaction) -> None:
          # generate embed
          spotting_message = Submission.generate_embed(Submission, date=date_utils.convert_date(self.date.value), town=self.town.value, country=self.country.value, 
                                            source=self.sourceUrl.value, location=self.locationUrl.value, service=submission_data['company'])
        
          # new submission handling
          if submission_data['mode'] == 'new':
            # grab image
            image_url = submission_data['imageUrl']
            image_filename = image_url.split('/')[-1]
            image_response = requests.get(image_url)
            image_bytes = BytesIO(image_response.content)
            image_file = discord.File(image_bytes, filename=image_filename)
                
            # submit message - channel listener will handle the rest
            await submission_output_channel.send(content=spotting_message, file=image_file)
          
          # edit submission handling
          elif submission_data['mode'] == 'edit':
            # edit to database
            await bot_database.update_spotting(id=submission_embed.output_message_id, date=date_utils.convert_date(self.date.value), 
                                              country=flag.dflagize(self.country.value), countryEmoji=self.country.value, town=self.town.value,
                                              sourceUrl=self.sourceUrl.value, locationUrl=self.locationUrl.value, company=submission_embed.service)
            
            # notify changes
            ## get message
            output_message = await submission_output_channel.fetch_message(submission_embed.output_message_id)
            
            ## create message notification content
            submission_notify_message = (
                f'Contributor <@{message.author.id}> has approved an edit that changes your spotting submission. Here are the details of the changes:\n'
                '```\n'
                f'{spotting_message}\n'
                '```\n'
                'If you do not agree with these changes, feel free to edit your original message to reverse the edit.'
            )
            
            ## create thread (if channel type is textchannel)
            if submission_output_channel_type == "TextChannel":
              # TODO: check if a thread already exists
              submission_notify_thread = await output_message.create_thread(name=f"{self.date.value} in {self.town.value}")
              await submission_notify_thread.send(submission_notify_message)
            ## send reply (if channel type is thread)
            elif submission_output_channel_type == 'Thread':
              await output_message.reply(submission_notify_message)
          
          # pos-handling
          thread = message.channel.get_thread(message.id)
          await thread.send("changes have been approved. locking...")
          await thread.edit(locked=True)
          await bot_submission.delete_submission(id=message.id, database=bot_database, s3=bot_s3)
      
      # submit modal
      await interaction.response.send_modal(ModalApproval())
    
    ## Delete Submission
    async def delete_submission_ctx(self, interaction: discord.Interaction, message: discord.Message) -> None:
      # checks if message's metadata matches web_submission ids
      if message.author.id != submission_webhook_id and message.channel.id != submission_channel_id:
        await interaction.response.send_message("cannot delete message", ephemeral=True)
        return
        
      submission_data = await self.bot.database.get_submission(id=message.id)
      if submission_data == None:
        await interaction.response.send_message("not a submission. not deleting")
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
      date="The date of the spotting - Must follow the format: YYYY/MM/DD",
      town="The town of the spotting",
      country="The emoji country of the spotting",
      source="The source of the spotting - URL if available; otherwise, the name of the source",
      location="The location of the spotting - URL if available",
      service="The service of the spotting - Must be a valid service in the database",
      channel="The Channel to post it to",
      thread="The thread to post it to"
    )
    @app_commands.guilds(discord.Object(id=guild_id))
    # @commands.check_any(is_owner(), has_guild_permissions(manage_messages=True))
    async def edit(self, context: Context, *, 
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
      if (context.channel.parent_id != submission_channel_id) and (context.channel.type != "public_thread" or "private_thread"):
        await context.send("pls speak within thread")
        return
    
      # grab from database for default values
      id = context.channel.id
      submission_data = await self.bot.database.get_submission(id=id)

      # checks if channel and thread are not overlapping
      if channel is None and thread is None and submission_data['output_channel_id'] is None:
        await context.send("No channel or thread provided. Please provide one.")
        return
      # if both channel and thread are provided
      if channel and thread and submission_data['output_channel_id'] is None:
        await context.send("No channel or thread provided. Please provide one.")
        return
      
      # sets the target to the channel or thread
      if channel is not None and submission_data['output_channel_id'] is None:
        target = channel.id
      if thread is not None and submission_data['output_channel_id'] is None:
        target = thread.id
            
      if date == None:
        date = submission_data['date']
      else:
        # convert from string to datetime
        date = date_utils.convert_date(date)
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
      if channel or thread == None and submission_data == 'new':
        target = submission_data['output_channel_id']
      
      # submit new preview
      preview_message_content = self.submission.generate_embed(date=date, town=town, country=country, source=source, location=location, service=service, image_url=submission_data['imageUrl'])
      preview_message_response = await context.send(preview_message_content)
      
      # edit to database
      if submission_data['mode'] == 'new':
        # [new]: parameters + output channel id & output message id (preview)
        await self.bot.database.edit_submission(id=id, date=date, town=town, country=country, sourceUrl=source, locationUrl=location, company=service, output_channel_id=target, output_message_id=preview_message_response.id)
      if submission_data['mode'] == 'edit':
        # [edit]: parameters (output channel id and output message id is OG Message)
        await self.bot.database.edit_submission(id=id, date=date, town=town, country=country, sourceUrl=source, locationUrl=location, company=service)
      
      return
#
async def setup(bot) -> None:

    await bot.add_cog(WebSubmission(bot))
