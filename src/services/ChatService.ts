import { io, type Socket } from 'socket.io-client';
import { EventBus } from "./Bus";
import type { WSEvent } from "./types/ws-events";
import type { PlaylistItem } from "./SongService";

interface ServerToClientEvents {
    msg: (data: string) => void;
}

interface ClientToServerEvents {
    msg: (data: string) => void;
}

interface CmdMap {
    msg: string;
    ready: string;
    player: {
        play: string;
        pause: string;
        continue: string;
        playing: string;
        current: string;
    };
    playlist: {
        update: string;
    };
}

const cmd: CmdMap = {
    msg: "msg",
    ready: "ready",
    player: {
        play: "player.play",
        pause: "player.pause",
        continue: "player.continue",
        playing: "player.playing",
        current: "player.current"
    },
    playlist: {
        update: "update"
    }
};

interface PlayerControls {
    play(album: PlaylistItem, index: number): void;
    pause(): void;
    continue(): void;
    playing(album: PlaylistItem, index: number, time: number, total: number): void;
    current(): void;
}

interface PlaylistControls {
    update(): void;
}

export default class ChatService {
    private API: string;
    private client: Socket<ServerToClientEvents, ClientToServerEvents>;

    static get CMD(): CmdMap {
        return cmd;
    }

    constructor() {
        this.API = (globalThis as any).WS_URL || "";

        this.client = io<ServerToClientEvents, ClientToServerEvents>(this.API, {
            path: "/io",
            transports: ['websocket', 'polling']
        })

        this.client.on("connect", () => {
            this.client.on(cmd.msg, function (data: string) {
                const evt: WSEvent = JSON.parse(data);
                if (evt) {
                    var jcmd = evt.cmd || "",
                        jargs = "args" in evt ? evt.args : false;
                    EventBus.emit(jcmd, jargs);
                }
            });

            EventBus.emit(cmd.ready);
        });
    }

    playlist(): PlaylistControls {
        let client = this.client

        return {
            update() {
                client.emit(cmd.msg, JSON.stringify({
                    cmd: cmd.playlist.update
                }));
            }
        }
    }

    player(): PlayerControls {
        let client = this.client

        return {
            play(album: PlaylistItem, index: number) {
                client.emit(cmd.msg, JSON.stringify({
                    cmd: cmd.player.play,
                    args: [album, index]
                }));
            },

            pause() {
                client.emit(cmd.msg, JSON.stringify({
                    cmd: cmd.player.pause
                }));
            },

            continue() {
                client.emit(cmd.msg, JSON.stringify({
                    cmd: cmd.player.continue
                }));
            },

            playing(album: PlaylistItem, index: number, time: number, total: number) {
                client.emit(cmd.msg, JSON.stringify({
                    cmd: cmd.player.playing,
                    args: [album, index, time, total]
                }));
            },

            current() {
                client.emit(cmd.msg, JSON.stringify({
                    cmd: cmd.player.current
                }));
            }
        }
    }
}
