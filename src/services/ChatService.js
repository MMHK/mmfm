import io from 'socket.io-client';
import {
    EventBus
} from "./Bus";

const cmd = {
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


export default class {
    static get CMD() {
        return cmd;
    }

    constructor() {
        this.API = global.WS_URL || "";

        this.client = io(this.API, {
            path: "/io",
            transports: ['websocket', 'polling']
        })

        this.client.on("connect", () => {
            this.client.on(cmd.msg, function (data) {
                var args = JSON.parse(data);
                if (args) {
                    var jcmd = args["cmd"] || "",
                        jargs = args["args"] || false;
                    EventBus.$emit(jcmd, jargs);
                }
            });

            EventBus.$emit(cmd.ready);
        });
    }

    playlist() {
        let client = this.client

        return {
            update() {
                client.emit(cmd.msg, JSON.stringify({
                    cmd: cmd.playlist.update
                }));
            }
        }
    }

    player() {

        let client = this.client

        return {

            play(album, index) {
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

            continue () {
                client.emit(cmd.msg, JSON.stringify({
                    cmd: cmd.player.continue
                }));
            },

            playing(album, index, time, total) {
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