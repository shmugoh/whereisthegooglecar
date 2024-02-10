import re
import datetime

import flag

from discord import Message

from utils.database import DatabaseManager

class spotting():
  def __init__(self):
    # whenever a new separator is added per regex, add another if statement to the corresponding function
  
    self.regex_country = r"(^[\U0001F1E6-\U0001F1FF]{2})"
    # country flag emoji
    
    self.regex_service = r"^.+\[([A-Z][a-z].+?)\] (?:(?:\[|)[0-9])"
    # service
    # obtained from the first line of the spotting and before the date
    # [A-Z][a-z].+? is for catching the company name among brackets
    
    self.regex_date = r"\d{4}\/\d{2}\/\d{2}" 
    # YYYY/MM/DD
    
    self.regex_town = r'''
      in 
      (\w.+(?=\()|\w.+
      |
      (?:\[)(\w.+?)(?:\]))
      '''.replace("\n", "").replace(" ", "").replace("in(", "in (") # to remove the spaces and newlines
    # first separators is for legacy spottings that have a parenthesis after the town name ( in Town Name( )
      # this is to avoid catching accidental text
    # second separator is for catching legacy spottings with no parenthesis ( in Town Name )
    # third separator is for catching town names among brackets ( in [Town Name] )
    
    self.regex_source = r'''
      source:?.*
      (https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&//=]*)
      |
      (?:[0-9]\])\((?:\<|)
      (https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&//=]*)
      (?:\>|)\)
      |
      \d .+?\w \((.+)\)
      '''.replace("\n", "").replace(" ", "").replace("\\d.", "\\d .").replace("\\w\\", "\\w \\") # to remove the spaces and newlines
    # first separator is for legacy spottings
    # second separator is for catching URLs after the date; among brackets, and sometimes angle brackets
      
    self.regex_location = r'''
      location:?.*
      (https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&//=]*)
      |
      (?:in \[\w.+])\((?:\<|)
      (https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&//=]*)
      (?:\>|)\)
      '''.replace("\n", "").replace(" ", "").replace("in\\", "in \\") # to remove the spaces and newlines, except for the "in"
    # first spearator is for legacy spottings
    # second separator is for catching URLs after the town name; among brackets, and sometimes angle brackets

  async def add_spotting(self, message: Message, channel: dict[str, any], database: DatabaseManager):
    """
    Adds a spotting to the database.

    Args:
      message (Message): The message containing the spotting information.
      channel (dict[str, any]): The channel information.
      database (DatabaseManager): The database manager.

    Raises:
      Exception: If an error occurs while adding the spotting to the database.
        - IndexError: Invalid Spotting
    """
    try:
      # process regex
      spotting = self.spotting.process_spotting(message.content)

      # get spotting meta information
      spotting_message_id = message.id
      spotting_channel_id = channel['id']
      spotting_image = message.attachments[0].url

      if spotting['source'] == None:
        spotting['source'] = message.author.name

      # process service
      if spotting['service'] == None:
        spotting['service'] = channel['company']

      # add the spotting to the database
      await database.add_spotting(
        spotting_message_id,
        spotting_channel_id,
        spotting['date'],
        spotting['town'],
        spotting['country']['country'],
        spotting['country']['countryEmoji'],
        spotting_image,
        spotting['source'],
        spotting['location'],
        spotting['service']
      )

    except Exception as e:
      raise e
    
  def process_spotting(self, spotting: str):
    """
    Process a spotting string and extract relevant information.

    Args:
      spotting (str): The spotting string to be processed.

    Raises:
      IndexError: If the spotting string cannot be parsed or contains invalid information.

    Returns:
      SpottingResult: An object containing the extracted information from the spotting string.
      
      Args:
        country (dict): The country where the spotting occurred - `{"countryEmoji": "🇺🇸", "country": "United States"}`.
        service (str): The service used for spotting.
        date (str): The date of the spotting.
        town (str): The town where the spotting occurred.
        source (str): The source of the spotting information.
        location (str): The location of the spotting.
    """
    
    # basic information
    country = self.get_country(spotting)
    service = self.get_service(spotting)
    town = self.get_town(spotting)
    source = self.get_source(spotting) # source could be proccesed better here, so when theres no source it uses the discord user's name, but unittest would fail
    location = self.get_location(spotting)
    
    # timestamp information
    date_str = self.get_date(spotting)
    date_obj = datetime.datetime.strptime(date_str, "%Y/%m/%d")
    
    # define the SpottingResult class
    return {
      "country": country,
      "service": service,
      "date": date_obj,
      "town": town,
      "source": source,
      "location": location,
    }

  def get_country(self, spotting: str) -> str:
    """
    Extracts the country code and country name from the given spotting string.

    Args:
      spotting (str): The spotting string.

    Returns:
      dict: A dictionary containing the country emoji and country name.
          If the spotting string does not match the regex, the values will be None.
          Example: {"countryEmoji": "🇺🇸", "country": "United States"}
    """
    result = re.search(self.regex_country, spotting.strip())
    if result:
      countryEmoji = result[0]
      country = str(flag.dflagize(result[0])).replace(":", "") # to remove the colon
      return {"countryEmoji": countryEmoji, "country": country}
    return {"countryEmoji": None, "country": None} # legacy spotting
    
  def get_service(self, spotting: str) -> str:
    result = re.findall(self.regex_service, spotting.strip())
    if result:
      return result[0]
    return None # optional, so that it doesn't throw an error if there's no match
  
  def get_date(self, spotting: str) -> str:
    return re.findall(self.regex_date, spotting)[0]
  
  def get_town(self, spotting: str) -> str:
    result = re.findall(self.regex_town, spotting)
    if result:
      for match in result:
        if match[1]:
          return match[1]
        if match[0]:
          return match[0]
    
  def get_source(self, spotting: str) -> str:
    result = re.findall(self.regex_source, spotting)
    if result:
      for match in result:
        # match[0] is for the first separator
        if match[0]:
          return match[0]
        # match[1] is for the second separator
        elif match[1]:
          return match[1]
        # match[2] is for the third separator
        elif match[2]: 
          return match[2]
    
    return None # optional, so that it doesn't throw an error if there's no match
    
  def get_location(self, spotting: str) -> str:  
    result = re.findall(self.regex_location, spotting)
    if result:
      for match in result:
        # match[0] is for the first separator
        if match[0]:
          return match[0]
        # match[1] is for the second separator
        elif match[1]:
          return match[1]
    
    return None # optional, so that it doesn't throw an error if there's no matc