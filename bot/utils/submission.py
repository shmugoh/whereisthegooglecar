import re
import datetime

import flag

from discord import Message
from utils.database import DatabaseManager
from utils.s3_upload import delete

class Submission:
    def process_embed(self, message: Message):
        embed = message.embeds[0]
        if embed:
            # grab title & mode
            title = embed.title
            if "new" in embed.title.lower():
                mode = "new"
            elif "edit" in embed.title.lower():
                mode = "edit"

            # grab values
            date = embed.fields[0].value
            town = embed.fields[1].value
            country = embed.fields[2].value
            source = embed.fields[3].value
            location = embed.fields[4].value
            service = embed.fields[5].value

            if embed.image and mode == "new":
                image = embed.image.url
            else:
                image = None

            # generate preview
            preview = self.generate_embed(date=date, town=town, country=country, source=source, location=location,
                                          service=service, image_url=image)

            # return data
            submission_data = SubmissionData(date, town, country, source, location, service, image, preview, mode)
            return submission_data

    def generate_embed(self, date: str, town: str, country: str, source: str, location: str, service: str, image_url: str):
        return f'''
        {country} [{service}] [{date}](<{source}>) in [{town}](<{location}>)
        {image_url}
        '''

class SubmissionData:
    __slots__ = ["date", "town", "country", "source", "location", "service", "image", "preview", "mode"]

    def __init__(self, date, town, country, source, location, service, image, preview, mode):
        self.date = date
        self.town = town
        self.country = country
        self.source = source
        self.location = location
        self.service = service
        self.image = image
        self.preview = preview
        self.mode = mode