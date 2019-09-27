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

// console.log(__dirname + "./../../dist/public");

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

const options = cli.parse({
    host: [ 'b', 'web server listen on address', 'ip', "0.0.0.0"], 
    port: [ 'p', 'listen on port', "string", "8011"],           
    webroot: [ 'd', "web root path", "string", "./public"],           
});

let webRoot = options.webroot;

app.use(express.static(webRoot));

cli.info(`web root: ${webRoot}`);
cli.ok(`server listen on: http://${options.host}:${options.port}`);
server.listen(options.port, options.host);