# whereisthegooglecar

## w.i.p.

monorepo project that tracks and logs all google car sightings posted from the virtualstreets discord server. this project
has been made as an attempt to fulfill the legacy of whereisthegooglecar.com, with more accurate data

no documentation yet, but i'll leave a poorly written block of known issues for now:

# known issues

- discord-bot won't work in a local docker compose environment if you're connecting to the local docker serverless redis
  - discord_bot works if ran locally though; dotenv automatically loads the .env from the monorepo root
- a bunch of eslint & type errors on the site monorepo
- images are not optimized
- no domain... yet
- /remove_channel stopped working for some reason - issue of channel_id having a relation with the other spottings table

# future plans

- manual entry through bot
- search button
- improve bot logging
- submission from site (...i have my doubts about this one, but we'll see how it goes!)
- better specific spotting page
  - source embed by left; location by right
