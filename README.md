# MMFM music Panel

[![dockeri.co](https://dockeri.co/image/mmhk/mmfm)](https://hub.docker.com/r/mmhk/mmfm)

![GitHub](https://img.shields.io/github/license/mmhk/mmfm)

一个用于内网的在线共享音乐电台，基于`Vue`全家桶开发。

由于音乐API已经被整合到`Panel`，所以此项目自带web服务端。

## 特性
- 兼容 ~~虾米~~ / 网易云音乐 / QQ音乐 / 咪咕 / 酷我 / 酷狗 歌曲搜索及添加播放
- 通过此`Panel`控制 后端音乐播放器[mmfm-playback-go](https://github.com/MMHK/mmfm-playback-go)

## 项目依赖
- [~~music-api~~](https://github.com/sunzongzheng/musicApi), ~~感谢这位兄台的努力整合了三大平台的API，那之前自己分析的API可以放弃维护了。~~ 已经很久没有维护放弃接入
- [listen1-chrome-extension](https://github.com/listen1/listen1_chrome_extension)，感谢这位兄台的努力整合了各平台的API，主要使用该项目的平台接入代码，再做wrapper。
- [express](https://expressjs.com/)
- [socket.io](https://socket.io/)
- [Vue](https://vuejs.org)


## 开发项目
```bash
npm install
npm run serve
```

## 编译项目
```bash
npm run build
```

## 运行项目
```bash
cd ./dist
node ./server.js -d ./public
```

## Docker 
```bash
docker pull mmhk/mmfm
docker run --rm --name mmfm -p 8011:8011 mmhk/mmfm:latest
```
