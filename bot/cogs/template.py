""""
Copyright © Krypton 2019-2023 - https://github.com/kkrypt0nn (https://krypton.ninja)
Description:
🐍 A simple template to start to code your own and personalized discord bot in Python programming language.

Version: 6.1.0
"""

import discord
from discord import app_commands
from discord.ext import commands
from discord.ext.commands import Context


# Here we name the cog and create a new class for the cog.
class Template(commands.Cog, name="template"):
    def __init__(self, bot) -> None:
        self.bot = bot

    @commands.hybrid_command(
        name="test",
        description="This is a testing command that does nothing.",
    )
    @app_commands.guilds(discord.Object(id="977037849025204324"))
    async def test(self, context: Context) -> None:   
        await context.send("This is a testing command that does nothing.")
        
    @commands.hybrid_command(
        name="ping",
    )
    async def ping(self, context: Context):
        await context.send("Pong!")
        
    @commands.hybrid_command(
        name="pong",
        description="This is a testing command that does nothing.",
    )
    @commands.is_owner()
    async def pong(self, context: Context) -> None:
        await context.send("Ping!")

# And then we finally add the cog to the bot so that it can load, unload, reload and use it's content.
async def setup(bot) -> None:
    await bot.add_cog(Template(bot))
