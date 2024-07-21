<image>
<img align="right" src="https://raw.githubusercontent.com/shmugoh/whereisthegooglecar/main/site/public/favicon.svg" width="10%">
</image>

<h1>WhereIsTheGoogleCar</h1>

WhereIsTheGoogleCar is a monorepo project that tracks and logs Street View Vehicle Sightings posted from the VirtualStreets Discord server.
This project has been made as an attempt to fulfill the legacy of whereisthegooglecar.com, with more accurate data.

This monorepo consists of the following components.

- `site`: Folder containing the website contents.
- `api`: Folder containing the backend code for the website.
- `bot`: Folder containing the code for the Discord Bot itself.
- `compose.yaml`: Docker Compose for local development.

## Known Issues

- `/remove_channel` stopped working for some reason - issue of channel_id having a relation with the other spottings table
- RegEx month & source doesn't work as intended

## Funding - Keep the site online!

If you really love this project, consider supporting the maintenance costs.
Your contribution will help cover the costs for running this project to stay online!

You can do so by donating on Ko-fi or sponsoring on GitHub. Every bit of support is greatly appreciated!

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/shmugoh)
[![gh-sponsors](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23ff5e5b&style=for-the-badge)](https://github.com/sponsors/shmugoh)

## Contributing

Contributions are welcome! If you have any ideas for improvement, bug reports, or feature requests, feel free to [create an issue](https://github.com/shmugoh/whereisthegooglecar/issues) or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
