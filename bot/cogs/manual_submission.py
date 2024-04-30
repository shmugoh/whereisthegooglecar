import asyncio
import discord
from discord import app_commands
from discord.ext import commands
from discord.ext.commands import Context
from discord.ext.commands import check_any, has_guild_permissions, is_owner
from asyncpg import exceptions as ps

import os
from utils.spotting import spotting
from utils.database import DatabaseManager
import re

guild_id = os.getenv("GUILD_ID")
submission_channel_id = int(os.getenv("CHANNEL_SUBMISSION_ID"))
# i can't call self.bot.guild_id within the @app_commands.guilds decorator, so i have to hard-code it

class ManualSubmission(commands.Cog, name="manual_submission"):
    def __init__(self, bot) -> None:
      self.bot = bot    
      
      self.database: DatabaseManager
      self.spotting = spotting()
      
    @commands.hybrid_command(
      name="add",
      description="Scan (or rescan) a spotting that is either in the database or not.",
    )
    @app_commands.describe(
      id="The (Message) ID of the spotting to rescan",
      channel="The channel to rescan the spotting from",
      thread="The thread to rescan the spotting from",
    )
    @app_commands.guilds(discord.Object(id=guild_id))
    @commands.check_any(is_owner(), has_guild_permissions(manage_messages=True), commands.has_any_role("Where Is The Google Car Team"))
    async def scan(self, context: Context, id: str, channel: discord.TextChannel = None, thread: discord.Thread = None) -> None:
      # passing channels here as a way to check if channel is in database
      # we are removing the previous spotting in database if it exits, as
      # one of its use cases is fully rescanning it if any sort of change has been made
      
      # enable/disable ephemeral depending on channel
      ephemeral_status = True
      if context.channel.id == submission_channel_id:
        ephemeral_status = False
    
      # generate embed
      embed = discord.Embed(
        title=f"Manual Submission - Add",
        description = "Scanning Spotting...",
        color=discord.Color.blurple()
      )
      bot_message = await context.send(embed=embed, ephemeral=ephemeral_status)
    
      # if no channel or thread is provided
      if channel is None and thread is None:
        embed.color = discord.Color.red()
        embed.description = "No channel or thread provided. Please provide one."
        await bot_message.edit(embed=embed)
        return
      # if both channel and thread are provided
      if channel and thread:
        embed.color = discord.Color.red()
        embed.description = "Please provide either a channel or a thread, not both."
        await bot_message.edit(embed=embed)
        return
      
      # sets the target to the channel or thread
      if channel is not None:
        target = channel
      if thread is not None:
        target = thread
      
      # process id
      id = int(id)
      
      # find spotting in db and delete in case if its on database already
      # input might have been scanned already, or not
      spotting_cache = await self.bot.database.find_spotting(id)
      if spotting_cache:
        embed.set_footer(text=f"Spotting {id} already exists in the database. Deleting...")
        await bot_message.edit(embed=embed)
        self.bot.logger.info(f"Deleting spotting {id} from database...")
        await self.bot.database.delete_spotting(id)
      
      # process contents
      try:
        # grab message from target channel/thread
        embed.set_footer(text=f"Fetching Message...")
        await bot_message.edit(embed=embed)
        message = await target.fetch_message(id)
        
        # grab channel from database
        embed.set_footer(text=f"Getting Channel from DB...")
        await bot_message.edit(embed=embed)
        channels: dict = await self.bot.database.get_channels()
        
        # checks if channel is in database
        try:
          channel_index = [channel['id'] for channel in channels].index(message.channel.id)
        except ValueError:
          embed.color = discord.Color.red()
          embed.remove_footer()
          embed.description = "Channel not found in database. Please add it first."
          await context.send(embed=embed, ephemeral=ephemeral_status)
          return
        
        # checks if message is spotting
        embed.set_footer(text=f"Checking if message is spotting...")
        await bot_message.edit(embed=embed)
        if channels[channel_index]['id'] != -1 and message.attachments:        
          # get channel index from channels db
          channel_map = {
            "id": message.channel.id,
            "company": channels[channel_index]['company']
          }
          
          # add to database again
          embed.set_footer(text=f"Adding Spotting to S3 & DB...")
          await bot_message.edit(embed=embed)
          spotting = await self.spotting.add_spotting(message, channel_map, self.bot.database, self.bot.s3)
          
          # update embed
          self.bot.logger.info(f"Scanned [{message.author.name} - {message.author.id}]'s spotting ({message.id}) to the database: {spotting['date']} - {spotting['town']}")
          embed.color = discord.Color.green()
          embed.remove_footer()
          embed.description = f"Spotting {id} has been added to the database."
          
          output_url = f"{self.bot.url}/spotting/{id}"
          view_button = discord.ui.Button(label="View in Web", style=discord.ButtonStyle.link, url=output_url)
          view = discord.ui.View()
          view.add_item(view_button)
          
          await bot_message.edit(embed=embed, view=view)
        else:
          # message not spotting
          embed.remove_footer()
          embed.color = discord.Color.red()
          embed.description = "Message is not a spotting."
          await bot_message.edit(embed=embed)
          
      except Exception as e:
        # error occurred
        embed.color = discord.Color.red()
        embed.remove_footer()
        embed.description = f"An error occurred: {e}"
        await context.send(embed=embed, ephemeral=ephemeral_status)
        
    @commands.hybrid_command(
      name="edit",
      description="Edits a spotting in the database.",
    )
    @app_commands.describe(
      id="The ID of the spotting to edit",
      date="The date of the spotting - Must follow the format: YYYY-MM-DD",
      town="The town of the spotting",
      country="The emoji country of the spotting",
      source="The source of the spotting - URL if available; otherwise, the name of the source",
      location="The location of the spotting - URL if available",
      service="The service of the spotting - Must be a valid service in the database",
    )
    @app_commands.guilds(discord.Object(id=guild_id))
    @commands.check_any(is_owner(), has_guild_permissions(manage_messages=True), commands.has_any_role("Where Is The Google Car Team"))
    async def edit(self, context: Context, *, 
      id: str,
      date: str = None,
      town: str = None,
      country: str = None,
      source: str = None,
      location: str = None,
      service: str = None,
      ) -> None:
      
      # enable/disable ephemeral depending on channel
      ephemeral_status = True
      if context.channel.id == submission_channel_id:
        ephemeral_status = False
      
      # generate embed
      embed = discord.Embed(
        title=f"Manual Submission - Edit",
        description = "Editing Spotting...",
        color=discord.Color.blurple()
      )
      bot_message = await context.send(embed=embed, ephemeral=ephemeral_status)
      
      # find spotting in db
      id = int(id)
      
      embed.set_footer(text=f"Finding Spotting {id} in DB...")
      await bot_message.edit(embed=embed)
      
      spotting_cache = await self.bot.database.find_spotting(id)
      
      # process parameters
      if (spotting_cache):
        embed.set_footer(text=f"Processing Parameters...")
        await bot_message.edit(embed=embed)
      
        try:
        # process date
          if date != None: # date must always be present
            date = self.spotting.get_date(date)
          else: date = spotting_cache['date']
          
          # process country
          if country != None and country != "": # country must always be present
            country = self.spotting.get_country(country)
          else: country = {"countryEmoji": spotting_cache['countryEmoji'], "country": spotting_cache['country']}
          
          # process town
          if town != None: # town must always be present
            town = town
          else: town = spotting_cache['town']
          
          # process source
          if source != None: # source must always be present
            source = source
          else: source = spotting_cache['sourceUrl']
          
          # process location
          url_regex = r'^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)'
          if location != None and re.match(url_regex, location): # location must always be present and match the URL regex
            location = location
          else:
            location = spotting_cache['locationUrl']
          
          # process company
          if service != None: # service must always be present
            service = service.lower()
          else: service = spotting_cache['company']
          
          # update the spotting in the database
          embed.set_footer(text=f"Updating Spotting {id} in DB...")
          await bot_message.edit(embed=embed)
          
          await self.bot.database.update_spotting(
            id,
            date=date,
            town=town,
            country=country["country"],
            countryEmoji=country["countryEmoji"],
            sourceUrl=source,
            locationUrl=location,
            company=service
          )
          
          # update embed
          embed.remove_footer()
          embed.color = discord.Color.green()
          embed.description = f"Spotting {id} has been updated."
          
          output_url = f"{self.bot.url}/spotting/{id}"
          view_button = discord.ui.Button(label="View in Web", style=discord.ButtonStyle.link, url=output_url)
          view = discord.ui.View()
          view.add_item(view_button)
          
          await bot_message.edit(embed=embed, view=view)
          
        except Exception as e:
          embed.remove_footer()
          embed.color = discord.Color.red()
          embed.description = f"An error occurred: {e}"
          await context.send(embed=embed, ephemeral=ephemeral_status)
      else:
        embed.remove_footer()
        embed.color = discord.Color.red()
        embed.description = "Spotting not found in DB."
        await bot_message.edit(embed=embed)
      
    @commands.hybrid_command(
      name="delete",
      description="Deletes a spotting from the database.",
    )
    @app_commands.describe(
      id="The ID of the spotting to delete",
    )
    @app_commands.guilds(discord.Object(id=guild_id))
    @commands.check_any(is_owner(), has_guild_permissions(manage_messages=True), commands.has_any_role("Where Is The Google Car Team"))
    async def delete(self, context: Context, id: str) -> None:
    
      # enable/disable ephemeral depending on channel
      ephemeral_status = True
      if context.channel.id == submission_channel_id:
        ephemeral_status = False
    
      # generate embed
      embed = discord.Embed(
        title=f"Manual Submission - Delete",
        description = "Deleting Spotting",
        color=discord.Color.blurple()
      )
      bot_message = await context.send(embed=embed, ephemeral=ephemeral_status)
      
      # find spotting in db
      id = int(id)
      spotting_cache = await self.bot.database.find_spotting(id)
      
      if (spotting_cache):
        try:
          await self.bot.database.delete_spotting(id)
          
          embed.color = discord.Color.green()
          embed.description = f"Spotting {id} has been deleted."
          await bot_message.edit(embed=embed)
        except Exception as e:
          embed.color = discord.Color.red()
          embed.description = f"An error occurred: {e}"
          await bot_message.edit(embed=embed)
      else:
        embed.color = discord.Color.red()
        embed.description = "Spotting not found."
        await bot_message.edit(embed=embed)

async def setup(bot) -> None:
    await bot.add_cog(ManualSubmission(bot))
