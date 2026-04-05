# Ping

A small TypeScript module to query a Minecraft Bedrock server over UDP and retrieve its main information:

- server name
- Minecraft version and protocol version
- online player count
- map name
- game mode
- latency

The module exports a `pingBedrock(host, port, timeout)` function that returns either the server information or `false` if the server does not respond within the given timeout.

## Prerequisites

- Recent Node.js
- npm
- TypeScript available via `npx tsc`

## Installation

Install dependencies:

```bash
npm install
```

## Build

The project is configured to compile files into the `dist` folder.

```bash
npx tsc
```

## Usage

Example from another compiled TypeScript or JavaScript file:

```ts
import pingBedrock from "./dist/ping.js";

async function main() {
    const result = await pingBedrock("127.0.0.1", 19132, 500);

    if (!result) {
        console.log("Server unreachable");
        return;
    }

    console.log(result);
}

main();
```

## Signature

```ts
pingBedrock(host: string, port: number, timeout?: number): Promise<BedrockPingResult>
```

## Return Type

```ts
type BedrockPingResult = {
    edition: string;
    name: string;
    version: {
        minecraftVersion: string;
        protocolVersion: number;
    };
    players: {
        online: number;
        max: number;
    };
    serverId: string;
    mapName: string;
    gameMode: string;
    ping: number;
} | false;
```

## Behavior

- Default port is `19132`.
- Default timeout is `500 ms`.
- If no response is received before the timeout, the function returns `false`.
- If an invalid response is received, the promise is rejected with an error.

## Project Structure

- `ping.ts`: main Bedrock ping logic
- `tsconfig.json`: TypeScript configuration
- `package.json`: project metadata and dependencies

## Current Limitations

- The project does not yet provide a `build` script in `package.json`.
- The project does not provide a CLI.
- Le module cible actuellement le protocole de ping Bedrock via UDP.
