# WXT + Svelte

A chrome extension that takes elements from user's selection and send a response using Gemini's AI.

## Requirements

The extension requires the following to be true:

- Chrome or Firefox version 121 or higher
- Application running Svelte version `^4.0.0`

## Development

Clone this repository and setup the environment with `pnpm`

```sh
pnpm install

cd workspace/extension
pnpm dev
```

To work on the extension, run the `dev` script from `workspace/extension` directory

```sh
cd workspace/extension
pnpm build
```

## Execution

This will build the extension and create a directory called `.output`. Steps may vary depending on the browser you are using, but generally:

1. Navigate to the extensions settings page
2. Turn on the 'Developer mode' switch
3. Click 'Load Unpacked' and select the `.output` directory

