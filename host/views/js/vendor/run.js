/**
 * Sea.js 2.3.0 | seajs.org/LICENSE.md
 */
(function(global, undefined) {

// Avoid conflicting when `sea.js` is loaded multiple times
if (global.seajs) {
  return
}

var seajs = global.seajs = {
  // The current version of Sea.js being used
  version: "2.3.0"
}

var data = seajs.data = {}


/**
 * util-lang.js - The minimal language enhancement
 */

function isType(type) {
  return function(obj) {
    return {}.toString.call(obj) == "[object " + type + "]"
  }
}

var isObject = isType("Object")
var isString = isType("String")
var isArray = Array.isArray || isType("Array")
var isFunction = isType("Function")

var _cid = 0
function cid() {
  return _cid++
}


/**
 * util-events.js - The minimal events support
 */

var events = data.events = {}

// Bind event
seajs.on = function(name, callback) {
  var list = events[name] || (events[name] = [])
  list.push(callback)
  return seajs
}

// Remove event. If `callback` is undefined, remove all callbacks for the
// event. If `event` and `callback` are both undefined, remove all callbacks
// for all events
seajs.off = function(name, callback) {
  // Remove *all* events
  if (!(name || callback)) {
    events = data.events = {}
    return seajs
  }

  var list = events[name]
  if (list) {
    if (callback) {
      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i] === callback) {
          list.splice(i, 1)
        }
      }
    }
    else {
      delete events[name]
    }
  }

  return seajs
}

// Emit event, firing all bound callbacks. Callbacks receive the same
// arguments as `emit` does, apart from the event name
var emit = seajs.emit = function(name, data) {
  var list = events[name], fn

  if (list) {
    // Copy callback lists to prevent modification
    list = list.slice()

    // Execute event callbacks, use index because it's the faster.
    for(var i = 0, len = list.length; i < len; i++) {
      list[i](data)
    }
  }

  return seajs
}


/**
 * util-path.js - The utilities for operating path such as id, uri
 */

var DIRNAME_RE = /[^?#]*\//

var DOT_RE = /\/\.\//g
var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//
var MULTI_SLASH_RE = /([^:/])\/+\//g

// Extract the directory portion of a path
// dirname("a/b/c.js?t=123#xx/zz") ==> "a/b/"
// ref: http://jsperf.com/regex-vs-split/2
function dirname(path) {
  return path.match(DIRNAME_RE)[0]
}

// Canonicalize a path
// realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"
function realpath(path) {
  // /a/b/./c/./d ==> /a/b/c/d
  path = path.replace(DOT_RE, "/")

  /*
    @author wh1100717
    a//b/c ==> a/b/c
    a///b/////c ==> a/b/c
    DOUBLE_DOT_RE matches a/b/c//../d path correctly only if replace // with / first
  */
  path = path.replace(MULTI_SLASH_RE, "$1/")

  // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
  while (path.match(DOUBLE_DOT_RE)) {
    path = path.replace(DOUBLE_DOT_RE, "/")
  }

  return path
}

// Normalize an id
// normalize("path/to/a") ==> "path/to/a.js"
// NOTICE: substring is faster than negative slice and RegExp
function normalize(path) {
  var last = path.length - 1
  var lastC = path.charAt(last)

  // If the uri ends with `#`, just return it without '#'
  if (lastC === "#") {
    return path.substring(0, last)
  }

  return (path.substring(last - 2) === ".js" ||
      path.indexOf("?") > 0 ||
      lastC === "/") ? path : path + ".js"
}


var PATHS_RE = /^([^/:]+)(\/.+)$/
var VARS_RE = /{([^{]+)}/g

function parseAlias(id) {
  var alias = data.alias
  return alias && isString(alias[id]) ? alias[id] : id
}

function parsePaths(id) {
  var paths = data.paths
  var m

  if (paths && (m = id.match(PATHS_RE)) && isString(paths[m[1]])) {
    id = paths[m[1]] + m[2]
  }

  return id
}

function parseVars(id) {
  var vars = data.vars

  if (vars && id.indexOf("{") > -1) {
    id = id.replace(VARS_RE, function(m, key) {
      return isString(vars[key]) ? vars[key] : m
    })
  }

  return id
}

function parseMap(uri) {
  var map = data.map
  var ret = uri

  if (map) {
    for (var i = 0, len = map.length; i < len; i++) {
      var rule = map[i]

      ret = isFunction(rule) ?
          (rule(uri) || uri) :
          uri.replace(rule[0], rule[1])

      // Only apply the first matched rule
      if (ret !== uri) break
    }
  }

  return ret
}


var ABSOLUTE_RE = /^\/\/.|:\//
var ROOT_DIR_RE = /^.*?\/\/.*?\//

function addBase(id, refUri) {
  var ret
  var first = id.charAt(0)

  // Absolute
  if (ABSOLUTE_RE.test(id)) {
    ret = id
  }
  // Relative
  else if (first === ".") {
    ret = realpath((refUri ? dirname(refUri) : data.cwd) + id)
  }
  // Root
  else if (first === "/") {
    var m = data.cwd.match(ROOT_DIR_RE)
    ret = m ? m[0] + id.substring(1) : id
  }
  // Top-level
  else {
    ret = data.base + id
  }

  // Add default protocol when uri begins with "//"
  if (ret.indexOf("//") === 0) {
    ret = location.protocol + ret
  }

  return ret
}

function id2Uri(id, refUri) {
  if (!id) return ""

  id = parseAlias(id)
  id = parsePaths(id)
  id = parseVars(id)
  id = normalize(id)

  var uri = addBase(id, refUri)
  uri = parseMap(uri)

  return uri
}


var doc = document
var cwd = (!location.href || location.href.indexOf('about:') === 0) ? '' : dirname(location.href)
var scripts = doc.scripts

// Recommend to add `seajsnode` id for the `sea.js` script element
var loaderScript = doc.getElementById("seajsnode") ||
    scripts[scripts.length - 1]

// When `sea.js` is inline, set loaderDir to current working directory
var loaderDir = dirname(getScriptAbsoluteSrc(loaderScript) || cwd)

function getScriptAbsoluteSrc(node) {
  return node.hasAttribute ? // non-IE6/7
      node.src :
    // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
      node.getAttribute("src", 4)
}


// For Developers
seajs.resolve = id2Uri


/**
 * util-request.js - The utilities for requesting script and style files
 * ref: tests/research/load-js-css/test.html
 */

var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement
var baseElement = head.getElementsByTagName("base")[0]

var currentlyAddingScript
var interactiveScript

function request(url, callback, charset) {
  var node = doc.createElement("script")

  if (charset) {
    var cs = isFunction(charset) ? charset(url) : charset
    if (cs) {
      node.charset = cs
    }
  }

  addOnload(node, callback, url)

  node.async = true
  node.src = url

  // For some cache cases in IE 6-8, the script executes IMMEDIATELY after
  // the end of the insert execution, so use `currentlyAddingScript` to
  // hold current node, for deriving url in `define` call
  currentlyAddingScript = node

  // ref: #185 & http://dev.jquery.com/ticket/2709
  baseElement ?
      head.insertBefore(node, baseElement) :
      head.appendChild(node)

  currentlyAddingScript = null
}

function addOnload(node, callback, url) {
  var supportOnload = "onload" in node

  if (supportOnload) {
    node.onload = onload
    node.onerror = function() {
      emit("error", { uri: url, node: node })
      onload()
    }
  }
  else {
    node.onreadystatechange = function() {
      if (/loaded|complete/.test(node.readyState)) {
        onload()
      }
    }
  }

  function onload() {
    // Ensure only run once and handle memory leak in IE
    node.onload = node.onerror = node.onreadystatechange = null

    // Remove the script to reduce memory leak
    if (!data.debug) {
      head.removeChild(node)
    }

    // Dereference the node
    node = null

    callback()
  }
}

function getCurrentScript() {
  if (currentlyAddingScript) {
    return currentlyAddingScript
  }

  // For IE6-9 browsers, the script onload event may not fire right
  // after the script is evaluated. Kris Zyp found that it
  // could query the script nodes and the one that is in "interactive"
  // mode indicates the current script
  // ref: http://goo.gl/JHfFW
  if (interactiveScript && interactiveScript.readyState === "interactive") {
    return interactiveScript
  }

  var scripts = head.getElementsByTagName("script")

  for (var i = scripts.length - 1; i >= 0; i--) {
    var script = scripts[i]
    if (script.readyState === "interactive") {
      interactiveScript = script
      return interactiveScript
    }
  }
}


// For Developers
seajs.request = request


/**
 * util-deps.js - The parser for dependencies
 * ref: tests/research/parse-dependencies/test.html
 */

var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g
var SLASH_RE = /\\\\/g

function parseDependencies(code) {
  var ret = []

  code.replace(SLASH_RE, "")
      .replace(REQUIRE_RE, function(m, m1, m2) {
        if (m2) {
          ret.push(m2)
        }
      })

  return ret
}


/**
 * module.js - The core of module loader
 */

var cachedMods = seajs.cache = {}
var anonymousMeta

var fetchingList = {}
var fetchedList = {}
var callbackList = {}

var STATUS = Module.STATUS = {
  // 1 - The `module.uri` is being fetched
  FETCHING: 1,
  // 2 - The meta data has been saved to cachedMods
  SAVED: 2,
  // 3 - The `module.dependencies` are being loaded
  LOADING: 3,
  // 4 - The module are ready to execute
  LOADED: 4,
  // 5 - The module is being executed
  EXECUTING: 5,
  // 6 - The `module.exports` is available
  EXECUTED: 6
}


function Module(uri, deps) {
  this.uri = uri
  this.dependencies = deps || []
  this.exports = null
  this.status = 0

  // Who depends on me
  this._waitings = {}

  // The number of unloaded dependencies
  this._remain = 0
}

// Resolve module.dependencies
Module.prototype.resolve = function() {
  var mod = this
  var ids = mod.dependencies
  var uris = []

  for (var i = 0, len = ids.length; i < len; i++) {
    uris[i] = Module.resolve(ids[i], mod.uri)
  }
  return uris
}

// Load module.dependencies and fire onload when all done
Module.prototype.load = function() {
  var mod = this

  // If the module is being loaded, just wait it onload call
  if (mod.status >= STATUS.LOADING) {
    return
  }

  mod.status = STATUS.LOADING

  // Emit `load` event for plugins such as combo plugin
  var uris = mod.resolve()
  emit("load", uris)

  var len = mod._remain = uris.length
  var m

  // Initialize modules and register waitings
  for (var i = 0; i < len; i++) {
    m = Module.get(uris[i])

    if (m.status < STATUS.LOADED) {
      // Maybe duplicate: When module has dupliate dependency, it should be it's count, not 1
      m._waitings[mod.uri] = (m._waitings[mod.uri] || 0) + 1
    }
    else {
      mod._remain--
    }
  }

  if (mod._remain === 0) {
    mod.onload()
    return
  }

  // Begin parallel loading
  var requestCache = {}

  for (i = 0; i < len; i++) {
    m = cachedMods[uris[i]]

    if (m.status < STATUS.FETCHING) {
      m.fetch(requestCache)
    }
    else if (m.status === STATUS.SAVED) {
      m.load()
    }
  }

  // Send all requests at last to avoid cache bug in IE6-9. Issues#808
  for (var requestUri in requestCache) {
    if (requestCache.hasOwnProperty(requestUri)) {
      requestCache[requestUri]()
    }
  }
}

// Call this method when module is loaded
Module.prototype.onload = function() {
  var mod = this
  mod.status = STATUS.LOADED

  if (mod.callback) {
    mod.callback()
  }

  // Notify waiting modules to fire onload
  var waitings = mod._waitings
  var uri, m

  for (uri in waitings) {
    if (waitings.hasOwnProperty(uri)) {
      m = cachedMods[uri]
      m._remain -= waitings[uri]
      if (m._remain === 0) {
        m.onload()
      }
    }
  }

  // Reduce memory taken
  delete mod._waitings
  delete mod._remain
}

// Fetch a module
Module.prototype.fetch = function(requestCache) {
  var mod = this
  var uri = mod.uri

  mod.status = STATUS.FETCHING

  // Emit `fetch` event for plugins such as combo plugin
  var emitData = { uri: uri }
  emit("fetch", emitData)
  var requestUri = emitData.requestUri || uri

  // Empty uri or a non-CMD module
  if (!requestUri || fetchedList[requestUri]) {
    mod.load()
    return
  }

  if (fetchingList[requestUri]) {
    callbackList[requestUri].push(mod)
    return
  }

  fetchingList[requestUri] = true
  callbackList[requestUri] = [mod]

  // Emit `request` event for plugins such as text plugin
  emit("request", emitData = {
    uri: uri,
    requestUri: requestUri,
    onRequest: onRequest,
    charset: data.charset
  })

  if (!emitData.requested) {
    requestCache ?
        requestCache[emitData.requestUri] = sendRequest :
        sendRequest()
  }

  function sendRequest() {
    seajs.request(emitData.requestUri, emitData.onRequest, emitData.charset)
  }

  function onRequest() {
    delete fetchingList[requestUri]
    fetchedList[requestUri] = true

    // Save meta data of anonymous module
    if (anonymousMeta) {
      Module.save(uri, anonymousMeta)
      anonymousMeta = null
    }

    // Call callbacks
    var m, mods = callbackList[requestUri]
    delete callbackList[requestUri]
    while ((m = mods.shift())) m.load()
  }
}

// Execute a module
Module.prototype.exec = function () {
  var mod = this

  // When module is executed, DO NOT execute it again. When module
  // is being executed, just return `module.exports` too, for avoiding
  // circularly calling
  if (mod.status >= STATUS.EXECUTING) {
    return mod.exports
  }

  mod.status = STATUS.EXECUTING

  // Create require
  var uri = mod.uri

  function require(id) {
    return Module.get(require.resolve(id)).exec()
  }

  require.resolve = function(id) {
    return Module.resolve(id, uri)
  }

  require.async = function(ids, callback) {
    Module.use(ids, callback, uri + "_async_" + cid())
    return require
  }

  // Exec factory
  var factory = mod.factory

  var exports = isFunction(factory) ?
      factory(require, mod.exports = {}, mod) :
      factory

  if (exports === undefined) {
    exports = mod.exports
  }

  // Reduce memory leak
  delete mod.factory

  mod.exports = exports
  mod.status = STATUS.EXECUTED

  // Emit `exec` event
  emit("exec", mod)

  return exports
}

// Resolve id to uri
Module.resolve = function(id, refUri) {
  // Emit `resolve` event for plugins such as text plugin
  var emitData = { id: id, refUri: refUri }
  emit("resolve", emitData)

  return emitData.uri || seajs.resolve(emitData.id, refUri)
}

// Define a module
Module.define = function (id, deps, factory) {
  var argsLen = arguments.length

  // define(factory)
  if (argsLen === 1) {
    factory = id
    id = undefined
  }
  else if (argsLen === 2) {
    factory = deps

    // define(deps, factory)
    if (isArray(id)) {
      deps = id
      id = undefined
    }
    // define(id, factory)
    else {
      deps = undefined
    }
  }

  // Parse dependencies according to the module factory code
  if (!isArray(deps) && isFunction(factory)) {
    deps = parseDependencies(factory.toString())
  }

  var meta = {
    id: id,
    uri: Module.resolve(id),
    deps: deps,
    factory: factory
  }

  // Try to derive uri in IE6-9 for anonymous modules
  if (!meta.uri && doc.attachEvent) {
    var script = getCurrentScript()

    if (script) {
      meta.uri = script.src
    }

    // NOTE: If the id-deriving methods above is failed, then falls back
    // to use onload event to get the uri
  }

  // Emit `define` event, used in nocache plugin, seajs node version etc
  emit("define", meta)

  meta.uri ? Module.save(meta.uri, meta) :
      // Save information for "saving" work in the script onload event
      anonymousMeta = meta
}

// Save meta data to cachedMods
Module.save = function(uri, meta) {
  var mod = Module.get(uri)

  // Do NOT override already saved modules
  if (mod.status < STATUS.SAVED) {
    mod.id = meta.id || uri
    mod.dependencies = meta.deps || []
    mod.factory = meta.factory
    mod.status = STATUS.SAVED

    emit("save", mod)
  }
}

// Get an existed module or create a new one
Module.get = function(uri, deps) {
  return cachedMods[uri] || (cachedMods[uri] = new Module(uri, deps))
}

// Use function is equal to load a anonymous module
Module.use = function (ids, callback, uri) {
  var mod = Module.get(uri, isArray(ids) ? ids : [ids])

  mod.callback = function() {
    var exports = []
    var uris = mod.resolve()

    for (var i = 0, len = uris.length; i < len; i++) {
      exports[i] = cachedMods[uris[i]].exec()
    }

    if (callback) {
      callback.apply(global, exports)
    }

    delete mod.callback
  }

  mod.load()
}


// Public API

seajs.use = function(ids, callback) {
  Module.use(ids, callback, data.cwd + "_use_" + cid())
  return seajs
}

Module.define.cmd = {}
global.define = Module.define


// For Developers

seajs.Module = Module
data.fetchedList = fetchedList
data.cid = cid

seajs.require = function(id) {
  var mod = Module.get(Module.resolve(id))
  if (mod.status < STATUS.EXECUTING) {
    mod.onload()
    mod.exec()
  }
  return mod.exports
}


/**
 * config.js - The configuration for the loader
 */

// The root path to use for id2uri parsing
data.base = loaderDir

// The loader directory
data.dir = loaderDir

// The current working directory
data.cwd = cwd

// The charset for requesting files
data.charset = "utf-8"

// data.alias - An object containing shorthands of module id
// data.paths - An object containing path shorthands in module id
// data.vars - The {xxx} variables in module id
// data.map - An array containing rules to map module uri
// data.debug - Debug mode. The default value is false

seajs.config = function(configData) {

  for (var key in configData) {
    var curr = configData[key]
    var prev = data[key]

    // Merge object config such as alias, vars
    if (prev && isObject(prev)) {
      for (var k in curr) {
        prev[k] = curr[k]
      }
    }
    else {
      // Concat array config such as map
      if (isArray(prev)) {
        curr = prev.concat(curr)
      }
      // Make sure that `data.base` is an absolute path
      else if (key === "base") {
        // Make sure end with "/"
        if (curr.slice(-1) !== "/") {
          curr += "/"
        }
        curr = addBase(curr)
      }

      // Set config
      data[key] = curr
    }
  }

  emit("config", configData)
  return seajs
}

})(this);
(function() {
  /**
 * util-request.js - The utilities for requesting script and style files
 * ref: tests/research/load-js-css/test.html
 */
var doc = document
var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement
var baseElement = head.getElementsByTagName("base")[0]

var IS_CSS_RE = /\.css(?:\?|$)/i
var currentlyAddingScript
var interactiveScript

// `onload` event is not supported in WebKit < 535.23 and Firefox < 9.0
// ref:
//  - https://bugs.webkit.org/show_activity.cgi?id=38995
//  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
//  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
var isOldWebKit = +navigator.userAgent
  .replace(/.*(?:AppleWebKit|AndroidWebKit)\/(\d+).*/, "$1") < 536

function isFunction(obj) {
  return {}.toString.call(obj) == "[object Function]"
}
function request(url, callback, charset) {
  var isCSS = IS_CSS_RE.test(url)
  var node = doc.createElement(isCSS ? "link" : "script")

  if (charset) {
    var cs = isFunction(charset) ? charset(url) : charset
    if (cs) {
      node.charset = cs
    }
  }

  addOnload(node, callback, isCSS, url)

  if (isCSS) {
    node.rel = "stylesheet"
    node.href = url
  }
  else {
    node.async = true
    node.src = url
  }

  // For some cache cases in IE 6-8, the script executes IMMEDIATELY after
  // the end of the insert execution, so use `currentlyAddingScript` to
  // hold current node, for deriving url in `define` call
  currentlyAddingScript = node

  // ref: #185 & http://dev.jquery.com/ticket/2709
  baseElement ?
    head.insertBefore(node, baseElement) :
    head.appendChild(node)

  currentlyAddingScript = null
}

function addOnload(node, callback, isCSS, url) {
  var supportOnload = "onload" in node

  // for Old WebKit and Old Firefox
  if (isCSS && (isOldWebKit || !supportOnload)) {
    setTimeout(function() {
      pollCss(node, callback)
    }, 1) // Begin after node insertion
    return
  }

  if (supportOnload) {
    node.onload = onload
    node.onerror = function() {
      seajs.emit("error", { uri: url, node: node })
      onload()
    }
  }
  else {
    node.onreadystatechange = function() {
      if (/loaded|complete/.test(node.readyState)) {
        onload()
      }
    }
  }

  function onload() {
    // Ensure only run once and handle memory leak in IE
    node.onload = node.onerror = node.onreadystatechange = null

    // Remove the script to reduce memory leak
    if (!isCSS && !seajs.data.debug) {
      head.removeChild(node)
    }

    // Dereference the node
    node = null

    callback()
  }
}

function pollCss(node, callback) {
  var sheet = node.sheet
  var isLoaded

  // for WebKit < 536
  if (isOldWebKit) {
    if (sheet) {
      isLoaded = true
    }
  }
  // for Firefox < 9.0
  else if (sheet) {
    try {
      if (sheet.cssRules) {
        isLoaded = true
      }
    } catch (ex) {
      // The value of `ex.name` is changed from "NS_ERROR_DOM_SECURITY_ERR"
      // to "SecurityError" since Firefox 13.0. But Firefox is less than 9.0
      // in here, So it is ok to just rely on "NS_ERROR_DOM_SECURITY_ERR"
      if (ex.name === "NS_ERROR_DOM_SECURITY_ERR") {
        isLoaded = true
      }
    }
  }

  setTimeout(function() {
    if (isLoaded) {
      // Place callback here to give time for style rendering
      callback()
    }
    else {
      pollCss(node, callback)
    }
  }, 20)
}

function getCurrentScript() {
  if (currentlyAddingScript) {
    return currentlyAddingScript
  }

  // For IE6-9 browsers, the script onload event may not fire right
  // after the script is evaluated. Kris Zyp found that it
  // could query the script nodes and the one that is in "interactive"
  // mode indicates the current script
  // ref: http://goo.gl/JHfFW
  if (interactiveScript && interactiveScript.readyState === "interactive") {
    return interactiveScript
  }

  var scripts = head.getElementsByTagName("script")

  for (var i = scripts.length - 1; i >= 0; i--) {
    var script = scripts[i]
    if (script.readyState === "interactive") {
      interactiveScript = script
      return interactiveScript
    }
  }
}


// For Developers
seajs.request = request;
})();

(function(){
var data = seajs.data
var doc = document

seajs.Module.preload = function(callback) {
  var preloadMods = data.preload
  var len = preloadMods.length

  if(len) {
    seajs.Module.use(preloadMods, function() {
      // Remove the loaded preload modules
      preloadMods.splice(0, len)

      // Allow preload modules to add new preload modules
      seajs.Module.preload(callback)
    }, data.cwd + "_preload_" + data.cid())
  }
  else {
    callback()
  }
}

seajs.use = function(ids, callback) {
  seajs.Module.preload(function() {
    seajs.Module.use(ids, callback, data.cwd + "_use_" + data.cid())
  })
  return seajs
}

data.preload = (function() {
  var plugins = []

  // Convert `seajs-xxx` to `seajs-xxx=1`
  // NOTE: use `seajs-xxx=1` flag in uri or cookie to preload `seajs-xxx`
  var str = location.search.replace(/(seajs-\w+)(&|$)/g, "$1=1$2")

  // Add cookie string
  str += " " + doc.cookie

  // Exclude seajs-xxx=0
  str.replace(/(seajs-\w+)=1/g, function(m, name) {
    plugins.push(name)
  })

  return plugins
})()
// define("seajs/seajs-preload/1.0.0/seajs-preload-debug", [], {});
})();/**
 * The Sea.js plugin for embedding style text in JavaScript code
 */

(function(){
  var RE_NON_WORD = /\W/g
  var doc = document
  var head = document.getElementsByTagName('head')[0] ||
      document.documentElement
  var styleNode

  seajs.importStyle = function(cssText, id) {
    if (id) {
      // Convert id to valid string
      id = id.replace(RE_NON_WORD, '-')

      // Don't add multiple times
      if (doc.getElementById(id)) return
    }

    var element

    // Don't share styleNode when id is spectied
    if (!styleNode || id) {
      element = doc.createElement('style')
      id && (element.id = id)

      // Adds to DOM first to avoid the css hack invalid
      head.appendChild(element)
    } else {
      element = styleNode
    }

    // IE
    if (element.styleSheet) {

      // http://support.microsoft.com/kb/262161
      if (doc.getElementsByTagName('style').length > 31) {
        throw new Error('Exceed the maximal count of style tags in IE')
      }

      element.styleSheet.cssText += cssText
    }
    // W3C
    else {
      element.appendChild(doc.createTextNode(cssText))
    }

    if (!id) {
      styleNode = element
    }
  }
})();
/**
 * The Sea.js plugin for loading text resources such as template, json etc
 */
(function(){
  
var global = window
var plugins = {}
var uriCache = {}

function register(o) {
  plugins[o.name] = o
}

// normal text
register({
  name: "text",

  ext: [".tpl", ".html"],

  exec: function(uri, content) {
    globalEval('define("' + uri + '#", [], "' + jsEscape(content) + '")')
  }
})

// json
register({
  name: "json",

  ext: [".json"],

  exec: function(uri, content) {
    globalEval('define("' + uri + '#", [], ' + content + ')')
  }
})

// for handlebars template
register({
  name: "handlebars",

  ext: [".handlebars"],

  exec: function(uri, content) {
    var code = [
      'define("' + uri + '#", ["handlebars"], function(require, exports, module) {',
      '  var source = "' + jsEscape(content) + '"',
      '  var Handlebars = require("handlebars")["default"]',
      '  module.exports = function(data, options) {',
      '    options || (options = {})',
      '    options.helpers || (options.helpers = {})',
      '    for (var key in Handlebars.helpers) {',
      '      options.helpers[key] = options.helpers[key] || Handlebars.helpers[key]',
      '    }',
      '    return Handlebars.compile(source)(data, options)',
      '  }',
      '})'
    ].join('\n')

    globalEval(code)
  }
})


seajs.on("resolve", function(data) {
  var id = data.id
  if (!id) return ""

  var pluginName
  var m

  // text!path/to/some.xx
  if ((m = id.match(/^(\w+)!(.+)$/)) && isPlugin(m[1])) {
    pluginName = m[1]
    id = m[2]
  }
  // http://path/to/a.tpl
  // http://path/to/c.json?v2
  else if ((m = id.match(/[^?]+(\.\w+)(?:\?|#|$)/))) {
    pluginName = getPluginName(m[1])
  }

  if (pluginName && id.indexOf("#") === -1) {
    id += "#"
  }

  var uri = seajs.resolve(id, data.refUri)

  if (pluginName) {
    uriCache[uri] = pluginName
  }

  data.uri = uri
})

seajs.on("request", function(data) {
  var name = uriCache[data.uri]

  if (name) {
    xhr(data.requestUri, function(content) {
      plugins[name].exec(data.uri, content)
      data.onRequest()
    })

    data.requested = true
  }
})


// Helpers

function isPlugin(name) {
  return name && plugins.hasOwnProperty(name)
}

function getPluginName(ext) {
  for (var k in plugins) {
    if (isPlugin(k)) {
      var exts = "," + plugins[k].ext.join(",") + ","
      if (exts.indexOf("," + ext + ",") > -1) {
        return k
      }
    }
  }
}

function xhr(url, callback) {
  var r = global.ActiveXObject ?
      new global.ActiveXObject("Microsoft.XMLHTTP") :
      new global.XMLHttpRequest()

  r.open("GET", url, true)

  r.onreadystatechange = function() {
    if (r.readyState === 4) {
      // Support local file
      if (r.status > 399 && r.status < 600) {
        throw new Error("Could not load: " + url + ", status = " + r.status)
      }
      else {
        callback(r.responseText)
      }
    }
  }

  return r.send(null)
}

function globalEval(content) {
  if (content && /\S/.test(content)) {
    (global.execScript || function(content) {
      (global.eval || eval).call(global, content)
    })(content)
  }
}

function jsEscape(content) {
  return content.replace(/(["\\])/g, "\\$1")
      .replace(/[\f]/g, "\\f")
      .replace(/[\b]/g, "\\b")
      .replace(/[\n]/g, "\\n")
      .replace(/[\t]/g, "\\t")
      .replace(/[\r]/g, "\\r")
      .replace(/[\u2028]/g, "\\u2028")
      .replace(/[\u2029]/g, "\\u2029")
}

function pure(uri) {
  // Remove timestamp etc
  return uri.replace(/\?.*$/, "")
}
})();
(function(window){
	var R = window.R = {};
})(window);/**
 * [debug]
 * @return {[type]} [description]
 */
(function(){
	// 使用/run-debug为了与  seajs 的base 隔离
	define("/run-debug",function(require,exports,module){
	    require.async("vendor/seajs-debug",function(){});
	});
})();
/**
 * 统计性能的工具
 * 
 * @param  {[type]} root [description]
 * @return {[type]}      [description]
 */
(function(){
	var timeProfile = R.timeProfile = {};
	var timers = {};
	/**
	 *  设置统计项目
	 * @param {[type]} name     [项目名称，推荐使用 user.getinfo 这样的命名空间的形式来作为名称]
	 * @param {[type]} override [是否覆盖之前的项目]
	 * return Profile 成功,false 失败
	 */
	timeProfile.set = function(name,override){
		if(typeof name !== "string" ){
			R.log("计时器名称必须为String","error");
			return false;
		}
		if(timers[name] && !override){
			R.log("计时器已存在，需要覆盖请使用：TimeProfile.set(name,true);","error");
			return false;
		}
		return timers[name] = new Profile(name);
	}
	/**
	 * 获取项目的执行时间
	 * 如果有快照参数，则会生成快照
	 * @param  {[String]} name    [项目名称]
	 * @param  {[String]} capture [快照名称]
	 * @return {[type]}         [description]
	 */
	timeProfile.time = function(name,capture){
		if(!timers[name]){
			R.log("计时器不存在","error");
			return -1;
		}
		return capture ? timers[name].capture(capture) : timers[name].get();
	}
	/**
	 * 移除项目
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	timeProfile.remove = function(name){
		var tmp = timers[name];
		delete timers[name];
		return tmp;
	}

	timeProfile.log = function(start,end,time){
		return "『"+start+"』" + "至" +"『"+end+"』" + "消耗了:"+time+"ms";
	}

	/**
	 * 时间性能
	 */
	function Profile(name){
		this.node = {};
		this.startTime = new Date().getTime();
		this.name = name || "未命名";
	}
	/**
	 * 生成一个时间快照，若存在则返回已存在的
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	Profile.prototype.capture = function(name) {
		if(typeof name !== "string"){
			throw new Error("缺少字符串作为快照名称");
		}
		if(this.node[name]){
			return this.node[name];
		}
		var time = new Date().getTime() - this.startTime;

		R.log(timeProfile.log(this.name,name,time));

		return this.node[name] = time;
	};
	/**
	 * 临时获取一个执行时间
	 * @return {[type]} [description]
	 */
	Profile.prototype.get = function() {
		return new Date().getTime() - this.startTime;
	};
})();

(function(){
	var ok_time = new Date().getTime() - 3.6e5;
	var headtime = parseInt(window.HEAD_TIME);
	if( headtime > ok_time ){
		var head = R.timeProfile.set("HEAD_TIME");
		head.startTime = headtime;
		head.name = "head标签";
	}
})();// 命令行工具将信息分类显示


(function(window){
	var R = window.R;

	var consoles = {};

	R.logger = function(scope){
    scope = scope.toUpperCase();
		if(consoles[scope]){
			return consoles[scope];
		}
		return consoles[scope] = new Console(scope);
	}
  R.logger.getAll = function(){
    var tmp = {};
    for(var i in consoles){
      tmp[i] = consoles[i];
    }
    return tmp;
  }


  var methods = ["warn","error","trace","info","debug"]
  for (var i = methods.length - 1; i >= 0; i--) {
    Console.prototype[methods[i]] = makeConsoleMethod(methods[i]);
  };
  // log 也都使用trace，方便获取调用栈
  Console.prototype.log = Console.prototype.trace;

  Console.prototype.printAll = function(){
    var console = window.console;
    if(!console){
      return 
    }
    var infos = this._infos;
    for(var i = 0; i < infos.length ; i++){
      var m = infos[i][0];
      console[m].call(console,infos[i][1], infos[i][2].stack);
    }
  }

	function Console(scope){
		this._infos = [];
		this.scope = scope;
	}

	function makeConsoleMethod(method){
    var console = window.console;
		return function() {
			// 非DEBUG模式直接不做任何操作
			if(!R.config("DEBUG")){
				return;
			}
      var args = Array.prototype.slice.call(arguments);
      args.unshift("【"+this.scope+"】\n");
			// debug模式下，将所有输出信息缓存下来，方便调试查看
			var msg ;
			if(JSON){
				msg = JSON.stringify(args);
			}else{
        // 留坑，以后填，在没有json支持的情况下
        msg = Array.prototype.map.apply(args,function(v,i){
          return v.toString();
        }).join("\n");
			}

			this._infos.push([ method , msg , new Error()]);

			// 并如果 设置了 scope ，则输出scope 内相应的消息。否则也是不作输出
			if(!console){
				return;
			}
			// 如果指定了错误的类型，则默认为trace
			if(!console[method]){
				console.warn("CONSOLE：您填写的%s控制台方法不被支持已被调整为：console.trace",method);
				method = "trace";
				return;
			}
			var loggerScope = R.config("logger");
			// 检测 this.scope 是否在 允许显示的 scope 列表中
	  	if(loggerScope && (loggerScope === "all" || loggerScope.indexOf(this.scope) > -1 ) ){
        console[method].apply(console,args);
      }
	  }
	}
})(window);// window 的页面配置，仅作为配置一些静态变量，不能批量操作
// 不能重复，不能修改.修改需要传入 force = true 的参数
(function(){
	var cache = {};
	var console = R.logger("R.config");
	R.config =  function(name,value,force){
		if(  (typeof name) !== "string"  ) {
			R.error("页面配置项需要为：String");
		}
		if(value === undefined){
			return cache[name];
		}
		if(!cache.hasOwnProperty(name)){
			return cache[name] = value;
		}else if(!force)
		{
			$.error("已经存在名为：" + name + "的配置项，不能重复设置。重复设置请使用R.config(name,value,true);");
		}
		else{
			// null 值可以删除 配置项，并返回原来值
			var tmp = cache[name];
			if(value === null){
				console.warn("强制删除了配置["+name+"]");
				delete cache[name];
			}else{
				console.warn("强制设置了配置["+name+"]为："+value);
				cache[name] = value;
			}
			return tmp;
		}
	}
	R.config.getAll = function(){
		var tmp = {};
		for(var i in  cache){
			tmp[i] = cache[i];
		}
		return tmp;
	}
})();(function(R){
 R.faFisMap = function(rs_map){
 	"use strict";
	var base = R.config("STATIC_BASE");
	var domain = R.config("STATIC_DOMAIN");
	var dir = R.config("STATIC_DIR");

 	if(!domain || !domain || !dir){
 		R.error("静态资源根路径未配置！");
 	}
	var console = R.logger("resource_map");
	console.log(rs_map);
	var seamap = [];
	for(var i in rs_map.res){
		if(!/\.(js|css|less)$/.test(i)){
			continue;
		}
		var rs = rs_map.res[i];
		var uri ;
		if(rs.pkg){
			uri =  rs_map.pkg[rs.pkg].uri;
		}else{
			uri =  rs.uri;
		}
		// uri是带静态服务器地址和目录信息，去掉后方便seajs加载
		uri = uri.replace( base ,"");
		console.log(i,uri);
		seamap.push([i,uri]);
	}
	seajs.config({
		base: base,
		map : seamap
	});
 }
})(window.R);/**
 * Run.js使用
 * 3、其他seajs方法可以用 seajs本身
 * R的API列表
 * R.error() //产生一个error异常
 * R.logger(scope) //logger工具
 * R.config // 全局配置
 * R.timeProfile //性能工具  含默认的一个项目：HEAD_TIME 刚加载head tag 时的时间
 *
 * 可使用的全局配置列表：
 * window.RUN_DEVELOP
 * 
 */

(function(window) {
	var seajsDebug = window.location.search.indexOf("run-debug") !== -1;
	var R = window.R;
	/**
	 * @param  {[type]}抛出错误
	 * @return {[type]}
	 */
	R.error = function(msg){
		throw new Error(msg);
	}
	R.config("DEBUG",seajsDebug);

	if(seajsDebug){
		R.config("logger","all");
	}

	(function() {
	seajs.config({
		paths:{
			"vendor":seajs.data.dir
		},
		alias:{
			"jquery":"vendor/jquery/jquery-1.10.1"
		}
	});

	var delay_for_debug = 1000; //延迟debug 插件的执行时间，保证其完整加载
	var seaUse = seajs.use;
	seajs.use = function(){
		var args = arguments;
		if( seajsDebug ){
			seaUse.call(seajs,"/run-debug",function(){
				setTimeout(function(){
					delay_for_debug = 0; //已经加载完毕debug插件，便不用再给debug留时间了
					seaUse.apply(seajs,args);
				},delay_for_debug);
			});
		}else{
			seajs.use = seaUse;
			seajs.use.apply(seajs,args);
		}
	}

})();


})(window);

