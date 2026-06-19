# MMFM music Panel

[![dockeri.co](https://dockeri.co/image/mmhk/mmfm)](https://hub.docker.com/r/mmhk/mmfm)

![GitHub](https://img.shields.io/github/license/mmhk/mmfm)

涓€涓敤浜庡唴缃戠殑鍦ㄧ嚎鍏变韩闊充箰鐢靛彴锛屽熀浜巂Vue`鍏ㄥ妗跺紑鍙戙€?

鐢变簬闊充箰API宸茬粡琚暣鍚堝埌`Panel`锛屾墍浠ユ椤圭洰鑷甫web鏈嶅姟绔€?

## 鐗规€?
- 鍏煎 ~~铏剧背~~ / 缃戞槗浜戦煶涔?/ QQ闊充箰 / 鍜挄 / 閰锋垜 / 閰风嫍 姝屾洸鎼滅储鍙婃坊鍔犳挱鏀?
- 閫氳繃姝Panel`鎺у埗 鍚庣闊充箰鎾斁鍣╗mmfm-playback-go](https://github.com/MMHK/mmfm-playback-go)
- 鏀寔鏈湴鎾斁妯″紡锛堥€氳繃 `.env` 閰嶇疆 `LOCAL_PLAYER_MODE=true` 寮€鍚級
- 娴忚鍣ㄧ HTML5 Audio 鐩存帴鎾斁锛堥粯璁ゅ叧闂紝榛樿浣跨敤鍚庣杩滅▼鎾斁锛?
- 鎾斁鍒楄〃鎸佷箙鍖栧瓨鍌紙淇濆瓨鍒?`cache/playlist.json`锛?

## 鐜閰嶇疆

椤圭洰浣跨敤 `.env` 鏂囦欢绠＄悊鍓嶇鐜鍙橀噺锛堥€氳繃 rspack DefinePlugin 娉ㄥ叆锛夈€?

棣栨寮€鍙戣澶嶅埗 `.env.example` 涓?`.env`锛?
```bash
cp .env.example .env
```

| 鍙橀噺 | 榛樿鍊?| 璇存槑 |
|------|--------|------|
| `LOCAL_PLAYER_MODE` | `false` | 寮€鍚悗浣跨敤娴忚鍣ㄧ HTML5 Audio 鎾斁锛屽叧闂垯浣跨敤鍚庣杩滅▼鎾斁 |

淇敼 `.env` 鍚庨渶瑕侀噸鏂?`yarn build` 鎴栭噸鍚?`yarn serve`銆?

## 椤圭洰渚濊禆
- [~~music-api~~](https://github.com/sunzongzheng/musicApi), ~~鎰熻阿杩欎綅鍏勫彴鐨勫姫鍔涙暣鍚堜簡涓夊ぇ骞冲彴鐨凙PI锛岄偅涔嬪墠鑷繁鍒嗘瀽鐨凙PI鍙互鏀惧純缁存姢浜嗐€倊~ 宸茬粡寰堜箙娌℃湁缁存姢鏀惧純鎺ュ叆
- [listen1-chrome-extension](https://github.com/listen1/listen1_chrome_extension)锛屾劅璋㈣繖浣嶅厔鍙扮殑鍔姏鏁村悎浜嗗悇骞冲彴鐨凙PI锛屼富瑕佷娇鐢ㄨ椤圭洰鐨勫钩鍙版帴鍏ヤ唬鐮侊紝鍐嶅仛wrapper銆?
- [express](https://expressjs.com/)
- [socket.io](https://socket.io/)
- [Vue](https://vuejs.org)


## 寮€鍙戦」鐩?
```bash
yarn install
yarn serve
```

## 缂栬瘧椤圭洰
```bash
yarn build
```

## 杩愯椤圭洰
```bash
cd ./dist
node ./service.js -d ./public
```

## Docker 
```bash
docker pull mmhk/mmfm
docker run --rm --name mmfm -p 8011:8011 mmhk/mmfm:latest
```
