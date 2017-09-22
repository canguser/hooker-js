/**
 * ---------------------------
 * Time: 2017/9/20 18:33.
 * Author: Cangshi
 * View: http://palerock.cn
 * ---------------------------
 */
'use strict';
~function (utils) {
    var _global = this;
    var EHook = function () {
        var _autoId = 1;
        var _hookedMap = {};
        this._getHookedMap = function () {
            return _hookedMap;
        };
        this._getAutoStrId = function () {
            return '__auto__' + _autoId++;
        };
        this._getAutoId = function () {
            return _autoId++;
        }
    };
    EHook.prototype = {
        /**
         * 获取一个对象的劫持id，若没有则创建一个
         * @param context
         * @return {*}
         * @private
         */
        _getHookedId: function (context) {
            var hookedId = context.___hookedId;
            if (hookedId == null) {
                hookedId = context.___hookedId = this._getAutoStrId();
            }
            return hookedId;
        },
        /**
         * 获取一个对象的劫持方法映射，若没有则创建一个
         * @param context
         * @return {*}
         * @private
         */
        _getHookedMethodMap: function (context) {
            var hookedId = this._getHookedId(context);
            var hookedMap = this._getHookedMap();
            var thisTask = hookedMap[hookedId];
            if (!utils.isExistObject(thisTask)) {
                thisTask = hookedMap[hookedId] = {};
            }
            return thisTask;
        },
        /**
         * 获取对应方法的hook原型任务对象，若没有则初始化一个。
         * @param context
         * @param methodName
         * @private
         */
        _getHookedMethodTask: function (context, methodName) {
            var thisMethodMap = this._getHookedMethodMap(context);
            var thisMethod = thisMethodMap[methodName];
            if (!utils.isExistObject(thisMethod)) {
                thisMethod = thisMethodMap[methodName] = {
                    original: undefined,
                    replace: undefined,
                    task: {
                        before: [],
                        current: undefined,
                        after: []
                    }
                };
            }
            return thisMethod;
        },
        /**
         * 执行多个方法并注入一个方法和参数集合
         * @param context
         * @param methods
         * @param args
         * @private
         */
        _invokeMethods: function (context, methods, args) {
            if (!utils.isArray(methods)) {
                return;
            }
            utils.ergodicArrayObject(context, methods, function (_method) {
                if (!utils.isFunction(_method.method)) {
                    return;
                }
                _method.method.apply(this, args);
            });
        },
        /**
         * 生成和替换劫持方法
         * @param parent
         * @param context
         * @param methodName {string}
         * @private
         */
        _hook: function (parent, methodName, context) {
            if (context === undefined) {
                context = parent
            }
            var method = parent[methodName];
            var methodTask = this._getHookedMethodTask(parent, methodName);
            if (!methodTask.original) {
                methodTask.original = method;
            }
            if (utils.isExistObject(methodTask.replace) && utils.isFunction(methodTask.replace.method)) {
                parent[methodName] = methodTask.replace.method(methodTask.original);
                return;
            }
            var invokeMethods = this._invokeMethods;
            // 组装劫持函数
            var methodStr = '(function(){\n';
            methodStr = methodStr + 'var result = undefined;\n';
            if (methodTask.task.before.length > 0) {
                methodStr = methodStr + 'invokeMethods(context, methodTask.task.before,[methodTask.original, arguments]);\n';
            }
            if (utils.isFunction(methodTask.task.current)) {
                methodStr = methodStr + 'result = methodTask.task.current.method.call(context, parent, methodTask.original, arguments);\n';
            } else {
                methodStr = methodStr + 'result = methodTask.original.apply(context, arguments);\n';
            }
            if (methodTask.task.after.length > 0) {
                methodStr = methodStr + 'var args = [];args.push(methodTask.original);args.push(arguments);args.push(result);\n';
                methodStr = methodStr + 'invokeMethods(context, methodTask.task.after, args);\n';
            }
            methodStr = methodStr + 'return result;\n})';
            // 绑定劫持函数
            parent[methodName] = eval(methodStr);
        },
        /**
         * 劫持一个方法
         * @param parent
         * @param methodName {string}
         * @param config
         */
        hook: function (parent, methodName, config) {
            var hookedFailure = -1;
            // 调用方法的上下文
            var context = config.context !== undefined ? config.context : parent;
            if (!parent[methodName] || !utils.isFunction(parent[methodName])) {
                return hookedFailure;
            }
            var methodTask = this._getHookedMethodTask(parent, methodName);
            var id = this._getAutoId();
            if (utils.isFunction(config.replace)) {
                methodTask.replace = {
                    id: id,
                    method: config.replace
                };
                hookedFailure = 0;
            }
            if (utils.isFunction(config.before)) {
                methodTask.task.before.push({
                    id: id,
                    method: config.before
                });
                hookedFailure = 0;
            }
            if (utils.isFunction(config.current)) {
                methodTask.task.current = {
                    id: id,
                    method: config.current
                };
                hookedFailure = 0;
            }
            if (utils.isFunction(config.after)) {
                methodTask.task.after.push({
                    id: id,
                    method: config.after
                });
                hookedFailure = 0;
            }
            if (hookedFailure === 0) {
                this._hook(parent, methodName, context);
                return id;
            } else {
                return hookedFailure;
            }

        },
        /**
         * 劫持替换一个方法
         * @param parent
         * @param context
         * @param methodName {string}
         * @param replace {function}
         * @return {number} 该次劫持的id
         */
        hookReplace: function (parent, methodName, replace, context) {
            return this.hook(parent, methodName, {
                replace: replace,
                context: context
            })
        },
        hookBefore: function (parent, methodName, before, context) {
            return this.hook(parent, methodName, {
                before: before,
                context: context
            })
        },
        hookCurrent: function (parent, methodName, current, context) {
            return this.hook(parent, methodName, {
                current: current,
                context: context
            })
        },
        hookAfter: function (parent, methodName, after, context) {
            return this.hook(parent, methodName, {
                after: after,
                context: context
            })
        },
        /**
         * 劫持全局ajax
         * @param methods {object} 劫持的方法
         * @return {*|number} 劫持的id
         */
        hookAjax: function (methods) {
            var _this = this;
            var hookMethod = function (methodName) {
                if (utils.isFunction(methods[methodName])) {
                    // 在执行方法之前hook原方法，除开on开头的方法
                    _this.hookBefore(this.xhr, methodName, methods[methodName]);
                }
                // 返回方法调用内部的xhr
                return this.xhr[methodName].bind(this.xhr);
            };
            var getFactory = function (attr) {
                return function () {
                    return this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this.xhr[attr];
                };
            };
            var setFactory = function (attr) {
                return function (f) {
                    var xhr = this.xhr;
                    if (attr.indexOf("on") !== 0) {
                        this[attr + "_"] = f;
                        return;
                    }
                    if (methods[attr]) {
                        xhr[attr] = function () {
                            f.apply(xhr, arguments);
                        };
                        // on方法在set时劫持
                        _this.hookBefore(xhr, attr, methods[attr]);
                    } else {
                        xhr[attr] = f;
                    }
                };
            };
            return this.hookReplace(_global, 'XMLHttpRequest', function (XMLHttpRequest) {
                return function () {
                    this.xhr = new XMLHttpRequest();
                    for (var propertyName in this.xhr) {
                        var property = this.xhr[propertyName];
                        if (utils.isFunction(property)) {
                            // hook 原方法
                            this[propertyName] = hookMethod.bind(this)(propertyName);
                        } else {
                            Object.defineProperty(this, propertyName, {
                                get: getFactory(propertyName),
                                set: setFactory(propertyName)
                            });
                        }
                    }
                };
            })
        },
        /**
         * 解除劫持
         * @param context 上下文
         * @param methodName 方法名
         * @param isDeeply {boolean=} 是否深度解除[默认为false]
         * @param eqId {number=} todo 解除指定id的劫持[可选]
         */
        unHook: function (context, methodName, isDeeply, eqId) {
            if (!context[methodName] || !utils.isFunction(context[methodName])) {
                return;
            }
            var methodTask = this._getHookedMethodTask(context, methodName);
            context[methodName] = methodTask.original;
            if (isDeeply) {
                delete this._getHookedMethodMap(context)[methodName];
            }
        }
    };
    var eHook = new EHook();
    var AHook = function () {
        this.isHooked = false;
        var autoId = 1;
        this._urlDispatcherList = [];
        this._getAutoId = function () {
            return autoId++;
        }
    };
    AHook.prototype = {
        /**
         * 执行配置列表中的指定方法组
         * @param xhr
         * @param methodName
         * @param args
         * @private
         */
        _invokeAimMethods: function (xhr, methodName, args) {
            var configs = utils.parseArrayByProperty(xhr.patcherList, 'config');
            var methods = [];
            utils.ergodicArrayObject(xhr, configs, function (config) {
                if (utils.isFunction(config[methodName])) {
                    methods.push(config[methodName]);
                }
            });
            utils.invokeMethods(xhr, methods, args);
        },
        /**
         * 根据url获取配置列表
         * @param url
         * @return {Array}
         * @private
         */
        _urlPatcher: function (url) {
            var patcherList = [];
            utils.ergodicArrayObject(this, this._urlDispatcherList, function (patcherMap, i) {
                if (utils.urlUtils.urlMatching(url, patcherMap.patcher)) {
                    patcherList.push(patcherMap);
                }
            });
            return patcherList;
        },
        /**
         * 根据xhr对象分发回调请求
         * @param xhr
         * @param fullUrl
         * @private
         */
        _xhrDispatcher: function (xhr, fullUrl) {
            var url = utils.urlUtils.getUrlWithoutParam(fullUrl);
            xhr.patcherList = this._urlPatcher(url);
        },
        /**
         * 解析open方法的参数
         * @param args
         * @private
         */
        _parseOpenArgs: function (args) {
            return {
                method: args[0],
                fullUrl: args[1],
                url: utils.urlUtils.getUrlWithoutParam(args[1]),
                params: utils.urlUtils.getParamFromUrl(args[1]),
                async: args[2]
            };
        },
        _rebuildOpenArgs: function (argsObject, argsArray) {
            argsArray[0] = argsObject.method;
            argsArray[1] = utils.urlUtils.margeUrlAndParams(argsObject.url, argsObject.params);
            argsArray[2] = argsObject.async;
        },
        /**
         * 手动开始劫持
         */
        startHook: function () {
            var _this = this;
            var _getHookedArgs = function (args) {
                // 获取劫持方法的参数 [原方法,原方法参数,原方法返回值]
                // 将参数中'原方法'剔除
                return Array.prototype.slice.call(args, 0).splice(1);
            };
            var normalMethods = {
                // 拦截响应
                onreadystatechange: function () {
                    if (this.readyState == 4 && this.status == 200 || this.status == 304) {
                        var args = _getHookedArgs(arguments);
                        _this._invokeAimMethods(this, 'onreadystatechange', args);
                    }
                },
                onload: function () {
                    var args = _getHookedArgs(arguments);
                    _this._invokeAimMethods(this, 'onload', args);
                },
                // 拦截请求
                open: function () {
                    var args = _getHookedArgs(arguments);
                    var fullUrl = args[0][1];
                    _this._xhrDispatcher(this, fullUrl);
                    var argsObject = _this._parseOpenArgs(args[0]);
                    _this._invokeAimMethods(this, 'open', [argsObject]);
                    _this._rebuildOpenArgs(argsObject, args[0]);
                }
            };
            // todo reinfecta [aop切入实现劫持所有参数并赋值]
            // 设置总的hookId
            this.___hookedId = _global.eHook.hookAjax(normalMethods);
            this.isHooked = true;
        },
        /**
         * 注册ajaxUrl拦截
         * @param urlPatcher
         * @param config
         * @return {number}
         */
        register: function (urlPatcher, config) {
            if (!urlPatcher || !utils.isExistObject(config)) {
                return -1;
            }
            var id = this._getAutoId();
            this._urlDispatcherList.push({
                // 指定id便于后续取消
                id: id,
                patcher: urlPatcher,
                config: config
            });
            // 当注册一个register时，自动开始运行劫持
            if (!this.isHooked) {
                this.startHook();
            }
            return id;
        }
        // todo 注销  cancellation: function (registerId){};
    };

    _global['eHook'] = eHook;
    _global['aHook'] = new AHook();

}.bind(window)({
    /**
     * 对象是否为数组
     * @param arr
     */
    isArray: function (arr) {
        return Array.isArray(arr) || Object.prototype.toString.call(arr) == "[object Array]";
    },
    /**
     * 判断是否为方法
     * @param func
     * @return {boolean}
     */
    isFunction: function (func) {
        return typeof func === 'function';
    },
    /**
     * 判断是否是一个有效的对象
     * @param obj
     * @return {*|boolean}
     */
    isExistObject: function (obj) {
        return obj && (typeof obj === 'object');
    },
    /**
     * 遍历数组
     * @param context {Object}
     * @param arr {Array}
     * @param cb {Function} 回调函数
     */
    ergodicArrayObject: function (context, arr, cb) {
        if (!context) {
            context = window;
        }
        if (!(arr instanceof Array) || !(cb instanceof Function)) {
            return;
        }
        for (var i = 0; i < arr.length; i++) {
            var result = cb.call(context, arr[i], i);
            if (result && result == -1) {
                break;
            }
        }
    },
    /**
     * 遍历对象属性
     * @param context {object} 上下文
     * @param obj {object} 遍历对象
     * @param cb {function} 回调函数
     * @param isReadInnerObject {boolean=} 是否遍历内部对象的属性
     */
    ergodicObject: function (context, obj, cb, isReadInnerObject) {
        var keys = Object.keys(obj);
        this.ergodicArrayObject(this, keys, function (propertyName) {
            // 若内部对象需要遍历
            var _propertyName = propertyName;
            if (isReadInnerObject && obj[propertyName] != null && typeof obj[propertyName] == 'object') {
                this.ergodicObject(this, obj[propertyName], function (value, key) {
                    return cb.call(context, value, _propertyName + '.' + key);
                }, true)
            } else {
                return cb.call(context, obj[propertyName], propertyName);
            }
        })
    },
    /**
     * 获取数组对象的一个属性发起动作
     * @param context {Object}
     * @param arr {Array}
     * @param propertyName {String}
     * @param cb {Function}
     * @param checkProperty {boolean} 是否排除不拥有该属性的对象[default:true]
     */
    getPropertyDo: function (context, arr, propertyName, cb, checkProperty) {
        if (checkProperty == null) {
            checkProperty = true;
        }
        this.ergodicArrayObject(context, arr, function (ele) {
            if (!checkProperty || ele.hasOwnProperty(propertyName)) {
                cb.call(context, ele[propertyName], ele);
            }
        })
    },
    /**
     * 通过数组中每个对象的指定属性生成一个新数组
     * @param arr {Array}
     * @param propertyName {String}
     */
    parseArrayByProperty: function (arr, propertyName) {
        var result = [];
        if (!this.isArray(arr)) {
            return result;
        }
        this.getPropertyDo(this, arr, propertyName, function (value) {
            result.push(value);
        }, true);
        return result;
    },
    invokeMethods: function (context, methods, args) {
        if (!this.isArray(methods)) {
            return;
        }
        var results = [];
        var _this = this;
        this.ergodicArrayObject(context, methods, function (method) {
            if (!_this.isFunction(method)) {
                return;
            }
            results.push(
                method.apply(_this, args)
            );
        });
        return results;
    },
    urlUtils: {
        urlMatching: function (url, matchUrl) {
            var pattern = eval('/' + matchUrl.replace(/\//g, '\\/') + '/');
            return pattern.test(url);
        },
        getUrlWithoutParam: function (url) {
            return url.split('?')[0];
        },
        getParamFromUrl: function (url) {
            var params = [];
            var parts = url.split('?');
            if (parts.length < 2) {
                return params;
            }
            var paramsStr = parts[1].split('&');
            for (var i = 0; i < paramsStr.length; i++) {
                var ps = paramsStr[i].split('=');
                if (ps.length < 2) {
                    continue;
                }
                params.push({
                    key: ps[0],
                    value: ps[1]
                });
            }
            return params;
        },
        margeUrlAndParams: function (url, params) {
            if (url.indexOf('?') != -1 || !(params instanceof Array)) {
                return url;
            }
            var paramsStr = [];
            for (var i = 0; i < params.length; i++) {
                if (params[i].key != null && params[i].value != null) {
                    paramsStr.push(params[i].key + '=' + params[i].value);
                }
            }
            return url + '?' + paramsStr.join('&');
        }
    }
});