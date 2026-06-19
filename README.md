# MMFM music Panel

[![dockeri.co](https://dockeri.co/image/mmhk/mmfm)](https://hub.docker.com/r/mmhk/mmfm)

![GitHub](https://img.shields.io/github/license/mmhk/mmfm)

一个用于内网的在线共享音乐电台，基于`Vue`全家桶开发。

由于音乐API已经被整合到`Panel`，所以此项目自带web服务端。

## 特性
- 兼容 ~~虾米~~ / 网易云音乐 / QQ音乐 / 咪咕 / 酷我 / 酷狗 歌曲搜索及添加播放
- 通过此`Panel`控制 后端音乐播放器[mmfm-playback-go](https://github.com/MMHK/mmfm-playback-go)
- 支持本地播放模式（通过 `.env` 配置 `LOCAL_PLAYER_MODE=true` 开启）
- 浏览器端 HTML5 Audio 直接播放（默认关闭，默认使用后端远程播放）
- 播放列表持久化存储（保存到 `cache/playlist.json`）

## 环境配置

项目使用 `.env` 文件管理前端环境变量（通过 rspack DefinePlugin 注入）。

首次开发请复制 `.env.example` 为 `.env`：
```bash
cp .env.example .env
```

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `LOCAL_PLAYER_MODE` | `false` | 开启后使用浏览器端 HTML5 Audio 播放，关闭则使用后端远程播放 |

修改 `.env` 后需要重新 `yarn build` 或重启 `yarn serve`。

## 项目依赖
- [~~music-api~~](https://github.com/sunzongzheng/musicApi), ~~感谢这位兄台的努力整合了三大平台的API，那之前自己分析的API可以放弃维护了。~~ 已经很久没有维护放弃接入
- [listen1-chrome-extension](https://github.com/listen1/listen1_chrome_extension)，感谢这位兄台的努力整合了各平台的API，主要使用该项目的平台接入代码，再做wrapper。
- [express](https://expressjs.com/)
- [socket.io](https://socket.io/)
- [Vue](https://vuejs.org)


## 开发项目
```bash
yarn install
yarn serve
```

## 编译项目
```bash
yarn build
```

## 运行项目
```bash
cd ./dist
node ./service.js -d ./public
```

## Docker 
```bash
docker pull mmhk/mmfm
docker run --rm --name mmfm -p 8011:8011 mmhk/mmfm:latest
```
