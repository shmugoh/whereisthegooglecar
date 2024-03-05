import logging
import os

from PIL import Image
import tempfile
import ffmpeg

from io import BytesIO
import requests

class LoggingFormatter(logging.Formatter):
    # Colors
    black = "\x1b[30m"
    red = "\x1b[31m"
    green = "\x1b[32m"
    yellow = "\x1b[33m"
    blue = "\x1b[34m"
    gray = "\x1b[38m"
    # Styles
    reset = "\x1b[0m"
    bold = "\x1b[1m"

    COLORS = {
        logging.DEBUG: gray + bold,
        logging.INFO: blue + bold,
        logging.WARNING: yellow + bold,
        logging.ERROR: red,
        logging.CRITICAL: red + bold,
    }

    def format(self, record):
        log_color = self.COLORS[record.levelno]
        format = "(black){asctime}(reset) (levelcolor){levelname:<8}(reset) (green){name}(reset) {message}"
        format = format.replace("(black)", self.black + self.bold)
        format = format.replace("(reset)", self.reset)
        format = format.replace("(levelcolor)", log_color)
        format = format.replace("(green)", self.green + self.bold)
        formatter = logging.Formatter(format, "%Y-%m-%d %H:%M:%S", style="{")
        return formatter.format(record)

logger = logging.getLogger("aws_s3")
logger.setLevel(logging.INFO)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(LoggingFormatter())
# File handler
file_handler = logging.FileHandler(filename="aws_s3.log", encoding="utf-8", mode="w")
file_handler_formatter = logging.Formatter(
    "[{asctime}] [{levelname:<8}] {name}: {message}", "%Y-%m-%d %H:%M:%S", style="{"
)
file_handler.setFormatter(file_handler_formatter)

# Add the handlers
logger.addHandler(console_handler)
logger.addHandler(file_handler)

class ImageUpload:
    def __init__(self, aws_session, aws_bucket):
      """
      Initializes an instance of the ImageUpload class.

      Args:
        aws_session (boto3.Session): The AWS session object.
        aws_bucket (str): The name of the AWS S3 bucket.

      Returns:
        None
      """
      self.aws_session = aws_session
      self.aws_bucket = aws_bucket
      self.s3 = aws_session.resource('s3')

    def upload(self, image, id):
      try:
        self.s3.Bucket(self.aws_bucket).put_object(Key=f'images/{id}.webp', Body=image, ContentType='image/png')
        logger.info(f"Uploaded image {id}.webp to S3")
        return f'images/{id}.webp'
      except Exception as e:
        logger.error(f"Failed to upload image {id}: {e}")
        raise Exception(f"S3 Upload: {e}")

    def delete(self, id):
      try:
        self.s3.Object(self.aws_bucket, f'images/{id}.webp').delete()
        logger.info(f"Deleted image {id} from S3")
      except Exception as e:
        logger.error(f"Failed to delete image {id}: {e}")
        raise Exception(f"S3 Delete: {e}")

    def process(self, image_url):
      """
      Process the given file and return the processed image as bytes.

      Args:
        image_url (str): URL of the image file.

      Returns:
        The processed image as bytes.
      """
      # load image from URL
      try:
        response = requests.get(image_url)
        input = BytesIO(response.content)
        
        # converts first frame of video to image
        if response.headers['Content-Type'].startswith('video'):
          try:
            input = self.process_video(input)
          except Exception as e:
            raise Exception(e)
        
        # process image and return as bytes
        image = Image.open(input)
        
        # create temp file to append to IO
        with tempfile.NamedTemporaryFile(delete=False) as temp:
          image.save(temp.name, format='WebP', quality=10, optimize=True)
          temp.close()
          
          # append to IO
          with open(temp.name, 'rb') as f:
            output = BytesIO(f.read())
          os.remove(temp.name)
        
        logger.info(f"Processed image {image_url}")
        return output.getvalue()
      except Exception as e:
        logger.error(f"Failed to process image {image_url}: {e}")
        raise Exception(f"S3 Processing: {e}")

    def process_video(self, video_bytesio):
      try:
        # save video to file temporarily
        video_bytesio.seek(0)
        with open("tmp_vid", "wb") as f:
          f.write(video_bytesio.getbuffer())

        # process video and return first frame as image bytes
        logger.info(f"Processing video to first frame")
        process = (
          ffmpeg
          .input('tmp_vid')
          .output('tmp_%03d.png', vf='select=eq(n\,1)') # selects second frame; docker's ffmpeg crashes without %03d, creates two temporal files
          .run(quiet=False, overwrite_output=True)
        )
        logger.info(f"Processed video to first frame")

        # read image from buffer and return as bytes
        file = open('tmp_002.png', 'rb')
        buffer = BytesIO(file.read())
        # cleanup
        file.close()
        os.remove('tmp_vid')
        os.remove('tmp_001.png')
        os.remove('tmp_002.png')

        return buffer

      except Exception as e:
        logger.error(f"Failed to process video: {e}")
        raise Exception(f"S3 Video Processing: {e}")