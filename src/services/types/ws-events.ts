import type { PlaylistItem } from "../SongService";

export interface PlayerPlayEvent {
  cmd: "player.play";
  args: [album: PlaylistItem, index: number];
}

export interface PlayerPauseEvent {
  cmd: "player.pause";
  args: [album: PlaylistItem, index: number, time: number, total: number];
}

export interface PlayerContinueEvent {
  cmd: "player.continue";
}

export interface PlayerPlayingEvent {
  cmd: "player.playing";
  args: [album: PlaylistItem, index: number, time: number, total: number];
}

export interface PlayerCurrentEvent {
  cmd: "player.current";
}

export interface PlaylistUpdateEvent {
  cmd: "update";
}

export type WSEvent =
  | PlayerPlayEvent
  | PlayerPauseEvent
  | PlayerContinueEvent
  | PlayerPlayingEvent
  | PlayerCurrentEvent
  | PlaylistUpdateEvent;

export type WSEventMap = {
  [E in WSEvent as E["cmd"]]: "args" extends keyof E ? E["args"] : never;
};
