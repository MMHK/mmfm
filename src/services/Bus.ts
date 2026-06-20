import mitt, { type Emitter } from "mitt";
import type { WSEventMap } from "./types/ws-events";
import type { PlaylistItem } from "./SongService";

type Events = WSEventMap & {
  "song.add": PlaylistItem;
  "search.open": undefined;
  "ready": undefined;
};

const emitter: Emitter<Events> = mitt<Events>();

export { emitter as EventBus };
