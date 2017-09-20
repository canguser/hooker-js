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
        this._getAutoId = function () {
            return '__auto__' + _autoId++;
        }
    };
    EHook.prototype = {
        /**
         * 获取对应方法的hook原型任务对象，若没有则初始化一个。
         * @param context
         * @param methodName
         * @private
         */
        _getHookedMethodTask: function (context, methodName) {
            var hookedId = context.___hookedId;
            if (hookedId == null) {
                hookedId = context.___hookedId = this._getAutoId();
            }
            var hookedMap = this._getHookedMap();
            var thisTask = hookedMap[hookedId];
            if (!utils.isExistObject(thisTask)) {
                thisTask = hookedMap[hookedId] = {};
            }
            var thisMethod = thisTask[methodName];
            if (!utils.isExistObject(thisMethod)) {
                thisMethod = thisTask[methodName] = {
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
        _invokeMethods: function (context, method, methods, args) {
            if (!utils.isArray(methods)) {
                return;
            }
            utils.ergodicArrayObject(context, methods, function (_method) {
                if (!utils.isFunction(_method)) {
                    return;
                }
                _method.call(this, method, args);
            });
        },
        _hook: function (context, methodName) {
            var method = context[methodName];
            var methodTask = this._getHookedMethodTask(context, methodName);
            if (!methodTask.original) {
                methodTask.original = method;
            }
            if (utils.isFunction(methodTask.replace)) {
                context[methodName] = methodTask.replace(methodTask.original);
                return;
            }
            var invokeMethods = this._invokeMethods;
            // 组装劫持函数
            var methodStr = '(function(){\n';
            methodStr = methodStr + 'var result = undefined;\n';
            if (methodTask.task.before.length > 0) {
                methodStr = methodStr + 'invokeMethods(context, method, methodTask.task.before, arguments);\n';
            }
            if (utils.isFunction(methodTask.task.current)) {
                methodStr = methodStr + 'result = methodTask.task.current.call(context, context, method, arguments);\n';
            } else {
                methodStr = methodStr + 'result = methodTask.original.apply(context, arguments);\n';
            }
            if (methodTask.task.after.length > 0) {
                methodStr = methodStr + 'invokeMethods(context, method, methodTask.task.after, arguments);\n';
            }
            methodStr = methodStr + 'return result;\n})';
            // 绑定劫持函数
            context[methodName] = eval(methodStr);
        },
        hook: function (context, methodName, config) {
            if (!context[methodName] || !utils.isFunction(context[methodName])) {
                return;
            }
            var methodTask = this._getHookedMethodTask(context, methodName);
            if (utils.isFunction(config.replace)) {
                methodTask.replace = config.replace;
            }
            if (utils.isFunction(config.before)) {
                methodTask.task.before.push(config.before);
            }
            if (utils.isFunction(config.current)) {
                methodTask.task.current = config.current;
            }
            if (utils.isFunction(config.after)) {
                methodTask.task.after.push(config.after);
            }
            this._hook(context, methodName);
        },
        unHook: function (context, methodName, isDeeply) {
            if (!context[methodName] || !utils.isFunction(context[methodName])) {
                return;
            }
            var methodTask = this._getHookedMethodTask(context, methodName);
            context[methodName] = methodTask.original;
            if (isDeeply) {
                // todo 删除该方法对应的hook属性
            }
        }
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