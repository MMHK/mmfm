(() => {
"use strict";
var __webpack_modules__ = ({});
// The module cache
var __webpack_module_cache__ = {};

// The require function
function __webpack_require__(moduleId) {

// Check if module is in cache
var cachedModule = __webpack_module_cache__[moduleId];
if (cachedModule !== undefined) {
return cachedModule.exports;
}
// Create a new module (and put it into the cache)
var module = (__webpack_module_cache__[moduleId] = {
exports: {}
});
// Execute the module function
__webpack_modules__[moduleId](module, module.exports, __webpack_require__);

// Return the exports of the module
return module.exports;

}

// webpack/runtime/compat_get_default_export
(() => {
// getDefaultExport function for compatibility with non-ESM modules
__webpack_require__.n = (module) => {
	var getter = module && module.__esModule ?
		() => (module['default']) :
		() => (module);
	__webpack_require__.d(getter, { a: getter });
	return getter;
};

})();
// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = (exports, definition) => {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
})();
// webpack/runtime/has_own_property
(() => {
__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();
// webpack/runtime/rspack_version
(() => {
__webpack_require__.rv = () => ("1.7.12")
})();
// webpack/runtime/rspack_unique_id
(() => {
__webpack_require__.ruid = "bundler=rspack@1.7.12";
})();

;// CONCATENATED MODULE: external "express"
const external_express_namespaceObject = require("express");
var external_express_default = /*#__PURE__*/__webpack_require__.n(external_express_namespaceObject);
;// CONCATENATED MODULE: external "cli"
const external_cli_namespaceObject = require("cli");
var external_cli_default = /*#__PURE__*/__webpack_require__.n(external_cli_namespaceObject);
;// CONCATENATED MODULE: external "body-parser"
const external_body_parser_namespaceObject = require("body-parser");
var external_body_parser_default = /*#__PURE__*/__webpack_require__.n(external_body_parser_namespaceObject);
;// CONCATENATED MODULE: external "swagger-ui-express"
const external_swagger_ui_express_namespaceObject = require("swagger-ui-express");
var external_swagger_ui_express_default = /*#__PURE__*/__webpack_require__.n(external_swagger_ui_express_namespaceObject);
;// CONCATENATED MODULE: external "http"
const external_http_namespaceObject = require("http");
var external_http_default = /*#__PURE__*/__webpack_require__.n(external_http_namespaceObject);
;// CONCATENATED MODULE: external "socket.io"
const external_socket_io_namespaceObject = require("socket.io");
;// CONCATENATED MODULE: ./src/services/swagger.json
var swagger_namespaceObject = JSON.parse('{"swagger":"2.0","info":{"description":"Intranet music radio API — search, resolve, and stream YouTube/Bilibili tracks via yt-dlp.","version":"1.0.0","title":"MMFM Music API"},"host":"localhost","basePath":"/","schemes":["http"],"tags":[{"name":"song","description":"Song search, detail, preload, and playlist management"},{"name":"cookies","description":"yt-dlp cookie file management"}],"paths":{"/api/song/search":{"get":{"tags":["song"],"summary":"Search song of all platform","produces":["application/json"],"parameters":[{"name":"keyword","in":"query","type":"string","description":"Name of song","required":true}],"responses":{"200":{"description":"Success","schema":{"$ref":"#/definitions/SearchResponse"}},"400":{"description":"Bad request","schema":{"$ref":"#/definitions/ErrorResponse"}},"500":{"description":"Server error","schema":{"$ref":"#/definitions/ErrorResponse"}}}}},"/api/song/detail":{"get":{"tags":["song"],"summary":"get song detail","produces":["application/json"],"parameters":[{"in":"query","name":"id","type":"string","description":"Track URL or ID (string)","required":true}],"responses":{"200":{"description":"Success","schema":{"$ref":"#/definitions/DetailResponse"}},"400":{"description":"Bad request","schema":{"$ref":"#/definitions/ErrorResponse"}},"404":{"description":"Track not found"}}}},"/api/song/url":{"get":{"tags":["song"],"summary":"get song URL","produces":["application/json"],"parameters":[{"in":"query","name":"vendor","type":"string","description":"platform","required":true},{"in":"query","name":"id","type":"string","description":"ID of song","required":true}],"responses":{"200":{"description":"Success","schema":{"$ref":"#/definitions/UrlResponse"}},"400":{"description":"Bad request","schema":{"$ref":"#/definitions/ErrorResponse"}},"404":{"description":"Track not found"}}}},"/api/cookies/status":{"get":{"tags":["cookies"],"summary":"get cookie file status for all supported platforms","produces":["application/json"],"responses":{"200":{"description":"Success","schema":{"type":"object","properties":{"youtube":{"type":"object","properties":{"exists":{"type":"boolean"},"updatedAt":{"type":"number","description":"mtimeMs or null"}}},"bilibili":{"type":"object","properties":{"exists":{"type":"boolean"},"updatedAt":{"type":"number","description":"mtimeMs or null"}}}}}}}}},"/api/cookies/{platform}":{"post":{"tags":["cookies"],"summary":"upload/overwrite a cookie file for a platform","consumes":["application/json"],"produces":["application/json"],"parameters":[{"name":"platform","in":"path","type":"string","enum":["youtube","bilibili"],"description":"Target platform","required":true},{"in":"body","name":"body","required":true,"schema":{"type":"object","required":["content"],"properties":{"content":{"type":"string","description":"Netscape cookies.txt content"}}}}],"responses":{"200":{"description":"Success","schema":{"type":"object","properties":{"status":{"type":"boolean"},"platform":{"type":"string"},"updatedAt":{"type":"number"}}}},"400":{"description":"Bad request (unsupported platform or empty content)","schema":{"$ref":"#/definitions/ErrorResponse"}},"500":{"description":"Server error","schema":{"$ref":"#/definitions/ErrorResponse"}}}}},"/song/save":{"post":{"tags":["song"],"summary":"save play list","consumes":["application/json"],"produces":["application/json"],"parameters":[{"in":"body","name":"body","required":true,"schema":{"type":"object","required":["list"],"properties":{"list":{"type":"string","description":"JSON-encoded playlist array"}}}}],"responses":{"200":{"description":"Success","schema":{"type":"array","items":{"$ref":"#/definitions/Song"}}}}}},"/song/get":{"get":{"tags":["song"],"summary":"load PlayList","produces":["application/json"],"responses":{"200":{"description":"Success","schema":{"type":"array","items":{"$ref":"#/definitions/Song"}}}}}},"/song/preload":{"post":{"tags":["song"],"summary":"preload a song url, conver to local url","consumes":["application/json"],"produces":["application/json"],"parameters":[{"in":"body","name":"body","required":true,"schema":{"type":"object","required":["url"],"properties":{"url":{"type":"string","description":"Audio URL to preload"}}}}],"responses":{"200":{"description":"Success","schema":{"$ref":"#/definitions/PreloadResponse"}}}}}},"x-websocket":{"description":"Socket.IO WebSocket endpoint. Connect at ws://<host>/io using the Socket.IO protocol.","path":"/io","events":{"client-to-server":{"msg":{"description":"Send a chat message (string) to the server; broadcasted to all other clients in the \'chat\' room.","payload":"string"},"disconnect":{"description":"Fired when the client disconnects."},"error":{"description":"Fired on client-side error.","payload":"string"}},"server-to-client":{"msg":{"description":"Chat message broadcasted to connected clients.","payload":"string"}}}},"definitions":{"Artist":{"type":"object","properties":{"name":{"type":"string"}}},"Album":{"type":"object","properties":{"cover":{"type":"string","description":"Cover image URL"}}},"Song":{"type":"object","properties":{"id":{"type":"string","description":"Track URL or ID"},"name":{"type":"string","description":"Track title"},"artists":{"type":"array","items":{"$ref":"#/definitions/Artist"}},"album":{"$ref":"#/definitions/Album"},"link":{"type":"string","description":"Link to original page"},"vendor":{"type":"string","enum":["youtube","bilibili"]}}},"SongGroup":{"type":"object","properties":{"total":{"type":"integer"},"songs":{"type":"array","items":{"$ref":"#/definitions/Song"}}}},"SearchResponse":{"type":"object","properties":{"status":{"type":"boolean"},"data":{"type":"object","properties":{"youtube":{"$ref":"#/definitions/SongGroup"},"bilibili":{"$ref":"#/definitions/SongGroup"}}}}},"DetailResponse":{"type":"object","properties":{"status":{"type":"boolean"},"data":{"$ref":"#/definitions/Song"}}},"UrlResponse":{"type":"object","properties":{"status":{"type":"boolean"},"data":{"type":"string","description":"Track webpage URL"}}},"PreloadResponse":{"type":"object","properties":{"status":{"type":"integer","enum":[0,1],"description":"1=success, 0=no url/error"},"url":{"type":"string","description":"Local cache URL (present when status=1)"},"error":{"type":"string","description":"Error message (present on failure)"}}},"ErrorResponse":{"type":"object","properties":{"status":{"type":"boolean","enum":[false]},"error":{"type":"string"}}}}}')
;// CONCATENATED MODULE: external "path"
const external_path_namespaceObject = require("path");
var external_path_default = /*#__PURE__*/__webpack_require__.n(external_path_namespaceObject);
;// CONCATENATED MODULE: external "crypto"
const external_crypto_namespaceObject = require("crypto");
var external_crypto_default = /*#__PURE__*/__webpack_require__.n(external_crypto_namespaceObject);
;// CONCATENATED MODULE: external "fs"
const external_fs_namespaceObject = require("fs");
var external_fs_default = /*#__PURE__*/__webpack_require__.n(external_fs_namespaceObject);
;// CONCATENATED MODULE: external "os"
const external_os_namespaceObject = require("os");
var external_os_default = /*#__PURE__*/__webpack_require__.n(external_os_namespaceObject);
;// CONCATENATED MODULE: external "flat-cache"
const external_flat_cache_namespaceObject = require("flat-cache");
var external_flat_cache_default = /*#__PURE__*/__webpack_require__.n(external_flat_cache_namespaceObject);
;// CONCATENATED MODULE: external "dotenv"
const external_dotenv_namespaceObject = require("dotenv");
var external_dotenv_default = /*#__PURE__*/__webpack_require__.n(external_dotenv_namespaceObject);
;// CONCATENATED MODULE: ./src/services/logger.ts
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var _console, _console1, _console2, _console3;
var _LOG_LEVELS_;
var LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};
var currentLevel = (_LOG_LEVELS_ = LOG_LEVELS[process.env.LOG_LEVEL || "info"]) !== null && _LOG_LEVELS_ !== void 0 ? _LOG_LEVELS_ : 2;
var logger = {
    error: function error() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        return currentLevel >= 0 && (_console = console).error.apply(_console, [
            "[ERROR]"
        ].concat(_to_consumable_array(args)));
    },
    warn: function warn() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        return currentLevel >= 1 && (_console1 = console).warn.apply(_console1, [
            "[WARN]"
        ].concat(_to_consumable_array(args)));
    },
    info: function info() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        return currentLevel >= 2 && (_console2 = console).log.apply(_console2, [
            "[INFO]"
        ].concat(_to_consumable_array(args)));
    },
    debug: function debug() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        return currentLevel >= 3 && (_console3 = console).log.apply(_console3, [
            "[DEBUG]"
        ].concat(_to_consumable_array(args)));
    }
};

;// CONCATENATED MODULE: external "child_process"
const external_child_process_namespaceObject = require("child_process");
;// CONCATENATED MODULE: ./src/services/CookieService.ts


var COOKIE_DIR = process.env.COOKIE_DIR || external_path_default().join(__dirname, "..", "..", "public", "cache", "cookies");
var SUPPORTED_PLATFORMS = [
    "youtube",
    "bilibili"
];
function isSupportedPlatform(p) {
    return SUPPORTED_PLATFORMS.includes(p);
}
function cookiePath(platform) {
    return external_path_default().join(COOKIE_DIR, "".concat(platform, ".txt"));
}
function cookieExists(platform) {
    return external_fs_default().existsSync(cookiePath(platform));
}
function saveCookie(platform, content) {
    external_fs_default().mkdirSync(COOKIE_DIR, {
        recursive: true
    });
    external_fs_default().writeFileSync(cookiePath(platform), content, "utf8");
    var stat = external_fs_default().statSync(cookiePath(platform));
    return {
        updatedAt: stat.mtimeMs
    };
}
function cookieStatus() {
    var result = {};
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = SUPPORTED_PLATFORMS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var p = _step.value;
            if (external_fs_default().existsSync(cookiePath(p))) {
                var stat = external_fs_default().statSync(cookiePath(p));
                result[p] = {
                    exists: true,
                    updatedAt: stat.mtimeMs
                };
            } else {
                result[p] = {
                    exists: false,
                    updatedAt: null
                };
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    return result;
}

;// CONCATENATED MODULE: ./src/services/YtDlpService.ts
function YtDlpService_array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function YtDlpService_array_without_holes(arr) {
    if (Array.isArray(arr)) return YtDlpService_array_like_to_array(arr);
}
function _assert_this_initialized(self) {
    if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
}
function _call_super(_this, derived, args) {
    derived = _get_prototype_of(derived);
    return _possible_constructor_return(_this, _is_native_reflect_construct() ? Reflect.construct(derived, args || [], _get_prototype_of(_this).constructor) : derived.apply(_this, args));
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _construct(Parent, args, Class) {
    if (_is_native_reflect_construct()) {
        _construct = Reflect.construct;
    } else {
        _construct = function construct(Parent, args, Class) {
            var a = [
                null
            ];
            a.push.apply(a, args);
            var Constructor = Function.bind.apply(Parent, a);
            var instance = new Constructor();
            if (Class) _set_prototype_of(instance, Class.prototype);
            return instance;
        };
    }
    return _construct.apply(null, arguments);
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _get_prototype_of(o) {
    _get_prototype_of = Object.setPrototypeOf ? Object.getPrototypeOf : function getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _get_prototype_of(o);
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });
    if (superClass) _set_prototype_of(subClass, superClass);
}
function _is_native_function(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
function YtDlpService_iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function YtDlpService_non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _possible_constructor_return(self, call) {
    if (call && (_type_of(call) === "object" || typeof call === "function")) {
        return call;
    }
    return _assert_this_initialized(self);
}
function _set_prototype_of(o, p) {
    _set_prototype_of = Object.setPrototypeOf || function setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return _set_prototype_of(o, p);
}
function YtDlpService_to_consumable_array(arr) {
    return YtDlpService_array_without_holes(arr) || YtDlpService_iterable_to_array(arr) || YtDlpService_unsupported_iterable_to_array(arr) || YtDlpService_non_iterable_spread();
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function YtDlpService_unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return YtDlpService_array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return YtDlpService_array_like_to_array(o, minLen);
}
function _wrap_native_super(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;
    _wrap_native_super = function wrapNativeSuper(Class) {
        if (Class === null || !_is_native_function(Class)) return Class;
        if (typeof Class !== "function") {
            throw new TypeError("Super expression must either be null or a function");
        }
        if (typeof _cache !== "undefined") {
            if (_cache.has(Class)) return _cache.get(Class);
            _cache.set(Class, Wrapper);
        }
        function Wrapper() {
            return _construct(Class, arguments, _get_prototype_of(this).constructor);
        }
        Wrapper.prototype = Object.create(Class.prototype, {
            constructor: {
                value: Wrapper,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        return _set_prototype_of(Wrapper, Class);
    };
    return _wrap_native_super(Class);
}
function _is_native_reflect_construct() {
    try {
        var result = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
    } catch (_) {}
    return (_is_native_reflect_construct = function() {
        return !!result;
    })();
}



var YtDlpService_CookieError = /*#__PURE__*/ function(Error1) {
    "use strict";
    _inherits(CookieError, Error1);
    function CookieError(platform, stderr) {
        _class_call_check(this, CookieError);
        var _this;
        _this = _call_super(this, CookieError, [
            "Cookie required for ".concat(platform, ": ").concat(stderr)
        ]), _define_property(_this, "platform", void 0), _define_property(_this, "stderr", void 0);
        _this.name = "CookieError";
        _this.platform = platform;
        _this.stderr = stderr;
        return _this;
    }
    return CookieError;
}(_wrap_native_super(Error));
var CMD = process.platform === "win32" ? "yt-dlp.cmd" : "yt-dlp";
function runYtDlp(args, platform, timeout) {
    if (platform && cookieExists(platform)) {
        args = [
            "--cookies",
            cookiePath(platform)
        ].concat(YtDlpService_to_consumable_array(args));
    }
    return new Promise(function(resolve, reject) {
        logger.debug("[yt-dlp] spawn: ".concat(CMD, " ").concat(args.join(" ")));
        var startTime = Date.now();
        var proc = (0,external_child_process_namespaceObject.spawn)(CMD, args, {
            stdio: [
                "ignore",
                "pipe",
                "pipe"
            ]
        });
        var stdout = "";
        var stderr = "";
        var timer = null;
        var timedOut = false;
        if (timeout && timeout > 0) {
            timer = setTimeout(function() {
                timer = null;
                timedOut = true;
                proc.kill();
                reject(new Error("timeout after ".concat(timeout, "ms")));
            }, timeout);
        }
        proc.stdout.on("data", function(chunk) {
            stdout += chunk.toString();
        });
        proc.stderr.on("data", function(chunk) {
            var msg = chunk.toString();
            stderr += msg;
            logger.debug("[yt-dlp:stderr] ".concat(msg.trim()));
        });
        proc.on("close", function(code) {
            if (timedOut) return;
            if (timer) clearTimeout(timer);
            var elapsed = Date.now() - startTime;
            var pidMsg = "pid=".concat(proc.pid);
            var hasData = stdout.trim().length > 0;
            if (code !== 0 && !hasData) {
                logger.error("[yt-dlp] exited code=".concat(code, " ").concat(pidMsg, " (").concat(elapsed, "ms), no output: ").concat(stderr.trim()));
                return reject(new Error("code=".concat(code, ": ").concat(stderr.trim())));
            }
            if (code !== 0) {
                logger.warn("[yt-dlp] exited code=".concat(code, " ").concat(pidMsg, " (").concat(elapsed, "ms), partial data returned"));
            } else {
                logger.debug("[yt-dlp] exited code=0 ".concat(pidMsg, " (").concat(elapsed, "ms) stdout=").concat(stdout.length, "bytes"));
            }
            resolve(stdout);
        });
        proc.on("error", function(err) {
            if (timer) clearTimeout(timer);
            logger.error("[yt-dlp] spawn failed pid=".concat(proc.pid, ": ").concat(err.message));
            reject(err);
        });
    });
}
function parseMetadata(data) {
    var json = JSON.parse(data);
    return {
        id: json.id,
        title: json.title,
        uploader: json.uploader || json.channel || "",
        thumbnail: json.thumbnail,
        duration: json.duration,
        webpage_url: json.webpage_url,
        extractor: json.extractor
    };
}
function YtDlpService_resolve(url, platform) {
    var args = [
        "--dump-json",
        "--no-download",
        "--no-playlist",
        url
    ];
    return runYtDlp(args, platform).then(function(stdout) {
        return parseMetadata(stdout);
    });
}
function search(keyword) {
    var platforms = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [
        "youtube",
        "bilibili"
    ];
    var prefixMap = {
        youtube: "yt",
        bilibili: "bili"
    };
    var queries = platforms.map(function(p) {
        return {
            prefix: prefixMap[p] || p,
            platform: p
        };
    });
    var SEARCH_TIMEOUT = 30000;
    var promises = queries.map(function(param) {
        var prefix = param.prefix, platform = param.platform;
        return runYtDlp([
            "--dump-json",
            "--no-download",
            "".concat(prefix, "search5:").concat(keyword)
        ], platform, SEARCH_TIMEOUT).then(function(stdout) {
            return stdout.trim().split("\n").filter(Boolean).map(function(line) {
                try {
                    return parseMetadata(line);
                } catch (unused) {
                    logger.debug("[yt-dlp] parse failed: ".concat(line.slice(0, 100)));
                    return null;
                }
            }).filter(function(m) {
                return m !== null;
            });
        }).catch(function(err) {
            logger.warn("[yt-dlp] ".concat(platform, " search failed: ").concat(err.message));
            return [];
        });
    });
    return Promise.all(promises).then(function(results) {
        return results.flat();
    });
}
function download(url, outputPath, platform) {
    var args = [
        "-x",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "0",
        "--no-playlist",
        "-o",
        "".concat(outputPath, ".%(ext)s"),
        "--ppa",
        "extractaudio:-filter:a loudnorm=I=-16:TP=-1.5:LRA=11",
        url
    ];
    return runYtDlp(args, platform).then(function() {
        return undefined;
    });
}

;// CONCATENATED MODULE: ./src/services/WebService.ts
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _instanceof(left, right) {
    "@swc/helpers - instanceof";
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _ts_generator(thisArg, body) {
    var f, y, t, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype), d = Object.defineProperty;
    return d(g, "next", {
        value: verb(0)
    }), d(g, "throw", {
        value: verb(1)
    }), d(g, "return", {
        value: verb(2)
    }), typeof Symbol === "function" && d(g, Symbol.iterator, {
        value: function() {
            return this;
        }
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
















var app = external_express_default()();
external_dotenv_default().config({
    override: true,
    quiet: true
});
var options = external_cli_default().parse({
    host: [
        "b",
        "web server listen on address",
        "ip",
        process.env.HOST || "0.0.0.0"
    ],
    port: [
        "p",
        "listen on port",
        "string",
        process.env.PORT || "8011"
    ],
    webroot: [
        "d",
        "web root path",
        "string",
        process.env.WEBROOT || "./public"
    ],
    logLevel: [
        "l",
        "log level (error, warn, info, debug)",
        "string",
        process.env.LOG_LEVEL || "info"
    ]
});
var webRoot = options.webroot;
var cacheDir = external_path_default().join(webRoot, "cache");
var trackCache = external_flat_cache_default().load("yt-track-cache", external_os_default().tmpdir());
app.use(external_body_parser_default().urlencoded({
    extended: false,
    limit: "10mb"
}));
app.use(external_body_parser_default().json({
    limit: "10mb"
}));
app.use("/swagger", function(req, res, next) {
    swagger_namespaceObject.host = req.get("host");
    req.swaggerDoc = swagger_namespaceObject;
    next();
}, (external_swagger_ui_express_default()).serve, external_swagger_ui_express_default().setup());
var isVideoUrl = /^(https?:\/\/)?(www\.youtube\.com|youtu\.be|www\.bilibili\.com|m\.bilibili\.com)\//i;
function mapExtractor(extractor) {
    if (extractor.includes("youtube") || extractor.includes("Youtube")) return "youtube";
    return "bilibili";
}
function toSongFormat(meta) {
    return {
        id: meta.webpage_url,
        name: meta.title,
        artists: [
            {
                name: meta.uploader
            }
        ],
        album: {
            cover: meta.thumbnail || ""
        },
        link: meta.webpage_url,
        vendor: mapExtractor(meta.extractor)
    };
}
function cacheTrack(meta) {
    trackCache.setKey(meta.webpage_url, meta);
    trackCache.save();
}
function groupByVendor(songs) {
    var groups = {
        youtube: {
            total: 0,
            songs: []
        },
        bilibili: {
            total: 0,
            songs: []
        }
    };
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = songs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var song = _step.value;
            groups[song.vendor].songs.push(song);
            groups[song.vendor].total++;
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    return groups;
}
app.get("/api/song/search", function(req, res) {
    return _async_to_generator(function() {
        var keyword, meta, results, e, need;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    keyword = req.query.keyword;
                    logger.debug("GET /api/song/search", {
                        keyword: keyword
                    });
                    if (!keyword) {
                        res.status(400).send({
                            status: false,
                            error: "参数错误"
                        });
                        return [
                            2
                        ];
                    }
                    _state.label = 1;
                case 1:
                    _state.trys.push([
                        1,
                        6,
                        ,
                        7
                    ]);
                    if (!isVideoUrl.test(keyword)) return [
                        3,
                        3
                    ];
                    return [
                        4,
                        YtDlpService_resolve(keyword)
                    ];
                case 2:
                    meta = _state.sent();
                    cacheTrack(meta);
                    res.send({
                        status: true,
                        data: groupByVendor([
                            toSongFormat(meta)
                        ])
                    });
                    return [
                        3,
                        5
                    ];
                case 3:
                    return [
                        4,
                        search(keyword)
                    ];
                case 4:
                    results = _state.sent();
                    results.forEach(cacheTrack);
                    res.send({
                        status: true,
                        data: groupByVendor(results.map(toSongFormat))
                    });
                    _state.label = 5;
                case 5:
                    return [
                        3,
                        7
                    ];
                case 6:
                    e = _state.sent();
                    if (_instanceof(e, YtDlpService_CookieError)) {
                        need = [
                            e.platform
                        ];
                        res.status(400).send({
                            status: false,
                            cookieNeed: need,
                            error: "Cookie 驗證失敗: ".concat(e.platform)
                        });
                        return [
                            2
                        ];
                    }
                    res.status(500).send({
                        status: false,
                        error: e.message
                    });
                    return [
                        3,
                        7
                    ];
                case 7:
                    return [
                        2
                    ];
            }
        });
    })();
});
app.get("/api/song/detail", function(req, res) {
    return _async_to_generator(function() {
        var id, cached;
        return _ts_generator(this, function(_state) {
            id = req.query.id;
            logger.debug("GET /api/song/detail", {
                id: id
            });
            if (!id) {
                res.status(400).send({
                    status: false,
                    error: "参数错误"
                });
                return [
                    2
                ];
            }
            cached = trackCache.getKey(id);
            if (cached) {
                res.send({
                    status: true,
                    data: toSongFormat(cached)
                });
            } else {
                res.status(404).send({
                    status: false,
                    error: "not found"
                });
            }
            return [
                2
            ];
        });
    })();
});
app.get("/api/song/url", function(req, res) {
    return _async_to_generator(function() {
        var vendor, id, cached;
        return _ts_generator(this, function(_state) {
            vendor = req.query.vendor;
            id = req.query.id;
            logger.debug("GET /api/song/url", {
                vendor: vendor,
                id: id
            });
            if (!id || !vendor) {
                res.status(400).send({
                    status: false,
                    error: "参数错误"
                });
                return [
                    2
                ];
            }
            cached = trackCache.getKey(id);
            if (cached) {
                res.send({
                    status: true,
                    data: cached.webpage_url
                });
            } else {
                res.status(404).send({
                    status: false,
                    error: "not found"
                });
            }
            return [
                2
            ];
        });
    })();
});
var SongList = [];
var playlistFile = external_path_default().join(cacheDir, "playlist.json");
if (!external_fs_default().existsSync(cacheDir)) {
    external_fs_default().mkdirSync(cacheDir, {
        recursive: true
    });
}
try {
    if (external_fs_default().existsSync(playlistFile)) {
        var WebService_data = external_fs_default().readFileSync(playlistFile, "utf8");
        SongList = JSON.parse(WebService_data);
        logger.debug("Loaded ".concat(SongList.length, " songs from playlist.json"));
    }
} catch (err) {
    logger.error("Failed to load playlist:", err.message);
}
app.post("/song/preload", function(req, res) {
    return _async_to_generator(function() {
        var url, platform, hash, localPath, host, err, host1;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    url = req.body.url || "";
                    platform = req.body.platform || "";
                    if (!platform) {
                        // detect from url
                        platform = url.includes("youtube") ? "youtube" : "bilibili";
                    }
                    if (!url) {
                        res.send(JSON.stringify({
                            status: 0,
                            url: ""
                        }));
                        return [
                            2
                        ];
                    }
                    hash = external_crypto_default().createHash("md5").update(url).digest("hex");
                    localPath = external_path_default().join(cacheDir, hash);
                    if (external_fs_default().existsSync(localPath)) {
                        host = req.get("host");
                        res.send(JSON.stringify({
                            status: 1,
                            url: "http://".concat(host, "/cache/").concat(hash, ".mp3")
                        }));
                        return [
                            2
                        ];
                    }
                    _state.label = 1;
                case 1:
                    _state.trys.push([
                        1,
                        3,
                        ,
                        4
                    ]);
                    return [
                        4,
                        download(url, localPath, platform)
                    ];
                case 2:
                    _state.sent();
                    return [
                        3,
                        4
                    ];
                case 3:
                    err = _state.sent();
                    res.send(JSON.stringify({
                        status: false,
                        error: err.message
                    }));
                    return [
                        2
                    ];
                case 4:
                    host1 = req.get("host");
                    res.send(JSON.stringify({
                        status: 1,
                        url: "http://".concat(host1, "/cache/").concat(hash, ".mp3")
                    }));
                    return [
                        2
                    ];
            }
        });
    })();
});
app.post("/song/save", function(req, res) {
    return _async_to_generator(function() {
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    SongList = JSON.parse(req.body.list || "[]") || [];
                    try {
                        external_fs_default().writeFileSync(playlistFile, JSON.stringify(SongList, null, 2), "utf8");
                    } catch (err) {
                        logger.error("Failed to save playlist:", err.message);
                    }
                    return [
                        4,
                        res.send(JSON.stringify(SongList))
                    ];
                case 1:
                    _state.sent();
                    return [
                        2
                    ];
            }
        });
    })();
});
app.get("/song/get", function(req, res) {
    return _async_to_generator(function() {
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    return [
                        4,
                        res.send(SongList)
                    ];
                case 1:
                    _state.sent();
                    return [
                        2
                    ];
            }
        });
    })();
});
var server = external_http_default().createServer(app);
var io = new external_socket_io_namespaceObject.Server(server, {
    path: "/io"
});
io.on("connection", function(socket) {
    logger.debug("Socket connected:", socket.id);
    socket.join("chat");
    socket.on("msg", function(msg) {
        socket.to("chat").emit("msg", msg);
    });
    socket.on("disconnect", function() {
        logger.debug("on disconnect");
    });
    socket.on("error", function(error) {
        logger.error(error);
    });
});
app.post("/api/cookies/:platform", function(req, res) {
    var _req_body;
    var platform = req.params.platform;
    if (!isSupportedPlatform(platform)) {
        res.status(400).send({
            status: false,
            error: "Unsupported platform: ".concat(platform)
        });
        return;
    }
    var content = (_req_body = req.body) === null || _req_body === void 0 ? void 0 : _req_body.content;
    if (!content || typeof content !== "string" || !content.trim()) {
        res.status(400).send({
            status: false,
            error: "参数错误: content 必须为非空字符串"
        });
        return;
    }
    try {
        var result = saveCookie(platform, content);
        res.send({
            status: true,
            platform: platform,
            updatedAt: result.updatedAt
        });
    } catch (err) {
        res.status(500).send({
            status: false,
            error: err.message
        });
    }
});
app.get("/api/cookies/status", function(_req, res) {
    res.send(cookieStatus());
});
app.use(external_express_default()["static"](webRoot));
server.listen(options.port, options.host, function() {
    logger.info("=== MMFM Server Started ===");
    logger.info("Host     : ".concat(options.host));
    logger.info("Port     : ".concat(options.port));
    logger.info("Web Root : ".concat(webRoot));
    logger.info("Log Level: ".concat(options.logLevel));
    logger.info("Cache Dir: ".concat(cacheDir));
    logger.info("Playlist : ".concat(playlistFile, " (").concat(SongList.length, " songs)"));
    logger.info("PID      : ".concat(process.pid));
});
function gracefulShutdown(signal) {
    logger.info("Received ".concat(signal, ", shutting down gracefully..."));
    io.close();
    server.close(function() {
        logger.info("Server closed");
        process.exit(0);
    });
    setTimeout(function() {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
    }, 5000);
}
process.on("SIGINT", function() {
    return gracefulShutdown("SIGINT");
});
process.on("SIGTERM", function() {
    return gracefulShutdown("SIGTERM");
});

})()
;