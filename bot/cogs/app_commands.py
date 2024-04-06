import discord
from discord import app_commands, ui
from discord.ext import commands

class AppCommands(commands.Cog, name="AppCommands"):
    def __init__(self, bot: commands.Bot) -> None:
        self.bot = bot
        self.ctx_menu = app_commands.ContextMenu(
            name='View in Web',
            callback=self.open_web_ctx_menu,
        )
        self.bot.tree.add_command(self.ctx_menu) # adds context menu to tree

    async def open_web_ctx_menu(self, interaction: discord.Interaction, message: discord.Message) -> None:
        # process message id
        spotting_in_db = await self.bot.database.find_spotting(message.id)

        if spotting_in_db:
            # process url
            output_url = f"{self.bot.url}/spotting/{message.id}"
        
            # process view
            view_button = discord.ui.Button(label="View in Web", style=discord.ButtonStyle.link, url=output_url)
            view = discord.ui.View()
            view.add_item(view_button)

            # send view
            await interaction.response.send_message(view=view, ephemeral=True)
        else:
            # process embed
            embed = discord.Embed(
                description="This spotting has not been registered in whereisthegooglecar's database.",
                color=discord.Color.red()
            )
        
            # send embed
            await interaction.response.send_message(embed=embed, ephemeral=True)

async def setup(bot) -> None:
    await bot.add_cog(AppCommands(bot))
