# tag-someone-based-on-directory

> A GitHub App built with [Probot](https://github.com/probot/probot) that Tag someone based on code changes in a certain folder

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t tag-someone-based-on-directory .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> tag-someone-based-on-directory
```

## Contributing

If you have suggestions for how tag-someone-based-on-directory could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2022 Depickere Sven <sven.depickere@hotmail.com>
