/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 17);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("axios");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("axios-cookiejar-support");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("tough-cookie");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("bytes");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("debug");

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * body-parser
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */



/**
 * Module dependencies.
 * @private
 */

var createError = __webpack_require__(10)
var getBody = __webpack_require__(22)
var iconv = __webpack_require__(23)
var onFinished = __webpack_require__(24)
var zlib = __webpack_require__(13)

/**
 * Module exports.
 */

module.exports = read

/**
 * Read a request into a buffer and parse.
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @param {function} parse
 * @param {function} debug
 * @param {object} options
 * @private
 */

function read (req, res, next, parse, debug, options) {
  var length
  var opts = options
  var stream

  // flag as parsed
  req._body = true

  // read options
  var encoding = opts.encoding !== null
    ? opts.encoding
    : null
  var verify = opts.verify

  try {
    // get the content stream
    stream = contentstream(req, debug, opts.inflate)
    length = stream.length
    stream.length = undefined
  } catch (err) {
    return next(err)
  }

  // set raw-body options
  opts.length = length
  opts.encoding = verify
    ? null
    : encoding

  // assert charset is supported
  if (opts.encoding === null && encoding !== null && !iconv.encodingExists(encoding)) {
    return next(createError(415, 'unsupported charset "' + encoding.toUpperCase() + '"', {
      charset: encoding.toLowerCase(),
      type: 'charset.unsupported'
    }))
  }

  // read body
  debug('read body')
  getBody(stream, opts, function (error, body) {
    if (error) {
      var _error

      if (error.type === 'encoding.unsupported') {
        // echo back charset
        _error = createError(415, 'unsupported charset "' + encoding.toUpperCase() + '"', {
          charset: encoding.toLowerCase(),
          type: 'charset.unsupported'
        })
      } else {
        // set status code on error
        _error = createError(400, error)
      }

      // read off entire request
      stream.resume()
      onFinished(req, function onfinished () {
        next(createError(400, _error))
      })
      return
    }

    // verify
    if (verify) {
      try {
        debug('verify body')
        verify(req, res, body, encoding)
      } catch (err) {
        next(createError(403, err, {
          body: body,
          type: err.type || 'entity.verify.failed'
        }))
        return
      }
    }

    // parse
    var str = body
    try {
      debug('parse body')
      str = typeof body !== 'string' && encoding !== null
        ? iconv.decode(body, encoding)
        : body
      req.body = parse(str)
    } catch (err) {
      next(createError(400, err, {
        body: str,
        type: err.type || 'entity.parse.failed'
      }))
      return
    }

    next()
  })
}

/**
 * Get the content stream of the request.
 *
 * @param {object} req
 * @param {function} debug
 * @param {boolean} [inflate=true]
 * @return {object}
 * @api private
 */

function contentstream (req, debug, inflate) {
  var encoding = (req.headers['content-encoding'] || 'identity').toLowerCase()
  var length = req.headers['content-length']
  var stream

  debug('content-encoding "%s"', encoding)

  if (inflate === false && encoding !== 'identity') {
    throw createError(415, 'content encoding unsupported', {
      encoding: encoding,
      type: 'encoding.unsupported'
    })
  }

  switch (encoding) {
    case 'deflate':
      stream = zlib.createInflate()
      debug('inflate body')
      req.pipe(stream)
      break
    case 'gzip':
      stream = zlib.createGunzip()
      debug('gunzip body')
      req.pipe(stream)
      break
    case 'identity':
      stream = req
      stream.length = length
      break
    default:
      throw createError(415, 'unsupported content encoding "' + encoding + '"', {
        encoding: encoding,
        type: 'encoding.unsupported'
      })
  }

  return stream
}


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("type-is");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("content-type");

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("http-errors");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("depd");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("zlib");

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("node-forge");

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {const express = __webpack_require__(11);
const app = express();
const cli = __webpack_require__(19);
const bodyParser = __webpack_require__(20);
const musicApi = __webpack_require__(30);
const swaggerUi = __webpack_require__(41)
const server = __webpack_require__(15).Server(app);
const SocketIO = __webpack_require__(43);
const swaggerDocument = __webpack_require__(44);
const path = __webpack_require__(0);
const crypto = __webpack_require__(45);
const fs = __webpack_require__(1);
const FetchStream = __webpack_require__(46).FetchStream;

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
        const req = new FetchStream(url, {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
            }
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

if ( true && __webpack_require__.c[__webpack_require__.s] === module) {
    cli.info(`web root: ${webRoot}`);
    cli.ok(`server listen on: http://${options.host}:${options.port}`);
    server.listen(options.port, options.host);
}


/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(18)(module)))

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("cli");

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * body-parser
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */



/**
 * Module dependencies.
 * @private
 */

var deprecate = __webpack_require__(12)('body-parser')

/**
 * Cache of loaded parsers.
 * @private
 */

var parsers = Object.create(null)

/**
 * @typedef Parsers
 * @type {function}
 * @property {function} json
 * @property {function} raw
 * @property {function} text
 * @property {function} urlencoded
 */

/**
 * Module exports.
 * @type {Parsers}
 */

exports = module.exports = deprecate.function(bodyParser,
  'bodyParser: use individual json/urlencoded middlewares')

/**
 * JSON parser.
 * @public
 */

Object.defineProperty(exports, 'json', {
  configurable: true,
  enumerable: true,
  get: createParserGetter('json')
})

/**
 * Raw parser.
 * @public
 */

Object.defineProperty(exports, 'raw', {
  configurable: true,
  enumerable: true,
  get: createParserGetter('raw')
})

/**
 * Text parser.
 * @public
 */

Object.defineProperty(exports, 'text', {
  configurable: true,
  enumerable: true,
  get: createParserGetter('text')
})

/**
 * URL-encoded parser.
 * @public
 */

Object.defineProperty(exports, 'urlencoded', {
  configurable: true,
  enumerable: true,
  get: createParserGetter('urlencoded')
})

/**
 * Create a middleware to parse json and urlencoded bodies.
 *
 * @param {object} [options]
 * @return {function}
 * @deprecated
 * @public
 */

function bodyParser (options) {
  var opts = {}

  // exclude type option
  if (options) {
    for (var prop in options) {
      if (prop !== 'type') {
        opts[prop] = options[prop]
      }
    }
  }

  var _urlencoded = exports.urlencoded(opts)
  var _json = exports.json(opts)

  return function bodyParser (req, res, next) {
    _json(req, res, function (err) {
      if (err) return next(err)
      _urlencoded(req, res, next)
    })
  }
}

/**
 * Create a getter for loading a parser.
 * @private
 */

function createParserGetter (name) {
  return function get () {
    return loadParser(name)
  }
}

/**
 * Load a parser module.
 * @private
 */

function loadParser (parserName) {
  var parser = parsers[parserName]

  if (parser !== undefined) {
    return parser
  }

  // this uses a switch for static require analysis
  switch (parserName) {
    case 'json':
      parser = __webpack_require__(21)
      break
    case 'raw':
      parser = __webpack_require__(25)
      break
    case 'text':
      parser = __webpack_require__(26)
      break
    case 'urlencoded':
      parser = __webpack_require__(27)
      break
  }

  // store to prevent invoking require()
  return (parsers[parserName] = parser)
}


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * body-parser
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */



/**
 * Module dependencies.
 * @private
 */

var bytes = __webpack_require__(5)
var contentType = __webpack_require__(9)
var createError = __webpack_require__(10)
var debug = __webpack_require__(6)('body-parser:json')
var read = __webpack_require__(7)
var typeis = __webpack_require__(8)

/**
 * Module exports.
 */

module.exports = json

/**
 * RegExp to match the first non-space in a string.
 *
 * Allowed whitespace is defined in RFC 7159:
 *
 *    ws = *(
 *            %x20 /              ; Space
 *            %x09 /              ; Horizontal tab
 *            %x0A /              ; Line feed or New line
 *            %x0D )              ; Carriage return
 */

var FIRST_CHAR_REGEXP = /^[\x20\x09\x0a\x0d]*(.)/ // eslint-disable-line no-control-regex

/**
 * Create a middleware to parse JSON bodies.
 *
 * @param {object} [options]
 * @return {function}
 * @public
 */

function json (options) {
  var opts = options || {}

  var limit = typeof opts.limit !== 'number'
    ? bytes.parse(opts.limit || '100kb')
    : opts.limit
  var inflate = opts.inflate !== false
  var reviver = opts.reviver
  var strict = opts.strict !== false
  var type = opts.type || 'application/json'
  var verify = opts.verify || false

  if (verify !== false && typeof verify !== 'function') {
    throw new TypeError('option verify must be function')
  }

  // create the appropriate type checking function
  var shouldParse = typeof type !== 'function'
    ? typeChecker(type)
    : type

  function parse (body) {
    if (body.length === 0) {
      // special-case empty json body, as it's a common client-side mistake
      // TODO: maybe make this configurable or part of "strict" option
      return {}
    }

    if (strict) {
      var first = firstchar(body)

      if (first !== '{' && first !== '[') {
        debug('strict violation')
        throw createStrictSyntaxError(body, first)
      }
    }

    try {
      debug('parse json')
      return JSON.parse(body, reviver)
    } catch (e) {
      throw normalizeJsonSyntaxError(e, {
        message: e.message,
        stack: e.stack
      })
    }
  }

  return function jsonParser (req, res, next) {
    if (req._body) {
      debug('body already parsed')
      next()
      return
    }

    req.body = req.body || {}

    // skip requests without bodies
    if (!typeis.hasBody(req)) {
      debug('skip empty body')
      next()
      return
    }

    debug('content-type %j', req.headers['content-type'])

    // determine if request should be parsed
    if (!shouldParse(req)) {
      debug('skip parsing')
      next()
      return
    }

    // assert charset per RFC 7159 sec 8.1
    var charset = getCharset(req) || 'utf-8'
    if (charset.substr(0, 4) !== 'utf-') {
      debug('invalid charset')
      next(createError(415, 'unsupported charset "' + charset.toUpperCase() + '"', {
        charset: charset,
        type: 'charset.unsupported'
      }))
      return
    }

    // read
    read(req, res, next, parse, debug, {
      encoding: charset,
      inflate: inflate,
      limit: limit,
      verify: verify
    })
  }
}

/**
 * Create strict violation syntax error matching native error.
 *
 * @param {string} str
 * @param {string} char
 * @return {Error}
 * @private
 */

function createStrictSyntaxError (str, char) {
  var index = str.indexOf(char)
  var partial = str.substring(0, index) + '#'

  try {
    JSON.parse(partial); /* istanbul ignore next */ throw new SyntaxError('strict violation')
  } catch (e) {
    return normalizeJsonSyntaxError(e, {
      message: e.message.replace('#', char),
      stack: e.stack
    })
  }
}

/**
 * Get the first non-whitespace character in a string.
 *
 * @param {string} str
 * @return {function}
 * @private
 */

function firstchar (str) {
  return FIRST_CHAR_REGEXP.exec(str)[1]
}

/**
 * Get the charset of a request.
 *
 * @param {object} req
 * @api private
 */

function getCharset (req) {
  try {
    return (contentType.parse(req).parameters.charset || '').toLowerCase()
  } catch (e) {
    return undefined
  }
}

/**
 * Normalize a SyntaxError for JSON.parse.
 *
 * @param {SyntaxError} error
 * @param {object} obj
 * @return {SyntaxError}
 */

function normalizeJsonSyntaxError (error, obj) {
  var keys = Object.getOwnPropertyNames(error)

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    if (key !== 'stack' && key !== 'message') {
      delete error[key]
    }
  }

  // replace stack before message for Node.js 0.10 and below
  error.stack = obj.stack.replace(error.message, obj.message)
  error.message = obj.message

  return error
}

/**
 * Get the simple type checker.
 *
 * @param {string} type
 * @return {function}
 */

function typeChecker (type) {
  return function checkType (req) {
    return Boolean(typeis(req, type))
  }
}


/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = require("raw-body");

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require("iconv-lite");

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = require("on-finished");

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * body-parser
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */



/**
 * Module dependencies.
 */

var bytes = __webpack_require__(5)
var debug = __webpack_require__(6)('body-parser:raw')
var read = __webpack_require__(7)
var typeis = __webpack_require__(8)

/**
 * Module exports.
 */

module.exports = raw

/**
 * Create a middleware to parse raw bodies.
 *
 * @param {object} [options]
 * @return {function}
 * @api public
 */

function raw (options) {
  var opts = options || {}

  var inflate = opts.inflate !== false
  var limit = typeof opts.limit !== 'number'
    ? bytes.parse(opts.limit || '100kb')
    : opts.limit
  var type = opts.type || 'application/octet-stream'
  var verify = opts.verify || false

  if (verify !== false && typeof verify !== 'function') {
    throw new TypeError('option verify must be function')
  }

  // create the appropriate type checking function
  var shouldParse = typeof type !== 'function'
    ? typeChecker(type)
    : type

  function parse (buf) {
    return buf
  }

  return function rawParser (req, res, next) {
    if (req._body) {
      debug('body already parsed')
      next()
      return
    }

    req.body = req.body || {}

    // skip requests without bodies
    if (!typeis.hasBody(req)) {
      debug('skip empty body')
      next()
      return
    }

    debug('content-type %j', req.headers['content-type'])

    // determine if request should be parsed
    if (!shouldParse(req)) {
      debug('skip parsing')
      next()
      return
    }

    // read
    read(req, res, next, parse, debug, {
      encoding: null,
      inflate: inflate,
      limit: limit,
      verify: verify
    })
  }
}

/**
 * Get the simple type checker.
 *
 * @param {string} type
 * @return {function}
 */

function typeChecker (type) {
  return function checkType (req) {
    return Boolean(typeis(req, type))
  }
}


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * body-parser
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */



/**
 * Module dependencies.
 */

var bytes = __webpack_require__(5)
var contentType = __webpack_require__(9)
var debug = __webpack_require__(6)('body-parser:text')
var read = __webpack_require__(7)
var typeis = __webpack_require__(8)

/**
 * Module exports.
 */

module.exports = text

/**
 * Create a middleware to parse text bodies.
 *
 * @param {object} [options]
 * @return {function}
 * @api public
 */

function text (options) {
  var opts = options || {}

  var defaultCharset = opts.defaultCharset || 'utf-8'
  var inflate = opts.inflate !== false
  var limit = typeof opts.limit !== 'number'
    ? bytes.parse(opts.limit || '100kb')
    : opts.limit
  var type = opts.type || 'text/plain'
  var verify = opts.verify || false

  if (verify !== false && typeof verify !== 'function') {
    throw new TypeError('option verify must be function')
  }

  // create the appropriate type checking function
  var shouldParse = typeof type !== 'function'
    ? typeChecker(type)
    : type

  function parse (buf) {
    return buf
  }

  return function textParser (req, res, next) {
    if (req._body) {
      debug('body already parsed')
      next()
      return
    }

    req.body = req.body || {}

    // skip requests without bodies
    if (!typeis.hasBody(req)) {
      debug('skip empty body')
      next()
      return
    }

    debug('content-type %j', req.headers['content-type'])

    // determine if request should be parsed
    if (!shouldParse(req)) {
      debug('skip parsing')
      next()
      return
    }

    // get charset
    var charset = getCharset(req) || defaultCharset

    // read
    read(req, res, next, parse, debug, {
      encoding: charset,
      inflate: inflate,
      limit: limit,
      verify: verify
    })
  }
}

/**
 * Get the charset of a request.
 *
 * @param {object} req
 * @api private
 */

function getCharset (req) {
  try {
    return (contentType.parse(req).parameters.charset || '').toLowerCase()
  } catch (e) {
    return undefined
  }
}

/**
 * Get the simple type checker.
 *
 * @param {string} type
 * @return {function}
 */

function typeChecker (type) {
  return function checkType (req) {
    return Boolean(typeis(req, type))
  }
}


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * body-parser
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */



/**
 * Module dependencies.
 * @private
 */

var bytes = __webpack_require__(5)
var contentType = __webpack_require__(9)
var createError = __webpack_require__(10)
var debug = __webpack_require__(6)('body-parser:urlencoded')
var deprecate = __webpack_require__(12)('body-parser')
var read = __webpack_require__(7)
var typeis = __webpack_require__(8)

/**
 * Module exports.
 */

module.exports = urlencoded

/**
 * Cache of parser modules.
 */

var parsers = Object.create(null)

/**
 * Create a middleware to parse urlencoded bodies.
 *
 * @param {object} [options]
 * @return {function}
 * @public
 */

function urlencoded (options) {
  var opts = options || {}

  // notice because option default will flip in next major
  if (opts.extended === undefined) {
    deprecate('undefined extended: provide extended option')
  }

  var extended = opts.extended !== false
  var inflate = opts.inflate !== false
  var limit = typeof opts.limit !== 'number'
    ? bytes.parse(opts.limit || '100kb')
    : opts.limit
  var type = opts.type || 'application/x-www-form-urlencoded'
  var verify = opts.verify || false

  if (verify !== false && typeof verify !== 'function') {
    throw new TypeError('option verify must be function')
  }

  // create the appropriate query parser
  var queryparse = extended
    ? extendedparser(opts)
    : simpleparser(opts)

  // create the appropriate type checking function
  var shouldParse = typeof type !== 'function'
    ? typeChecker(type)
    : type

  function parse (body) {
    return body.length
      ? queryparse(body)
      : {}
  }

  return function urlencodedParser (req, res, next) {
    if (req._body) {
      debug('body already parsed')
      next()
      return
    }

    req.body = req.body || {}

    // skip requests without bodies
    if (!typeis.hasBody(req)) {
      debug('skip empty body')
      next()
      return
    }

    debug('content-type %j', req.headers['content-type'])

    // determine if request should be parsed
    if (!shouldParse(req)) {
      debug('skip parsing')
      next()
      return
    }

    // assert charset
    var charset = getCharset(req) || 'utf-8'
    if (charset !== 'utf-8') {
      debug('invalid charset')
      next(createError(415, 'unsupported charset "' + charset.toUpperCase() + '"', {
        charset: charset,
        type: 'charset.unsupported'
      }))
      return
    }

    // read
    read(req, res, next, parse, debug, {
      debug: debug,
      encoding: charset,
      inflate: inflate,
      limit: limit,
      verify: verify
    })
  }
}

/**
 * Get the extended query parser.
 *
 * @param {object} options
 */

function extendedparser (options) {
  var parameterLimit = options.parameterLimit !== undefined
    ? options.parameterLimit
    : 1000
  var parse = parser('qs')

  if (isNaN(parameterLimit) || parameterLimit < 1) {
    throw new TypeError('option parameterLimit must be a positive number')
  }

  if (isFinite(parameterLimit)) {
    parameterLimit = parameterLimit | 0
  }

  return function queryparse (body) {
    var paramCount = parameterCount(body, parameterLimit)

    if (paramCount === undefined) {
      debug('too many parameters')
      throw createError(413, 'too many parameters', {
        type: 'parameters.too.many'
      })
    }

    var arrayLimit = Math.max(100, paramCount)

    debug('parse extended urlencoding')
    return parse(body, {
      allowPrototypes: true,
      arrayLimit: arrayLimit,
      depth: Infinity,
      parameterLimit: parameterLimit
    })
  }
}

/**
 * Get the charset of a request.
 *
 * @param {object} req
 * @api private
 */

function getCharset (req) {
  try {
    return (contentType.parse(req).parameters.charset || '').toLowerCase()
  } catch (e) {
    return undefined
  }
}

/**
 * Count the number of parameters, stopping once limit reached
 *
 * @param {string} body
 * @param {number} limit
 * @api private
 */

function parameterCount (body, limit) {
  var count = 0
  var index = 0

  while ((index = body.indexOf('&', index)) !== -1) {
    count++
    index++

    if (count === limit) {
      return undefined
    }
  }

  return count
}

/**
 * Get parser for module name dynamically.
 *
 * @param {string} name
 * @return {function}
 * @api private
 */

function parser (name) {
  var mod = parsers[name]

  if (mod !== undefined) {
    return mod.parse
  }

  // this uses a switch for static require analysis
  switch (name) {
    case 'qs':
      mod = __webpack_require__(28)
      break
    case 'querystring':
      mod = __webpack_require__(29)
      break
  }

  // store to prevent invoking require()
  parsers[name] = mod

  return mod.parse
}

/**
 * Get the simple query parser.
 *
 * @param {object} options
 */

function simpleparser (options) {
  var parameterLimit = options.parameterLimit !== undefined
    ? options.parameterLimit
    : 1000
  var parse = parser('querystring')

  if (isNaN(parameterLimit) || parameterLimit < 1) {
    throw new TypeError('option parameterLimit must be a positive number')
  }

  if (isFinite(parameterLimit)) {
    parameterLimit = parameterLimit | 0
  }

  return function queryparse (body) {
    var paramCount = parameterCount(body, parameterLimit)

    if (paramCount === undefined) {
      debug('too many parameters')
      throw createError(413, 'too many parameters', {
        type: 'parameters.too.many'
      })
    }

    debug('parse urlencoding')
    return parse(body, undefined, undefined, { maxKeys: parameterLimit })
  }
}

/**
 * Get the simple type checker.
 *
 * @param {string} type
 * @return {function}
 */

function typeChecker (type) {
  return function checkType (req) {
    return Boolean(typeis(req, type))
  }
}


/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = require("qs");

/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = require("querystring");

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

const MiguService = __webpack_require__(31);
const KuwoService = __webpack_require__(33);
const QQService = __webpack_require__(34);
const neteaseService = __webpack_require__(36);
const kugouService = __webpack_require__(37);
const flatCache = __webpack_require__(39);
const os = __webpack_require__(40);

const cache = flatCache.load("musicCache", os.tmpdir());

exports.search = (keywork) => {
    return Promise.all([neteaseService.search(keywork),
        MiguService.search(keywork), KuwoService.search(keywork), kugouService.search(keywork)])
        .then((dataList) => {
            const list = Array.from(dataList).reduce(function (last, row) {
                if (row.result && row.result.length > 0 && row.result[0].source && !last[row.result[0].source]) {
                    last[row.result[0].source] = {
                        total: row.total,
                        songs: Array.from(row.result).map((item) => {
                            cache.setKey(item.id, item);

                            return {
                                album: {
                                    cover: item.img_url
                                },
                                artists: [
                                    {
                                        name: item.artist
                                    }
                                ],
                                name: item.title,
                                id: item.id,
                                link: item.source_url,
                                vendor: item.source
                            }
                        })
                    };
                }
                return last
            }, {});

            cache.save();

            return list;
        })
};

exports.song = (track_id) => {
    const track = cache.getKey(track_id);
    if (!track) {
        return Promise.reject("no cache found")
    }
    return Promise.resolve(track);
};

exports.url = (track_id) => {
    const track = cache.getKey(track_id);
    if (!track) {
        return Promise.reject("no cache found")
    }

    const provider = track.source;
    switch (provider) {
        case "qq":
            return QQService.song(track);
        case "netease":
            return neteaseService.song(track);
        case "kuwo":
            return KuwoService.song(track);
        case "migu":
            return MiguService.song(track);
        case "kugou":
            return kugouService.song(track);
    }

    return Promise.reject("no provider found");
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

const axios = __webpack_require__(2).create({
    timeout: 10000,
});
const path = __webpack_require__(0);
const fs = __webpack_require__(1);
const UUID = __webpack_require__(32);
const forge = __webpack_require__(14);

const axiosCookieJarSupport = __webpack_require__(3).default;
const tough = __webpack_require__(4);

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

axios.interceptors.request.use((config) => {
    config.headers["User-Agent"] = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36';
    config.jar = cookieJar;
    config.withCredentials = true;

    return config;
});


axios.interceptors.response.use((response) => {
    // console.log(response.config);
    return response;
}, (error) => {
    // console.error(error);

    return Promise.reject(error);
});


function cookieGet(cookie, callback) {
    const url = cookie.url || cookie.domain;
    const name = cookie.name;
    cookieJar.getCookies(url, {}, (err, cookies) => {
        const target = Array.from(cookies).find((c) => {
            return name && c.key == name;
        });

        callback(target);
    });
}

function isElectron() {
    return false;
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&'); // eslint-disable-line no-useless-escape
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);

    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function wrapFunc() {
    const jsFile = path.resolve("node_modules", "listen1_chrome_extension/js/provider/migu.js");
    let body = fs.readFileSync(jsFile);

    body = (body+'').replace(/uuid\(\) {([^}]+)}/im, 'uuid(){return UUID.generate();}');

    const func = new Function("axios", "getParameterByName",
        "isElectron", "cookieGet", "UUID", "forge", `${body} return migu`);

    return func(axios, getParameterByName, isElectron, cookieGet, UUID, forge);
}

const migu = wrapFunc();

exports.search = (key) => {
    const keywords = encodeURI(key);

    return new Promise(resolve => {
        migu.search(`/search?keywords=${keywords}&type=0&curpage=1`)
            .success(resolve)
    })
};

exports.song = (result) => {
    return new Promise((resolve, reject) => {
        migu.bootstrap_track(result, resolve, reject);
    })
};


/***/ }),
/* 32 */
/***/ (function(module, exports) {

module.exports = require("uuidjs");

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

const axios = __webpack_require__(2).create({
    timeout: 10000,
});
const path = __webpack_require__(0);
const fs = __webpack_require__(1);

const axiosCookieJarSupport = __webpack_require__(3).default;
const tough = __webpack_require__(4);

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

axios.interceptors.request.use((config) => {
    config.headers["User-Agent"] = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36';
    config.headers["Host"] = 'www.kuwo.cn';
    config.jar = cookieJar;
    config.withCredentials = true;
    
    if (config.url.includes("searchMusicBykeyWord")) {
        config.headers["Referer"] = 'http://www.kuwo.cn/search/list?key=';
    }

    if (config.url.includes("convert_url")) {
        delete config.jar;
        config.withCredentials = false;
        delete config.headers["Host"];
    }

    return config;
});

axios.interceptors.response.use((response) => {
    // console.log(response.config);
    return response;
}, (error) => {
    console.error(error);

    return Promise.reject(error);
});


function isElectron() {
    return false;
}

function cookieGet(cookie, callback) {
    const url = cookie.url || cookie.domain;
    const name = cookie.name;
    cookieJar.getCookies(url, {}, (err, cookies) => {
        const target = Array.from(cookies).find((c) => {
            return name && c.key == name;
        });

        callback(target);
    });
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&'); // eslint-disable-line no-useless-escape
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);

    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function wrapFunc() {
    const jsFile = path.resolve("node_modules", "listen1_chrome_extension/js/provider/kuwo.js");
    const body = fs.readFileSync(jsFile);

    const func = new Function("axios", "getParameterByName", "isElectron", "cookieGet", `${body} return kuwo`);

    return func(axios, getParameterByName, isElectron, cookieGet);
}

const kuwo = wrapFunc();

exports.search = (key) => {
    const keywords = encodeURI(encodeURI(key));

    return new Promise(resolve => {
        kuwo.search(`/search?keywords=${keywords}&type=0&curpage=1`)
            .success(resolve)
    })
};

exports.song = (result) => {
    return new Promise((resolve, reject) => {
        kuwo.bootstrap_track(result, resolve, reject);
    })
};


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

const axios = __webpack_require__(2).create({
    timeout: 10000,
});
const path = __webpack_require__(0);
const fs = __webpack_require__(1);
const DOMParser = __webpack_require__(35);

const axiosCookieJarSupport = __webpack_require__(3).default;
const tough = __webpack_require__(4);

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

axios.interceptors.request.use((config) => {
    config.headers["User-Agent"] = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36';
    // config.headers["Host"] = 'www.qq.cn';
    config.jar = cookieJar;
    config.withCredentials = true;
    //
    if (config.url.includes("qq.com")) {
        config.headers["Referer"] = 'https://i.y.qq.com/';
    }

    // if (config.url.includes("convert_url")) {
    //     delete config.jar;
    //     config.withCredentials = false;
    //     delete config.headers["Host"];
    // }

    return config;
});

axios.interceptors.response.use((response) => {
    console.log(response.config);
    // console.log(response.data);
    return response;
}, (error) => {
    console.error(error);

    return Promise.reject(error);
});


function isElectron() {
    return false;
}

function cookieGet(cookie, callback) {
    const url = cookie.url || cookie.domain;
    const name = cookie.name;
    cookieJar.getCookies(url, {}, (err, cookies) => {
        const target = Array.from(cookies).find((c) => {
            return name && c.key == name;
        });

        callback(target);
    });
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&'); // eslint-disable-line no-useless-escape
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);

    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function wrapFunc() {
    const jsFile = path.resolve("node_modules", "listen1_chrome_extension/js/provider/qq.js");
    let body = fs.readFileSync(jsFile);

    body = (body+'').replace(/htmlDecode\(value\) {([^}]+)}/im, `
    htmlDecode (value) { 
        const parser = new DOMParser();
        const dom = parser.parseFromString(value);
        const elements = dom.getElementsByTagName("body");
        if (elements.length > 0) {
            return elements[0].textContent;
        }
        
        return value;
    }`);

    const func = new Function("axios", "getParameterByName",
        "isElectron", "cookieGet", "DOMParser", `${body} return qq`);

    return func(axios, getParameterByName, isElectron, cookieGet, DOMParser);
}

const qq = wrapFunc();

exports.search = (key) => {
    const keywords = encodeURI(encodeURI(key));

    return new Promise(resolve => {
        qq.search(`/search?keywords=${keywords}&type=0&curpage=1`)
            .success(resolve)
    })
};

exports.song = (result) => {
    return new Promise((resolve, reject) => {
        qq.bootstrap_track(result, resolve, reject);
    })
};


/***/ }),
/* 35 */
/***/ (function(module, exports) {

module.exports = require("dom-parser");

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

const axios = __webpack_require__(2).create({
    timeout: 10000,
});
const path = __webpack_require__(0);
const fs = __webpack_require__(1);
const forge = __webpack_require__(14);

const axiosCookieJarSupport = __webpack_require__(3).default;
const tough = __webpack_require__(4);

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

axios.interceptors.request.use((config) => {
    config.headers["User-Agent"] = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36';
    // config.headers["Host"] = 'www.netease.cn';
    config.jar = cookieJar;
    config.withCredentials = true;
    //
    // if (config.url.includes("netease.com")) {
    //     config.headers["Referer"] = 'https://y.netease.com/';
    // }
    //
    // if (config.url.includes("convert_url")) {
    //     delete config.jar;
    //     config.withCredentials = false;
    //     delete config.headers["Host"];
    // }

    return config;
});

axios.interceptors.response.use((response) => {
    // console.log(response.config);
    // console.log(response.data);
    return response;
}, (error) => {
    console.error(error);

    return Promise.reject(error);
});


function isElectron() {
    return false;
}

function cookieGet(cookie, callback) {
    const url = cookie.url || cookie.domain;
    const name = cookie.name;
    cookieJar.getCookies(url, {}, (err, cookies) => {
        const target = Array.from(cookies).find((c) => {
            return name && c.key == name;
        });

        callback(target);
    });
}

function cookieSet(cookie, callback) {
    const c = new tough.Cookie({
        key: cookie.name,
        value: cookie.value
    });


    cookieJar.setCookie(c, cookie.url, {}, (err, cookieEntry) => {
        callback(cookieEntry);
    });
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&'); // eslint-disable-line no-useless-escape
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);

    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function wrapFunc() {
    const jsFile = path.resolve("node_modules", "listen1_chrome_extension/js/provider/netease.js");
    let body = fs.readFileSync(jsFile);

    const func = new Function("axios", "getParameterByName",
        "isElectron", "cookieGet", "forge", "cookieSet",`${body} return netease`);

    return func(axios, getParameterByName, isElectron, cookieGet, forge, cookieSet, forge);
}

const netease = wrapFunc();

exports.search = (key) => {
    const keywords = encodeURI(key);

    return new Promise(resolve => {
        netease.search(`/search?keywords=${keywords}&type=0&curpage=1`)
            .success(resolve)
    })
};

exports.song = (result) => {
    return new Promise((resolve, reject) => {
        netease.bootstrap_track(result, resolve, reject);
    })
};


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

const axios = __webpack_require__(2).create({
    timeout: 10000,
});
const path = __webpack_require__(0);
const fs = __webpack_require__(1);
const async = __webpack_require__(38);

const axiosCookieJarSupport = __webpack_require__(3).default;
const tough = __webpack_require__(4);

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

axios.interceptors.request.use((config) => {
    config.headers["User-Agent"] = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36';
    config.jar = cookieJar;
    config.withCredentials = true;
    config.headers["Referer"] = 'http://www.kugou.com/';


    return config;
});

axios.interceptors.response.use((response) => {
    // console.dir(response.data.data.lists);
    // console.dir(response.config);
    return response;
}, (error) => {
    console.error(error);

    return Promise.reject(error);
});


function isElectron() {
    return false;
}

function cookieGet(cookie, callback) {
    const url = cookie.url || cookie.domain;
    const name = cookie.name;
    cookieJar.getCookies(url, {}, (err, cookies) => {
        const target = Array.from(cookies).find((c) => {
            return name && c.key == name;
        });

        callback(target);
    });
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&'); // eslint-disable-line no-useless-escape
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);

    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function wrapFunc() {
    const jsFile = path.resolve("node_modules", "listen1_chrome_extension/js/provider/kugou.js");
    const body = fs.readFileSync(jsFile);

    const func = new Function("async", "axios", "getParameterByName", "isElectron", "cookieGet", `${body} return kugou`);

    return func(async, axios, getParameterByName, isElectron, cookieGet);
}

const kugou = wrapFunc();

exports.search = (key) => {
    const keywords = encodeURI(encodeURI(key));

    return new Promise(resolve => {
        kugou.search(`/search?keywords=${keywords}&type=0&curpage=1`)
            .success(resolve)
    })
};

exports.song = (result) => {
    return new Promise((resolve, reject) => {
        kugou.bootstrap_track(result, resolve, reject);
    })
};


/***/ }),
/* 38 */
/***/ (function(module, exports) {

module.exports = require("async");

/***/ }),
/* 39 */
/***/ (function(module, exports) {

module.exports = require("flat-cache");

/***/ }),
/* 40 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(11)
var swaggerUi = __webpack_require__(42)
var favIconHtml = '<link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />' +
  '<link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />'
var swaggerInit = ''

var htmlTplString = `
<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><% title %></title>
  <link rel="stylesheet" type="text/css" href="./swagger-ui.css" >
  <% favIconString %>
  <% customJs %>
  <style>
    html
    {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *,
    *:before,
    *:after
    {
      box-sizing: inherit;
    }

    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>

<body>

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position:absolute;width:0;height:0">
  <defs>
    <symbol viewBox="0 0 20 20" id="unlocked">
      <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V6h2v-.801C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8z"></path>
    </symbol>

    <symbol viewBox="0 0 20 20" id="locked">
      <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8zM12 8H8V5.199C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8z"/>
    </symbol>

    <symbol viewBox="0 0 20 20" id="close">
      <path d="M14.348 14.849c-.469.469-1.229.469-1.697 0L10 11.819l-2.651 3.029c-.469.469-1.229.469-1.697 0-.469-.469-.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-.469-.469-.469-1.228 0-1.697.469-.469 1.228-.469 1.697 0L10 8.183l2.651-3.031c.469-.469 1.228-.469 1.697 0 .469.469.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c.469.469.469 1.229 0 1.698z"/>
    </symbol>

    <symbol viewBox="0 0 20 20" id="large-arrow">
      <path d="M13.25 10L6.109 2.58c-.268-.27-.268-.707 0-.979.268-.27.701-.27.969 0l7.83 7.908c.268.271.268.709 0 .979l-7.83 7.908c-.268.271-.701.27-.969 0-.268-.269-.268-.707 0-.979L13.25 10z"/>
    </symbol>

    <symbol viewBox="0 0 20 20" id="large-arrow-down">
      <path d="M17.418 6.109c.272-.268.709-.268.979 0s.271.701 0 .969l-7.908 7.83c-.27.268-.707.268-.979 0l-7.908-7.83c-.27-.268-.27-.701 0-.969.271-.268.709-.268.979 0L10 13.25l7.418-7.141z"/>
    </symbol>


    <symbol viewBox="0 0 24 24" id="jump-to">
      <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/>
    </symbol>

    <symbol viewBox="0 0 24 24" id="expand">
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
    </symbol>

  </defs>
</svg>

<div id="swagger-ui"></div>

<script src="./swagger-ui-bundle.js"> </script>
<script src="./swagger-ui-standalone-preset.js"> </script>
<script src="./swagger-ui-init.js"> </script>
<% customCssUrl %>
<style>
  <% customCss %>
</style>
</body>

</html>
`

var jsTplString = `
window.onload = function() {
  // Build a system
  var url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  <% swaggerOptions %>
  url = options.swaggerUrl || url
  var urls = options.swaggerUrls
  var customOptions = options.customOptions
  var spec1 = options.swaggerDoc
  var swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (var attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  var ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.oauth) {
    ui.initOAuth(customOptions.oauth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }

  window.ui = ui
}
`

var generateHTML = function (swaggerDoc, opts, options, customCss, customfavIcon, swaggerUrl, customSiteTitle, _htmlTplString, _jsTplString) {
  var isExplorer
  var customJs
  var swaggerUrls
  var customCssUrl
  if (opts && typeof opts === 'object') {
    options = opts.swaggerOptions
    customCss = opts.customCss
    customJs = opts.customJs
    customfavIcon = opts.customfavIcon
    swaggerUrl = opts.swaggerUrl
    swaggerUrls = opts.swaggerUrls
    isExplorer = opts.explorer || !!swaggerUrls
    customSiteTitle = opts.customSiteTitle
    customCssUrl = opts.customCssUrl
  } else {
    //support legacy params based function
    isExplorer = opts
  }
  options = options || {}
  var explorerString = isExplorer ? '' : '.swagger-ui .topbar .download-url-wrapper { display: none }'
  customCss = explorerString + ' ' + customCss || explorerString
  customfavIcon = customfavIcon || false
  customSiteTitle = customSiteTitle || 'Swagger UI'
  _htmlTplString = _htmlTplString || htmlTplString
  _jsTplString = _jsTplString || jsTplString

  var favIconString = customfavIcon ? '<link rel="icon" href="' + customfavIcon + '" />' : favIconHtml
  var htmlWithCustomCss = _htmlTplString.toString().replace('<% customCss %>', customCss)
  var htmlWithFavIcon = htmlWithCustomCss.replace('<% favIconString %>', favIconString)
  var htmlWithCustomJs = htmlWithFavIcon.replace('<% customJs %>', customJs ? `<script src="${customJs}"></script>` : '')
  var htmlWithCustomCssUrl = htmlWithCustomJs.replace('<% customCssUrl %>', customCssUrl ? `<link href="${customCssUrl}" rel="stylesheet">` : '')

  var initOptions = {
    swaggerDoc: swaggerDoc || undefined,
    customOptions: options,
    swaggerUrl: swaggerUrl || undefined,
    swaggerUrls: swaggerUrls || undefined
  }

  swaggerInit = _jsTplString.toString().replace('<% swaggerOptions %>', stringify(initOptions))
  return htmlWithCustomCssUrl.replace('<% title %>', customSiteTitle)
}

var setup = function (swaggerDoc, opts, options, customCss, customfavIcon, swaggerUrl, customSiteTitle) {
  var html = generateHTML(swaggerDoc, opts, options, customCss, customfavIcon, swaggerUrl, customSiteTitle, htmlTplString, jsTplString)
  return function (req, res) {
    if (req.swaggerDoc) {
      var reqHtml = generateHTML(req.swaggerDoc, opts, options, customCss, customfavIcon, swaggerUrl, customSiteTitle, htmlTplString, jsTplString)
      res.send(reqHtml)
    } else {
      res.send(html)
    }
  }
}

function swaggerInitFn(req, res, next) {
  if (req.url === '/package.json') {
    res.sendStatus(404)
  } else if (req.url === '/swagger-ui-init.js') {
    res.set('Content-Type', 'application/javascript')
    res.send(swaggerInit)
  } else {
    next()
  }
}

var swaggerInitFunction = function (swaggerDoc, opts) {
  var swaggerInitFile = jsTplString.toString().replace('<% swaggerOptions %>', stringify(opts))
  return function (req, res, next) {
    if (req.url === '/package.json') {
      res.sendStatus(404)
    } else if (req.url === '/swagger-ui-init.js') {
      res.set('Content-Type', 'application/javascript')
      res.send(swaggerInitFile)
    } else {
      next()
    }
  }
}

var swaggerAssetMiddleware = options => {
  var opts = options || {}
  opts.index = false
  return express.static(swaggerUi.getAbsoluteFSPath(), opts)
}

var serveFiles = function (swaggerDoc, opts) {
  opts = opts || {}
  var initOptions = {
    swaggerDoc: swaggerDoc || undefined,
    customOptions: opts.swaggerOptions || {},
    swaggerUrl: opts.swaggerUrl || {},
    swaggerUrls: opts.swaggerUrls || undefined
  }
  var swaggerInitWithOpts = swaggerInitFunction(swaggerDoc, initOptions)
  return [swaggerInitWithOpts, swaggerAssetMiddleware()]
}

var serve = [swaggerInitFn, swaggerAssetMiddleware()]
var serveWithOptions = options => [swaggerInitFn, swaggerAssetMiddleware(options)]

var stringify = function (obj, prop) {
  var placeholder = '____FUNCTIONPLACEHOLDER____'
  var fns = []
  var json = JSON.stringify(obj, function (key, value) {
    if (typeof value === 'function') {
      fns.push(value)
      return placeholder
    }
    return value
  }, 2)
  json = json.replace(new RegExp('"' + placeholder + '"', 'g'), function (_) {
    return fns.shift()
  })
  return 'var options = ' + json + ';'
}

module.exports = {
  setup: setup,
  serve: serve,
  serveWithOptions: serveWithOptions,
  generateHTML: generateHTML,
  serveFiles: serveFiles
}


/***/ }),
/* 42 */
/***/ (function(module, exports) {

module.exports = require("swagger-ui-dist");

/***/ }),
/* 43 */
/***/ (function(module, exports) {

module.exports = require("socket.io");

/***/ }),
/* 44 */
/***/ (function(module) {

module.exports = JSON.parse("{\"swagger\":\"2.0\",\"info\":{\"description\":\"This music API for qq netease xiami\",\"version\":\"1.0.0\",\"title\":\"Music API for QQ NetEase Xiami\",\"license\":{\"name\":\"Apache 2.0\",\"url\":\"http://www.apache.org/licenses/LICENSE-2.0.html\"}},\"host\":\"localhost\",\"basePath\":\"/\",\"tags\":[{\"name\":\"song\",\"description\":\"song of QQ NetEase Xiami\"}],\"schemes\":[\"http\"],\"paths\":{\"/api/song/search\":{\"get\":{\"tags\":[\"song\"],\"summary\":\"Search song of all platform\",\"description\":\"\",\"produces\":[\"application/json\"],\"parameters\":[{\"name\":\"keyword\",\"in\":\"query\",\"type\":\"string\",\"description\":\"Name of song\",\"required\":true},{\"in\":\"query\",\"name\":\"offset\",\"type\":\"string\",\"description\":\"offset of page\",\"required\":false}],\"responses\":{\"200\":{\"description\":\"Success\"}},\"security\":[]}},\"/api/song/detail\":{\"get\":{\"tags\":[\"song\"],\"summary\":\"get song detail\",\"produces\":[\"application/json\"],\"parameters\":[{\"in\":\"query\",\"name\":\"vendor\",\"type\":\"string\",\"description\":\"platform\",\"required\":true},{\"in\":\"query\",\"name\":\"id\",\"type\":\"number\",\"description\":\"ID of song\",\"required\":true}],\"responses\":{\"200\":{\"description\":\"Success\"}}}},\"/api/song/url\":{\"get\":{\"tags\":[\"song\"],\"summary\":\"get song URL\",\"produces\":[\"application/json\"],\"parameters\":[{\"in\":\"query\",\"name\":\"vendor\",\"type\":\"string\",\"description\":\"platform\",\"required\":true},{\"in\":\"query\",\"name\":\"id\",\"type\":\"number\",\"description\":\"ID of song\",\"required\":true}],\"responses\":{\"200\":{\"description\":\"Success\"}}}},\"/song/save\":{\"post\":{\"tags\":[\"song\"],\"summary\":\"save play list\",\"consumes\":[\"application/x-www-form-urlencoded\"],\"produces\":[\"application/json\"],\"parameters\":[{\"in\":\"formData\",\"type\":\"string\",\"name\":\"list\",\"description\":\"playlist JSON\",\"required\":true}],\"responses\":{\"200\":{\"description\":\"Success\"}}}},\"/song/get\":{\"get\":{\"tags\":[\"song\"],\"summary\":\"load PlayList\",\"produces\":[\"application/json\"],\"responses\":{\"200\":{\"description\":\"Success\"}}}},\"/song/preload\":{\"post\":{\"tags\":[\"song\"],\"summary\":\"preload a song url, conver to local url\",\"consumes\":[\"application/x-www-form-urlencoded\"],\"produces\":[\"application/json\"],\"parameters\":[{\"in\":\"formData\",\"type\":\"string\",\"name\":\"url\",\"description\":\"audio file url\",\"required\":true}],\"responses\":{\"200\":{\"description\":\"Success\"}}}}}}");

/***/ }),
/* 45 */
/***/ (function(module, exports) {

module.exports = require("crypto");

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var http = __webpack_require__(15);
var https = __webpack_require__(47);
var urllib = __webpack_require__(16);
var utillib = __webpack_require__(48);
var zlib = __webpack_require__(13);
var dns = __webpack_require__(49);
var Stream = __webpack_require__(50).Readable;
var CookieJar = __webpack_require__(51).CookieJar;
var encodinglib = __webpack_require__(52);
var net = __webpack_require__(53);

var USE_ALLOC = typeof Buffer.alloc === 'function';

exports.FetchStream = FetchStream;
exports.CookieJar = CookieJar;
exports.fetchUrl = fetchUrl;

function FetchStream(url, options) {
    Stream.call(this);

    options = options || {};

    this.url = url;
    if (!this.url) {
        return this.emit('error', new Error('url not defined'));
    }

    this.userAgent = options.userAgent || 'FetchStream';

    this._redirect_count = 0;

    this.options = options || {};
    this.normalizeOptions();

    // prevent errors before 'error' handler is set by defferring actions
    if (typeof setImmediate !== 'undefined') {
        setImmediate(this.runStream.bind(this, url));
    } else {
        process.nextTick(this.runStream.bind(this, url));
    }
    this.responseBuffer = USE_ALLOC ? Buffer.alloc(0, '', 'binary') : new Buffer(0, 'binary');
    this.ended = false;
    this.readyToRead = 0;
}
utillib.inherits(FetchStream, Stream);

FetchStream.prototype._read = function (size) {
    if (this.ended && this.responseBuffer.length === 0) {
        this.push(null);
        return;
    }
    this.readyToRead += size;
    this.drainBuffer();
};

FetchStream.prototype.drainBuffer = function () {
    if (this.readyToRead === 0) {
        return;
    }
    if (this.responseBuffer.length === 0) {
        return;
    }
    var push;
    var rest;
    var restSize;

    if (this.responseBuffer.length > this.readyToRead) {
        push = USE_ALLOC ? Buffer.alloc(this.readyToRead, '', 'binary') : new Buffer(this.readyToRead, 'binary');
        this.responseBuffer.copy(push, 0, 0, this.readyToRead);
        restSize = this.responseBuffer.length - this.readyToRead;
        rest = USE_ALLOC ? Buffer.alloc(restSize, '', 'binary') : new Buffer(restSize, 'binary');
        this.responseBuffer.copy(rest, 0, this.readyToRead);
    } else {
        push = this.responseBuffer;
        rest = USE_ALLOC ? Buffer.alloc(0, '', 'binary') : new Buffer(0, 'binary');
    }
    this.responseBuffer = rest;
    this.readyToRead = 0;
    if (this.options.encoding) {
        this.push(push, this.options.encoding);
    } else {
        this.push(push);
    }
};

FetchStream.prototype.destroy = function (ex) {
    this.emit('destroy', ex);
};

FetchStream.prototype.normalizeOptions = function () {

    // cookiejar
    this.cookieJar = this.options.cookieJar || new CookieJar();

    // default redirects - 10
    // if disableRedirect is set, then 0
    if (!this.options.disableRedirect && typeof this.options.maxRedirects !== 'number' &&
        !(this.options.maxRedirects instanceof Number)) {
        this.options.maxRedirects = 10;
    } else if (this.options.disableRedirects) {
        this.options.maxRedirects = 0;
    }

    // normalize header keys
    // HTTP and HTTPS takes in key names in case insensitive but to find
    // an exact value from an object key name needs to be case sensitive
    // so we're just lowercasing all input keys
    this.options.headers = this.options.headers || {};

    var keys = Object.keys(this.options.headers);
    var newheaders = {};
    var i;

    for (i = keys.length - 1; i >= 0; i--) {
        newheaders[keys[i].toLowerCase().trim()] = this.options.headers[keys[i]];
    }

    this.options.headers = newheaders;

    if (!this.options.headers['user-agent']) {
        this.options.headers['user-agent'] = this.userAgent;
    }

    if (!this.options.headers.pragma) {
        this.options.headers.pragma = 'no-cache';
    }

    if (!this.options.headers['cache-control']) {
        this.options.headers['cache-control'] = 'no-cache';
    }

    if (!this.options.disableGzip) {
        this.options.headers['accept-encoding'] = 'gzip, deflate';
    } else {
        delete this.options.headers['accept-encoding'];
    }

    // max length for the response,
    // if not set, default is Infinity
    if (!this.options.maxResponseLength) {
        this.options.maxResponseLength = Infinity;
    }

    // method:
    // defaults to GET, or when payload present to POST
    if (!this.options.method) {
        this.options.method = this.options.payload || this.options.payloadSize ? 'POST' : 'GET';
    }

    // set cookies
    // takes full cookie definition strings as params
    if (this.options.cookies) {
        for (i = 0; i < this.options.cookies.length; i++) {
            this.cookieJar.setCookie(this.options.cookies[i], this.url);
        }
    }

    // rejectUnauthorized
    if (typeof this.options.rejectUnauthorized === 'undefined') {
        this.options.rejectUnauthorized = true;
    }
};

FetchStream.prototype.parseUrl = function (url) {
    var urlparts = urllib.parse(url, false, true),
        transport,
        urloptions = {
            host: urlparts.hostname || urlparts.host,
            port: urlparts.port,
            path: urlparts.pathname + (urlparts.search || '') || '/',
            method: this.options.method,
            rejectUnauthorized: this.options.rejectUnauthorized
        };

    switch (urlparts.protocol) {
        case 'https:':
            transport = https;
            break;
        case 'http:':
        default:
            transport = http;
            break;
    }

    if (transport === https) {
        if('agentHttps' in this.options){
            urloptions.agent = this.options.agentHttps;
        }
        if('agent' in this.options){
            urloptions.agent = this.options.agent;
        }
    } else {
        if('agentHttp' in this.options){
            urloptions.agent = this.options.agentHttp;
        }
        if('agent' in this.options){
            urloptions.agent = this.options.agent;
        }
    }

    if (!urloptions.port) {
        switch (urlparts.protocol) {
            case 'https:':
                urloptions.port = 443;
                break;
            case 'http:':
            default:
                urloptions.port = 80;
                break;
        }
    }

    urloptions.headers = this.options.headers || {};

    if (urlparts.auth) {
        var buf = USE_ALLOC ? Buffer.alloc(Buffer.byteLength(urlparts.auth), urlparts.auth) : new Buffer(urlparts.auth);
        urloptions.headers.Authorization = 'Basic ' + buf.toString('base64');
    }

    return {
        urloptions: urloptions,
        transport: transport
    };
};

FetchStream.prototype.setEncoding = function (encoding) {
    this.options.encoding = encoding;
};

FetchStream.prototype.runStream = function (url) {
    var url_data = this.parseUrl(url),
        cookies = this.cookieJar.getCookies(url);

    if (cookies) {
        url_data.urloptions.headers.cookie = cookies;
    } else {
        delete url_data.urloptions.headers.cookie;
    }

    if (this.options.payload) {
        url_data.urloptions.headers['content-length'] = Buffer.byteLength(this.options.payload || '', 'utf-8');
    }

    if (this.options.payloadSize) {
        url_data.urloptions.headers['content-length'] = this.options.payloadSize;
    }

    if (this.options.asyncDnsLoookup) {
        var dnsCallback = (function (err, addresses) {
            if (err) {
                this.emit('error', err);
                return;
            }

            url_data.urloptions.headers.host = url_data.urloptions.hostname || url_data.urloptions.host;
            url_data.urloptions.hostname = addresses[0];
            url_data.urloptions.host = url_data.urloptions.headers.host + (url_data.urloptions.port ? ':' + url_data.urloptions.port : '');

            this._runStream(url_data, url);
        }).bind(this);

        if (net.isIP(url_data.urloptions.host)) {
            dnsCallback(null, [url_data.urloptions.host]);
        } else {
            dns.resolve4(url_data.urloptions.host, dnsCallback);
        }
    } else {
        this._runStream(url_data, url);
    }
};

FetchStream.prototype._runStream = function (url_data, url) {

    var req = url_data.transport.request(url_data.urloptions, (function (res) {

        // catch new cookies before potential redirect
        if (Array.isArray(res.headers['set-cookie'])) {
            for (var i = 0; i < res.headers['set-cookie'].length; i++) {
                this.cookieJar.setCookie(res.headers['set-cookie'][i], url);
            }
        }

        if ([301, 302, 303, 307, 308].indexOf(res.statusCode) >= 0) {
            if (!this.options.disableRedirects && this.options.maxRedirects > this._redirect_count && res.headers.location) {
                this._redirect_count++;
                req.destroy();
                this.runStream(urllib.resolve(url, res.headers.location));
                return;
            }
        }

        this.meta = {
            status: res.statusCode,
            responseHeaders: res.headers,
            finalUrl: url,
            redirectCount: this._redirect_count,
            cookieJar: this.cookieJar
        };

        var curlen = 0,
            maxlen,

            receive = (function (chunk) {
                if (curlen + chunk.length > this.options.maxResponseLength) {
                    maxlen = this.options.maxResponseLength - curlen;
                } else {
                    maxlen = chunk.length;
                }

                if (maxlen <= 0) {
                    return;
                }

                curlen += Math.min(maxlen, chunk.length);
                if (maxlen >= chunk.length) {
                    if (this.responseBuffer.length === 0) {
                        this.responseBuffer = chunk;
                    } else {
                        this.responseBuffer = Buffer.concat([this.responseBuffer, chunk]);
                    }
                } else {
                    this.responseBuffer = Buffer.concat([this.responseBuffer, chunk], this.responseBuffer.length + maxlen);
                }
                this.drainBuffer();
            }).bind(this),

            error = (function (e) {
                this.ended = true;
                this.emit('error', e);
                this.drainBuffer();
            }).bind(this),

            end = (function () {
                this.ended = true;
                if (this.responseBuffer.length === 0) {
                    this.push(null);
                }
            }).bind(this),

            unpack = (function (type, res) {
                var z = zlib['create' + type]();
                z.on('data', receive);
                z.on('error', error);
                z.on('end', end);
                res.pipe(z);
            }).bind(this);

        this.emit('meta', this.meta);

        if (res.headers['content-encoding']) {
            switch (res.headers['content-encoding'].toLowerCase().trim()) {
                case 'gzip':
                    return unpack('Gunzip', res);
                case 'deflate':
                    return unpack('InflateRaw', res);
            }
        }

        res.on('data', receive);
        res.on('end', end);

    }).bind(this));

    req.on('error', (function (e) {
        this.emit('error', e);
    }).bind(this));

    if (this.options.timeout) {
        req.setTimeout(this.options.timeout, req.abort.bind(req));
    }
    this.on('destroy', req.abort.bind(req));

    if (this.options.payload) {
        req.end(this.options.payload);
    } else if (this.options.payloadStream) {
        this.options.payloadStream.pipe(req);
        this.options.payloadStream.resume();
    } else {
        req.end();
    }
};

function fetchUrl(url, options, callback) {
    if (!callback && typeof options === 'function') {
        callback = options;
        options = undefined;
    }
    options = options || {};

    var fetchstream = new FetchStream(url, options),
        response_data, chunks = [],
        length = 0,
        curpos = 0,
        buffer,
        content_type,
        callbackFired = false;

    fetchstream.on('meta', function (meta) {
        response_data = meta;
        content_type = _parseContentType(meta.responseHeaders['content-type']);
    });

    fetchstream.on('data', function (chunk) {
        if (chunk) {
            chunks.push(chunk);
            length += chunk.length;
        }
    });

    fetchstream.on('error', function (error) {
        if (error && error.code === 'HPE_INVALID_CONSTANT') {
            // skip invalid formatting errors
            return;
        }
        if (callbackFired) {
            return;
        }
        callbackFired = true;
        callback(error);
    });

    fetchstream.on('end', function () {
        if (callbackFired) {
            return;
        }
        callbackFired = true;

        buffer = USE_ALLOC ? Buffer.alloc(length) : new Buffer(length);
        for (var i = 0, len = chunks.length; i < len; i++) {
            chunks[i].copy(buffer, curpos);
            curpos += chunks[i].length;
        }

        if (content_type.mimeType === 'text/html') {
            content_type.charset = _findHTMLCharset(buffer) || content_type.charset;
        }

        content_type.charset = (options.overrideCharset || content_type.charset || 'utf-8').trim().toLowerCase();


        if (!options.disableDecoding && !content_type.charset.match(/^utf-?8$/i)) {
            buffer = encodinglib.convert(buffer, 'UTF-8', content_type.charset);
        }

        if (options.outputEncoding) {
            return callback(null, response_data, buffer.toString(options.outputEncoding));
        } else {
            return callback(null, response_data, buffer);
        }

    });
}

function _parseContentType(str) {
    if (!str) {
        return {};
    }
    var parts = str.split(';'),
        mimeType = parts.shift(),
        charset, chparts;

    for (var i = 0, len = parts.length; i < len; i++) {
        chparts = parts[i].split('=');
        if (chparts.length > 1) {
            if (chparts[0].trim().toLowerCase() === 'charset') {
                charset = chparts[1];
            }
        }
    }

    return {
        mimeType: (mimeType || '').trim().toLowerCase(),
        charset: (charset || 'UTF-8').trim().toLowerCase() // defaults to UTF-8
    };
}

function _findHTMLCharset(htmlbuffer) {

    var body = htmlbuffer.toString('ascii'),
        input, meta, charset;

    if ((meta = body.match(/<meta\s+http-equiv=["']content-type["'][^>]*?>/i))) {
        input = meta[0];
    }

    if (input) {
        charset = input.match(/charset\s?=\s?([a-zA-Z\-0-9]*);?/);
        if (charset) {
            charset = (charset[1] || '').trim().toLowerCase();
        }
    }

    if (!charset && (meta = body.match(/<meta\s+charset=["'](.*?)["']/i))) {
        charset = (meta[1] || '').trim().toLowerCase();
    }

    return charset;
}


/***/ }),
/* 47 */
/***/ (function(module, exports) {

module.exports = require("https");

/***/ }),
/* 48 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 49 */
/***/ (function(module, exports) {

module.exports = require("dns");

/***/ }),
/* 50 */
/***/ (function(module, exports) {

module.exports = require("stream");

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var urllib = __webpack_require__(16);

module.exports.CookieJar = CookieJar;

function CookieJar(options) {
    this.options = options || {};
    this.options.sessionTimeout = this.options.sessionTimeout || 1800; // 30min

    this.cookies = {};
}

CookieJar.prototype.addCookie = function (cookie) {

    if (!cookie || !cookie.name) {
        return;
    }

    var lcookie;

    if (!this.cookies[cookie.name]) {
        this.cookies[cookie.name] = [];
    }

    // overwrite if has same params
    for (var i = 0, len = this.cookies[cookie.name].length; i < len; i++) {
        lcookie = this.cookies[cookie.name][i];
        if (
            lcookie.path === cookie.path &&
            lcookie.domain === cookie.domain &&
            lcookie.secure === cookie.secure &&
            lcookie.httponly === cookie.httponly
        ) {
            this.cookies[cookie.name][i] = cookie;
            return;
        }
    }

    this.cookies[cookie.name].push(cookie);
};

CookieJar.prototype.getCookies = function (url) {
    var keys = Object.keys(this.cookies),
        cookie, cookies = [];

    for (var i = 0, len = keys.length; i < len; i++) {
        if (Array.isArray(this.cookies[keys[i]])) {
            for (var j = 0, lenj = this.cookies[keys[i]].length; j < lenj; j++) {
                cookie = this.cookies[keys[i]][j];
                if (this.matchCookie(cookie, url)) {
                    cookies.push(cookie.name + '=' + cookie.value);
                }
            }
        }
    }
    return cookies.join('; ');
};

CookieJar.prototype.matchCookie = function (cookie, url) {
    var urlparts = urllib.parse(url || '', false, true),
        path;

    // check expire
    if (cookie.expire) {
        if (cookie.expire.getTime() < Date.now()) {
            return;
        }
    }

    // check if hostname matches
    if (urlparts.hostname && cookie._domain) {
        if (!(urlparts.hostname === cookie._domain || urlparts.hostname.substr(-(cookie._domain.length + 1)) === '.' + cookie._domain)) {
            return false;
        }
    }

    // check if path matches
    if (cookie.path && urlparts.pathname) {

        path = (urlparts.pathname || '/').split('/');
        path.pop();
        path = path.join('/').trim();
        if (path.substr(0, 1) !== '/') {
            path = '/' + path;
        }
        if (path.substr(-1) !== '/') {
            path += '/';
        }

        if (path.substr(0, cookie.path.length) !== cookie.path) {
            return false;
        }
    }

    // check secure
    if (cookie.secure && urlparts.protocol) {
        if (urlparts.protocol !== 'https:') {
            return false;
        }
    }

    // check httponly
    if (cookie.httponly && urlparts.protocol) {
        if (urlparts.protocol !== 'http:') {
            return false;
        }
    }

    return true;
};

CookieJar.prototype.setCookie = function (cookie_str, url) {
    var parts = (cookie_str || '').split(';'),
        cookie = {},
        urlparts = urllib.parse(url || '', false, true),
        path;

    parts.forEach((function (part) {
        var key, val;
        part = part.split('=');
        key = part.shift().trim();
        val = part.join('=').trim();

        if (!key) {
            return;
        }

        switch (key.toLowerCase()) {

            case 'expires':

                cookie.expires = new Date(val);
                break;

            case 'path':
                cookie.path = val.trim();
                break;

            case 'domain':
                cookie.domain = val.toLowerCase();
                break;

            case 'max-age':
                cookie.expires = new Date(Date.now() + (Number(val) || 0) * 1000);
                break;

            case 'secure':
                cookie.secure = true;
                break;

            case 'httponly':
                cookie.httponly = true;
                break;

            default:
                if (!cookie.name) {
                    cookie.name = key;
                    cookie.value = val;
                }
        }
    }).bind(this));

    // use current path when path is not specified
    if (!cookie.path) {
        path = (urlparts.pathname || '/').split('/');
        path.pop();
        cookie.path = path.join('/').trim();
        if (cookie.path.substr(0, 1) !== '/') {
            cookie.path = '/' + cookie.path;
        }
        if (cookie.path.substr(-1) !== '/') {
            cookie.path += '/';
        }
    }

    // if no expire date, then use sessionTimeout value
    if (!cookie.expires) {
        cookie._expires = new Date(Date.now() + (Number(this.options.sessionTimeout) || 0) * 1000);
    } else {
        cookie._expires = cookie.expires;
    }

    if (!cookie.domain) {
        if (urlparts.hostname) {
            cookie._domain = urlparts.hostname;
        }
    } else {
        cookie._domain = cookie.domain;
    }

    this.addCookie(cookie);
};


/***/ }),
/* 52 */
/***/ (function(module, exports) {

module.exports = require("encoding");

/***/ }),
/* 53 */
/***/ (function(module, exports) {

module.exports = require("net");

/***/ })
/******/ ]);