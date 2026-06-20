# WS Event Type Definitions

## Status: Completed

---

## Goal

保持單 `msg` channel 架構，建立完整的 WSEvent discriminated union 型別，讓 payload 結構可追溯。

---

## 設計

### 1. 新增 `src/services/types/ws-events.ts`

```ts
import type { PlaylistItem } from "../SongService";

// WS payload — discriminated union on `cmd`
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
```

### 2. 更新 `Bus.ts`

```ts
import type { WSEventMap } from "./types/ws-events";

type Events = WSEventMap & {
  "song.add": PlaylistItem;
  "search.open": undefined;
  "ready": undefined;
};
```

### 3. 更新 `ChatService.ts`
- import `WSEvent` 型別
- `msg` handler 裡 `JSON.parse(data)` 轉型為 `WSEvent`
- 用 narrowing 驗證 `cmd` 合法性
- 移除 `CmdMap` 中的 `playlist.current`（死代碼）
- `PlayerControls` / `PlaylistControls` 的 args 改用 `PlaylistItem` 取代 `any`

### 4. 更新 `Player.vue`
- EventBus listener callback 自動獲得正確 args 型別
- 移除 `playlist.current` 死代碼（line 193-204）
- `args` 解構改為具名取值

---

## 檔案變動

| 檔案 | 操作 |
|------|------|
| `src/services/types/ws-events.ts` | 新增 |
| `src/services/Bus.ts` | 修改 — EventBus 型別 map |
| `src/services/ChatService.ts` | 修改 — import WSEvent、remove dead cmd、type narrowing |
| `src/components/Player.vue` | 修改 — 移除死代碼、typed callback args |

## 驗證

- `yarn lint` 0 errors
- `yarn build` 通過
- `yarn build:service` 通過
