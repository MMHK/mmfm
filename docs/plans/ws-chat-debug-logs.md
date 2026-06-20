# Add Debug Logs to WebSocket Chat

## Problem
`WebService.ts` 中 Socket.IO chat 部分 logging 不足：
- `msg` 事件（消息轉發）完全無日志
- `disconnect` 事件未記錄 socket.id
- `error` 事件未記錄 socket.id 上下文
- `connection` 事件缺少 remote address

## Solution
在 chat socket handler 中補充 debug log（需 `LOG_LEVEL=debug` 啟用）：

1. **connection**: 補充 `handshake.address`
2. **msg**: 記錄消息轉發來源 + 消息長度
3. **disconnect**: 記錄 socket.id
4. **error**: 記錄 socket.id + error

## Changes

### File: `src/services/WebService.ts` (lines 267-280)

修改前：
```ts
io.on("connection", (socket) => {
  logger.debug("Socket connected:", socket.id);
  socket.join("chat");
  socket.on("msg", (msg) => {
    socket.to("chat").emit("msg", msg);
  });
  socket.on("disconnect", () => {
    logger.debug("on disconnect");
  });

  socket.on("error", (error) => {
    logger.error(error);
  });
});
```

修改后：
```ts
io.on("connection", (socket) => {
  logger.debug("Socket connected:", socket.id, "from", socket.handshake.address);
  socket.join("chat");
  logger.debug("Socket", socket.id, "joined chat room");
  socket.on("msg", (msg) => {
    logger.debug("msg from", socket.id, "len:", msg.length);
    socket.to("chat").emit("msg", msg);
  });
  socket.on("disconnect", () => {
    logger.debug("Socket disconnected:", socket.id);
  });

  socket.on("error", (error) => {
    logger.error("Socket error from", socket.id, error);
  });
});
```

## Verification
1. `yarn lint`
2. `yarn build`

## Status
- [x] Delegate to sub agent
- [x] Verify lint passes
- [x] Verify build passes
**完成日期**: 2026-06-20
