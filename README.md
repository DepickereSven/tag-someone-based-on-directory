# Tag someone based on directory

> A GitHub App built with [Probot](https://github.com/probot/probot) that Tags someone based on code changes in a certain folder

## Information

Certain people need to review certain code changes so instead you as a person tagging them to ask for a review. \
We have a bot that can do this for you!

## Usage

There are a couple of configuration options that you will need to set up depending on what you want.

```yml
personToTag: UserNameOfPerson # This is the user you want to tag to send the comment to
regexPath: (api\/) # If something changed in this folder we will post comment asking the user to verify the changes
```




### Extra available options

| Name    | Description                               | Default                                                    |
|---------|-------------------------------------------|------------------------------------------------------------|
| message | The message you want to send to the user. | would you be so kind to review the following code changes? |


## Contributing

If you have suggestions for how tag-someone-based-on-directory could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2022 Depickere Sven <sven.depickere@hotmail.com>
