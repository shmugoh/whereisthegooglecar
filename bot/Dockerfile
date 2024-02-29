FROM gorialis/discord.py:3.10.11-alpine-full

WORKDIR /bot

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "python", "bot.py" ]