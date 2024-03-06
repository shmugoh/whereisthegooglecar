<image>
<img align="right" src="https://raw.githubusercontent.com/shmugoh/whereisthegooglecar/main/site/public/favicon.svg" width="10%">
</image>

<!-- <image>
<img align="right" src="https://github.com/yourusername/whereisthegooglecar/raw/master/docs/logo.png" width="10%">
</image> -->
<h1>WhereIsTheGoogleCar</h1>

<a href="https://railway.app/template/wCT-86?referralCode=HFLxLD" target="_blank"><img src="https://railway.app/button.svg" alt="Deploy on Railway" height="32px" /></a> <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshmugoh%2Fwhereisthegooglecar%2Ftree%2Fmain%2Fsite&env=NEXT_PUBLIC_CDN_URL,NEXT_PUBLIC_VERCEL_URL,KV_URL,KV_REST_API_URL,KV_REST_API_TOKEN,KV_REST_API_READ_ONLY_TOKEN&repository-name=whereisthegooglecar" target="_blank"><img src="https://vercel.com/button" alt="Deploy with Vercel" height="35px" /></a>

WhereIsTheGoogleCar is a monorepo project that tracks and logs all Google car sightings posted from the VirtualStreets Discord server.
This project has been made as an attempt to fulfill the legacy of whereisthegooglecar.com, with more accurate data.

This monorepo consists of the following components.

- `site`: Folder containing the website contents.
- `bot`: Folder containing the code for the Discord Bot itself.
- `compose.yaml`: Docker Compose for local development.

To access the website contents, navigate to the `site` folder. To access the bot, navigate to the `bot` folder.

## Getting Started - Local Development

0. Initiate an AWS S3 Bucket (& CloudFront if needed), alongside IAM credentials with `s3:PutObject` permissions; passed over to the S3 Bucket Policy.
1. Rename `.env.example` to `.env`, and adjust to your settings.
2. Initiate `docker-compose up -d`.
3. Head over to the site folder.
4. Pass over the environment variables from root to site's `.env`.
5. Run `npm run dev`.

**Note**: We are not setting up a development Docker service for the site itself
here, as it is very slow (especially if you have low memory);
Prisma's client will not function properly if your host operating system is not Linux;
and you'd be better off using `npm run dev` locally. Trust me, you don't want to get into that mess unless you know what you're doing.

## Getting Started - Deploying

0. Initiate an AWS S3 Bucket (& CloudFront if needed), alongside IAM credentials with `s3:PutObject` permissions; passed over to the S3 Bucket Policy.
1. In Vercel (or any other Redis serverless provider such as Upstash), initialize Redis
2. Configure the environment variables asked in Railway, then proceed to deploy
   - You may wanna deploy twice, as the template has the PostgreSQL variables
     pre-written, but they may not work with once Railway initializes the database.
3. Configure the environment variables asked in Vercel, then proceed to deploy.

## Known Issues

- A bunch of ESLint & type errors on the site monorepo
- Image compression is somewhat messy
- No domain... yet
- `/remove_channel` stopped working for some reason - issue of channel_id having a relation with the other spottings table

## Future Plans

- Search Button
- Improve bot logging
- Manual Submission through bot
- Manual Submission through site (I personally have my doubts for this, may or may not be a thing)
- Better specific spotting page
  - Source embed by left; location by right

## Funding - Keep the site online!

If you really love this project, consider the maintenance costs.
Your contribution will help cover the costs for running this project to stay online

You can do so by donating on Ko-fi or sponsoring on GitHub. Every bit of support is greatly appreciated!

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/shmugoh)
[![gh-sponsors](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23ff5e5b&style=for-the-badge)](https://github.com/sponsors/shmugoh)

## Contributing

Contributions are welcome! If you have any ideas for improvement, bug reports, or feature requests, feel free to [create an issue](https://github.com/shmugoh/whereisthegooglecar/issues) or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
