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
var swagger_namespaceObject = JSON.parse('{"swagger":"2.0","info":{"description":"Intranet music radio API — search, resolve, and stream YouTube/Bilibili tracks via yt-dlp.","version":"1.0.0","title":"MMFM Music API"},"host":"localhost","basePath":"/","schemes":["http"],"tags":[{"name":"song","description":"Song search, detail, preload, and playlist management"},{"name":"cookies","description":"yt-dlp cookie file management"},{"name":"youtube","description":"YouTube audio extraction"}],"paths":{"/api/song/search":{"get":{"tags":["song"],"summary":"Search song of all platform","produces":["application/json"],"parameters":[{"name":"keyword","in":"query","type":"string","description":"Name of song","required":true}],"responses":{"200":{"description":"Success","schema":{"$ref":"#/definitions/SearchResponse"}},"400":{"description":"Bad request","schema":{"$ref":"#/definitions/ErrorResponse"}},"500":{"description":"Server error","schema":{"$ref":"#/definitions/ErrorResponse"}}}}},"/api/song/detail":{"get":{"tags":["song"],"summary":"get song detail","produces":["application/json"],"parameters":[{"in":"query","name":"id","type":"string","description":"Track URL or ID (string)","required":true}],"responses":{"200":{"description":"Success","schema":{"$ref":"#/definitions/DetailResponse"}},"400":{"description":"Bad request","schema":{"$ref":"#/definitions/ErrorResponse"}},"404":{"description":"Track not found"}}}},"/api/song/url":{"get":{"tags":["song"],"summary":"get song URL","produces":["application/json"],"parameters":[{"in":"query","name":"vendor","type":"string","description":"platform","required":true},{"in":"query","name":"id","type":"string","description":"ID of song","required":true}],"responses":{"200":{"description":"Success","schema":{"$ref":"#/definitions/UrlResponse"}},"400":{"description":"Bad request","schema":{"$ref":"#/definitions/ErrorResponse"}},"404":{"description":"Track not found"}}}},"/api/cookies/status":{"get":{"tags":["cookies"],"summary":"get cookie file status for all supported platforms","produces":["application/json"],"responses":{"200":{"description":"Success","schema":{"type":"object","properties":{"youtube":{"type":"object","properties":{"exists":{"type":"boolean"},"updatedAt":{"type":"number","description":"mtimeMs or null"}}},"bilibili":{"type":"object","properties":{"exists":{"type":"boolean"},"updatedAt":{"type":"number","description":"mtimeMs or null"}}}}}}}}},"/api/cookies/{platform}":{"post":{"tags":["cookies"],"summary":"upload/overwrite a cookie file for a platform","consumes":["application/json"],"produces":["application/json"],"parameters":[{"name":"platform","in":"path","type":"string","enum":["youtube","bilibili"],"description":"Target platform","required":true},{"in":"body","name":"body","required":true,"schema":{"type":"object","required":["content"],"properties":{"content":{"type":"string","description":"Netscape cookies.txt content"}}}}],"responses":{"200":{"description":"Success","schema":{"type":"object","properties":{"status":{"type":"boolean"},"platform":{"type":"string"},"updatedAt":{"type":"number"}}}},"400":{"description":"Bad request (unsupported platform or empty content)","schema":{"$ref":"#/definitions/ErrorResponse"}},"500":{"description":"Server error","schema":{"$ref":"#/definitions/ErrorResponse"}}}}},"/youtube/audio-info":{"get":{"tags":["youtube"],"summary":"get YouTube audio info (PlaylistItem format)","produces":["application/json"],"parameters":[{"name":"url","in":"query","type":"string","description":"YouTube video URL","required":true}],"responses":{"200":{"description":"Success","schema":{"$ref":"#/definitions/PlaylistItem"}},"400":{"description":"Bad request","schema":{"$ref":"#/definitions/ErrorResponse"}},"500":{"description":"Server error","schema":{"$ref":"#/definitions/ErrorResponse"}}}}},"/song/save":{"post":{"tags":["song"],"summary":"save play list","consumes":["application/json"],"produces":["application/json"],"parameters":[{"in":"body","name":"body","required":true,"schema":{"type":"object","required":["list"],"properties":{"list":{"type":"string","description":"JSON-encoded playlist array"}}}}],"responses":{"200":{"description":"Success","schema":{"type":"array","items":{"$ref":"#/definitions/Song"}}}}}},"/song/get":{"get":{"tags":["song"],"summary":"load PlayList","produces":["application/json"],"responses":{"200":{"description":"Success","schema":{"type":"array","items":{"$ref":"#/definitions/Song"}}}}}},"/song/preload":{"post":{"tags":["song"],"summary":"preload a song url, conver to local url","consumes":["application/x-www-form-urlencoded"],"produces":["application/json"],"parameters":[{"in":"body","name":"body","required":true,"schema":{"type":"object","required":["url"],"properties":{"url":{"type":"string","description":"Audio URL to preload"},"platform":{"type":"string","enum":["youtube","bilibili"],"description":"Platform hint; auto-detected from URL if omitted"}}}}],"responses":{"200":{"description":"Success","schema":{"$ref":"#/definitions/PreloadResponse"}}}}}},"x-websocket":{"description":"Socket.IO WebSocket endpoint. Connect at ws://<host>/io using the Socket.IO protocol.","path":"/io","events":{"client-to-server":{"msg":{"description":"Send a chat message (string) to the server; broadcasted to all other clients in the \'chat\' room.","payload":"string"},"disconnect":{"description":"Fired when the client disconnects."},"error":{"description":"Fired on client-side error.","payload":"string"}},"server-to-client":{"msg":{"description":"Chat message broadcasted to connected clients.","payload":"string"}}}},"definitions":{"Artist":{"type":"object","properties":{"name":{"type":"string"}}},"Album":{"type":"object","properties":{"cover":{"type":"string","description":"Cover image URL"}}},"Song":{"type":"object","properties":{"id":{"type":"string","description":"Track URL or ID"},"name":{"type":"string","description":"Track title"},"artists":{"type":"array","items":{"$ref":"#/definitions/Artist"}},"album":{"$ref":"#/definitions/Album"},"link":{"type":"string","description":"Link to original page"},"vendor":{"type":"string","enum":["youtube","bilibili"]}}},"PlaylistItem":{"type":"object","properties":{"id":{"type":"string","description":"Video page URL"},"name":{"type":"string","description":"Track title"},"author":{"type":"string","description":"Uploader"},"cover":{"type":"string","description":"Thumbnail URL"},"src":{"type":"string","description":"Original page URL (resolved to real audio via /song/preload)"}}},"SongGroup":{"type":"object","properties":{"total":{"type":"integer"},"songs":{"type":"array","items":{"$ref":"#/definitions/Song"}}}},"SearchResponse":{"type":"object","properties":{"status":{"type":"boolean"},"data":{"type":"object","properties":{"youtube":{"$ref":"#/definitions/SongGroup"},"bilibili":{"$ref":"#/definitions/SongGroup"}}}}},"DetailResponse":{"type":"object","properties":{"status":{"type":"boolean"},"data":{"$ref":"#/definitions/Song"}}},"UrlResponse":{"type":"object","properties":{"status":{"type":"boolean"},"data":{"type":"string","description":"Track webpage URL"}}},"PreloadResponse":{"type":"object","properties":{"status":{"type":"integer","enum":[0,1],"description":"1=success, 0=no url/error"},"url":{"type":"string","description":"Local cache URL (present when status=1)"},"error":{"type":"string","description":"Error message (present on failure)"}}},"ErrorResponse":{"type":"object","properties":{"status":{"type":"boolean","enum":[false]},"error":{"type":"string"}}}}}')
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
        "--embed-metadata",
        "--embed-thumbnail",
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
function audioInfo(url) {
    return _async_to_generator(function() {
        var meta;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    return [
                        4,
                        YtDlpService_resolve(url)
                    ];
                case 1:
                    meta = _state.sent();
                    return [
                        2,
                        {
                            id: meta.webpage_url,
                            name: meta.title,
                            author: meta.uploader,
                            cover: meta.thumbnail || "",
                            src: url
                        }
                    ];
            }
        });
    })();
}

;// CONCATENATED MODULE: external "node-ssdp"
const external_node_ssdp_namespaceObject = require("node-ssdp");
;// CONCATENATED MODULE: external "fast-xml-parser"
const external_fast_xml_parser_namespaceObject = require("fast-xml-parser");
;// CONCATENATED MODULE: external "url"
const external_url_namespaceObject = require("url");
;// CONCATENATED MODULE: ./src/services/DlnaRenderer.ts
function DlnaRenderer_asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
function DlnaRenderer_async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                DlnaRenderer_asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                DlnaRenderer_asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function DlnaRenderer_class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function DlnaRenderer_define_property(obj, key, value) {
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
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            DlnaRenderer_define_property(target, key, source[key]);
        });
    }
    return target;
}
function DlnaRenderer_type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function DlnaRenderer_ts_generator(thisArg, body) {
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











var FFMPEG_CMD = "ffmpeg";
var FFPROBE_CMD = "ffprobe";
var NS_AVT = "urn:schemas-upnp-org:service:AVTransport:1";
var NS_RC = "urn:schemas-upnp-org:service:RenderingControl:1";
var xmlParser = new external_fast_xml_parser_namespaceObject.XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    trimValues: false
});
function decodeHtmlEntities(str) {
    return str.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, function(_, code) {
        return String.fromCharCode(+code);
    }).replace(/&#x([0-9a-fA-F]+);/g, function(_, c) {
        return String.fromCharCode(parseInt(c, 16));
    });
}
function generateUuid() {
    if (typeof (external_crypto_default()).randomUUID === "function") return external_crypto_default().randomUUID();
    return external_crypto_default().randomBytes(16).toString("hex").replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
}
function isYtdlpUrl(url) {
    return /^(https?:\/\/)?(www\.youtube\.com|youtu\.be|www\.bilibili\.com|soundcloud\.com|vimeo\.com|bandcamp\.com)\//i.test(url);
}
function soapEnvelope(body) {
    return '<?xml version="1.0"?>' + '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"' + ' s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' + "<s:Body>".concat(body, "</s:Body></s:Envelope>");
}
function extractSoapAction(body) {
    var m = body.match(/<u:(\w+)[\s\S]*?xmlns:u="([^"]+)"/);
    return m ? m[1] : null;
}
function extractArgument(body, name) {
    var re = new RegExp("<".concat(name, ">[\\s\\S]*?</").concat(name, ">"), "i");
    var match = body.match(re);
    if (!match) return "";
    var inner = match[0].replace(new RegExp("^<".concat(name, ">|</").concat(name, ">$"), "gi"), "");
    return decodeHtmlEntities(inner);
}
function parseDidlLite(xml) {
    if (!xml) return null;
    try {
        var decoded = decodeHtmlEntities(xml);
        var parsed = xmlParser.parse(decoded);
        var didl = parsed["DIDL-Lite"] || parsed["s:DIDL-Lite"] || parsed;
        var item = (didl === null || didl === void 0 ? void 0 : didl.item) || (didl === null || didl === void 0 ? void 0 : didl["s:item"]);
        if (!item) return null;
        var res = item.res;
        var resUrl = (typeof res === "undefined" ? "undefined" : DlnaRenderer_type_of(res)) === "object" ? res["#text"] || res : res;
        var resDur = (typeof res === "undefined" ? "undefined" : DlnaRenderer_type_of(res)) === "object" ? res["@_duration"] : null;
        return {
            id: item["@_id"] || null,
            title: item["dc:title"] || item.title || "",
            creator: item["dc:creator"] || item.creator || "",
            artist: item["upnp:artist"] || item["dc:creator"] || "",
            album: item["upnp:album"] || item.album || "",
            albumArtURI: item["upnp:albumArtURI"] || null,
            duration: resDur || null,
            class: item["upnp:class"] || null,
            res: resUrl || null,
            musicId: item["netease:musicId"] || null
        };
    } catch (e) {
        logger.error("[DLNA] DIDL parse error:", e.message);
        return null;
    }
}
function getDeviceXml(deviceName, udn, port, host) {
    var location = "http://".concat(host, ":").concat(port, "/dlna/device.xml");
    return '<?xml version="1.0" encoding="UTF-8"?>' + '<root xmlns="urn:schemas-upnp-org:device-1-0">' + "<specVersion><major>1</major><minor>0</minor></specVersion>" + "<device>" + "<deviceType>urn:schemas-upnp-org:device:MediaRenderer:1</deviceType>" + "<friendlyName>".concat(deviceName, "</friendlyName>") + "<manufacturer>MMFM</manufacturer>" + "<modelName>MMFM DMR</modelName>" + "<UDN>".concat(udn, "</UDN>") + "<presentationURL>".concat(location, "</presentationURL>") + "<serviceList>" + getServiceXml("AVTransport", NS_AVT, "/dlna/avtransport", "/dlna/service.xml") + getServiceXml("RenderingControl", NS_RC, "/dlna/rendering", "/dlna/rendering-service.xml") + "</serviceList></device></root>";
}
function getServiceXml(name, serviceType, control, scpd) {
    return "<service>" + "<serviceType>".concat(serviceType, "</serviceType>") + "<serviceId>urn:upnp-org:serviceId:".concat(name, "</serviceId>") + "<controlURL>".concat(control, "</controlURL>") + "<eventSubURL>/dlna/event</eventSubURL>" + "<SCPDURL>".concat(scpd, "</SCPDURL>") + "</service>";
}
function getAvTransportXml() {
    var spec = "<specVersion><major>1</major><minor>0</minor></specVersion>";
    var arg = function arg(n, d, r) {
        return "<argument><name>".concat(n, "</name><direction>").concat(d, "</direction>") + "<relatedStateVariable>".concat(r, "</relatedStateVariable></argument>");
    };
    var action = function action(n, args) {
        return "<action><name>".concat(n, "</name><argumentList>").concat(args, "</argumentList></action>");
    };
    var sv = function sv(n, t, send) {
        return '<stateVariable sendEvents="'.concat(send ? "yes" : "no", '">') + "<name>".concat(n, "</name><dataType>").concat(t, "</dataType></stateVariable>");
    };
    var actions = [
        action("SetAVTransportURI", arg("InstanceID", "in", "A_ARG_TYPE_InstanceID") + arg("CurrentURI", "in", "AVTransportURI") + arg("CurrentURIMetaData", "in", "AVTransportURIMetaData")),
        action("GetTransportInfo", arg("InstanceID", "in", "A_ARG_TYPE_InstanceID") + arg("CurrentTransportState", "out", "TransportState") + arg("CurrentTransportStatus", "out", "CurrentTransportStatus") + arg("CurrentSpeed", "out", "TransportPlaySpeed")),
        action("Play", arg("InstanceID", "in", "A_ARG_TYPE_InstanceID") + arg("Speed", "in", "TransportPlaySpeed")),
        action("Stop", arg("InstanceID", "in", "A_ARG_TYPE_InstanceID")),
        action("Pause", arg("InstanceID", "in", "A_ARG_TYPE_InstanceID"))
    ].join("");
    var vars = [
        sv("LastChange", "string", true),
        sv("AVTransportURI", "string"),
        sv("AVTransportURIMetaData", "string"),
        sv("TransportState", "string"),
        sv("CurrentTransportStatus", "string"),
        sv("TransportPlaySpeed", "string"),
        sv("A_ARG_TYPE_InstanceID", "ui4")
    ].join("");
    return '<?xml version="1.0"?>' + '<scpd xmlns="urn:schemas-upnp-org:service-1-0">'.concat(spec) + "<actionList>".concat(actions, "</actionList>") + "<serviceStateTable>".concat(vars, "</serviceStateTable></scpd>");
}
function getRenderingControlXml() {
    var spec = "<specVersion><major>1</major><minor>0</minor></specVersion>";
    var arg = function arg(n, d, r) {
        return "<argument><name>".concat(n, "</name><direction>").concat(d, "</direction>") + "<relatedStateVariable>".concat(r, "</relatedStateVariable></argument>");
    };
    var actions = "<action><name>GetVolume</name><argumentList>" + arg("InstanceID", "in", "A_ARG_TYPE_InstanceID") + arg("Channel", "in", "A_ARG_TYPE_Channel") + arg("CurrentVolume", "out", "Volume") + "</argumentList></action>" + "<action><name>SetVolume</name><argumentList>" + arg("InstanceID", "in", "A_ARG_TYPE_InstanceID") + arg("Channel", "in", "A_ARG_TYPE_Channel") + arg("DesiredVolume", "in", "Volume") + "</argumentList></action>";
    var vars = '<stateVariable sendEvents="no"><name>Volume</name>' + "<dataType>ui2</dataType></stateVariable>" + '<stateVariable sendEvents="no"><name>A_ARG_TYPE_InstanceID</name>' + "<dataType>ui4</dataType></stateVariable>" + '<stateVariable sendEvents="no"><name>A_ARG_TYPE_Channel</name>' + "<dataType>string</dataType></stateVariable>";
    return '<?xml version="1.0"?>' + '<scpd xmlns="urn:schemas-upnp-org:service-1-0">'.concat(spec) + "<actionList>".concat(actions, "</actionList>") + "<serviceStateTable>".concat(vars, "</serviceStateTable></scpd>");
}
function buildLastChangeXml(state, status, uri, meta) {
    var esc = function esc(s) {
        return s.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };
    var inner = '<Event xmlns="urn:schemas-upnp-org:metadata-1-0/AVT/">' + '<InstanceID val="0">' + '<TransportState val="'.concat(state, '"/>') + '<TransportStatus val="'.concat(status, '"/>') + '<CurrentTrackMetaData val="'.concat(esc(meta), '"/>') + '<AVTransportURI val="'.concat(esc(uri), '"/>') + '<CurrentTrack val="0"/>' + '<CurrentTrackDuration val="00:00:00"/>' + '<CurrentTransportActions val="Play,Stop,Pause"/>' + "</InstanceID></Event>";
    return "<?xml version=\"1.0\"?>" + '<e:propertyset xmlns:e="urn:schemas-upnp-org:event-1-0">' + "<e:property>" + "<LastChange>".concat(esc(inner), "</LastChange>") + "</e:property></e:propertyset>";
}
function getAvtResponse(action, inner) {
    return soapEnvelope("<u:".concat(action, 'Response xmlns:u="').concat(NS_AVT, '">').concat(inner, "</u:").concat(action, "Response>"));
}
function handleSetAvTransport(self, body, res) {
    var uri = extractArgument(body, "CurrentURI");
    var metaDataXml = extractArgument(body, "CurrentURIMetaData");
    logger.info("[DLNA] SetAVTransportURI:", uri);
    self.currentUri = uri;
    self.currentMeta = parseDidlLite(metaDataXml);
    logger.debug("[DLNA] DIDL:", JSON.stringify(self.currentMeta));
    res.set("Content-Type", "text/xml; charset=utf-8");
    res.send(getAvtResponse("SetAVTransportURI", ""));
    self.notifySubscribers("TRANSITIONING", "OK");
    self.processMedia(uri).catch(function(e) {
        logger.error("[DLNA] processMedia error:", e);
        self.transportState = "STOPPED";
        self.notifySubscribers("STOPPED", "ERROR_OCCURRED");
    });
}
function handleTransportAction(self, action, res) {
    if (action === "Stop") self.transportState = "STOPPED";
    else if (action === "Pause") self.transportState = "PAUSED_PLAYBACK";
    else if (action === "Play") self.transportState = "PLAYING";
    self.notifySubscribers(self.transportState, "OK");
    res.set("Content-Type", "text/xml; charset=utf-8");
    res.send(getAvtResponse(action, ""));
}
function handleAvTransport(self, body, res) {
    var action = extractSoapAction(body);
    logger.debug("[DLNA] AVT action:", action);
    if (action === "SetAVTransportURI") return handleSetAvTransport(self, body, res);
    if (action === "GetTransportInfo") {
        res.set("Content-Type", "text/xml; charset=utf-8");
        res.send(getAvtResponse("GetTransportInfo", "<CurrentTransportState>".concat(self.transportState, "</CurrentTransportState>") + "<CurrentTransportStatus>OK</CurrentTransportStatus>" + "<CurrentSpeed>1</CurrentSpeed>"));
        return;
    }
    if (action === "Play" || action === "Stop" || action === "Pause") return handleTransportAction(self, action, res);
    res.set("Content-Type", "text/xml; charset=utf-8");
    res.send(getAvtResponse(action || "Unknown", ""));
}
function handleRendering(body, res) {
    var action = extractSoapAction(body);
    logger.debug("[DLNA] RC action:", action);
    if (action === "GetVolume") {
        res.set("Content-Type", "text/xml; charset=utf-8");
        res.send(soapEnvelope('<u:GetVolumeResponse xmlns:u="'.concat(NS_RC, '">') + "<CurrentVolume>50</CurrentVolume></u:GetVolumeResponse>"));
        return;
    }
    res.set("Content-Type", "text/xml; charset=utf-8");
    res.send(soapEnvelope('<u:SetVolumeResponse xmlns:u="'.concat(NS_RC, '"/>')));
}
function buildFfmpegArgs(url, output, meta) {
    var args = [
        "-i",
        url
    ];
    if (meta.cover) {
        args.push("-i", meta.cover, "-map", "0:a", "-map", "1:v", "-disposition:v:0", "attached_pic");
    } else {
        args.push("-map", "0:a", "-vn");
    }
    args.push("-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-codec:a", "libmp3lame", "-q:a", "0", "-map_metadata", "-1", "-id3v2_version", "3");
    if (meta.title) args.push("-metadata", "title=".concat(meta.title));
    if (meta.artist) args.push("-metadata", "artist=".concat(meta.artist));
    if (meta.album) args.push("-metadata", "album=".concat(meta.album));
    args.push("-y", output);
    return args;
}
function runFfmpeg(cmd, args, timeoutMs) {
    return new Promise(function(resolveP, reject) {
        var proc = (0,external_child_process_namespaceObject.spawn)(cmd, args, {
            stdio: [
                "ignore",
                "pipe",
                "pipe"
            ]
        });
        var stdout = "";
        var stderr = "";
        var timer = setTimeout(function() {
            timer = null;
            proc.kill();
            reject(new Error("".concat(cmd, " timeout")));
        }, timeoutMs);
        proc.stdout.on("data", function(c) {
            stdout += c.toString();
        });
        proc.stderr.on("data", function(c) {
            stderr += c.toString();
        });
        proc.on("close", function(code) {
            if (timer) clearTimeout(timer);
            code === 0 ? resolveP(stdout) : reject(new Error("".concat(cmd, " failed (").concat(code, "): ").concat(stderr.slice(-200))));
        });
        proc.on("error", function(err) {
            if (timer) clearTimeout(timer);
            reject(err);
        });
    });
}
function runFfmpegProbe(url) {
    return runFfmpeg(FFPROBE_CMD, [
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        url
    ], 15000).then(JSON.parse);
}
function buildPlaylistItem(url, meta) {
    return {
        id: meta.musicId || url,
        name: meta.title || url,
        author: meta.artist || "Unknown",
        src: url,
        cover: meta.cover || ""
    };
}
function resolveYtdlpMeta(url, didl) {
    return DlnaRenderer_async_to_generator(function() {
        var meta, info, e;
        return DlnaRenderer_ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    meta = {
                        title: didl === null || didl === void 0 ? void 0 : didl.title,
                        artist: (didl === null || didl === void 0 ? void 0 : didl.artist) || (didl === null || didl === void 0 ? void 0 : didl.creator),
                        album: didl === null || didl === void 0 ? void 0 : didl.album,
                        cover: (didl === null || didl === void 0 ? void 0 : didl.albumArtURI) || undefined,
                        musicId: (didl === null || didl === void 0 ? void 0 : didl.musicId) || undefined
                    };
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
                        YtDlpService_resolve(url)
                    ];
                case 2:
                    info = _state.sent();
                    meta.title = meta.title || info.title;
                    meta.artist = meta.artist || info.uploader;
                    meta.cover = meta.cover || info.thumbnail;
                    return [
                        3,
                        4
                    ];
                case 3:
                    e = _state.sent();
                    logger.warn("[DLNA] yt-dlp resolve failed:", e.message);
                    return [
                        3,
                        4
                    ];
                case 4:
                    return [
                        2,
                        meta
                    ];
            }
        });
    })();
}
function processDirectUrl(self, url, didl) {
    return DlnaRenderer_async_to_generator(function() {
        var baseMeta, probeInfo, e, finalMeta, _i, _iter, k, args, item;
        return DlnaRenderer_ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    baseMeta = {
                        title: didl === null || didl === void 0 ? void 0 : didl.title,
                        artist: (didl === null || didl === void 0 ? void 0 : didl.artist) || (didl === null || didl === void 0 ? void 0 : didl.creator),
                        album: didl === null || didl === void 0 ? void 0 : didl.album,
                        cover: (didl === null || didl === void 0 ? void 0 : didl.albumArtURI) || undefined,
                        musicId: (didl === null || didl === void 0 ? void 0 : didl.musicId) || undefined
                    };
                    probeInfo = {};
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
                        buildProbeInfo(url)
                    ];
                case 2:
                    probeInfo = _state.sent();
                    return [
                        3,
                        4
                    ];
                case 3:
                    e = _state.sent();
                    logger.warn("[DLNA] ffprobe failed:", e.message);
                    return [
                        3,
                        4
                    ];
                case 4:
                    finalMeta = _object_spread({}, baseMeta);
                    for(_i = 0, _iter = [
                        "title",
                        "artist",
                        "album"
                    ]; _i < _iter.length; _i++){
                        k = _iter[_i];
                        if (!finalMeta[k]) finalMeta[k] = probeInfo[k];
                    }
                    if (!finalMeta.title) finalMeta.title = external_path_default().basename(new external_url_namespaceObject.URL(url).pathname).split(".")[0] || url;
                    args = buildFfmpegArgs(url, self.outputPath, finalMeta);
                    return [
                        4,
                        runFfmpeg(FFMPEG_CMD, args, 180000)
                    ];
                case 5:
                    _state.sent();
                    logger.info("[DLNA] ffmpeg download complete:", self.outputPath);
                    item = buildPlaylistItem(url, finalMeta);
                    self.opts.onSongAdded(item);
                    self.opts.broadcastPlaylist();
                    return [
                        2
                    ];
            }
        });
    })();
}
function buildProbeInfo(url) {
    return DlnaRenderer_async_to_generator(function() {
        var _probe_format, _probe_streams, _probe_format1, _probe_format2, probe, tags, audio, sTags;
        return DlnaRenderer_ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    return [
                        4,
                        runFfmpegProbe(url)
                    ];
                case 1:
                    probe = _state.sent();
                    tags = ((_probe_format = probe.format) === null || _probe_format === void 0 ? void 0 : _probe_format.tags) || {};
                    audio = (_probe_streams = probe.streams) === null || _probe_streams === void 0 ? void 0 : _probe_streams.find(function(s) {
                        return s.codec_type === "audio";
                    });
                    sTags = (audio === null || audio === void 0 ? void 0 : audio.tags) || {};
                    return [
                        2,
                        {
                            codec: audio === null || audio === void 0 ? void 0 : audio.codec_name,
                            sampleRate: String(audio === null || audio === void 0 ? void 0 : audio.sample_rate),
                            channels: String(audio === null || audio === void 0 ? void 0 : audio.channels),
                            bitrate: ((_probe_format1 = probe.format) === null || _probe_format1 === void 0 ? void 0 : _probe_format1.bit_rate) ? "".concat(Math.round(+probe.format.bit_rate / 1000), " kbps") : "",
                            duration: ((_probe_format2 = probe.format) === null || _probe_format2 === void 0 ? void 0 : _probe_format2.duration) ? String(Math.round(+probe.format.duration * 100) / 100) : "",
                            title: tags.title || tags.Title || sTags.title,
                            artist: tags.artist || tags.Artist || sTags.artist,
                            album: tags.album || tags.Album || sTags.album
                        }
                    ];
            }
        });
    })();
}
function handleSubscribe(self, req, res) {
    return DlnaRenderer_async_to_generator(function() {
        var _self_currentMeta, callback, sid, body, e, timer;
        return DlnaRenderer_ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    callback = String(req.headers.callback || "").replace(/[<>]/g, "");
                    sid = "uuid:".concat(generateUuid());
                    body = buildLastChangeXml(self.transportState, "OK", self.currentUri, ((_self_currentMeta = self.currentMeta) === null || _self_currentMeta === void 0 ? void 0 : _self_currentMeta.title) || "");
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
                        sendNotify(callback, sid, 0, body)
                    ];
                case 2:
                    _state.sent();
                    return [
                        3,
                        4
                    ];
                case 3:
                    e = _state.sent();
                    logger.warn("[DLNA] Initial NOTIFY failed:", e.message);
                    return [
                        3,
                        4
                    ];
                case 4:
                    timer = setTimeout(function() {
                        self.subscriptions = self.subscriptions.filter(function(s) {
                            return s.sid !== sid;
                        });
                    }, 1800000);
                    self.subscriptions.push({
                        sid: sid,
                        callback: callback,
                        seq: 0,
                        timer: timer
                    });
                    res.set({
                        SID: sid,
                        TIMEOUT: "Second-1800"
                    });
                    res.status(200).end();
                    return [
                        2
                    ];
            }
        });
    })();
}
function handleUnsubscribe(self, req, res) {
    var sid = String(req.headers.sid || "");
    var sub = self.subscriptions.find(function(s) {
        return s.sid === sid;
    });
    if (sub) {
        clearTimeout(sub.timer);
        self.subscriptions = self.subscriptions.filter(function(s) {
            return s.sid !== sid;
        });
    }
    res.status(200).end();
}
function sendNotify(callback, sid, seq, body) {
    return new Promise(function(resolveP, reject) {
        var url = new external_url_namespaceObject.URL(callback);
        var req = external_http_default().request({
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: "NOTIFY",
            headers: {
                "Content-Type": "text/xml; charset=utf-8",
                NT: "upnp:event",
                NTS: "upnp:propchange",
                SID: sid,
                SEQ: String(seq)
            }
        }, function(res) {
            res.resume();
            resolveP(true);
        });
        req.on("error", reject);
        req.write(body);
        req.end();
    });
}
var DlnaRenderer_DlnaRenderer = /*#__PURE__*/ function() {
    "use strict";
    function DlnaRenderer(opts) {
        DlnaRenderer_class_call_check(this, DlnaRenderer);
        DlnaRenderer_define_property(this, "opts", void 0);
        DlnaRenderer_define_property(this, "transportState", "NO_MEDIA_PRESENT");
        DlnaRenderer_define_property(this, "currentUri", "");
        DlnaRenderer_define_property(this, "currentMeta", null);
        DlnaRenderer_define_property(this, "subscriptions", []);
        DlnaRenderer_define_property(this, "ssdp", null);
        DlnaRenderer_define_property(this, "udn", void 0);
        DlnaRenderer_define_property(this, "baseUrl", void 0);
        DlnaRenderer_define_property(this, "outputPath", void 0);
        this.opts = opts;
        this.udn = "uuid:".concat(generateUuid());
        this.baseUrl = "http://".concat(opts.host, ":").concat(opts.port);
        this.outputPath = "";
    }
    _create_class(DlnaRenderer, [
        {
            key: "start",
            value: function start() {
                return DlnaRenderer_async_to_generator(function() {
                    var _this, location;
                    return DlnaRenderer_ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                _this = this;
                                location = "".concat(this.baseUrl, "/dlna/device.xml");
                                this.ssdp = new external_node_ssdp_namespaceObject.Server({
                                    logLevel: "ERROR",
                                    unicastHost: "0.0.0.0",
                                    location: location
                                });
                                this.ssdp.addUSN("upnp:rootdevice");
                                this.ssdp.addUSN(this.udn);
                                this.ssdp.addUSN("urn:schemas-upnp-org:device:MediaRenderer:1");
                                this.ssdp.addUSN(NS_AVT);
                                this.ssdp.addUSN(NS_RC);
                                return [
                                    4,
                                    new Promise(function(resolveP) {
                                        return _this.ssdp.start(function() {
                                            return resolveP();
                                        });
                                    })
                                ];
                            case 1:
                                _state.sent();
                                logger.info("[DLNA] SSDP started. UDN=".concat(this.udn));
                                logger.info("[DLNA] Location: ".concat(location));
                                return [
                                    2
                                ];
                        }
                    });
                }).call(this);
            }
        },
        {
            key: "stop",
            value: function stop() {
                if (this.ssdp) {
                    this.ssdp.stop();
                    this.ssdp = null;
                }
                this.subscriptions.forEach(function(s) {
                    return clearTimeout(s.timer);
                });
                this.subscriptions = [];
                logger.info("[DLNA] Stopped");
            }
        },
        {
            key: "registerRoutes",
            value: function registerRoutes(app) {
                var _this = this;
                var router = (0,external_express_namespaceObject.Router)();
                router.get("/dlna/device.xml", function(_req, res) {
                    res.set("Content-Type", "application/xml; charset=utf-8");
                    res.send(getDeviceXml(_this.opts.deviceName, _this.udn, _this.opts.port, _this.opts.host));
                });
                router.get("/dlna/service.xml", function(_req, res) {
                    res.set("Content-Type", "application/xml; charset=utf-8");
                    res.send(getAvTransportXml());
                });
                router.get("/dlna/rendering-service.xml", function(_req, res) {
                    res.set("Content-Type", "application/xml; charset=utf-8");
                    res.send(getRenderingControlXml());
                });
                router.post("/dlna/avtransport", function(req, res) {
                    handleAvTransport(_this, req.body, res);
                });
                router.post("/dlna/rendering", function(req, res) {
                    handleRendering(req.body, res);
                });
                router.all("/dlna/event", function(req, res) {
                    if (req.method === "SUBSCRIBE") handleSubscribe(_this, req, res);
                    else if (req.method === "UNSUBSCRIBE") handleUnsubscribe(_this, req, res);
                    else res.status(405).end();
                });
                app.use(router);
            }
        },
        {
            key: "notifySubscribers",
            value: function notifySubscribers(state, status) {
                return DlnaRenderer_async_to_generator(function() {
                    var _this_currentMeta, body, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, sub, e, err;
                    return DlnaRenderer_ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                this.transportState = state;
                                body = buildLastChangeXml(state, status, this.currentUri, ((_this_currentMeta = this.currentMeta) === null || _this_currentMeta === void 0 ? void 0 : _this_currentMeta.title) || "");
                                _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                                _state.label = 1;
                            case 1:
                                _state.trys.push([
                                    1,
                                    8,
                                    9,
                                    10
                                ]);
                                _iterator = this.subscriptions[Symbol.iterator]();
                                _state.label = 2;
                            case 2:
                                if (!!(_iteratorNormalCompletion = (_step = _iterator.next()).done)) return [
                                    3,
                                    7
                                ];
                                sub = _step.value;
                                sub.seq++;
                                _state.label = 3;
                            case 3:
                                _state.trys.push([
                                    3,
                                    5,
                                    ,
                                    6
                                ]);
                                return [
                                    4,
                                    sendNotify(sub.callback, sub.sid, sub.seq, body)
                                ];
                            case 4:
                                _state.sent();
                                return [
                                    3,
                                    6
                                ];
                            case 5:
                                e = _state.sent();
                                logger.warn("[DLNA] NOTIFY failed sid=".concat(sub.sid, ":"), e.message);
                                return [
                                    3,
                                    6
                                ];
                            case 6:
                                _iteratorNormalCompletion = true;
                                return [
                                    3,
                                    2
                                ];
                            case 7:
                                return [
                                    3,
                                    10
                                ];
                            case 8:
                                err = _state.sent();
                                _didIteratorError = true;
                                _iteratorError = err;
                                return [
                                    3,
                                    10
                                ];
                            case 9:
                                try {
                                    if (!_iteratorNormalCompletion && _iterator.return != null) {
                                        _iterator.return();
                                    }
                                } finally{
                                    if (_didIteratorError) {
                                        throw _iteratorError;
                                    }
                                }
                                return [
                                    7
                                ];
                            case 10:
                                return [
                                    2
                                ];
                        }
                    });
                }).call(this);
            }
        },
        {
            key: "processMedia",
            value: function processMedia(url) {
                return DlnaRenderer_async_to_generator(function() {
                    var hash, _this_currentMeta, _this_currentMeta1, item, e;
                    return DlnaRenderer_ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                hash = external_crypto_default().createHash("md5").update(url).digest("hex");
                                this.outputPath = external_path_default().join(this.opts.cacheDir, "".concat(hash, ".mp3"));
                                if (external_fs_default().existsSync(this.outputPath)) {
                                    ;
                                    logger.info("[DLNA] Already cached:", this.outputPath);
                                    item = buildPlaylistItem(url, {
                                        title: ((_this_currentMeta = this.currentMeta) === null || _this_currentMeta === void 0 ? void 0 : _this_currentMeta.title) || url,
                                        artist: ((_this_currentMeta1 = this.currentMeta) === null || _this_currentMeta1 === void 0 ? void 0 : _this_currentMeta1.artist) || "Unknown"
                                    });
                                    this.opts.onSongAdded(item);
                                    this.opts.broadcastPlaylist();
                                    this.notifySubscribers("PLAYING", "OK");
                                    return [
                                        2
                                    ];
                                }
                                _state.label = 1;
                            case 1:
                                _state.trys.push([
                                    1,
                                    7,
                                    ,
                                    9
                                ]);
                                if (!isYtdlpUrl(url)) return [
                                    3,
                                    3
                                ];
                                return [
                                    4,
                                    this.processYtdlpUrl(url)
                                ];
                            case 2:
                                _state.sent();
                                return [
                                    3,
                                    5
                                ];
                            case 3:
                                return [
                                    4,
                                    processDirectUrl(this, url, this.currentMeta)
                                ];
                            case 4:
                                _state.sent();
                                _state.label = 5;
                            case 5:
                                return [
                                    4,
                                    this.notifySubscribers("PLAYING", "OK")
                                ];
                            case 6:
                                _state.sent();
                                return [
                                    3,
                                    9
                                ];
                            case 7:
                                e = _state.sent();
                                logger.error("[DLNA] Download failed:", e.message);
                                this.transportState = "STOPPED";
                                return [
                                    4,
                                    this.notifySubscribers("STOPPED", "ERROR_OCCURRED")
                                ];
                            case 8:
                                _state.sent();
                                return [
                                    3,
                                    9
                                ];
                            case 9:
                                return [
                                    2
                                ];
                        }
                    });
                }).call(this);
            }
        },
        {
            key: "processYtdlpUrl",
            value: function processYtdlpUrl(url) {
                return DlnaRenderer_async_to_generator(function() {
                    var meta, item;
                    return DlnaRenderer_ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                return [
                                    4,
                                    resolveYtdlpMeta(url, this.currentMeta)
                                ];
                            case 1:
                                meta = _state.sent();
                                if (!!external_fs_default().existsSync(this.outputPath)) return [
                                    3,
                                    3
                                ];
                                return [
                                    4,
                                    download(url, this.outputPath.replace(/\.mp3$/, ""))
                                ];
                            case 2:
                                _state.sent();
                                _state.label = 3;
                            case 3:
                                item = buildPlaylistItem(url, meta);
                                this.opts.onSongAdded(item);
                                this.opts.broadcastPlaylist();
                                return [
                                    2
                                ];
                        }
                    });
                }).call(this);
            }
        }
    ]);
    return DlnaRenderer;
}();

;// CONCATENATED MODULE: ./src/services/WebService.ts
function WebService_asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
function WebService_async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                WebService_asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                WebService_asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
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
function WebService_ts_generator(thisArg, body) {
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

















var WebService_app = external_express_default()();
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
WebService_app.use(external_body_parser_default().urlencoded({
    extended: false,
    limit: "10mb"
}));
WebService_app.use(external_body_parser_default().json({
    limit: "10mb"
}));
WebService_app.use("/swagger", function(req, res, next) {
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
WebService_app.get("/api/song/search", function(req, res) {
    return WebService_async_to_generator(function() {
        var keyword, meta, results, e, need;
        return WebService_ts_generator(this, function(_state) {
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
WebService_app.get("/api/song/detail", function(req, res) {
    return WebService_async_to_generator(function() {
        var id, cached;
        return WebService_ts_generator(this, function(_state) {
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
WebService_app.get("/api/song/url", function(req, res) {
    return WebService_async_to_generator(function() {
        var vendor, id, cached;
        return WebService_ts_generator(this, function(_state) {
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
WebService_app.post("/song/preload", function(req, res) {
    return WebService_async_to_generator(function() {
        var url, platform, hash, localPath, host, err, host1;
        return WebService_ts_generator(this, function(_state) {
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
WebService_app.post("/song/save", function(req, res) {
    return WebService_async_to_generator(function() {
        return WebService_ts_generator(this, function(_state) {
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
WebService_app.get("/song/get", function(req, res) {
    return WebService_async_to_generator(function() {
        return WebService_ts_generator(this, function(_state) {
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
WebService_app.get("/youtube/audio-info", function(req, res) {
    return WebService_async_to_generator(function() {
        var url, audioItem, e;
        return WebService_ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    url = req.query.url;
                    if (!url) {
                        res.status(400).send({
                            status: false,
                            error: "Missing url parameter"
                        });
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
                        audioInfo(url)
                    ];
                case 2:
                    audioItem = _state.sent();
                    res.send(audioItem);
                    return [
                        3,
                        4
                    ];
                case 3:
                    e = _state.sent();
                    if (_instanceof(e, YtDlpService_CookieError)) {
                        res.status(400).send({
                            status: false,
                            cookieNeed: [
                                e.platform
                            ],
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
                        4
                    ];
                case 4:
                    return [
                        2
                    ];
            }
        });
    })();
});
var server = external_http_default().createServer(WebService_app);
var io = new external_socket_io_namespaceObject.Server(server, {
    path: "/io"
});
var dlna = new DlnaRenderer_DlnaRenderer({
    port: parseInt(options.port),
    host: options.host === "0.0.0.0" ? "0.0.0.0" : options.host,
    deviceName: "MMFM",
    cacheDir: cacheDir,
    onSongAdded: function onSongAdded(item) {
        SongList.push(item);
        try {
            external_fs_default().writeFileSync(playlistFile, JSON.stringify(SongList, null, 2), "utf8");
        } catch (err) {
            logger.error("[DLNA] Failed to save playlist:", err.message);
        }
        logger.info("[DLNA] Song added to playlist:", item.name);
    },
    broadcastPlaylist: function broadcastPlaylist() {
        io.to("chat").emit("msg", JSON.stringify({
            type: "chat",
            command: "playlist",
            action: "update"
        }));
    },
    io: io
});
dlna.registerRoutes(WebService_app);
io.on("connection", function(socket) {
    logger.debug("Socket connected:", socket.id, "from", socket.handshake.address);
    socket.join("chat");
    logger.debug("Socket", socket.id, "joined chat room");
    socket.on("msg", function(msg) {
        logger.debug("msg from", socket.id, "len:", msg.length);
        socket.to("chat").emit("msg", msg);
    });
    socket.on("disconnect", function() {
        logger.debug("Socket disconnected:", socket.id);
    });
    socket.on("error", function(error) {
        logger.error("Socket error from", socket.id, error);
    });
});
WebService_app.post("/api/cookies/:platform", function(req, res) {
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
WebService_app.get("/api/cookies/status", function(_req, res) {
    res.send(cookieStatus());
});
WebService_app.use(external_express_default()["static"](webRoot));
server.listen(options.port, options.host, function() {
    logger.info("=== MMFM Server Started ===");
    logger.info("Host     : ".concat(options.host));
    logger.info("Port     : ".concat(options.port));
    logger.info("Web Root : ".concat(webRoot));
    logger.info("Log Level: ".concat(options.logLevel));
    logger.info("Cache Dir: ".concat(cacheDir));
    logger.info("Playlist : ".concat(playlistFile, " (").concat(SongList.length, " songs)"));
    logger.info("PID      : ".concat(process.pid));
    dlna.start().catch(function(e) {
        logger.error("[DLNA] SSDP start failed:", e);
    });
});
function gracefulShutdown(signal) {
    logger.info("Received ".concat(signal, ", shutting down gracefully..."));
    dlna.stop();
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