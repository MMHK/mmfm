const express = require('express');
const app = express();
const cli = require("cli");
const bodyParser = require("body-parser");
const musicApi = require('@suen/music-api').default;
const swaggerUi = require('swagger-ui-express')
const server = require('http').Server(app);
const SocketIO = require('socket.io');
const swaggerDocument = require('./swagger.json');
const path = require("path");
const crypto = require('crypto');
const fs = require('fs');
const request = require("request");

const options = cli.parse({
    host: [ 'b', 'web server listen on address', 'ip', "0.0.0.0"], 
    port: [ 'p', 'listen on port', "string", "8011"],           
    webroot: [ 'd', "web root path", "string", "./public"],           
});

const webRoot = options.webroot;


// console.log(__dirname + "./../../dist/public");

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

swaggerDocument.host = `${options.host}:${options.port}`

app.get('/swagger', swaggerUi.setup(swaggerDocument));
app.use('/swagger', swaggerUi.serve, (req, res) =>{
    swaggerDocument.host = req.get('host')
    let htmlWithOptions = swaggerUi.generateHTML(swaggerDocument)
    res.send(htmlWithOptions)
});

app.get('/api/song/search', async (req, res) => {
    const search = req.query.keyword
    const offset = req.query.offset || 0

    if (!search) {
        res.status(400).send({
            error: '参数错误'
        })
        return
    }
    let data = await musicApi.searchSong(search, offset)
    res.send(data)
});

app.get('/api/song/detail', async (req, res) => {
    const vendor = req.query.vendor
    const id = req.query.id || 0

    if (!id || !vendor) {
        res.status(400).send({
            error: '参数错误'
        })
        return
    }
    let data = await musicApi.getSongDetail(vendor, id)
    res.send(data)
});

app.get('/api/song/url', async (req, res) => {
    const vendor = req.query.vendor
    const id = req.query.id || 0

    if (!id || !vendor) {
        res.status(400).send({
            error: '参数错误'
        })
        return
    }
    let data = await musicApi.getSongUrl(vendor, id)
    let url = data.data["url"]
    if (url && vendor == "qq") {
        url = url.replace("http://isure.stream.qqmusic.qq.com", "http://aqqmusic.tc.qq.com/amobile.music.tc.qq.com")
        data.data["url"] = url
    }
    res.send(data)
});

let SongList = [];

function downloadFile(url, saveAs) {
    let file = fs.createWriteStream(saveAs);

    return new Promise((resolve, reject) => {
        let stream = request({
            /* Here you should specify the exact link to the file you are trying to download */
            uri: url,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
            },
            /* GZIP true for most of the websites now, disable it if you don't need it */
            gzip: true
        })
        .pipe(file)
        .on('finish', () => {
            console.log(`The file is finished downloading.`);
            resolve();
        })
        .on('error', (error) => {
            reject(error);
        })
    });
}

app.post("/song/preload", async(req, res) => {
    let url = req.body.url || "",
        md5 = crypto.createHash('md5'),
        hash = md5.update(url).digest('hex'),
        cachePath = path.join(webRoot, "cache");

    if (url.length <= 0) {
        await res.send(JSON.stringify({
            status: 0,
            url: ""
        }))
    }

    if (!fs.existsSync(cachePath)) {
        fs.mkdirSync(cachePath, {
            recursive: true,
            mode: 0o777
        });
    }

    await downloadFile(url, path.join(cachePath, hash))

    await res.send(JSON.stringify({
        status: 1,
        url: `http://${options.host}:${options.port}/cache/${hash}`
    }))
});

app.post('/song/save', async (req, res) => {
    SongList = JSON.parse(req.body.list || "[]") || [];

    await res.send(JSON.stringify(SongList))
});

app.get("/song/get", async (req, res) => {
    await res.send(SongList)
})

const io = new SocketIO(server,{
    path: "/io"
});
io.on("connection", (socket) => {

    socket.join("chat");
    socket.on("msg", (msg) => {
        socket.to("chat").emit("msg", msg);
    });
    socket.on("disconnect", () => {
        console.log("on disconnect");
    })

    socket.on("error", (error) => {
        console.log(error);
    })
});

app.use(express.static(webRoot));

cli.info(`web root: ${webRoot}`);
cli.ok(`server listen on: http://${options.host}:${options.port}`);
server.listen(options.port, options.host);