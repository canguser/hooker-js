// ==UserScript==
// @name         Everything-Hook
// @namespace    https://gitee.com/HGJing/everthing-hook/
// @updateURL    https://gitee.com/HGJing/everthing-hook/raw/master/src/everything-hook.js
// @version      0.5.9056
// @include      *
// @description  it can hook everything
// @author       Cangshi
// @match        http://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
/**
 * ---------------------------
 * Time: 2017/9/20 18:33.
 * Author: Cangshi
 * View: http://palerock.cn
 * ---------------------------
 */
'use strict';

const eUtils = require('@palerock/every-utils');

~(function (global, factory) {

    "use strict";

    if (typeof module === "object" && typeof module.exports === "object") {
        var results = factory.bind(global)(global, eUtils, true) || [];
        var HookJS = {};
        results.forEach(function (part) {
            HookJS[part.name] = part.module;
        });
        module.exports = HookJS;
    } else {
        factory.bind(global)(global, eUtils);
    }

}(typeof window !== "undefined" ? window : this, function (_global, utils, noGlobal) {
    /**
     * @namespace EHook
     * @author Cangshi
     * @constructor
     * @see {@link https://palerock.cn/projects/006HDUuOhBj}
     * @license Apache License 2.0
     */
    var EHook = function () {
        var _autoId = 1;
        var _hookedMap = {};
        var _hookedContextMap = {};
        this._getHookedMap = function () {
            return _hookedMap;
        };
        this._getHookedContextMap = function () {
            return _hookedContextMap;
        };
        this._getAutoStrId = function () {
            return '__auto__' + _autoId++;
        };
        this._getAutoId = function () {
            return _autoId++;
        };
    };
    EHook.prototype = {
        /**
         * 获取一个对象的劫持id，若没有则创建一个
         * @param context
         * @return {*}
         * @private
         */
        _getHookedId: function (context) {
            var contextMap = this._getHookedContextMap();
            var hookedId = null;
            Object.keys(contextMap).forEach(key => {
                if (context === contextMap[key]) {
                    hookedId = key;
                }
            });
            if (hookedId == null) {
                hookedId = this._getAutoStrId();
                contextMap[hookedId] = context;
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
         * @return result 最后一次执行方法的有效返回值
         * @private
         */
        _invokeMethods: function (context, methods, args) {
            if (!utils.isArray(methods)) {
                return;
            }
            var result = null;
            utils.ergodicArrayObject(context, methods, function (_method) {
                if (!utils.isFunction(_method.method)) {
                    return;
                }
                var r = _method.method.apply(this, args);
                if (r != null) {
                    result = r;
                }
            });
            return result;
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
                context = parent;
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
            var builder = new utils.FunctionBuilder(function (v) {
                return {
                    result: undefined
                };
            });
            if (methodTask.task.before.length > 0) {
                builder.push(function (v) {
                    invokeMethods(context || v.this, methodTask.task.before, [methodTask.original, v.arguments]);
                });
            }
            if (utils.isExistObject(methodTask.task.current) && utils.isFunction(methodTask.task.current.method)) {
                builder.push(function (v) {
                    return {
                        result: methodTask.task.current.method.call(context || v.this, parent, methodTask.original, v.arguments)
                    }
                });
            } else {
                builder.push(function (v) {
                    return {
                        result: methodTask.original.apply(context || v.this, v.arguments)
                    }
                });
            }
            if (methodTask.task.after.length > 0) {
                builder.push(function (v) {
                    var args = [];
                    args.push(methodTask.original);
                    args.push(v.arguments);
                    args.push(v.result);
                    var r = invokeMethods(context || v.this, methodTask.task.after, args);
                    return {
                        result: (r != null ? r : v.result)
                    };
                });
            }
            builder.push(function (v) {
                return {
                    returnValue: v.result
                };
            });
            // var methodStr = '(function(){\n';
            // methodStr = methodStr + 'var result = undefined;\n';
            // if (methodTask.task.before.length > 0) {
            //     methodStr = methodStr + 'invokeMethods(context, methodTask.task.before,[methodTask.original, arguments]);\n';
            // }
            // if (utils.isExistObject(methodTask.task.current) && utils.isFunction(methodTask.task.current.method)) {
            //     methodStr = methodStr + 'result = methodTask.task.current.method.call(context, parent, methodTask.original, arguments);\n';
            // } else {
            //     methodStr = methodStr + 'result = methodTask.original.apply(context, arguments);\n';
            // }
            // if (methodTask.task.after.length > 0) {
            //     methodStr = methodStr + 'var args = [];args.push(methodTask.original);args.push(arguments);args.push(result);\n';
            //     methodStr = methodStr + 'var r = invokeMethods(context, methodTask.task.after, args);result = (r!=null?r:result);\n';
            // }
            // methodStr = methodStr + 'return result;\n})';
            // 绑定劫持函数
            var resultFunc = builder.result();
            for (var proxyName in methodTask.original) {
                Object.defineProperty(resultFunc, proxyName, {
                    get: function () {
                        return methodTask.original[proxyName];
                    },
                    set: function (v) {
                        methodTask.original[proxyName] = v;
                    }
                })
            }
            resultFunc.prototype = methodTask.original.prototype;
            parent[methodName] = resultFunc;
        },
        /**
         * 劫持一个方法
         * @inner
         * @memberOf EHook
         * @param parent{Object} 指定方法所在的对象
         * @param methodName{String} 指定方法的名称
         * @param config{Object} 劫持的配置对象
         */
        hook: function (parent, methodName, config) {
            var hookedFailure = -1;
            // 调用方法的上下文
            var context = config.context !== undefined ? config.context : parent;
            if (parent[methodName] == null) {
                parent[methodName] = function () {
                }
            }
            if (!utils.isFunction(parent[methodName])) {
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
         * @see 注意：该方法会覆盖指定劫持方法在之前所进行的一切劫持，也不能重复使用，并且不和hookAfter,hookCurrent,hookBefore共存，在同时使用的情况下，优先使用hookReplace而不是其他的方法
         * @inner
         * @memberOf EHook
         * @param parent{Object} 指定方法所在的对象
         * @param context{Object=} 回调方法的上下文
         * @param methodName{String} 指定方法的名称
         * @param replace {function} 回调方法，该方法的返回值便是替换的方法 回调参数及返回值：[ method:指定的原方法，类型:function return:规定被替换的方法内容，类型:function ]
         * @return {number} 该次劫持的id
         */
        hookReplace: function (parent, methodName, replace, context) {
            return this.hook(parent, methodName, {
                replace: replace,
                context: context
            });
        },
        /**
         * 在指定方法前执行
         * @inner
         * @memberOf EHook
         * @param parent{Object} 指定方法所在的对象
         * @param methodName{String} 指定方法的名称
         * @param before{function} 回调方法，该方法在指定方法运行前执行 回调参数：[ method:指定的原方法 args:原方法运行的参数（在此改变参数值会影响后续指定方法的参数值） ]
         * @param context{Object=} 回调方法的上下文
         * @returns {number} 劫持id（用于解除劫持）
         */
        hookBefore: function (parent, methodName, before, context) {
            return this.hook(parent, methodName, {
                before: before,
                context: context
            });
        },
        /**
         * 劫持方法的运行，在对制定方法进行该劫持的时候，指定方法不会主动执行，替换为执行参数中的current方法
         * @see 注意：该方法只能对指定方法进行一次劫持，若再次使用该方法劫持就会覆盖之前的劫持[可以和hookBefore,hookAfter共存，且hookBefore和hookAfter可以对同个指定方法多次劫持]
         * @inner
         * @memberOf EHook
         * @param parent{Object} 指定方法所在的对象
         * @param methodName{String} 指定方法的名称
         * @param current{function} 回调方法，该方法在指定方法被调用时执行 回调参数及返回值：[ parent:指定方法所在的对象，类型:object method:指定的原方法，类型:function args:原方法的参数，类型:array return:规定被劫持方法的返回值，类型:* ]
         * @param context{Object=} 回调方法的上下文
         * @returns {number} 劫持id（用于解除劫持）
         */
        hookCurrent: function (parent, methodName, current, context) {
            return this.hook(parent, methodName, {
                current: current,
                context: context
            });
        },
        /**
         * 在指定方法后执行
         * @inner
         * @memberOf EHook
         * @param parent{Object} 指定方法所在的对象
         * @param methodName{String} 指定方法的名称
         * @param after{function} 回调方法，该方法在指定方法运行后执行 回调参数及返回值：[ method:指定的原方法，类型:function args:原方法的参数，类型:array result:原方法的返回值，类型:* return:规定被劫持方法的返回值，类型:* ]
         * @param context{Object=} 回调方法的上下文
         * @returns {number} 劫持id（用于解除劫持）
         */
        hookAfter: function (parent, methodName, after, context) {
            return this.hook(parent, methodName, {
                after: after,
                context: context
            });
        },
        hookClass: function (parent, className, replace, innerName, excludeProperties) {
            var _this = this;
            var originFunc = parent[className];
            if (!excludeProperties) {
                excludeProperties = [];
            }
            excludeProperties.push('prototype');
            excludeProperties.push('caller');
            excludeProperties.push('arguments');
            innerName = innerName || '_innerHook';
            var resFunc = function () {
                this[innerName] = new originFunc();
                replace.apply(this, arguments);
            };
            this.hookedToString(originFunc, resFunc);
            this.hookedToProperties(originFunc, resFunc, true, excludeProperties);
            var prototypeProperties = Object.getOwnPropertyNames(originFunc.prototype);
            var prototype = resFunc.prototype = {
                constructor: resFunc
            };
            prototypeProperties.forEach(function (name) {
                if (name === 'constructor') {
                    return;
                }
                var method = function () {
                    if (originFunc.prototype[name] && utils.isFunction(originFunc.prototype[name])) {
                        return originFunc.prototype[name].apply(this[innerName], arguments);
                    }
                    return undefined;
                };
                _this.hookedToString(originFunc.prototype[name], method);
                prototype[name] = method;
            });
            this.hookReplace(parent, className, function () {
                return resFunc;
            }, parent)
        },
        hookedToProperties: function (originObject, resultObject, isDefined, excludeProperties) {
            var objectProperties = Object.getOwnPropertyNames(originObject);
            objectProperties.forEach(function (property) {
                if (utils.contains(excludeProperties, property)) {
                    return;
                }
                if (!isDefined) {
                    resultObject[property] = originObject[property];
                } else {
                    Object.defineProperty(resultObject, property, {
                        configurable: false,
                        enumerable: false,
                        value: originObject[property],
                        writable: false
                    });
                }
            });
        },
        hookedToString: function (originObject, resultObject) {
            Object.defineProperties(resultObject, {
                toString: {
                    configurable: false,
                    enumerable: false,
                    value: originObject.toString.bind(originObject),
                    writable: false
                },
                toLocaleString: {
                    configurable: false,
                    enumerable: false,
                    value: originObject.toLocaleString.bind(originObject),
                    writable: false
                }
            })
        },
        /**
         * 劫持全局ajax
         * @inner
         * @memberOf EHook
         * @param methods {object} 劫持的方法
         * @return {*|number} 劫持的id
         */
        hookAjax: function (methods) {
            if (this.isHooked(_global, 'XMLHttpRequest')) {
                return;
            }
            var _this = this;
            var hookMethod = function (methodName) {
                if (utils.isFunction(methods[methodName])) {
                    // 在执行方法之前hook原方法
                    _this.hookBefore(this.xhr, methodName, methods[methodName]);
                }
                // 返回方法调用内部的xhr
                return this.xhr[methodName].bind(this.xhr);
            };
            var getProperty = function (attr) {
                return function () {
                    return this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this.xhr[attr];
                };
            };
            var setProperty = function (attr) {
                return function (f) {
                    var xhr = this.xhr;
                    var that = this;
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
                        // console.log(1,attr);
                        // xhr[attr] = function () {
                        //     methods[attr](that) || f.apply(xhr, arguments);
                        // }
                    } else {
                        xhr[attr] = f;
                    }
                };
            };
            return this.hookReplace(_global, 'XMLHttpRequest', function (XMLHttpRequest) {
                var resFunc = function () {
                    this.xhr = new XMLHttpRequest();
                    for (var propertyName in this.xhr) {
                        var property = this.xhr[propertyName];
                        if (utils.isFunction(property)) {
                            // hook 原方法
                            this[propertyName] = hookMethod.bind(this)(propertyName);
                        } else {
                            Object.defineProperty(this, propertyName, {
                                get: getProperty(propertyName),
                                set: setProperty(propertyName)
                            });
                        }
                    }
                    // 定义外部xhr可以在内部访问
                    this.xhr.xhr = this;
                };
                _this.hookedToProperties(XMLHttpRequest, resFunc, true);
                _this.hookedToString(XMLHttpRequest, resFunc);
                return resFunc
            });
        },
        /**
         * 劫持全局ajax
         * @param methods {object} 劫持的方法
         * @return {*|number} 劫持的id
         */
        hookAjaxV2: function (methods) {
            this.hookClass(window, 'XMLHttpRequest', function () {

            });
            utils.ergodicObject(this, methods, function (method) {

            });
        },
        /**
         * 解除劫持
         * @inner
         * @memberOf EHook
         * @param context 上下文
         * @param methodName 方法名
         * @param isDeeply {boolean=} 是否深度解除[默认为false]
         * @param eqId {number=}  解除指定id的劫持[可选]
         */
        unHook: function (context, methodName, isDeeply, eqId) {
            if (!context[methodName] || !utils.isFunction(context[methodName])) {
                return;
            }
            var methodTask = this._getHookedMethodTask(context, methodName);
            if (eqId) {
                if (this.unHookById(eqId)) {
                    return;
                }
            }
            if (!methodTask.original) {
                delete this._getHookedMethodMap(context)[methodName];
                return;
            }
            context[methodName] = methodTask.original;
            if (isDeeply) {
                delete this._getHookedMethodMap(context)[methodName];
            }
        },
        /**
         * 通过Id解除劫持
         * @inner
         * @memberOf EHook
         * @param eqId
         * @returns {boolean}
         */
        unHookById: function (eqId) {
            var hasEq = false;
            if (eqId) {
                var hookedMap = this._getHookedMap();
                utils.ergodicObject(this, hookedMap, function (contextMap) {
                    utils.ergodicObject(this, contextMap, function (methodTask) {
                        methodTask.task.before = methodTask.task.before.filter(function (before) {
                            hasEq = hasEq || before.id === eqId;
                            return before.id !== eqId;
                        });
                        methodTask.task.after = methodTask.task.after.filter(function (after) {
                            hasEq = hasEq || after.id === eqId;
                            return after.id !== eqId;
                        });
                        if (methodTask.task.current && methodTask.task.current.id === eqId) {
                            methodTask.task.current = undefined;
                            hasEq = true;
                        }
                        if (methodTask.replace && methodTask.replace.id === eqId) {
                            methodTask.replace = undefined;
                            hasEq = true;
                        }
                    })
                });
            }
            return hasEq;
        },
        /**
         *  移除所有劫持相关的方法
         * @inner
         * @memberOf EHook
         * @param context 上下文
         * @param methodName 方法名
         */
        removeHookMethod: function (context, methodName) {
            if (!context[methodName] || !utils.isFunction(context[methodName])) {
                return;
            }
            this._getHookedMethodMap(context)[methodName] = {
                original: undefined,
                replace: undefined,
                task: {
                    before: [],
                    current: undefined,
                    after: []
                }
            };
        },
        /**
         * 判断一个方法是否被劫持过
         * @inner
         * @memberOf EHook
         * @param context
         * @param methodName
         */
        isHooked: function (context, methodName) {
            var hookMap = this._getHookedMethodMap(context);
            return hookMap[methodName] !== undefined ? (hookMap[methodName].original !== undefined) : false;
        },
        /**
         * 保护一个对象使之不会被篡改
         * @inner
         * @memberOf EHook
         * @param parent
         * @param methodName
         */
        protect: function (parent, methodName) {
            Object.defineProperty(parent, methodName, {
                configurable: false,
                writable: false
            });
        },
        preventError: function (parent, methodName, returnValue, context) {
            this.hookCurrent(parent, methodName, function (m, args) {
                var value = returnValue;
                try {
                    value = m.apply(this, args);
                } catch (e) {
                    console.log('Error Prevented from method ' + methodName, e);
                }
                return value;
            }, context)
        },
        /**
         * 装载插件
         * @inner
         * @memberOf EHook
         * @param option
         */
        plugins: function (option) {
            if (utils.isFunction(option.mount)) {
                var result = option.mount.call(this, utils);
                if (typeof option.name === 'string') {
                    _global[option.name] = result;
                }
            }
        }
    };
    if (_global.eHook && (_global.eHook instanceof EHook)) {
        return;
    }
    var eHook = new EHook();
    /**
     * @namespace AHook
     * @author Cangshi
     * @constructor
     * @see {@link https://palerock.cn/projects/006HDUuOhBj}
     * @license Apache License 2.0
     */
    var AHook = function () {
        this.isHooked = false;
        var autoId = 1;
        this._urlDispatcherList = [];
        this._getAutoId = function () {
            return autoId++;
        };
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
            return utils.invokeMethods(xhr, methods, args);
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
                if (utils.UrlUtils.urlMatching(url, patcherMap.patcher)) {
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
            var url = utils.UrlUtils.getUrlWithoutParam(fullUrl);
            xhr.patcherList = this._urlPatcher(url);
        },
        /**
         * 转换响应事件
         * @param e
         * @param xhr
         * @private
         */
        _parseEvent: function (e, xhr) {
            try {
                Object.defineProperties(e, {
                    target: {
                        get: function () {
                            return xhr;
                        }
                    },
                    srcElement: {
                        get: function () {
                            return xhr;
                        }
                    }
                });
            } catch (error) {
                console.warn('重定义返回事件失败，劫持响应可能失败');
            }
            return e;
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
                url: utils.UrlUtils.getUrlWithoutParam(args[1]),
                params: utils.UrlUtils.getParamFromUrl(args[1]),
                async: args[2]
            };
        },
        /**
         * 劫持ajax 请求参数
         * @param argsObject
         * @param argsArray
         * @private
         */
        _rebuildOpenArgs: function (argsObject, argsArray) {
            argsArray[0] = argsObject.method;
            argsArray[1] = utils.UrlUtils.margeUrlAndParams(argsObject.url, argsObject.params);
            argsArray[2] = argsObject.async;
        },
        /**
         * 获取劫持方法的参数 [原方法,原方法参数,原方法返回值]，剔除原方法参数
         * @param args
         * @return {*|Array.<T>}
         * @private
         */
        _getHookedArgs: function (args) {
            // 将参数中'原方法'剔除
            return Array.prototype.slice.call(args, 0).splice(1);
        },
        /**
         * 响应被触发时调用的方法
         * @param outerXhr
         * @param funcArgs
         * @private
         */
        _onResponse: function (outerXhr, funcArgs) {
            // 因为参数是被劫持的参数为[method(原方法),args(参数)],该方法直接获取参数并转换为数组
            var args = this._getHookedArgs(funcArgs);
            args[0][0] = this._parseEvent(args[0][0], outerXhr.xhr); // 强制事件指向外部xhr
            // 执行所有的名为hookResponse的方法组
            var results = this._invokeAimMethods(outerXhr, 'hookResponse', args);
            // 遍历结果数组并获取最后返回的有效的值作为响应值
            var resultIndex = -1;
            utils.ergodicArrayObject(outerXhr, results, function (res, i) {
                if (res != null) {
                    resultIndex = i;
                }
            });
            if (resultIndex !== -1) {
                outerXhr.xhr.responseText_ = outerXhr.xhr.response_ = results[resultIndex];
            }
        },
        /**
         * 手动开始劫持
         * @inner
         * @memberOf AHook
         */
        startHook: function () {
            var _this = this;
            var normalMethods = {
                // 方法中的this指向内部xhr
                // 拦截响应
                onreadystatechange: function () {
                    if (this.readyState == 4 && this.status == 200 || this.status == 304) {
                        _this._onResponse(this, arguments);
                    }
                },
                onload: function () {
                    _this._onResponse(this, arguments);
                },
                // 拦截请求
                open: function () {
                    var args = _this._getHookedArgs(arguments);
                    var fullUrl = args[0][1];
                    _this._xhrDispatcher(this, fullUrl);
                    var argsObject = _this._parseOpenArgs(args[0]);
                    this.openArgs = argsObject;
                    _this._invokeAimMethods(this, 'hookRequest', [argsObject]);
                    _this._rebuildOpenArgs(argsObject, args[0]);
                },
                send: function () {
                    var args = _this._getHookedArgs(arguments);
                    this.sendArgs = args;
                    _this._invokeAimMethods(this, 'hookSend', args);
                }
            };
            // 设置总的hookId
            this.___hookedId = _global.eHook.hookAjax(normalMethods);
            this.isHooked = true;
        },
        /**
         * 注册ajaxUrl拦截
         * @inner
         * @memberOf AHook
         * @param urlPatcher
         * @param configOrRequest
         * @param response
         * @return {number}
         */
        register: function (urlPatcher, configOrRequest, response) {
            if (!urlPatcher) {
                return -1;
            }
            if (!utils.isExistObject(configOrRequest) && !utils.isFunction(response)) {
                return -1;
            }
            var config = {};
            if (utils.isFunction(configOrRequest)) {
                config.hookRequest = configOrRequest;
            }
            if (utils.isFunction(response)) {
                config.hookResponse = response;
            }
            if (utils.isExistObject(configOrRequest)) {
                config = configOrRequest;
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

    return [{
        name: 'eHook',
        module: eHook
    }, {
        name: 'aHook',
        module: _global['aHook']
    }]

}));