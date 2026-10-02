# ForgeMinecraft

> ForgeMinecraft is an extension that provides real-time Minecraft server management via the management server protocol, alongside various functions for retrieving status and metadata from Java and Bedrock servers.

| | |
|---|---|
| Type | Official extension · verified |
| GitHub | https://github.com/tryforge/ForgeMinecraft |
| npm | `forge.minecraft` (`npm i forge.minecraft`) |
| Lead dev | Nicky |
| Main branch | `main` |
| Docs page | https://docs.botforge.org/?p=ForgeMinecraft |

## Contents

- [`functions/`](functions/_INDEX.md) — 99 functions
- [`events/`](events/_INDEX.md) — 21 events
- [`enums/`](enums/_INDEX.md) — 15 enums

## Changelog summary

| Version | Changes |
|---|---|
| 1.0.0 | Init ForgeMinecraft |

Full changelog: [`CHANGELOG.md`](CHANGELOG.md)

---

## Package README (verbatim from GitHub)

<div align="center">

<img height="150" width="150" src="https://raw.githubusercontent.com/tryforge/ForgeMinecraft/main/assets/ForgeMinecraft.png" alt="ForgeMinecraft">

# ForgeMinecraft

ForgeMinecraft is an extension that provides real-time Minecraft server management via the management server protocol, alongside various functions for retrieving status and metadata from Java and Bedrock servers.

<a href="https://github.com/tryforge/ForgeMinecraft/"><img src="https://img.shields.io/github/package-json/v/tryforge/ForgeMinecraft/main?label=@tryforge/forge.minecraft&color=5c16d4" alt="@tryforge/forge.minecraft"></a>
<a href="https://github.com/tryforge/ForgeScript/"><img src="https://img.shields.io/github/package-json/v/tryforge/ForgeScript/main?label=@tryforge/forgescript&color=5c16d4" alt="@tryforge/forgescript"></a>
<a href="https://discord.gg/hcJgjzPvqb"><img src="https://img.shields.io/discord/997899472610795580?logo=discord" alt="Discord"></a>

</div>

---

## Contents

1. [Installation](#installation)
2. [Management Server](#management-server)
3. [Java & Bedrock Servers](#java--bedrock-servers)
4. [Documentation](https://docs.botforge.org/p/ForgeMinecraft/)

<h3 align="center">Installation</h3><hr>

1. Run the following command to install the required `npm` packages:

   ```bash
   npm i @tryforge/forge.minecraft
   ```

2. Here’s an example of how your main file should look:

   ```js
   const { ForgeClient } = require("@tryforge/forgescript")
   const { ForgeMinecraft } = require("@tryforge/forge.minecraft")

   const minecraft = new ForgeMinecraft({
       java: {
           host: "0.0.0.0", // Default Java Server
           port: 25565
       },
       bedrock: {
           host: "0.0.0.0" // Default Bedrock Server
       }
   })

   const client = new ForgeClient({
       ...options, // The options you currently have
       extensions: [
           minecraft
       ]
   })

   client.commands.load("commands")

   client.login("YourToken")
   ```

   > 💡 **Tip**\
   > View all available client options [**here**](https://tryforge.github.io/ForgeMinecraft/interfaces/IForgeMinecraftOptions.html).

<h3 align="center">Management Server</h3><hr>

Minecraft’s management server protocol, introduced in **1.21.9**, enables remote management and monitoring of your Minecraft server. It allows this extension to connect to the server, execute administrative actions, and receive real-time events such as player activity, server status changes, and configuration updates, making automation and server control easier.

#### Setting up the Minecraft Server

To enable the management server protocol, set up `management-server-enabled`, `management-server-port` and `management-server-host` in the **server.properties** file of your Minecraft server:

```properties
management-server-enabled=true
management-server-port=25585
management-server-host=0.0.0.0
management-server-secret=
```

You can either set `management-server-secret` to a random 40 character long alphanumeric string or leave it empty and let the Minecraft server generate a random token on startup. You will need this token to connect to the server.

If you want to establish connections from a web browser, you need to set the allowed origins:

```properties
management-server-allowed-origins=http\://localhost\:63315
```

#### TLS

By default, TLS is enabled, but the server will crash if you don't provide a certificate. If the management server protocol is not exposed to the internet, or you are using a reverse proxy, the easiest option would be to disable TLS:

```properties
management-server-tls-enabled=false
```

#### Setting up Client Configurations

Next, configure the **ForgeMinecraft** client. This is where you specify which server `events` you want to listen to and provide the management server connection details, such as `host`, `port`, and authentication `token` (secret). These options determine how ForgeMinecraft connects to your server and which real-time events the extension receives.

```js
const minecraft = new ForgeMinecraft({
    events: [
        "playerJoined",
        "serverStarted"
    ],
    server: {
        host: "0.0.0.0",
        port: 3000,
        token: "YourAuthToken",
    }
})

// ...

minecraft.commands.load("minecraft") // Load your server events folder

// ...
```

> 💡 **Tip**\
> View all available server options [**here**](https://tryforge.github.io/ForgeMinecraft/interfaces/IManagementServerOptions.html).

<h3 align="center">Java & Bedrock Servers</h3><hr>

Desired Java and Bedrock functions let you fetch status and metadata from Minecraft servers on demand. You can call these functions with custom `host` and `port` arguments, or define [default Java and Bedrock server settings in the client configuration](#installation) to avoid passing arguments each time. The responses include various details such as server status, version, players, and more. Note that availability depends on the server, as not all servers allow full information to be queried.
