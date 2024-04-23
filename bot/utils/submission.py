from discord import Message
from utils.database import DatabaseManager
from utils.s3_upload import ImageUpload
import utils.date_utils as date_utils
from datetime import datetime

class Submission:
    def process_embed(self, message: Message):
        embed = message.embeds[0]
        if embed:
            # grab title & mode
            title = embed.title
            if "new" in title.lower():
                mode = "new"
            elif "edit" in title.lower():
                mode = "edit"

            # grab values
            date = embed.fields[0].value
            date = date_utils.convert_date(date) # datetime obj
            town = embed.fields[1].value
            country = embed.fields[2].value
            source = embed.fields[3].value
            
            location = embed.fields[4].value
            if location == "N/A": location = None
            
            service = embed.fields[5].value
            if service == "N/A": service = None
            
            # set optional variables to undefined
            ## output_message_id [edit]
            try:
                output_message_id = embed.fields[6].value
            except IndexError: # id doesn't exist
                output_message_id = None
            ## imageUrl [new]
            if embed.image and mode == "new":
                image = embed.image.url
            else:
                image = None

            # generate preview
            preview = self.generate_embed(date=date, town=town, country=country, source=source, location=location,
                                            service=service, image_url=image)

            # return data
            submission_data = SubmissionData(date, town, country, source, location, service, image, preview, mode, output_message_id)
            return submission_data

    def generate_embed(self, date: datetime, town: str, country: str, source: str, location: str, service: str, image_url: str = None):
        # initialize embed content and booleans
        embed_content = f"{country}"
        sourceIsUrl = False
        locationisUrl = False
        
        # service
        if service and service != "N/A":
            embed_content += f" [{service}]"
        
        # formatted date
        formattedDate = date_utils.stringify_date(date)
        
        # source (with url)
        if source and source.startswith('http'):
            sourceIsUrl = True
            embed_content += f" [{formattedDate}](<{source}>)"
        else:
            embed_content += f" {formattedDate}"
        
        # location (with url)
        if location and location.startswith('http'):
            locationisUrl = True
            embed_content += f" in [{town}](<{location}>)"
        else:
            embed_content += f" in {town}"
            
        # source (no url)
        if source and source != "N/A" and sourceIsUrl is False:
            embed_content += f"\n__source:__ {source}"
        # location (no url)
        if location and location != "N/A" and locationisUrl is False:
            embed_content += f"\n__location:__ {location}"
        
        # image url
        if image_url:
            embed_content += f"\n\n{image_url}"
        
        # return built embed
        return embed_content

    async def delete_submission(self, id: int, database: DatabaseManager, s3: ImageUpload):
        data = await database.get_submission(id=id)
        if data == None: raise NameError
        if data['imageUrl']:
            image_url = data['imageUrl']
            image_url_filename = image_url.split("/")[-1]
            s3.delete(mode="submissions", id=image_url_filename, type=None) # there is no file type as the front-end automatically names it like that
        await database.delete_submission(id=id)

class SubmissionData:
    __slots__ = ["date", "town", "country", "source", "location", "service", "image", "preview", "mode", "output_message_id"]

    def __init__(self, date, town, country, source, location, service, image, preview, mode, output_message_id):
        self.date = date
        self.town = town
        self.country = country
        self.source = source
        self.location = location
        self.service = service
        self.image = image
        self.preview = preview
        self.mode = mode
        self.output_message_id = output_message_id