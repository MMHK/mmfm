const express = require('express');
const app = express();
const cli = require("cli");
const bodyParser = require("body-parser");
const musicApi = require('./MusieApi');
const swaggerUi = require('swagger-ui-express')
const server = require('http').Server(app);
const SocketIO = require('socket.io');
const swaggerDocument = require('./swagger.json');
const path = require("path");
const crypto = require('crypto');
const fs = require('fs');
const FetchStream = require("fetch").FetchStream;

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

app.use('/swagger', (req, res, next) =>{
    swaggerDocument.host = req.get('host');
    req.swaggerDoc = swaggerDocument;
    next();
},swaggerUi.serve, swaggerUi.setup());


app.get('/api/song/search', async (req, res) => {
    const search = req.query.keyword

    if (!search) {
        res.status(400).send({
            status: false,
            error: '参数错误'
        });
        return
    }
    let data;
    try {
        data = await musicApi.search(search);
    } catch (e) {
        res.status(500).send({
            status: false,
            error: e
        });
        return;
    }

    res.send({
        status: true,
        data
    })
});

app.get('/api/song/detail', async (req, res) => {
    const vendor = req.query.vendor;
    const id = req.query.id || 0;

    if (!id || !vendor) {
        res.status(400).send({
            status: false,
            error: '参数错误'
        });
        return
    }
    let data;
    try {
        data  = await musicApi.song(id);
    } catch (e) {
        res.status(500).send({
            status: false,
            error: e
        });
        return;
    }
    res.send({
        status: true,
        data
    })
});

app.get('/api/song/url', async (req, res) => {
    const vendor = req.query.vendor;
    const id = req.query.id || 0;

    if (!id || !vendor) {
        res.status(400).send({
            status: false,
            error: '参数错误'
        });
        return
    }
    let data;
    try {
        data = await musicApi.url(id);
    } catch (e) {
        res.status(500).send({
            status: false,
            error: e
        });
        return;
    }

    res.send({
        status: true,
        data
    })
});

let SongList = [];

function downloadFile(url, saveAs) {
    const fileStream = fs.createWriteStream(saveAs);

    return new Promise((resolve, reject) => {
        let headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
        };
        if (url.includes("bilivideo.com")) {
            headers["Referer"] = "https://www.bilibili.com/";
        }
        const req = new FetchStream(url, {
            headers,
        });

        req.on("meta", (meta) => {
            if (meta.status != 200) {
                reject();
            }
        });
        req.on('end', () => {
            console.log(`The file is finished downloading.`);
            resolve();
        });
        req.on('error', (error) => {
            reject(error);
        });

        req.pipe(fileStream);
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

    try {
        await downloadFile(url, path.join(cachePath, hash))
    } catch (err) {
        await res.send(JSON.stringify({
            status: false,
            error: err
        }));
        return;
    }

    let host = req.get("host");

    await res.send(JSON.stringify({
        status: 1,
        url: `http://${host}/cache/${hash}`
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
    });

    socket.on("error", (error) => {
        console.log(error);
    })
});

app.use(express.static(webRoot));

if (require && require.main === module) {
    cli.info(`web root: ${webRoot}`);
    cli.ok(`server listen on: http://${options.host}:${options.port}`);
    server.listen(options.port, options.host);
}

