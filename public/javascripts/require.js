
Object.defineProperty(exports, "__esModule", { value: true });
/** vim: et:ts=4:sw=4:sts=4
 * @license RequireJS 2.3.6 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, https://github.com/requirejs/requirejs/blob/master/LICENSE
 */
//Not using strict: uneven strict support in browsers, #392, and causes
//problems with requirejs.exec()/transpiler plugins that may not be strict.
/*jslint regexp: true, nomen: true, sloppy: true */
/*global window, navigator, document, importScripts, setTimeout, opera */
// Object.defineProperty(exports, "__esModule", { value: true });
var requirejs, require, define;
(function (global, setTimeout) {
    var req, s, head, baseElement, dataMain, src, interactiveScript, currentlyAddingScript, mainScript, subPath, version = '2.3.6', commentRegExp = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/mg, cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g, jsSuffixRegExp = /\.js$/, currDirRegExp = /^\.\//, op = Object.prototype, ostring = op.toString, hasOwn = op.hasOwnProperty, isBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document), isWebWorker = !isBrowser && typeof importScripts !== 'undefined', 
    //PS3 indicates loaded and complete, but need to wait for complete
    //specifically. Sequence is 'loading', 'loaded', execution,
    // then 'complete'. The UA check is unfortunate, but not sure how
    //to feature test w/o causing perf issues.
    readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ?
        /^complete$/ : /^(complete|loaded)$/, defContextName = '_', 
    //Oh the tragedy, detecting opera. See the usage of isOpera for reason.
    isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]', contexts = {}, cfg = {}, globalDefQueue = [], useInteractive = false;
    //Could match something like ')//comment', do not lose the prefix to comment.
    function commentReplace(match, singlePrefix) {
        return singlePrefix || '';
    }
    function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }
    function isArray(it) {
        return ostring.call(it) === '[object Array]';
    }
    /**
     * Helper function for iterating over an array. If the func returns
     * a true value, it will break out of the loop.
     */
    function each(ary, func) {
        if (ary) {
            var i;
            for (i = 0; i < ary.length; i += 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }
    /**
     * Helper function for iterating over an array backwards. If the func
     * returns a true value, it will break out of the loop.
     */
    function eachReverse(ary, func) {
        if (ary) {
            var i;
            for (i = ary.length - 1; i > -1; i -= 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }
    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }
    function getOwn(obj, prop) {
        return hasProp(obj, prop) && obj[prop];
    }
    /**
     * Cycles over properties in an object and calls a function for each
     * property value. If the function returns a truthy value, then the
     * iteration is stopped.
     */
    function eachProp(obj, func) {
        var prop;
        for (prop in obj) {
            if (hasProp(obj, prop)) {
                if (func(obj[prop], prop)) {
                    break;
                }
            }
        }
    }
    /**
     * Simple function to mix in properties from source into target,
     * but only if target does not already have a property of the same name.
     */
    function mixin(target, source, force, deepStringMixin) {
        if (source) {
            eachProp(source, function (value, prop) {
                if (force || !hasProp(target, prop)) {
                    if (deepStringMixin && typeof value === 'object' && value &&
                        !isArray(value) && !isFunction(value) &&
                        !(value instanceof RegExp)) {
                        if (!target[prop]) {
                            target[prop] = {};
                        }
                        mixin(target[prop], value, force, deepStringMixin);
                    }
                    else {
                        target[prop] = value;
                    }
                }
            });
        }
        return target;
    }
    //Similar to Function.prototype.bind, but the 'this' object is specified
    //first, since it is easier to read/figure out what 'this' will be.
    function bind(obj, fn) {
        return function () {
            return fn.apply(obj, arguments);
        };
    }
    function scripts() {
        return document.getElementsByTagName('script');
    }
    function defaultOnError(err) {
        throw err;
    }
    //Allow getting a global that is expressed in
    //dot notation, like 'a.b.c'.
    function getGlobal(value) {
        if (!value) {
            return value;
        }
        var g = global;
        each(value.split('.'), function (part) {
            g = g[part];
        });
        return g;
    }
    /**
     * Constructs an error with a pointer to an URL with more information.
     * @param {String} id the error ID that maps to an ID on a web page.
     * @param {String} message human readable error.
     * @param {Error} [err] the original error, if there is one.
     *
     * @returns {Error}
     */
    function makeError(id, msg, err, requireModules) {
        var e = new Error(msg + '\nhttps://requirejs.org/docs/errors.html#' + id);
        e.requireType = id;
        e.requireModules = requireModules;
        if (err) {
            e.originalError = err;
        }
        return e;
    }
    if (typeof define !== 'undefined') {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }
    if (typeof requirejs !== 'undefined') {
        if (isFunction(requirejs)) {
            //Do not overwrite an existing requirejs instance.
            return;
        }
        cfg = requirejs;
        requirejs = undefined;
    }
    //Allow for a require config object
    if (typeof require !== 'undefined' && !isFunction(require)) {
        //assume it is a config object.
        cfg = require;
        require = undefined;
    }
    function newContext(contextName) {
        var inCheckLoaded, Module, context, handlers, checkLoadedTimeoutId, config = {
            //Defaults. Do not set a default for map
            //config to speed up normalize(), which
            //will run faster if there is no default.
            waitSeconds: 7,
            baseUrl: './',
            paths: {},
            bundles: {},
            pkgs: {},
            shim: {},
            config: {}
        }, registry = {}, 
        //registry of just enabled modules, to speed
        //cycle breaking code when lots of modules
        //are registered, but not activated.
        enabledRegistry = {}, undefEvents = {}, defQueue = [], defined = {}, urlFetched = {}, bundlesMap = {}, requireCounter = 1, unnormalizedCounter = 1;
        /**
         * Trims the . and .. from an array of path segments.
         * It will keep a leading path segment if a .. will become
         * the first path segment, to help with module name lookups,
         * which act like paths, but can be remapped. But the end result,
         * all paths that use this function should look normalized.
         * NOTE: this method MODIFIES the input array.
         * @param {Array} ary the array of path segments.
         */
        function trimDots(ary) {
            var i, part;
            for (i = 0; i < ary.length; i++) {
                part = ary[i];
                if (part === '.') {
                    ary.splice(i, 1);
                    i -= 1;
                }
                else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && ary[2] === '..') || ary[i - 1] === '..') {
                        continue;
                    }
                    else if (i > 0) {
                        ary.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
        }
        /**
         * Given a relative module name, like ./something, normalize it to
         * a real name that can be mapped to a path.
         * @param {String} name the relative name
         * @param {String} baseName a real name that the name arg is relative
         * to.
         * @param {Boolean} applyMap apply the map config to the value. Should
         * only be done if this normalization is for a dependency ID.
         * @returns {String} normalized name
         */
        function normalize(name, baseName, applyMap) {
            var pkgMain, mapValue, nameParts, i, j, nameSegment, lastIndex, foundMap, foundI, foundStarMap, starI, normalizedBaseParts, baseParts = (baseName && baseName.split('/')), map = config.map, starMap = map && map['*'];
            //Adjust any relative paths.
            if (name) {
                name = name.split('/');
                lastIndex = name.length - 1;
                // If wanting node ID compatibility, strip .js from end
                // of IDs. Have to do this here, and not in nameToUrl
                // because node allows either .js or non .js to map
                // to same file.
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }
                // Starts with a '.' so need the baseName
                if (name[0].charAt(0) === '.' && baseParts) {
                    //Convert baseName to array, and lop off the last part,
                    //so that . matches that 'directory' and not name of the baseName's
                    //module. For instance, baseName of 'one/two/three', maps to
                    //'one/two/three.js', but we want the directory, 'one/two' for
                    //this normalization.
                    normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                    name = normalizedBaseParts.concat(name);
                }
                trimDots(name);
                name = name.join('/');
            }
            //Apply map config if available.
            if (applyMap && map && (baseParts || starMap)) {
                nameParts = name.split('/');
                outerLoop: for (i = nameParts.length; i > 0; i -= 1) {
                    nameSegment = nameParts.slice(0, i).join('/');
                    if (baseParts) {
                        //Find the longest baseName segment match in the config.
                        //So, do joins on the biggest to smallest lengths of baseParts.
                        for (j = baseParts.length; j > 0; j -= 1) {
                            mapValue = getOwn(map, baseParts.slice(0, j).join('/'));
                            //baseName segment has config, find if it has one for
                            //this name.
                            if (mapValue) {
                                mapValue = getOwn(mapValue, nameSegment);
                                if (mapValue) {
                                    //Match, update name to the new value.
                                    foundMap = mapValue;
                                    foundI = i;
                                    break outerLoop;
                                }
                            }
                        }
                    }
                    //Check for a star map match, but just hold on to it,
                    //if there is a shorter segment match later in a matching
                    //config, then favor over this star map.
                    if (!foundStarMap && starMap && getOwn(starMap, nameSegment)) {
                        foundStarMap = getOwn(starMap, nameSegment);
                        starI = i;
                    }
                }
                if (!foundMap && foundStarMap) {
                    foundMap = foundStarMap;
                    foundI = starI;
                }
                if (foundMap) {
                    nameParts.splice(0, foundI, foundMap);
                    name = nameParts.join('/');
                }
            }
            // If the name points to a package's name, use
            // the package main instead.
            pkgMain = getOwn(config.pkgs, name);
            return pkgMain ? pkgMain : name;
        }
        function removeScript(name) {
            if (isBrowser) {
                each(scripts(), function (scriptNode) {
                    if (scriptNode.getAttribute('data-requiremodule') === name &&
                        scriptNode.getAttribute('data-requirecontext') === context.contextName) {
                        scriptNode.parentNode.removeChild(scriptNode);
                        return true;
                    }
                });
            }
        }
        function hasPathFallback(id) {
            var pathConfig = getOwn(config.paths, id);
            if (pathConfig && isArray(pathConfig) && pathConfig.length > 1) {
                //Pop off the first array value, since it failed, and
                //retry
                pathConfig.shift();
                context.require.undef(id);
                //Custom require that does not do map translation, since
                //ID is "absolute", already mapped/resolved.
                context.makeRequire(null, {
                    skipMap: true
                })([id]);
                return true;
            }
        }
        //Turns a plugin!resource to [plugin, resource]
        //with the plugin being undefined if the name
        //did not have a plugin prefix.
        function splitPrefix(name) {
            var prefix, index = name ? name.indexOf('!') : -1;
            if (index > -1) {
                prefix = name.substring(0, index);
                name = name.substring(index + 1, name.length);
            }
            return [prefix, name];
        }
        /**
         * Creates a module mapping that includes plugin prefix, module
         * name, and path. If parentModuleMap is provided it will
         * also normalize the name via require.normalize()
         *
         * @param {String} name the module name
         * @param {String} [parentModuleMap] parent module map
         * for the module name, used to resolve relative names.
         * @param {Boolean} isNormalized: is the ID already normalized.
         * This is true if this call is done for a define() module ID.
         * @param {Boolean} applyMap: apply the map config to the ID.
         * Should only be true if this map is for a dependency.
         *
         * @returns {Object}
         */
        function makeModuleMap(name, parentModuleMap, isNormalized, applyMap) {
            var url, pluginModule, suffix, nameParts, prefix = null, parentName = parentModuleMap ? parentModuleMap.name : null, originalName = name, isDefine = true, normalizedName = '';
            //If no name, then it means it is a require call, generate an
            //internal name.
            if (!name) {
                isDefine = false;
                name = '_@r' + (requireCounter += 1);
            }
            nameParts = splitPrefix(name);
            prefix = nameParts[0];
            name = nameParts[1];
            if (prefix) {
                prefix = normalize(prefix, parentName, applyMap);
                pluginModule = getOwn(defined, prefix);
            }
            //Account for relative paths if there is a base name.
            if (name) {
                if (prefix) {
                    if (isNormalized) {
                        normalizedName = name;
                    }
                    else if (pluginModule && pluginModule.normalize) {
                        //Plugin is loaded, use its normalize method.
                        normalizedName = pluginModule.normalize(name, function (name) {
                            return normalize(name, parentName, applyMap);
                        });
                    }
                    else {
                        // If nested plugin references, then do not try to
                        // normalize, as it will not normalize correctly. This
                        // places a restriction on resourceIds, and the longer
                        // term solution is not to normalize until plugins are
                        // loaded and all normalizations to allow for async
                        // loading of a loader plugin. But for now, fixes the
                        // common uses. Details in #1131
                        normalizedName = name.indexOf('!') === -1 ?
                            normalize(name, parentName, applyMap) :
                            name;
                    }
                }
                else {
                    //A regular module.
                    normalizedName = normalize(name, parentName, applyMap);
                    //Normalized name may be a plugin ID due to map config
                    //application in normalize. The map config values must
                    //already be normalized, so do not need to redo that part.
                    nameParts = splitPrefix(normalizedName);
                    prefix = nameParts[0];
                    normalizedName = nameParts[1];
                    isNormalized = true;
                    url = context.nameToUrl(normalizedName);
                }
            }
            //If the id is a plugin id that cannot be determined if it needs
            //normalization, stamp it with a unique ID so two matching relative
            //ids that may conflict can be separate.
            suffix = prefix && !pluginModule && !isNormalized ?
                '_unnormalized' + (unnormalizedCounter += 1) :
                '';
            return {
                prefix: prefix,
                name: normalizedName,
                parentMap: parentModuleMap,
                unnormalized: !!suffix,
                url: url,
                originalName: originalName,
                isDefine: isDefine,
                id: (prefix ?
                    prefix + '!' + normalizedName :
                    normalizedName) + suffix
            };
        }
        function getModule(depMap) {
            var id = depMap.id, mod = getOwn(registry, id);
            if (!mod) {
                mod = registry[id] = new context.Module(depMap);
            }
            return mod;
        }
        function on(depMap, name, fn) {
            var id = depMap.id, mod = getOwn(registry, id);
            if (hasProp(defined, id) &&
                (!mod || mod.defineEmitComplete)) {
                if (name === 'defined') {
                    fn(defined[id]);
                }
            }
            else {
                mod = getModule(depMap);
                if (mod.error && name === 'error') {
                    fn(mod.error);
                }
                else {
                    mod.on(name, fn);
                }
            }
        }
        function onError(err, errback) {
            var ids = err.requireModules, notified = false;
            if (errback) {
                errback(err);
            }
            else {
                each(ids, function (id) {
                    var mod = getOwn(registry, id);
                    if (mod) {
                        //Set error on module, so it skips timeout checks.
                        mod.error = err;
                        if (mod.events.error) {
                            notified = true;
                            mod.emit('error', err);
                        }
                    }
                });
                if (!notified) {
                    req.onError(err);
                }
            }
        }
        /**
         * Internal method to transfer globalQueue items to this context's
         * defQueue.
         */
        function takeGlobalQueue() {
            //Push all the globalDefQueue items into the context's defQueue
            if (globalDefQueue.length) {
                each(globalDefQueue, function (queueItem) {
                    var id = queueItem[0];
                    if (typeof id === 'string') {
                        context.defQueueMap[id] = true;
                    }
                    defQueue.push(queueItem);
                });
                globalDefQueue = [];
            }
        }
        handlers = {
            'require': function (mod) {
                if (mod.require) {
                    return mod.require;
                }
                else {
                    return (mod.require = context.makeRequire(mod.map));
                }
            },
            'exports': function (mod) {
                mod.usingExports = true;
                if (mod.map.isDefine) {
                    if (mod.exports) {
                        return (defined[mod.map.id] = mod.exports);
                    }
                    else {
                        return (mod.exports = defined[mod.map.id] = {});
                    }
                }
            },
            'module': function (mod) {
                if (mod.module) {
                    return mod.module;
                }
                else {
                    return (mod.module = {
                        id: mod.map.id,
                        uri: mod.map.url,
                        config: function () {
                            return getOwn(config.config, mod.map.id) || {};
                        },
                        exports: mod.exports || (mod.exports = {})
                    });
                }
            }
        };
        function cleanRegistry(id) {
            //Clean up machinery used for waiting modules.
            delete registry[id];
            delete enabledRegistry[id];
        }
        function breakCycle(mod, traced, processed) {
            var id = mod.map.id;
            if (mod.error) {
                mod.emit('error', mod.error);
            }
            else {
                traced[id] = true;
                each(mod.depMaps, function (depMap, i) {
                    var depId = depMap.id, dep = getOwn(registry, depId);
                    //Only force things that have not completed
                    //being defined, so still in the registry,
                    //and only if it has not been matched up
                    //in the module already.
                    if (dep && !mod.depMatched[i] && !processed[depId]) {
                        if (getOwn(traced, depId)) {
                            mod.defineDep(i, defined[depId]);
                            mod.check(); //pass false?
                        }
                        else {
                            breakCycle(dep, traced, processed);
                        }
                    }
                });
                processed[id] = true;
            }
        }
        function checkLoaded() {
            var err, usingPathFallback, waitInterval = config.waitSeconds * 1000, 
            //It is possible to disable the wait interval by using waitSeconds of 0.
            expired = waitInterval && (context.startTime + waitInterval) < new Date().getTime(), noLoads = [], reqCalls = [], stillLoading = false, needCycleCheck = true;
            //Do not bother if this call was a result of a cycle break.
            if (inCheckLoaded) {
                return;
            }
            inCheckLoaded = true;
            //Figure out the state of all the modules.
            eachProp(enabledRegistry, function (mod) {
                var map = mod.map, modId = map.id;
                //Skip things that are not enabled or in error state.
                if (!mod.enabled) {
                    return;
                }
                if (!map.isDefine) {
                    reqCalls.push(mod);
                }
                if (!mod.error) {
                    //If the module should be executed, and it has not
                    //been inited and time is up, remember it.
                    if (!mod.inited && expired) {
                        if (hasPathFallback(modId)) {
                            usingPathFallback = true;
                            stillLoading = true;
                        }
                        else {
                            noLoads.push(modId);
                            removeScript(modId);
                        }
                    }
                    else if (!mod.inited && mod.fetched && map.isDefine) {
                        stillLoading = true;
                        if (!map.prefix) {
                            //No reason to keep looking for unfinished
                            //loading. If the only stillLoading is a
                            //plugin resource though, keep going,
                            //because it may be that a plugin resource
                            //is waiting on a non-plugin cycle.
                            return (needCycleCheck = false);
                        }
                    }
                }
            });
            if (expired && noLoads.length) {
                //If wait time expired, throw error of unloaded modules.
                err = makeError('timeout', 'Load timeout for modules: ' + noLoads, null, noLoads);
                err.contextName = context.contextName;
                return onError(err);
            }
            //Not expired, check for a cycle.
            if (needCycleCheck) {
                each(reqCalls, function (mod) {
                    breakCycle(mod, {}, {});
                });
            }
            //If still waiting on loads, and the waiting load is something
            //other than a plugin resource, or there are still outstanding
            //scripts, then just try back later.
            if ((!expired || usingPathFallback) && stillLoading) {
                //Something is still waiting to load. Wait for it, but only
                //if a timeout is not already in effect.
                if ((isBrowser || isWebWorker) && !checkLoadedTimeoutId) {
                    checkLoadedTimeoutId = setTimeout(function () {
                        checkLoadedTimeoutId = 0;
                        checkLoaded();
                    }, 50);
                }
            }
            inCheckLoaded = false;
        }
        Module = function (map) {
            this.events = getOwn(undefEvents, map.id) || {};
            this.map = map;
            this.shim = getOwn(config.shim, map.id);
            this.depExports = [];
            this.depMaps = [];
            this.depMatched = [];
            this.pluginMaps = {};
            this.depCount = 0;
            /* this.exports this.factory
               this.depMaps = [],
               this.enabled, this.fetched
            */
        };
        Module.prototype = {
            init: function (depMaps, factory, errback, options) {
                options = options || {};
                //Do not do more inits if already done. Can happen if there
                //are multiple define calls for the same module. That is not
                //a normal, common case, but it is also not unexpected.
                if (this.inited) {
                    return;
                }
                this.factory = factory;
                if (errback) {
                    //Register for errors on this module.
                    this.on('error', errback);
                }
                else if (this.events.error) {
                    //If no errback already, but there are error listeners
                    //on this module, set up an errback to pass to the deps.
                    errback = bind(this, function (err) {
                        this.emit('error', err);
                    });
                }
                //Do a copy of the dependency array, so that
                //source inputs are not modified. For example
                //"shim" deps are passed in here directly, and
                //doing a direct modification of the depMaps array
                //would affect that config.
                this.depMaps = depMaps && depMaps.slice(0);
                this.errback = errback;
                //Indicate this module has be initialized
                this.inited = true;
                this.ignore = options.ignore;
                //Could have option to init this module in enabled mode,
                //or could have been previously marked as enabled. However,
                //the dependencies are not known until init is called. So
                //if enabled previously, now trigger dependencies as enabled.
                if (options.enabled || this.enabled) {
                    //Enable this module and dependencies.
                    //Will call this.check()
                    this.enable();
                }
                else {
                    this.check();
                }
            },
            defineDep: function (i, depExports) {
                //Because of cycles, defined callback for a given
                //export can be called more than once.
                if (!this.depMatched[i]) {
                    this.depMatched[i] = true;
                    this.depCount -= 1;
                    this.depExports[i] = depExports;
                }
            },
            fetch: function () {
                if (this.fetched) {
                    return;
                }
                this.fetched = true;
                context.startTime = (new Date()).getTime();
                var map = this.map;
                //If the manager is for a plugin managed resource,
                //ask the plugin to load it now.
                if (this.shim) {
                    context.makeRequire(this.map, {
                        enableBuildCallback: true
                    })(this.shim.deps || [], bind(this, function () {
                        return map.prefix ? this.callPlugin() : this.load();
                    }));
                }
                else {
                    //Regular dependency.
                    return map.prefix ? this.callPlugin() : this.load();
                }
            },
            load: function () {
                var url = this.map.url;
                //Regular dependency.
                if (!urlFetched[url]) {
                    urlFetched[url] = true;
                    context.load(this.map.id, url);
                }
            },
            /**
             * Checks if the module is ready to define itself, and if so,
             * define it.
             */
            check: function () {
                if (!this.enabled || this.enabling) {
                    return;
                }
                var err, cjsModule, id = this.map.id, depExports = this.depExports, exports = this.exports, factory = this.factory;
                if (!this.inited) {
                    // Only fetch if not already in the defQueue.
                    if (!hasProp(context.defQueueMap, id)) {
                        this.fetch();
                    }
                }
                else if (this.error) {
                    this.emit('error', this.error);
                }
                else if (!this.defining) {
                    //The factory could trigger another require call
                    //that would result in checking this module to
                    //define itself again. If already in the process
                    //of doing that, skip this work.
                    this.defining = true;
                    if (this.depCount < 1 && !this.defined) {
                        if (isFunction(factory)) {
                            //If there is an error listener, favor passing
                            //to that instead of throwing an error. However,
                            //only do it for define()'d  modules. require
                            //errbacks should not be called for failures in
                            //their callbacks (#699). However if a global
                            //onError is set, use that.
                            if ((this.events.error && this.map.isDefine) ||
                                req.onError !== defaultOnError) {
                                try {
                                    exports = context.execCb(id, factory, depExports, exports);
                                }
                                catch (e) {
                                    err = e;
                                }
                            }
                            else {
                                exports = context.execCb(id, factory, depExports, exports);
                            }
                            // Favor return value over exports. If node/cjs in play,
                            // then will not have a return value anyway. Favor
                            // module.exports assignment over exports object.
                            if (this.map.isDefine && exports === undefined) {
                                cjsModule = this.module;
                                if (cjsModule) {
                                    exports = cjsModule.exports;
                                }
                                else if (this.usingExports) {
                                    //exports already set the defined value.
                                    exports = this.exports;
                                }
                            }
                            if (err) {
                                err.requireMap = this.map;
                                err.requireModules = this.map.isDefine ? [this.map.id] : null;
                                err.requireType = this.map.isDefine ? 'define' : 'require';
                                return onError((this.error = err));
                            }
                        }
                        else {
                            //Just a literal value
                            exports = factory;
                        }
                        this.exports = exports;
                        if (this.map.isDefine && !this.ignore) {
                            defined[id] = exports;
                            if (req.onResourceLoad) {
                                var resLoadMaps = [];
                                each(this.depMaps, function (depMap) {
                                    resLoadMaps.push(depMap.normalizedMap || depMap);
                                });
                                req.onResourceLoad(context, this.map, resLoadMaps);
                            }
                        }
                        //Clean up
                        cleanRegistry(id);
                        this.defined = true;
                    }
                    //Finished the define stage. Allow calling check again
                    //to allow define notifications below in the case of a
                    //cycle.
                    this.defining = false;
                    if (this.defined && !this.defineEmitted) {
                        this.defineEmitted = true;
                        this.emit('defined', this.exports);
                        this.defineEmitComplete = true;
                    }
                }
            },
            callPlugin: function () {
                var map = this.map, id = map.id, 
                //Map already normalized the prefix.
                pluginMap = makeModuleMap(map.prefix);
                //Mark this as a dependency for this plugin, so it
                //can be traced for cycles.
                this.depMaps.push(pluginMap);
                on(pluginMap, 'defined', bind(this, function (plugin) {
                    var load, normalizedMap, normalizedMod, bundleId = getOwn(bundlesMap, this.map.id), name = this.map.name, parentName = this.map.parentMap ? this.map.parentMap.name : null, localRequire = context.makeRequire(map.parentMap, {
                        enableBuildCallback: true
                    });
                    //If current map is not normalized, wait for that
                    //normalized name to load instead of continuing.
                    if (this.map.unnormalized) {
                        //Normalize the ID if the plugin allows it.
                        if (plugin.normalize) {
                            name = plugin.normalize(name, function (name) {
                                return normalize(name, parentName, true);
                            }) || '';
                        }
                        //prefix and name should already be normalized, no need
                        //for applying map config again either.
                        normalizedMap = makeModuleMap(map.prefix + '!' + name, this.map.parentMap, true);
                        on(normalizedMap, 'defined', bind(this, function (value) {
                            this.map.normalizedMap = normalizedMap;
                            this.init([], function () { return value; }, null, {
                                enabled: true,
                                ignore: true
                            });
                        }));
                        normalizedMod = getOwn(registry, normalizedMap.id);
                        if (normalizedMod) {
                            //Mark this as a dependency for this plugin, so it
                            //can be traced for cycles.
                            this.depMaps.push(normalizedMap);
                            if (this.events.error) {
                                normalizedMod.on('error', bind(this, function (err) {
                                    this.emit('error', err);
                                }));
                            }
                            normalizedMod.enable();
                        }
                        return;
                    }
                    //If a paths config, then just load that file instead to
                    //resolve the plugin, as it is built into that paths layer.
                    if (bundleId) {
                        this.map.url = context.nameToUrl(bundleId);
                        this.load();
                        return;
                    }
                    load = bind(this, function (value) {
                        this.init([], function () { return value; }, null, {
                            enabled: true
                        });
                    });
                    load.error = bind(this, function (err) {
                        this.inited = true;
                        this.error = err;
                        err.requireModules = [id];
                        //Remove temp unnormalized modules for this module,
                        //since they will never be resolved otherwise now.
                        eachProp(registry, function (mod) {
                            if (mod.map.id.indexOf(id + '_unnormalized') === 0) {
                                cleanRegistry(mod.map.id);
                            }
                        });
                        onError(err);
                    });
                    //Allow plugins to load other code without having to know the
                    //context or how to 'complete' the load.
                    load.fromText = bind(this, function (text, textAlt) {
                        /*jslint evil: true */
                        var moduleName = map.name, moduleMap = makeModuleMap(moduleName), hasInteractive = useInteractive;
                        //As of 2.1.0, support just passing the text, to reinforce
                        //fromText only being called once per resource. Still
                        //support old style of passing moduleName but discard
                        //that moduleName in favor of the internal ref.
                        if (textAlt) {
                            text = textAlt;
                        }
                        //Turn off interactive script matching for IE for any define
                        //calls in the text, then turn it back on at the end.
                        if (hasInteractive) {
                            useInteractive = false;
                        }
                        //Prime the system by creating a module instance for
                        //it.
                        getModule(moduleMap);
                        //Transfer any config to this other module.
                        if (hasProp(config.config, id)) {
                            config.config[moduleName] = config.config[id];
                        }
                        try {
                            req.exec(text);
                        }
                        catch (e) {
                            return onError(makeError('fromtexteval', 'fromText eval for ' + id +
                                ' failed: ' + e, e, [id]));
                        }
                        if (hasInteractive) {
                            useInteractive = true;
                        }
                        //Mark this as a dependency for the plugin
                        //resource
                        this.depMaps.push(moduleMap);
                        //Support anonymous modules.
                        context.completeLoad(moduleName);
                        //Bind the value of that module to the value for this
                        //resource ID.
                        localRequire([moduleName], load);
                    });
                    //Use parentName here since the plugin's name is not reliable,
                    //could be some weird string with no path that actually wants to
                    //reference the parentName's path.
                    plugin.load(map.name, localRequire, load, config);
                }));
                context.enable(pluginMap, this);
                this.pluginMaps[pluginMap.id] = pluginMap;
            },
            enable: function () {
                enabledRegistry[this.map.id] = this;
                this.enabled = true;
                //Set flag mentioning that the module is enabling,
                //so that immediate calls to the defined callbacks
                //for dependencies do not trigger inadvertent load
                //with the depCount still being zero.
                this.enabling = true;
                //Enable each dependency
                each(this.depMaps, bind(this, function (depMap, i) {
                    var id, mod, handler;
                    if (typeof depMap === 'string') {
                        //Dependency needs to be converted to a depMap
                        //and wired up to this module.
                        depMap = makeModuleMap(depMap, (this.map.isDefine ? this.map : this.map.parentMap), false, !this.skipMap);
                        this.depMaps[i] = depMap;
                        handler = getOwn(handlers, depMap.id);
                        if (handler) {
                            this.depExports[i] = handler(this);
                            return;
                        }
                        this.depCount += 1;
                        on(depMap, 'defined', bind(this, function (depExports) {
                            if (this.undefed) {
                                return;
                            }
                            this.defineDep(i, depExports);
                            this.check();
                        }));
                        if (this.errback) {
                            on(depMap, 'error', bind(this, this.errback));
                        }
                        else if (this.events.error) {
                            // No direct errback on this module, but something
                            // else is listening for errors, so be sure to
                            // propagate the error correctly.
                            on(depMap, 'error', bind(this, function (err) {
                                this.emit('error', err);
                            }));
                        }
                    }
                    id = depMap.id;
                    mod = registry[id];
                    //Skip special modules like 'require', 'exports', 'module'
                    //Also, don't call enable if it is already enabled,
                    //important in circular dependency cases.
                    if (!hasProp(handlers, id) && mod && !mod.enabled) {
                        context.enable(depMap, this);
                    }
                }));
                //Enable each plugin that is used in
                //a dependency
                eachProp(this.pluginMaps, bind(this, function (pluginMap) {
                    var mod = getOwn(registry, pluginMap.id);
                    if (mod && !mod.enabled) {
                        context.enable(pluginMap, this);
                    }
                }));
                this.enabling = false;
                this.check();
            },
            on: function (name, cb) {
                var cbs = this.events[name];
                if (!cbs) {
                    cbs = this.events[name] = [];
                }
                cbs.push(cb);
            },
            emit: function (name, evt) {
                each(this.events[name], function (cb) {
                    cb(evt);
                });
                if (name === 'error') {
                    //Now that the error handler was triggered, remove
                    //the listeners, since this broken Module instance
                    //can stay around for a while in the registry.
                    delete this.events[name];
                }
            }
        };
        function callGetModule(args) {
            //Skip modules already defined.
            if (!hasProp(defined, args[0])) {
                getModule(makeModuleMap(args[0], null, true)).init(args[1], args[2]);
            }
        }
        function removeListener(node, func, name, ieName) {
            //Favor detachEvent because of IE9
            //issue, see attachEvent/addEventListener comment elsewhere
            //in this file.
            if (node.detachEvent && !isOpera) {
                //Probably IE. If not it will throw an error, which will be
                //useful to know.
                if (ieName) {
                    node.detachEvent(ieName, func);
                }
            }
            else {
                node.removeEventListener(name, func, false);
            }
        }
        /**
         * Given an event from a script node, get the requirejs info from it,
         * and then removes the event listeners on the node.
         * @param {Event} evt
         * @returns {Object}
         */
        function getScriptData(evt) {
            //Using currentTarget instead of target for Firefox 2.0's sake. Not
            //all old browsers will be supported, but this one was easy enough
            //to support and still makes sense.
            var node = evt.currentTarget || evt.srcElement;
            //Remove the listeners once here.
            removeListener(node, context.onScriptLoad, 'load', 'onreadystatechange');
            removeListener(node, context.onScriptError, 'error');
            return {
                node: node,
                id: node && node.getAttribute('data-requiremodule')
            };
        }
        function intakeDefines() {
            var args;
            //Any defined modules in the global queue, intake them now.
            takeGlobalQueue();
            //Make sure any remaining defQueue items get properly processed.
            while (defQueue.length) {
                args = defQueue.shift();
                if (args[0] === null) {
                    return onError(makeError('mismatch', 'Mismatched anonymous define() module: ' +
                        args[args.length - 1]));
                }
                else {
                    //args are id, deps, factory. Should be normalized by the
                    //define() function.
                    callGetModule(args);
                }
            }
            context.defQueueMap = {};
        }
        context = {
            config: config,
            contextName: contextName,
            registry: registry,
            defined: defined,
            urlFetched: urlFetched,
            defQueue: defQueue,
            defQueueMap: {},
            Module: Module,
            makeModuleMap: makeModuleMap,
            nextTick: req.nextTick,
            onError: onError,
            /**
             * Set a configuration for the context.
             * @param {Object} cfg config object to integrate.
             */
            configure: function (cfg) {
                //Make sure the baseUrl ends in a slash.
                if (cfg.baseUrl) {
                    if (cfg.baseUrl.charAt(cfg.baseUrl.length - 1) !== '/') {
                        cfg.baseUrl += '/';
                    }
                }
                // Convert old style urlArgs string to a function.
                if (typeof cfg.urlArgs === 'string') {
                    var urlArgs = cfg.urlArgs;
                    cfg.urlArgs = function (id, url) {
                        return (url.indexOf('?') === -1 ? '?' : '&') + urlArgs;
                    };
                }
                //Save off the paths since they require special processing,
                //they are additive.
                var shim = config.shim, objs = {
                    paths: true,
                    bundles: true,
                    config: true,
                    map: true
                };
                eachProp(cfg, function (value, prop) {
                    if (objs[prop]) {
                        if (!config[prop]) {
                            config[prop] = {};
                        }
                        mixin(config[prop], value, true, true);
                    }
                    else {
                        config[prop] = value;
                    }
                });
                //Reverse map the bundles
                if (cfg.bundles) {
                    eachProp(cfg.bundles, function (value, prop) {
                        each(value, function (v) {
                            if (v !== prop) {
                                bundlesMap[v] = prop;
                            }
                        });
                    });
                }
                //Merge shim
                if (cfg.shim) {
                    eachProp(cfg.shim, function (value, id) {
                        //Normalize the structure
                        if (isArray(value)) {
                            value = {
                                deps: value
                            };
                        }
                        if ((value.exports || value.init) && !value.exportsFn) {
                            value.exportsFn = context.makeShimExports(value);
                        }
                        shim[id] = value;
                    });
                    config.shim = shim;
                }
                //Adjust packages if necessary.
                if (cfg.packages) {
                    each(cfg.packages, function (pkgObj) {
                        var location, name;
                        pkgObj = typeof pkgObj === 'string' ? { name: pkgObj } : pkgObj;
                        name = pkgObj.name;
                        location = pkgObj.location;
                        if (location) {
                            config.paths[name] = pkgObj.location;
                        }
                        //Save pointer to main module ID for pkg name.
                        //Remove leading dot in main, so main paths are normalized,
                        //and remove any trailing .js, since different package
                        //envs have different conventions: some use a module name,
                        //some use a file name.
                        config.pkgs[name] = pkgObj.name + '/' + (pkgObj.main || 'main')
                            .replace(currDirRegExp, '')
                            .replace(jsSuffixRegExp, '');
                    });
                }
                //If there are any "waiting to execute" modules in the registry,
                //update the maps for them, since their info, like URLs to load,
                //may have changed.
                eachProp(registry, function (mod, id) {
                    //If module already has init called, since it is too
                    //late to modify them, and ignore unnormalized ones
                    //since they are transient.
                    if (!mod.inited && !mod.map.unnormalized) {
                        mod.map = makeModuleMap(id, null, true);
                    }
                });
                //If a deps array or a config callback is specified, then call
                //require with those args. This is useful when require is defined as a
                //config object before require.js is loaded.
                if (cfg.deps || cfg.callback) {
                    context.require(cfg.deps || [], cfg.callback);
                }
            },
            makeShimExports: function (value) {
                function fn() {
                    var ret;
                    if (value.init) {
                        ret = value.init.apply(global, arguments);
                    }
                    return ret || (value.exports && getGlobal(value.exports));
                }
                return fn;
            },
            makeRequire: function (relMap, options) {
                options = options || {};
                function localRequire(deps, callback, errback) {
                    var id, map, requireMod;
                    if (options.enableBuildCallback && callback && isFunction(callback)) {
                        callback.__requireJsBuild = true;
                    }
                    if (typeof deps === 'string') {
                        if (isFunction(callback)) {
                            //Invalid call
                            return onError(makeError('requireargs', 'Invalid require call'), errback);
                        }
                        //If require|exports|module are requested, get the
                        //value for them from the special handlers. Caveat:
                        //this only works while module is being defined.
                        if (relMap && hasProp(handlers, deps)) {
                            return handlers[deps](registry[relMap.id]);
                        }
                        //Synchronous access to one module. If require.get is
                        //available (as in the Node adapter), prefer that.
                        if (req.get) {
                            return req.get(context, deps, relMap, localRequire);
                        }
                        //Normalize module name, if it contains . or ..
                        map = makeModuleMap(deps, relMap, false, true);
                        id = map.id;
                        if (!hasProp(defined, id)) {
                            return onError(makeError('notloaded', 'Module name "' +
                                id +
                                '" has not been loaded yet for context: ' +
                                contextName +
                                (relMap ? '' : '. Use require([])')));
                        }
                        return defined[id];
                    }
                    //Grab defines waiting in the global queue.
                    intakeDefines();
                    //Mark all the dependencies as needing to be loaded.
                    context.nextTick(function () {
                        //Some defines could have been added since the
                        //require call, collect them.
                        intakeDefines();
                        requireMod = getModule(makeModuleMap(null, relMap));
                        //Store if map config should be applied to this require
                        //call for dependencies.
                        requireMod.skipMap = options.skipMap;
                        requireMod.init(deps, callback, errback, {
                            enabled: true
                        });
                        checkLoaded();
                    });
                    return localRequire;
                }
                mixin(localRequire, {
                    isBrowser: isBrowser,
                    /**
                     * Converts a module name + .extension into an URL path.
                     * *Requires* the use of a module name. It does not support using
                     * plain URLs like nameToUrl.
                     */
                    toUrl: function (moduleNamePlusExt) {
                        var ext, index = moduleNamePlusExt.lastIndexOf('.'), segment = moduleNamePlusExt.split('/')[0], isRelative = segment === '.' || segment === '..';
                        //Have a file extension alias, and it is not the
                        //dots from a relative path.
                        if (index !== -1 && (!isRelative || index > 1)) {
                            ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length);
                            moduleNamePlusExt = moduleNamePlusExt.substring(0, index);
                        }
                        return context.nameToUrl(normalize(moduleNamePlusExt, relMap && relMap.id, true), ext, true);
                    },
                    defined: function (id) {
                        return hasProp(defined, makeModuleMap(id, relMap, false, true).id);
                    },
                    specified: function (id) {
                        id = makeModuleMap(id, relMap, false, true).id;
                        return hasProp(defined, id) || hasProp(registry, id);
                    }
                });
                //Only allow undef on top level require calls
                if (!relMap) {
                    localRequire.undef = function (id) {
                        //Bind any waiting define() calls to this context,
                        //fix for #408
                        takeGlobalQueue();
                        var map = makeModuleMap(id, relMap, true), mod = getOwn(registry, id);
                        mod.undefed = true;
                        removeScript(id);
                        delete defined[id];
                        delete urlFetched[map.url];
                        delete undefEvents[id];
                        //Clean queued defines too. Go backwards
                        //in array so that the splices do not
                        //mess up the iteration.
                        eachReverse(defQueue, function (args, i) {
                            if (args[0] === id) {
                                defQueue.splice(i, 1);
                            }
                        });
                        delete context.defQueueMap[id];
                        if (mod) {
                            //Hold on to listeners in case the
                            //module will be attempted to be reloaded
                            //using a different config.
                            if (mod.events.defined) {
                                undefEvents[id] = mod.events;
                            }
                            cleanRegistry(id);
                        }
                    };
                }
                return localRequire;
            },
            /**
             * Called to enable a module if it is still in the registry
             * awaiting enablement. A second arg, parent, the parent module,
             * is passed in for context, when this method is overridden by
             * the optimizer. Not shown here to keep code compact.
             */
            enable: function (depMap) {
                var mod = getOwn(registry, depMap.id);
                if (mod) {
                    getModule(depMap).enable();
                }
            },
            /**
             * Internal method used by environment adapters to complete a load event.
             * A load event could be a script load or just a load pass from a synchronous
             * load call.
             * @param {String} moduleName the name of the module to potentially complete.
             */
            completeLoad: function (moduleName) {
                var found, args, mod, shim = getOwn(config.shim, moduleName) || {}, shExports = shim.exports;
                takeGlobalQueue();
                while (defQueue.length) {
                    args = defQueue.shift();
                    if (args[0] === null) {
                        args[0] = moduleName;
                        //If already found an anonymous module and bound it
                        //to this name, then this is some other anon module
                        //waiting for its completeLoad to fire.
                        if (found) {
                            break;
                        }
                        found = true;
                    }
                    else if (args[0] === moduleName) {
                        //Found matching define call for this script!
                        found = true;
                    }
                    callGetModule(args);
                }
                context.defQueueMap = {};
                //Do this after the cycle of callGetModule in case the result
                //of those calls/init calls changes the registry.
                mod = getOwn(registry, moduleName);
                if (!found && !hasProp(defined, moduleName) && mod && !mod.inited) {
                    if (config.enforceDefine && (!shExports || !getGlobal(shExports))) {
                        if (hasPathFallback(moduleName)) {
                            return;
                        }
                        else {
                            return onError(makeError('nodefine', 'No define call for ' + moduleName, null, [moduleName]));
                        }
                    }
                    else {
                        //A script that does not call define(), so just simulate
                        //the call for it.
                        callGetModule([moduleName, (shim.deps || []), shim.exportsFn]);
                    }
                }
                checkLoaded();
            },
            /**
             * Converts a module name to a file path. Supports cases where
             * moduleName may actually be just an URL.
             * Note that it **does not** call normalize on the moduleName,
             * it is assumed to have already been normalized. This is an
             * internal API, not a public one. Use toUrl for the public API.
             */
            nameToUrl: function (moduleName, ext, skipExt) {
                var paths, syms, i, parentModule, url, parentPath, bundleId, pkgMain = getOwn(config.pkgs, moduleName);
                if (pkgMain) {
                    moduleName = pkgMain;
                }
                bundleId = getOwn(bundlesMap, moduleName);
                if (bundleId) {
                    return context.nameToUrl(bundleId, ext, skipExt);
                }
                //If a colon is in the URL, it indicates a protocol is used and it is just
                //an URL to a file, or if it starts with a slash, contains a query arg (i.e. ?)
                //or ends with .js, then assume the user meant to use an url and not a module id.
                //The slash is important for protocol-less URLs as well as full paths.
                if (req.jsExtRegExp.test(moduleName)) {
                    //Just a plain path, not module name lookup, so just return it.
                    //Add extension if it is included. This is a bit wonky, only non-.js things pass
                    //an extension, this method probably needs to be reworked.
                    url = moduleName + (ext || '');
                }
                else {
                    //A module that needs to be converted to a path.
                    paths = config.paths;
                    syms = moduleName.split('/');
                    //For each module name segment, see if there is a path
                    //registered for it. Start with most specific name
                    //and work up from it.
                    for (i = syms.length; i > 0; i -= 1) {
                        parentModule = syms.slice(0, i).join('/');
                        parentPath = getOwn(paths, parentModule);
                        if (parentPath) {
                            //If an array, it means there are a few choices,
                            //Choose the one that is desired
                            if (isArray(parentPath)) {
                                parentPath = parentPath[0];
                            }
                            syms.splice(0, i, parentPath);
                            break;
                        }
                    }
                    //Join the path parts together, then figure out if baseUrl is needed.
                    url = syms.join('/');
                    url += (ext || (/^data\:|^blob\:|\?/.test(url) || skipExt ? '' : '.js'));
                    url = (url.charAt(0) === '/' || url.match(/^[\w\+\.\-]+:/) ? '' : config.baseUrl) + url;
                }
                return config.urlArgs && !/^blob\:/.test(url) ?
                    url + config.urlArgs(moduleName, url) : url;
            },
            //Delegates to req.load. Broken out as a separate function to
            //allow overriding in the optimizer.
            load: function (id, url) {
                req.load(context, id, url);
            },
            /**
             * Executes a module callback function. Broken out as a separate function
             * solely to allow the build system to sequence the files in the built
             * layer in the right sequence.
             *
             * @private
             */
            execCb: function (name, callback, args, exports) {
                return callback.apply(exports, args);
            },
            /**
             * callback for script loads, used to check status of loading.
             *
             * @param {Event} evt the event from the browser for the script
             * that was loaded.
             */
            onScriptLoad: function (evt) {
                //Using currentTarget instead of target for Firefox 2.0's sake. Not
                //all old browsers will be supported, but this one was easy enough
                //to support and still makes sense.
                if (evt.type === 'load' ||
                    (readyRegExp.test((evt.currentTarget || evt.srcElement).readyState))) {
                    //Reset interactive script so a script node is not held onto for
                    //to long.
                    interactiveScript = null;
                    //Pull out the name of the module and the context.
                    var data = getScriptData(evt);
                    context.completeLoad(data.id);
                }
            },
            /**
             * Callback for script errors.
             */
            onScriptError: function (evt) {
                var data = getScriptData(evt);
                if (!hasPathFallback(data.id)) {
                    var parents = [];
                    eachProp(registry, function (value, key) {
                        if (key.indexOf('_@r') !== 0) {
                            each(value.depMaps, function (depMap) {
                                if (depMap.id === data.id) {
                                    parents.push(key);
                                    return true;
                                }
                            });
                        }
                    });
                    return onError(makeError('scripterror', 'Script error for "' + data.id +
                        (parents.length ?
                            '", needed by: ' + parents.join(', ') :
                            '"'), evt, [data.id]));
                }
            }
        };
        context.require = context.makeRequire();
        return context;
    }
    /**
     * Main entry point.
     *
     * If the only argument to require is a string, then the module that
     * is represented by that string is fetched for the appropriate context.
     *
     * If the first argument is an array, then it will be treated as an array
     * of dependency string names to fetch. An optional function callback can
     * be specified to execute when all of those dependencies are available.
     *
     * Make a local req variable to help Caja compliance (it assumes things
     * on a require that are not standardized), and to give a short
     * name for minification/local scope use.
     */
    req = requirejs = function (deps, callback, errback, optional) {
        //Find the right context, use default
        var context, config, contextName = defContextName;
        // Determine if have config object in the call.
        if (!isArray(deps) && typeof deps !== 'string') {
            // deps is a config object
            config = deps;
            if (isArray(callback)) {
                // Adjust args if there are dependencies
                deps = callback;
                callback = errback;
                errback = optional;
            }
            else {
                deps = [];
            }
        }
        if (config && config.context) {
            contextName = config.context;
        }
        context = getOwn(contexts, contextName);
        if (!context) {
            context = contexts[contextName] = req.s.newContext(contextName);
        }
        if (config) {
            context.configure(config);
        }
        return context.require(deps, callback, errback);
    };
    /**
     * Support require.config() to make it easier to cooperate with other
     * AMD loaders on globally agreed names.
     */
    req.config = function (config) {
        return req(config);
    };
    /**
     * Execute something after the current tick
     * of the event loop. Override for other envs
     * that have a better solution than setTimeout.
     * @param  {Function} fn function to execute later.
     */
    req.nextTick = typeof setTimeout !== 'undefined' ? function (fn) {
        setTimeout(fn, 4);
    } : function (fn) { fn(); };
    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (!require) {
        require = req;
    }
    req.version = version;
    //Used to filter out dependencies that are already paths.
    req.jsExtRegExp = /^\/|:|\?|\.js$/;
    req.isBrowser = isBrowser;
    s = req.s = {
        contexts: contexts,
        newContext: newContext
    };
    //Create default context.
    req({});
    //Exports some context-sensitive methods on global require.
    each([
        'toUrl',
        'undef',
        'defined',
        'specified'
    ], function (prop) {
        //Reference from contexts instead of early binding to default context,
        //so that during builds, the latest instance of the default context
        //with its config gets used.
        req[prop] = function () {
            var ctx = contexts[defContextName];
            return ctx.require[prop].apply(ctx, arguments);
        };
    });
    if (isBrowser) {
        head = s.head = document.getElementsByTagName('head')[0];
        //If BASE tag is in play, using appendChild is a problem for IE6.
        //When that browser dies, this can be removed. Details in this jQuery bug:
        //http://dev.jquery.com/ticket/2709
        baseElement = document.getElementsByTagName('base')[0];
        if (baseElement) {
            head = s.head = baseElement.parentNode;
        }
    }
    /**
     * Any errors that require explicitly generates will be passed to this
     * function. Intercept/override it if you want custom error handling.
     * @param {Error} err the error object.
     */
    req.onError = defaultOnError;
    /**
     * Creates the node for the load command. Only used in browser envs.
     */
    req.createNode = function (config, moduleName, url) {
        var node = config.xhtml ?
            document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
            document.createElement('script');
        node.type = config.scriptType || 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;
        return node;
    };
    /**
     * Does the request to load a module for the browser case.
     * Make this a separate function to allow other environments
     * to override it.
     *
     * @param {Object} context the require context to find state.
     * @param {String} moduleName the name of the module.
     * @param {Object} url the URL to the module.
     */
    req.load = function (context, moduleName, url) {
        var config = (context && context.config) || {}, node;
        if (isBrowser) {
            //In the browser so use a script tag
            node = req.createNode(config, moduleName, url);
            node.setAttribute('data-requirecontext', context.contextName);
            node.setAttribute('data-requiremodule', moduleName);
            //Set up load listener. Test attachEvent first because IE9 has
            //a subtle issue in its addEventListener and script onload firings
            //that do not match the behavior of all other browsers with
            //addEventListener support, which fire the onload event for a
            //script right after the script execution. See:
            //https://connect.microsoft.com/IE/feedback/details/648057/script-onload-event-is-not-fired-immediately-after-script-execution
            //UNFORTUNATELY Opera implements attachEvent but does not follow the script
            //script execution mode.
            if (node.attachEvent &&
                //Check if node.attachEvent is artificially added by custom script or
                //natively supported by browser
                //read https://github.com/requirejs/requirejs/issues/187
                //if we can NOT find [native code] then it must NOT natively supported.
                //in IE8, node.attachEvent does not have toString()
                //Note the test for "[native code" with no closing brace, see:
                //https://github.com/requirejs/requirejs/issues/273
                !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) &&
                !isOpera) {
                //Probably IE. IE (at least 6-8) do not fire
                //script onload right after executing the script, so
                //we cannot tie the anonymous define call to a name.
                //However, IE reports the script as being in 'interactive'
                //readyState at the time of the define call.
                useInteractive = true;
                node.attachEvent('onreadystatechange', context.onScriptLoad);
                //It would be great to add an error handler here to catch
                //404s in IE9+. However, onreadystatechange will fire before
                //the error handler, so that does not help. If addEventListener
                //is used, then IE will fire error before load, but we cannot
                //use that pathway given the connect.microsoft.com issue
                //mentioned above about not doing the 'script execute,
                //then fire the script load event listener before execute
                //next script' that other browsers do.
                //Best hope: IE10 fixes the issues,
                //and then destroys all installs of IE 6-9.
                //node.attachEvent('onerror', context.onScriptError);
            }
            else {
                node.addEventListener('load', context.onScriptLoad, false);
                node.addEventListener('error', context.onScriptError, false);
            }
            node.src = url;
            //Calling onNodeCreated after all properties on the node have been
            //set, but before it is placed in the DOM.
            if (config.onNodeCreated) {
                config.onNodeCreated(node, config, moduleName, url);
            }
            //For some cache cases in IE 6-8, the script executes before the end
            //of the appendChild execution, so to tie an anonymous define
            //call to the module name (which is stored on the node), hold on
            //to a reference to this node, but clear after the DOM insertion.
            currentlyAddingScript = node;
            if (baseElement) {
                head.insertBefore(node, baseElement);
            }
            else {
                head.appendChild(node);
            }
            currentlyAddingScript = null;
            return node;
        }
        else if (isWebWorker) {
            try {
                //In a web worker, use importScripts. This is not a very
                //efficient use of importScripts, importScripts will block until
                //its script is downloaded and evaluated. However, if web workers
                //are in play, the expectation is that a build has been done so
                //that only one script needs to be loaded anyway. This may need
                //to be reevaluated if other use cases become common.
                // Post a task to the event loop to work around a bug in WebKit
                // where the worker gets garbage-collected after calling
                // importScripts(): https://webkit.org/b/153317
                setTimeout(function () { }, 0);
                importScripts(url);
                //Account for anonymous modules
                context.completeLoad(moduleName);
            }
            catch (e) {
                context.onError(makeError('importscripts', 'importScripts failed for ' +
                    moduleName + ' at ' + url, e, [moduleName]));
            }
        }
    };
    function getInteractiveScript() {
        if (interactiveScript && interactiveScript.readyState === 'interactive') {
            return interactiveScript;
        }
        eachReverse(scripts(), function (script) {
            if (script.readyState === 'interactive') {
                return (interactiveScript = script);
            }
        });
        return interactiveScript;
    }
    //Look for a data-main script attribute, which could also adjust the baseUrl.
    if (isBrowser && !cfg.skipDataMain) {
        //Figure out baseUrl. Get it from the script tag with require.js in it.
        eachReverse(scripts(), function (script) {
            //Set the 'head' where we can append children by
            //using the script's parent.
            if (!head) {
                head = script.parentNode;
            }
            //Look for a data-main attribute to set main script for the page
            //to load. If it is there, the path to data main becomes the
            //baseUrl, if it is not already set.
            dataMain = script.getAttribute('data-main');
            if (dataMain) {
                //Preserve dataMain in case it is a path (i.e. contains '?')
                mainScript = dataMain;
                //Set final baseUrl if there is not already an explicit one,
                //but only do so if the data-main value is not a loader plugin
                //module ID.
                if (!cfg.baseUrl && mainScript.indexOf('!') === -1) {
                    //Pull off the directory of data-main for use as the
                    //baseUrl.
                    src = mainScript.split('/');
                    mainScript = src.pop();
                    subPath = src.length ? src.join('/') + '/' : './';
                    cfg.baseUrl = subPath;
                }
                //Strip off any trailing .js since mainScript is now
                //like a module name.
                mainScript = mainScript.replace(jsSuffixRegExp, '');
                //If mainScript is still a path, fall back to dataMain
                if (req.jsExtRegExp.test(mainScript)) {
                    mainScript = dataMain;
                }
                //Put the data-main script in the files to load.
                cfg.deps = cfg.deps ? cfg.deps.concat(mainScript) : [mainScript];
                return true;
            }
        });
    }
    /**
     * The function that handles definitions of modules. Differs from
     * require() in that a string for the module should be the first argument,
     * and the function to execute after dependencies are loaded should
     * return a value to define the module corresponding to the first argument's
     * name.
     */
    define = function (name, deps, callback) {
        var node, context;
        //Allow for anonymous modules
        if (typeof name !== 'string') {
            //Adjust args appropriately
            callback = deps;
            deps = name;
            name = null;
        }
        //This module may not have dependencies
        if (!isArray(deps)) {
            callback = deps;
            deps = null;
        }
        //If no name, and callback is a function, then figure out if it a
        //CommonJS thing with dependencies.
        if (!deps && isFunction(callback)) {
            deps = [];
            //Remove comments from the callback string,
            //look for require calls, and pull them into the dependencies,
            //but only if there are function args.
            if (callback.length) {
                callback
                    .toString()
                    .replace(commentRegExp, commentReplace)
                    .replace(cjsRequireRegExp, function (match, dep) {
                    deps.push(dep);
                });
                //May be a CommonJS thing even without require calls, but still
                //could use exports, and module. Avoid doing exports and module
                //work though if it just needs require.
                //REQUIRES the function to expect the CommonJS variables in the
                //order listed below.
                deps = (callback.length === 1 ? ['require'] : ['require', 'exports', 'module']).concat(deps);
            }
        }
        //If in IE 6-8 and hit an anonymous define() call, do the interactive
        //work.
        if (useInteractive) {
            node = currentlyAddingScript || getInteractiveScript();
            if (node) {
                if (!name) {
                    name = node.getAttribute('data-requiremodule');
                }
                context = contexts[node.getAttribute('data-requirecontext')];
            }
        }
        //Always save off evaluating the def call until the script onload handler.
        //This allows multiple modules to be in a file without prematurely
        //tracing dependencies, and allows for anonymous module support,
        //where the module name is not known until the script onload event
        //occurs. If no context, use the global queue, and get it processed
        //in the onscript load callback.
        if (context) {
            context.defQueue.push([name, deps, callback]);
            context.defQueueMap[name] = true;
        }
        else {
            globalDefQueue.push([name, deps, callback]);
        }
    };
    define.amd = {
        jQuery: true
    };
    /**
     * Executes the text. Normally just uses eval, but can be modified
     * to use a better, environment-specific call. Only used for transpiling
     * loader plugins, not for plain JS modules.
     * @param {String} text the text to execute/evaluate.
     */
    req.exec = function (text) {
        /*jslint evil: true */
        return eval(text);
    };
    //Set up with config info.
    req(cfg);
}(this, (typeof setTimeout === 'undefined' ? undefined : setTimeout)));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWlyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wdWJsaWMvamF2YXNjcmlwdHMvcmVxdWlyZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBOzs7R0FHRztBQUNILHVFQUF1RTtBQUN2RSwyRUFBMkU7QUFDM0UsbURBQW1EO0FBQ25ELHlFQUF5RTtBQUN6RSxpRUFBaUU7QUFDakUsSUFBSSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQztBQUMvQixDQUFDLFVBQVUsTUFBTSxFQUFFLFVBQVU7SUFDekIsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sR0FBRyxPQUFPLEVBQUUsYUFBYSxHQUFHLHVDQUF1QyxFQUFFLGdCQUFnQixHQUFHLGdEQUFnRCxFQUFFLGNBQWMsR0FBRyxPQUFPLEVBQUUsYUFBYSxHQUFHLE9BQU8sRUFBRSxFQUFFLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxPQUFPLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLGNBQWMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsV0FBVyxHQUFHLENBQUMsU0FBUyxJQUFJLE9BQU8sYUFBYSxLQUFLLFdBQVc7SUFDamlCLGtFQUFrRTtJQUNsRSwyREFBMkQ7SUFDM0QsaUVBQWlFO0lBQ2pFLDBDQUEwQztJQUMxQyxXQUFXLEdBQUcsU0FBUyxJQUFJLFNBQVMsQ0FBQyxRQUFRLEtBQUssZUFBZSxDQUFDLENBQUM7UUFDL0QsWUFBWSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsRUFBRSxjQUFjLEdBQUcsR0FBRztJ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