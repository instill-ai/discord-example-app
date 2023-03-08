# Discord app connects VDP

![Demo of app](/assets/discord-app-demo.gif?raw=true)

This project contains VDP discord demos based on the [discord-example-app](https://github.com/discord/discord-example-app). We modified the following files to support our demos compared to the original example.

```
├── app.js        -> main entrypoint for app, refactored for better readibility.
├── commands.js   -> slash command payloads + helpers
├── vdp.js        -> utility functions that enables interaction with VDP
├── package.json  -> modified to support deployment on Glitch
├── README.md
└── .gitignore
```

🚀 We have a tutorial for this Discord app. See [Build a Text Generation Discord app with VDP](https://www.instill.tech/tutorials/vdp-discord-text-generation) for detailed instructions.

## Prerequisites
To run this Discord app, make sure you have the prerequisites set up:

- **A Text Generation pipeline on VDP** - The Discord app requires a Text Generation Pipeline as its backend service. To learn more about how to set up this pipeline on VDP, please check our [tutorial](https://www.instill.tech/tutorials/vdp-discord-text-generation).
- **NodeJS** - The Discord app is built with [discord-interation](https://github.com/discord/discord-interactions-js), an npm package based on Javacsript. See [download NodeJS](https://nodejs.org/en/download/) for installation instructions.

## Build the Discord app

Discord app is a versatile tool for developers to create interactive interfaces triggering VDP pipelines within Discord channels. Before building the app, you need to

1. install [NodeJS](https://nodejs.org/en/download/) and,
2. [create a Discord app](https://discord.com/developers/docs/getting-started#creating-an-app) with proper permissions:
   - `applications.commands`
   - `bot` (with `Send Messages` and `Use Slash Commands`enabled)

See [Adding scopes and permissions](https://discord.com/developers/docs/getting-started#adding-scopes-and-permissions) for detailed instructions.

### 1. Set up your project

We built this tutorial using a customised discord app. Clone the GitHub project with the shell command below:

```bash
# clone vdp-discord-demo repository to local
git clone https://github.com/instill-ai/vdp-discord-demo && cd vdp-discord-demo
# install NODEJS depensencies
npm install
```

Before running the Discord app, you must set up a few variables in `vdp.js`. These variables indicate your VDP service and the Text Generation pipeline to trigger.

```javascript
// VDP Text Generation pipeline ID
const pipelineID = "gpt2";

// Set up vdp service endpoint
const vdpConsole = `http://localhost:3000/pipelines/${pipelineID}`;
const triggerPipelineEndpoint = `http://locallhost:8080/${pipelineID}/trigger`;
```

### 2. Get app credentials

To connect the service with your Discord app, fetch the credentials from your app's settings and add them to a .env file (see `.env.sample` for an example). You'll need your app ID (`APP_ID`), server ID (`GUILD_ID`), bot token (`DISCORD_TOKEN`), and public key (`PUBLIC_KEY`).

Most of the information can be found in your application listed on the [Developer Portal/Application page](https://discord.com/developers/applications).
Fetching credentials is also covered in detail in [Discord Getting Started](https://discord.com/developers/docs/getting-started).

- `APP_ID`: under Developer Portal/Application/General Information.
- `PUBLIC_KEY`: under Developer Portal/Application/General Information.
- `DISCORD_TOKEN`: under Developer Portal/Application/Bot.
- `GUILD_ID` in Discord, right-click on the server you wish to connect to the Discord app and select **Copy ID**.

> **NOTE**   
> These credentials are added in `.env` for local development. Please keep them safe!

### 3. Run the Discord app


After your credentials are set, go ahead and run it:

```bash
# run the app
node app.js
```

### 4. Set up interactivity

The project needs a public endpoint where Discord can send requests. In this tutorial, we use [**ngrok**](https://ngrok.com/) to tunnel HTTP traffic. Use the command below to install or follow the [installation guide](https://ngrok.com/download).



```bash
# install ngrok locally on macOS
brew install ngrok/ngrok/ngrok
```

```bash
# install ngrok locally on Linux
snap install ngrok
```


Once installed, run **ngork** service with the shell command below:

```bash
# run ngrok using HTTP port 3069
ngrok http 3069
```

And you should see an active ngrok session:

```bash
ngrok                                                                                                                                                    (Ctrl+C to quit)

Join us in the ngrok community @ https://ngrok.com/slack

Session Status                online
Session Expires               1 hour, 59 minutes
Terms of Service              https://ngrok.com/tos
Version                       3.1.1
Region                        Europe (eu)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://ac2e-2a01-4b00-8066-4700-6c3c-765-9d9-f69f.eu.ngrok.io -> http://localhost:3069

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

> **NOTE**  
> Free version **ngrok** can only be active for two hours. Ensure you update the endpoint setting under the **General information** page. Otherwise, you can consider hosting your server or using online services such as [Glitch](https://glitch.com/). Please see [Running your app on Discord](https://glitch.com/) for further details.

Finally, go to your application under the **Discord Developer Portal**, copy the endpoint address, the **forwarding address** provided by **ngrok**, and paste it in the `INTERACTION ENDPOINT URL` below the **PUBLIC KEY** in the General Information page.

You should now see a Discord bot being added to your Discord server as a user! Your bot is now a user who can access your Discord channels with default permissions. You can update its access permission by assigning a role or setting up channel permissions. Please read [See Setting up Permission F&Q](https://support.discord.com/hc/en-us/articles/206029707-Setting-Up-Permissions-FAQ) for further details.

## Type some words and have fun

The bot should support the **Text Generation** Slash commands `/tg` consisting of three fields:

- `prompt`: text input for the generation
- `output_len`: the length of the text to generate (optional, default: 100)
- `seed`: a random seed between 0 and 65535 (optional, default: random generated seed)

Under the hood, the Discord bot wraps the above Slash command into a HTTP request payload and send the HTTP request to trigger the VDP pipeline `gpt2`.

Now, type some words as the `prompt` and have fun! Write a story or even a poetry and share with your friend 🎉.