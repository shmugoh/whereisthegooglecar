from datetime import datetime

def convert_date(date: str):
  return datetime.strptime(date, '%Y/%m/%d')

def stringify_date(date: datetime):
  return date.strftime("%Y/%m/%d")