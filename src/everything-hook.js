/**
 * ---------------------------
 * Time: 2017/9/20 18:33.
 * Author: Cangshi
 * View: http://palerock.cn
 * ---------------------------
 */
// 'use strict';
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
         * @param method
         * @param methods
         * @param args
         * @private
         */
        _invokeMethods: function (context, method, methods, args) {
            if (!utils.isArray(methods)) {
                return;
            }
            utils.ergodicArrayObject(context, methods, function (_method) {
                if (!utils.isFunction(_method.method)) {
                    return;
                }
                _method.method.call(this, method, args);
            });
        },
        /**
         * 生成和替换劫持方法
         * @param context
         * @param methodName {string}
         * @private
         */
        _hook: function (context, methodName) {
            var method = context[methodName];
            var methodTask = this._getHookedMethodTask(context, methodName);
            if (!methodTask.original) {
                methodTask.original = method;
            }
            if (utils.isExistObject(methodTask.replace) && utils.isFunction(methodTask.replace.method)) {
                context[methodName] = methodTask.replace.method(methodTask.original);
                return;
            }
            var invokeMethods = this._invokeMethods;
            // 组装劫持函数
            var methodStr = '(function(){\n';
            methodStr = methodStr + 'var result = undefined;\n';
            if (methodTask.task.before.length > 0) {
                methodStr = methodStr + 'invokeMethods(context, methodTask.original, methodTask.task.before, arguments);\n';
            }
            if (utils.isFunction(methodTask.task.current)) {
                methodStr = methodStr + 'result = methodTask.task.current.method.call(context, context, methodTask.original, arguments);\n';
            } else {
                methodStr = methodStr + 'result = methodTask.original.apply(context, arguments);\n';
            }
            if (methodTask.task.after.length > 0) {
                methodStr = methodStr + 'invokeMethods(context, methodTask.original, methodTask.task.after, arguments);\n';
            }
            methodStr = methodStr + 'return result;\n})';
            // 绑定劫持函数
            context[methodName] = eval(methodStr);
        },
        /**
         * 劫持一个方法
         * @param context
         * @param methodName {string}
         * @param config
         */
        hook: function (context, methodName, config) {
            var hookedFailure = -1;
            if (!context[methodName] || !utils.isFunction(context[methodName])) {
                return hookedFailure;
            }
            var methodTask = this._getHookedMethodTask(context, methodName);
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
                this._hook(context, methodName);
                return id;
            } else {
                return hookedFailure;
            }

        },
        /**
         * 劫持替换一个方法
         * @param context
         * @param methodName {string}
         * @param replace {function}
         * @return {number} 该次劫持的id
         */
        hookReplace: function (context, methodName, replace) {
            return this.hook(context, methodName, {
                replace: replace
            })
        },
        hookBefore: function (context, methodName, before) {
            return this.hook(context, methodName, {
                before: before
            })
        },
        hookCurrent: function (context, methodName, current) {
            return this.hook(context, methodName, {
                current: current
            })
        },
        hookAfter: function (context, methodName, after) {
            return this.hook(context, methodName, {
                after: after
            })
        },
        /**
         * 劫持全局ajax
         * @param methods {object} 劫持的方法
         * @return {*|number} 劫持的id
         */
        hookAjax: function (methods) {
            var hookMethod = function (methodName) {
                return function () {
                    var args = [].slice.call(arguments);
                    if (methods[methodName] && methods[methodName].call(this, args, this.xhr)) {
                        return;
                    }
                    return this.xhr[methodName].apply(this.xhr, args);
                };
            };
            var getFactory = function (attr) {
                return function () {
                    return this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this.xhr[attr];
                };
            };
            var setFactory = function (attr) {
                return function (f) {
                    var xhr = this.xhr;
                    var that = this;
                    if (attr.indexOf("on") !== 0) {
                        this[attr + "_"] = f;
                        return;
                    }
                    if (methods[attr]) {
                        xhr[attr] = function () {
                            methods[attr](that) || f.apply(xhr, arguments);
                        };
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
                            this[propertyName] = hookMethod(propertyName);
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
    var AHook = function () {
        this.urlDispatcherList = [];
    };
    _global['eHook'] = new EHook();
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
    }
});