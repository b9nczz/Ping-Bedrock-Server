import dgram from "dgram";
import crypto from "crypto";

const MAGIC = Buffer.from("00ffff00fefefefefdfdfdfd12345678", "hex");
const UNCONNECTED_PONG = 0x1C;

function createUnconnectedPingFrame(timestamp: number) {
    const buffer = Buffer.alloc(1 + 8 + 16 + 8);
    buffer.writeUInt8(0x01, 0);
    buffer.writeBigUInt64LE(BigInt(timestamp), 1);
    MAGIC.copy(buffer, 9);
    buffer.writeBigUInt64LE(BigInt("0x" + crypto.randomBytes(8).toString("hex")), 25);
    return buffer;
}

function extractModt(buffer: Buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 35) {
        throw new Error("Invalid pong packet");
    }

    let offset = 33;
    const length = buffer.readUInt16BE(offset);

    if (offset + 2 + length > buffer.length) {
        throw new Error("Malformed pong packet");
    }

    const motdString = buffer.slice(offset + 2, offset + 2 + length).toString();
    const comp = motdString.split(";");

    if (comp.length < 9) {
        throw new Error("Invalid MOTD format");
    }

    return {
        edition: comp[0],
        name: comp[1],
        version: {
            protocolVersion: Number(comp[2]),
            minecraftVersion: comp[3],
        },
        players: {
            online: Number(comp[4]),
            max: Number(comp[5]),
        },
        serverId: comp[6],
        mapName: comp[7],
        gameMode: comp[8],
    };
}

function ping(host: string, port: number = 19132, timeout: number = 500) {
    return new Promise((resolve, reject) => {
        const socket = dgram.createSocket("udp4");
        const timestamp = Date.now();
        const packet = createUnconnectedPingFrame(timestamp);

        const start = Date.now();

        socket.send(packet, port, host, (err: Error | null) => {
            if (err) return reject(err);
        });

        socket.once("message", (data: Buffer) => {
            clearTimeout(timeoutId);

            const end = Date.now();

            if (data[0] !== UNCONNECTED_PONG) {
                socket.close();
                return reject(new Error("Unexpected packet received"));
            }

            try {
                const pong = extractModt(data) as any;
                pong.ping = end - start;
                resolve(pong);
            } catch (err) {
                reject(err);
            } finally {
                socket.close();
            }
        });

        const timeoutId = setTimeout(() => {
            socket.close();
            resolve(false);
        }, timeout);

    });
}

/**
 * @param {string} host 
 * @param {number} port 
 * @returns
 */

export type BedrockPingResult = {
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

async function pingBedrock(host: string, port: number, timeout: number = 500): Promise<BedrockPingResult> {
    const r = await ping(host, port, timeout) as BedrockPingResult;

    if (!r) {
        return false;
    }

    return {
        edition: r.edition,
        name: r.name,
        version: {
            minecraftVersion: r.version.minecraftVersion,
            protocolVersion: r.version.protocolVersion,
        },
        players: {
            online: r.players.online,
            max: r.players.max,
        },
        serverId: r.serverId,
        mapName: r.mapName,
        gameMode: r.gameMode,
        ping: r.ping,
    };
}

export default pingBedrock;