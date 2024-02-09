import re

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
    
  def get_country(self, spotting: str) -> str:
    result = re.search(self.regex_country, spotting.strip())
    if result:
      return result[0]
    return None # legacy spotting
    
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
    
    return None # optional, so that it doesn't throw an error if there's no match

  def process_spotting(self, spotting: str) -> dict[str, any]:
    """
    Process a spotting string and extract relevant information.

    Args:
      spotting (str): The spotting string to be processed.

    Returns:
      dict: A dictionary containing the extracted information:
        - 'country': The country of the spotting.
        - 'service': The service associated with the spotting.
        - 'date': The date of the spotting.
        - 'town': The town of the spotting.
        - 'source': The source of the spotting.
        - 'location': The location of the spotting.

    Raises:
        IndexError: If the spotting string cannot be parsed or contains invalid information.

    """
    country = self.get_country(spotting)
    service = self.get_service(spotting)
    date = self.get_date(spotting)
    town = self.get_town(spotting)
    source = self.get_source(spotting)
    location = self.get_location(spotting)
    
    return {
      "country": country,
      "service": service,
      "date": date,
      "town": town,
      "source": source,
      "location": location
    }