# Ping

Petit module TypeScript pour interroger un serveur Minecraft Bedrock en UDP et récupérer ses informations principales:

- nom du serveur
- version Minecraft et version de protocole
- nombre de joueurs en ligne
- carte
- mode de jeu
- latence

Le module exporte une fonction `pingBedrock(host, port, timeout)` qui retourne soit les informations du serveur, soit `false` si le serveur ne répond pas dans le délai imparti.

## Prérequis

- Node.js récent
- npm
- TypeScript disponible via `npx tsc`

## Installation

Installer les dépendances:

```bash
npm install
```

## Compilation

Le projet est configuré pour compiler les fichiers dans le dossier `dist`.

```bash
npx tsc
```

## Utilisation

Exemple depuis un autre fichier TypeScript ou JavaScript compilé:

```ts
import pingBedrock from "./dist/ping.js";

async function main() {
    const result = await pingBedrock("127.0.0.1", 19132, 500);

    if (!result) {
        console.log("Serveur injoignable");
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

## Type de retour

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

## Comportement

- Le port par défaut est `19132`.
- Le timeout par défaut est `500 ms`.
- Si aucune réponse n'est reçue avant le timeout, la fonction retourne `false`.
- Si une réponse invalide est reçue, la promesse est rejetée avec une erreur.

## Structure du projet

- `ping.ts`: logique principale du ping Bedrock
- `tsconfig.json`: configuration TypeScript
- `package.json`: métadonnées et dépendances du projet

## Limites actuelles

- Le projet ne fournit pas encore de script `build` dans `package.json`.
- Le projet ne fournit pas de CLI.
- Le module cible actuellement le protocole de ping Bedrock via UDP.
