/**
 * Every-Utils
 * version:0.0.2001
 */
(function (global, factory) {

    "use strict";

    if (typeof module === "object" && typeof module.exports === "object") {

        // For CommonJS and CommonJS-like environments where a proper `window`
        // is present, execute the factory and get jQuery.
        // For environments that do not have a `window` with a `document`
        // (such as Node.js), expose a factory as module.exports.
        // This accentuates the need for the creation of a real `window`.
        // e.g. var jQuery = require("jquery")(window);
        // See ticket #14549 for more info.
        module.exports = global.document ?
            factory(global, true) :
            function (w) {
                if (!w.document) {
                    throw new Error("eUtils requires a window with a document");
                }
                return factory(w);
            };
    } else {
        factory(global);
    }

}(typeof window !== "undefined" ? window : this, function (_global, noGlobal) {

    // base
    var BaseUtils = {
        /**
         * 对象是否为数组
         * @param arr
         */
        isArray: function (arr) {
            return Array.isArray(arr) || Object.prototype.toString.call(arr) === "[object Array]";
        },
        /**
         * 判断是否为方法
         * @param func
         * @return {boolean}
         */
        isFunction: function (func) {
            if (!func) {
                return false;
            }
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
        isString: function (str) {
            if (str === null) {
                return false;
            }
            return typeof str === 'string';
        },
        uniqueNum: 1000,
        /**
         * 根据当前时间戳生产一个随机id
         * @returns {string}
         */
        buildUniqueId: function () {
            var prefix = new Date().getTime().toString();
            var suffix = this.uniqueNum.toString();
            this.uniqueNum++;
            return prefix + suffix;
        }
    };

    //
    var serviceProvider = {
        _parseDepends: function (depends) {
            var dependsArr = [];
            if (!BaseUtils.isArray(depends)) {
                return;
            }
            depends.forEach(function (depend) {
                if (BaseUtils.isString(depend)) {
                    dependsArr.push(serviceProvider[depend.toLowerCase()]);
                }
            });
            return dependsArr;
        }
    };

    //
    var factory = function (name, depends, construction) {
        if (!BaseUtils.isFunction(construction)) {
            return;
        }
        serviceProvider[name.toLowerCase()] = construction.apply(this, serviceProvider._parseDepends(depends));
    };

    var depend = function (depends, construction) {
        if (!BaseUtils.isFunction(construction)) {
            return;
        }
        construction.apply(this, serviceProvider._parseDepends(depends));
    };

    factory('BaseUtils', [], function () {
        return BaseUtils;
    });

    // logger
    factory('logger', [], function () {
        return console;
    });

    // DateTimeUtils
    factory('DateTimeUtils', ['logger'], function (logger) {
        return {
            /**
             * 打印当前时间
             */
            printNowTime: function () {
                var date = new Date();
                console.log(this.pattern(date, 'hh:mm:ss:S'));
            },
            /**
             * 格式化日期
             * @param date
             * @param fmt
             * @returns {*}
             */
            pattern: function (date, fmt) {
                var o = {
                    "M+": date.getMonth() + 1, //月份
                    "d+": date.getDate(), //日
                    "h+": date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, //小时
                    "H+": date.getHours(), //小时
                    "m+": date.getMinutes(), //分
                    "s+": date.getSeconds(), //秒
                    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
                    "S": date.getMilliseconds() //毫秒
                };
                var week = {
                    "0": "/u65e5",
                    "1": "/u4e00",
                    "2": "/u4e8c",
                    "3": "/u4e09",
                    "4": "/u56db",
                    "5": "/u4e94",
                    "6": "/u516d"
                };
                if (/(y+)/.test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
                }
                if (/(E+)/.test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[date.getDay() + ""]);
                }
                for (var k in o) {
                    if (new RegExp("(" + k + ")").test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                    }
                }
                return fmt;
            },
            /**
             * 以当前时间获取id
             * @returns {number}
             */
            getCurrentId: function () {
                var date = new Date();
                return date.getTime();
            },
            /**
             * 获取指定时间距离现在相差多久
             * @param date {number|Date}
             * @param isCeil{boolean=} 是否对结果向上取整，默认[false]
             * @param type {string=} 单位可取值['day','month','year']默认'day'
             * @returns {number}
             */
            getNowBetweenADay: function (date, isCeil, type) {
                if (!type) {
                    type = 'day'
                }
                if (typeof date === 'number') {
                    date = new Date(date);
                }
                if (!(date instanceof Date)) {
                    throw new TypeError('该参数类型必须是Date')
                }
                var time = date.getTime();
                var now = new Date();
                var nowTime = now.getTime();
                if (nowTime - time < 0) {
                    logger.warn('需要计算的时间必须在当前时间之前');
                }
                var result = 0;
                switch (type) {
                    default:
                    case 'day':
                        result = (nowTime - time) / (1000 * 60 * 60 * 24);
                        break;
                    case 'month':
                        var yearDifference = now.getFullYear() - date.getFullYear();
                        if (yearDifference > 0) {
                            result += yearDifference * 12;
                        }
                        result += now.getMonth() - date.getMonth();
                        break;
                    case 'year':
                        result += now.getFullYear() - date.getFullYear();
                        break;
                }
                if (!isCeil) {
                    return Math.floor(result);
                } else {
                    if (result === 0 && isCeil) {
                        result = 1;
                    }
                    return Math.ceil(result);
                }
            }
        }
    });

    // ArrayUtils
    factory('ArrayUtils', ['BaseUtils'], function (BaseUtils) {
        return {
            isArrayObject: function (arr) {
                return BaseUtils.isArray(arr);
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
                if (!BaseUtils.isArray(arr) || !BaseUtils.isFunction(cb)) {
                    return;
                }
                for (var i = 0; i < arr.length; i++) {
                    var result = cb.call(context, arr[i], i);
                    if (result && result === -1) {
                        break;
                    }
                }
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
                if (checkProperty === null) {
                    checkProperty = true;
                }
                this.ergodicArrayObject(context, arr, function (ele) {
                    if (!checkProperty || ele.hasOwnProperty(propertyName)) {
                        cb.call(context, ele[propertyName], ele);
                    }
                })
            },
            /**
             * [私有方法]将多个键值对对象转换为map
             * @param arr {Array}
             * @returns {{}}
             */
            parseKeyValue: function (arr) {
                var map = {};
                if (!(BaseUtils.isArray(arr))) {
                    return map;
                }
                this.ergodicArrayObject(this, arr, function (ele) {
                    if (ele.key === null) {
                        return;
                    }
                    if (!map.hasOwnProperty(ele.key)) {
                        map[ele.key] = ele.value;
                    }
                });
                return map;
            },
            /**
             * 获取数组的哈希码
             * @param arr {Array}
             * @returns {number}
             */
            getHashCode: function (arr) {
                var str = arr.toString();
                var hash = 31;
                if (str.length === 0) return hash;
                for (var i = 0; i < str.length; i++) {
                    var char = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash; // Convert to 32bit integer
                }
                return hash;
            },
            /**
             * 通过数组中每个对象的指定属性生成一个新数组
             * @param arr {Array}
             * @param propertyName {String}
             */
            parseArrayByProperty: function (arr, propertyName) {
                var result = [];
                if (!this.isArrayObject(arr)) {
                    return result;
                }
                this.getPropertyDo(this, arr, propertyName, function (value) {
                    result.push(value);
                }, true);
                return result;
            },
            /**
             * 数组对象是否包含一个对象
             * @param arr {Array}
             * @param obj
             * @param cb {function=}
             * @returns {boolean}
             */
            isContainsObject: function (arr, obj, cb) {
                var isContainsObject = false;
                this.ergodicArrayObject(this, arr, function (value, i) {
                    if (obj === value) {
                        isContainsObject = true;
                        if (BaseUtils.isFunction(cb)) {
                            cb.call(window, i);
                        }
                        return -1;
                    }
                });
                return isContainsObject;
            },
            /**
             * 获取数组中的最大值
             * @param arr 若数组中的对象还是数组，则按里面数组的每个对象进行多级比较
             * @param cb
             * @returns {*}
             */
            getMaxInArray: function (arr, cb) {
                var maxObject = null;
                var maxIndex = -1;
                while (maxObject === null && maxIndex < arr.length) {
                    maxObject = arr[++maxIndex]
                }
                for (var i = maxIndex + 1; i < arr.length; i++) {
                    // 若是比较对象都是数组，则对每个数组的第一个元素进行比较，若相同，则比较第二个元素
                    if (maxObject !== null && this.isArrayObject(maxObject) && this.isArrayObject(arr[i])) {
                        var classLength = maxObject.length;
                        var classLevel = 0;
                        // console.log(maxObject[classLevel],arr[i][classLevel]);
                        while (maxObject[classLevel] === arr[i][classLevel] && classLevel < classLength) {
                            classLevel++
                        }
                        if (maxObject[classLevel] !== null && maxObject[classLevel] < arr[i][classLevel]) {
                            maxObject = arr[i];
                            maxIndex = i;
                        }
                        continue;
                    }
                    if (maxObject !== null && maxObject < arr[i]) {
                        maxObject = arr[i];
                        maxIndex = i;
                    }
                }
                if (BaseUtils.isFunction(cb)) {
                    cb.call(this, maxObject, maxIndex);
                }
                return maxObject;
            },
            /**
             * 获取数组中的总值
             * @param arr{Array<number>}
             * @param cb {function=}
             */
            getSumInArray: function (arr, cb) {
                if (!this.isArrayObject(arr)) {
                    return;
                }
                var sum = 0;
                var count = 0;
                this.ergodicArrayObject(this, arr, function (value) {
                    if (typeof value === 'number' && !Number.isNaN(value)) {
                        sum += value;
                        count += 1;
                    }
                });
                if (BaseUtils.isFunction(cb)) {
                    cb.call(window, sum, count);
                }
                return sum;
            },
            /**
             * 获取数组中的平均值
             * @param arr{Array<number>}
             */
            getAverageInArray: function (arr) {
                var average = 0;
                this.getSumInArray(arr, function (sum, i) {
                    i === 0 || (average = sum / i);
                });
                return average;
            },
            /**
             * 为数组排序
             * @param arr
             * @param order
             * @param sortSetting {object=}
             */
            sortingArrays: function (arr, order, sortSetting) {
                if (!this.isArrayObject(arr)) {
                    return;
                }
                var DESC = 0;
                var ASC = 1;
                var thisArr = arr.slice(0);
                var _thisAction = null;
                // 解析配置
                var isSetting = sortSetting && sortSetting.getComparedProperty &&
                    BaseUtils.isFunction(sortSetting.getComparedProperty);
                if (isSetting) {
                    thisArr = sortSetting.getComparedProperty(arr);
                }
                switch (order) {
                    default :
                    case DESC:
                        _thisAction = thisArr.push;
                        break;
                    case ASC:
                        _thisAction = thisArr.unshift;
                        break;
                }
                var resultArr = [];
                for (var j = 0; j < thisArr.length; j++) {
                    this.getMaxInArray(thisArr, function (max, i) {
                        delete thisArr[i];
                        _thisAction.call(resultArr, arr[i]);
                    });
                }
                if (sortSetting && sortSetting.createNewData) {
                    return resultArr.slice(0);
                }
                return resultArr;
            },
            /**
             * 将类数组转化为数组
             * @param arrLike 类数组对象
             */
            toArray: function (arrLike) {
                if (!arrLike || arrLike.length === 0) {
                    return [];
                }
                // 非伪类对象，直接返回最好
                if (!arrLike.length) {
                    return arrLike;
                }
                // 针对IE8以前 DOM的COM实现
                try {
                    return [].slice.call(arrLike);
                } catch (e) {
                    var i = 0,
                        j = arrLike.length,
                        res = [];
                    for (; i < j; i++) {
                        res.push(arrLike[i]);
                    }
                    return res;
                }
            },
            /**
             * 判断是否为类数组
             * @param o
             * @returns {boolean}
             */
            isArrayLick: function (o) {
                if (o &&                                // o is not null, undefined, etc.
                    typeof o === 'object' &&            // o is an object
                    isFinite(o.length) &&               // o.length is a finite number
                    o.length >= 0 &&                    // o.length is non-negative
                    o.length === Math.floor(o.length) &&  // o.length is an integer
                    o.length < 4294967296)              // o.length < 2^32
                    return true;                        // Then o is array-like
                else
                    return false;                       // Otherwise it is not

            },
            /**
             * 判断数组是否包含对象
             * @param arr
             * @param obj
             */
            contains: function (arr, obj) {
                var contains = false;
                this.ergodicArrayObject(this, arr, function (a) {
                    if (a === obj) {
                        contains = true;
                        return -1;
                    }
                });
                return contains;
            }
        }
    });

    // ObjectUtils
    factory('ObjectUtils', ['ArrayUtils', 'BaseUtils'], function (ArrayUtils, BaseUtils) {
        return {
            /**
             * 获取对象属性[支持链式表达式,如获取学生所在班级所在的学校(student.class.school):'class.school']
             * @param obj
             * @param linkProperty {string|Array} 属性表达式，获取多个属性则用数组
             * @param cb {function=}
             * @return 对象属性
             */
            readLinkProperty: function (obj, linkProperty, cb) {
                var callback = null;
                if (BaseUtils.isFunction(cb)) {
                    callback = cb;
                }
                if (typeof linkProperty === 'string') {
                    // 除去所有的空格
                    linkProperty = linkProperty.replace(/ /g, '');
                    // 不判断为空的值
                    if (linkProperty === '') {
                        return null;
                    }
                    // 若是以','隔开的伪数组，则转化为数组再进行操作
                    if (linkProperty.indexOf(',') !== -1) {
                        var propertyNameArr = linkProperty.split(',');
                        return this.readLinkProperty(obj, propertyNameArr, callback);
                    }
                    if (linkProperty.indexOf('.') !== -1) {
                        var names = linkProperty.split('.');
                        var iterationObj = obj;
                        var result = null;
                        ArrayUtils.ergodicArrayObject(this, names, function (name, i) {
                            iterationObj = this.readLinkProperty(iterationObj, name);
                            if (names[names.length - 1] === name && names.length - 1 === i) {
                                result = iterationObj;
                                if (callback) {
                                    callback.call(window, result, linkProperty);
                                }
                            }
                            // 终止对接下来的属性的遍历
                            if (typeof iterationObj === 'undefined') {
                                return -1;
                            }
                        });
                        return result;
                    }
                    var normalResult = null;
                    if (linkProperty.slice(linkProperty.length - 2) === '()') {
                        var func = linkProperty.slice(0, linkProperty.length - 2);
                        normalResult = obj[func]();
                    } else {
                        normalResult = obj[linkProperty];
                    }
                    if (normalResult === null) {
                        console.warn(obj, '的属性[\'' + linkProperty + '\']值未找到');
                    }
                    if (callback) {
                        callback.call(window, normalResult, linkProperty);
                    }
                    return normalResult;
                }
                if (BaseUtils.isArray(linkProperty)) {
                    var results = [];
                    ArrayUtils.ergodicArrayObject(this, linkProperty, function (name) {
                        var value = this.readLinkProperty(obj, name);
                        results.push(value);
                        if (callback && name !== '') {
                            return callback.call(window, value, name);
                        }
                    });
                    results.isMultipleResults = true;
                    return results;
                }
            },
            /**
             * 为对象属性赋值
             * （同一个对象中不能够既有数字开头的属性名和普通属性名）
             * @param obj
             * @param linkProperty {string|Array} 属性表达式，多个属性则用数组
             * @param value
             */
            createLinkProperty: function (obj, linkProperty, value) {
                if (obj === null) {
                    obj = {};
                }
                if (typeof linkProperty === 'string') {
                    // 除去所有的空格
                    linkProperty = linkProperty.replace(/ /g, '');
                    // 不判断为空的值
                    if (linkProperty === '') {
                        throw new TypeError('对象属性名不能为空')
                    }
                    if (linkProperty.indexOf(',') !== -1) {
                        var propertyNameArr = linkProperty.split(',');
                        this.createLinkProperty(obj, propertyNameArr, value);
                        return obj;
                    }
                    if (linkProperty.indexOf('.') !== -1) {
                        var names = linkProperty.split('.');
                        if (!obj.hasOwnProperty(names[0])) {
                            obj[names[0]] = {}
                        }
                        // 判断属性名是否以数字开头（若是代表是一个数组）
                        if (!Number.isNaN(parseInt(names[0]))) {
                            if (!ArrayUtils.isArrayObject(obj)) {
                                obj = [];
                            }
                        }
                        var propertyObj = obj[names[0]];
                        var newProperties = names.slice(1, names.length);
                        var newLinkProperty = '';
                        ArrayUtils.ergodicArrayObject(this, newProperties, function (property, i) {
                            if (i < newProperties.length - 1) {
                                newLinkProperty = newLinkProperty + property + '.'
                            } else {
                                newLinkProperty = newLinkProperty + property;
                            }
                        });
                        obj[names[0]] = this.createLinkProperty(propertyObj, newLinkProperty, value);
                        return obj;
                    }
                    // 判断属性名是否以数字开头（若是代表是一个数组）
                    if (!Number.isNaN(parseInt(linkProperty))) {
                        if (!ArrayUtils.isArrayObject(obj)) {
                            obj = [];
                        }
                    }
                    obj[linkProperty] = value;
                    return obj;
                } else if (BaseUtils.isArray(linkProperty)) {
                    ArrayUtils.ergodicArrayObject(this, linkProperty, function (link) {
                        obj = this.createLinkProperty(obj, link, value);
                    });
                    return obj;
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
                ArrayUtils.ergodicArrayObject(this, keys, function (propertyName) {
                    // 若内部对象需要遍历
                    var _propertyName = propertyName;
                    if (isReadInnerObject && obj[propertyName] !== null && typeof obj[propertyName] === 'object') {
                        this.ergodicObject(this, obj[propertyName], function (value, key) {
                            return cb.call(context, value, _propertyName + '.' + key);
                        }, true)
                    } else {
                        return cb.call(context, obj[propertyName], propertyName);
                    }
                })
            },
            /**
             * 当指定属性为空或不存在时执行回到函数；
             * @param context {object} 上下文
             * @param obj {object} 检测对象
             * @param propertyNames{Array|string} 需要检测的属性名
             *                                     可以检查多级属性如:'a.b.c.e'，
             *                                     多个属性使用数组，支持纯字符串多个属性用','隔开
             * @param cb {function} 回调函数[参数：为空或不存在的属性名,返回值为'-1'时，跳过之后的回调函数]
             */
            whileEmptyObjectProperty: function (context, obj, propertyNames, cb) {
                // 解析单个属性名
                if (typeof propertyNames === 'string') {
                    // 除去所有的空格
                    propertyNames = propertyNames.replace(/ /g, '');
                    // 不判断为空的值
                    if (propertyNames === '') {
                        return;
                    }
                    // 若是以','隔开的伪数组，则转化为数组再进行操作
                    if (propertyNames.indexOf(',') !== -1) {
                        var propertyNameArr = propertyNames.split(',');
                        return this.whileEmptyObjectProperty(context, obj, propertyNameArr, cb);
                    }
                    // 若指定级联属性
                    if (propertyNames.indexOf('.') !== -1) {
                        var names = propertyNames.split('.');
                        var iterationObj = obj;
                        var result = null;
                        ArrayUtils.ergodicArrayObject(this, names, function (name) {
                            if (iterationObj && iterationObj.hasOwnProperty(name)) {
                                iterationObj = iterationObj[name];
                            } else {
                                result = cb.call(window, propertyNames);
                                // 终止对接下来的属性的遍历
                                return -1;
                            }
                        });
                        return result;
                    }
                    // 正常流程
                    if (!obj.hasOwnProperty(propertyNames)) {
                        return cb.call(context, propertyNames);
                    }
                    if (obj[propertyNames] === null || obj[propertyNames] === '') {
                        return cb.call(context, propertyNames);
                    }
                } else if (BaseUtils.isArray(propertyNames)) {
                    // 解析数组
                    ArrayUtils.ergodicArrayObject(this, propertyNames, function (propertyName) {
                        // 递归调用
                        return this.whileEmptyObjectProperty(context, obj, propertyName, cb);
                    })
                }
            },
            whileEmptyObjectPropertyV2: function (context, obj, propertyNames, cb) {
                this.readLinkProperty(obj, propertyNames, function (value, propertyName) {
                    if (value === null || value === '' || parseInt(value) < 0) {
                        return cb.call(context, propertyName);
                    }
                })
            },
            /**
             * 克隆对象[只克隆属性，不克隆原型链]
             * @param obj {*}
             */
            cloneObject: function (obj) {
                var newObj = {};
                // 判断是否为基本数据类型，若是则直接返回
                if (typeof obj === 'string' ||
                    typeof obj === 'number' ||
                    typeof obj === 'undefined' ||
                    typeof obj === 'function' ||
                    typeof obj === 'boolean') {
                    return obj;
                }
                // 判断是否是数组
                if (BaseUtils.isArray(obj)) {
                    newObj = [];
                    // 遍历数组并递归调用该方法获取数组内部对象的克隆对象并push到新数组
                    ArrayUtils.ergodicArrayObject(this, obj, function (arrObjValue) {
                        newObj.push(this.cloneObject(arrObjValue));
                    })
                } else if (typeof obj === 'object') {
                    // 当目标为一般对象时即 typeof 为 object
                    if (obj === null) {
                        // 当克隆对象为空时，返回空
                        return null;
                    }
                    // 遍历对象的属性并调用递归方法获得该属性对应的对象的克隆对象并将其重新赋值到该属性
                    this.ergodicObject(this, obj, function (value, key) {
                        newObj[key] = this.cloneObject(value);
                    });
                }
                return newObj;
            },
            // cloneIndeed: function (obj) {
            //     var hash = new Map();
            //     var result = this._cloneIndeed(obj, hash);
            //     for (var item of hash.values()) {
            //         ArrayUtils.ergodicArrayObject(this, item.settingArr, function (func) {
            //             func.call(this);
            //         })
            //     }
            //     return result;
            // },
            // _cloneIndeed: function (obj, hash) {
            //     hash = hash || new Map();
            //     var result = {};
            //     // 获取数据类型
            //     var dataType = typeof obj;
            //     switch (dataType.toLowerCase()) {
            //         case 'string':
            //         case 'number':
            //         case 'boolean':
            //         case 'undefined':
            //             return obj;
            //         case 'object':
            //         default: {
            //             for (var key in obj) {
            //                 var nextObj = obj[key];
            //                 var hashObj = hash.get(nextObj);
            //                 if (hashObj != null && hashObj.clonedObj != null) {
            //                     obj[key] = null;
            //                 }
            //                 hash.set(nextObj, {
            //                         clonedObj: result,
            //                         settingArr: [],
            //                         active: false
            //                     }
            //                 );
            //                 result[key] = this._cloneIndeed(nextObj, hash);
            //             }
            //             if (obj != null) {
            //                 result['__proto__'] = obj['__proto__'];
            //             }
            //         }
            //
            //     }
            //     return result;
            // },
            /**
             * 获取对象的哈希码
             * @param obj {Object}
             * @returns {number}
             */
            getObjHashCode: function (obj) {
                var str = JSON.stringify(obj);
                var hash = 0, i, chr, len;
                console.log(str)
                console.log(hash)
                if (str.length === 0) return hash;
                for (i = 0, len = str.length; i < len; i++) {
                    chr = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + chr;
                    hash |= 0; // Convert to 32bit integer
                }
                console.log(str)
                console.log(hash)
                return hash;
            },
            /**
             * 扩展对象属性
             * @param obj 原对象
             * @param extendedObj 被扩展的对象
             * @param isCover {boolean=} 扩展的属性和原来属性冲突时是否覆盖 默认[false]
             * @param isClone {boolean=} 是否返回一个新的对象，默认[false]返回扩展后的原对象
             */
            expandObject: function (obj, extendedObj, isCover, isClone) {
                var resultObj = obj;
                if (isClone) {
                    resultObj = this.cloneObject(obj);
                }
                this.ergodicObject(this, extendedObj, function (value, key) {
                    if (isCover && this.readLinkProperty(resultObj, key) !== null) {
                        return;
                    }
                    resultObj = this.createLinkProperty(resultObj, key, value);
                }, true);
                return resultObj;
            },
            /**
             * 为数组排序，当数组中的元素为对象时，根据指定对象的属性名进行排序
             * @param arr 数组
             * @param propertyName 属性名（当有多个属性名时，为多级排序）
             * @param order 升降序
             * @returns {*}
             */
            sortingArrayByProperty: function (arr, propertyName, order) {
                var _this = this;
                var sortSetting = {
                    // 是否创建新数据
                    createNewData: false,
                    // 通过该方法获取数组中每个对象中用来比较的属性
                    getComparedProperty: function (arr) {
                        var compareArr = [];
                        ArrayUtils.ergodicArrayObject(_this, arr, function (obj, i) {
                            if (typeof obj !== 'object') {
                                compareArr.push(obj);
                            } else {
                                var compareValue = this.readLinkProperty(obj, propertyName);
                                if (compareValue !== null) {
                                    compareArr.push(compareValue);
                                } else {
                                    compareArr.push(obj);
                                }
                            }
                        });
                        return compareArr.slice(0);
                    }
                };
                return ArrayUtils.sortingArrays(arr, order, sortSetting);
            },
            /**
             * 转话为目标的实例
             * @param constructor {function} 构造函数
             * @param obj {object|Array}判断的对象
             * @param defaultProperty {object=}
             */
            toAimObject: function (obj, constructor, defaultProperty) {
                if (BaseUtils.isArray(obj)) {
                    var originArr = [];
                    ArrayUtils.ergodicArrayObject(this, obj, function (value) {
                        originArr.push(this.toAimObject(value, constructor, defaultProperty));
                    });
                    return originArr;
                } else if (typeof obj === 'object') {
                    if (defaultProperty) {
                        this.ergodicObject(this, defaultProperty, function (value, key) {
                            if (obj[key] === null) {
                                obj[key] = value;
                            }
                        });
                    }
                    if (obj instanceof constructor) {
                        return obj;
                    }
                    var originObj = obj;
                    while (originObj.__proto__ !== null && originObj.__proto__ !== Object.prototype) {
                        originObj = originObj.__proto__;
                    }
                    originObj.__proto__ = constructor.prototype;
                    return originObj;
                }
            },
            /**
             * 将数组中结构类似对象指定属性融合为一个数组
             * @param arr {Array}
             * @param propertyNames
             */
            parseTheSameObjectPropertyInArray: function (arr, propertyNames) {
                var result = {};
                var temp = {};
                ArrayUtils.ergodicArrayObject(this, arr, function (obj) {
                    // 获取想要得到的所有属性，以属性名为键值存储到temp中
                    this.readLinkProperty(obj, propertyNames, function (value, property) {
                        if (!temp.hasOwnProperty(property) || !(BaseUtils.isArray(temp[property]))) {
                            temp[property] = [];
                        }
                        temp[property].push(value);
                    });
                });
                // 遍历temp获取每个键值中的值，并单独取出
                this.ergodicObject(this, temp, function (value, key) {
                    result = this.createLinkProperty(result, key, value);
                });
                return this.cloneObject(result);
            },
            /**
             * 将数组中结构类似对象指定属性融合为一个数组
             * @param arr {Array}
             */
            parseTheSameObjectAllPropertyInArray: function (arr) {
                if (!ArrayUtils.isArrayObject(arr) || arr.length < 1) {
                    return;
                }
                // 获取一个对象的所有属性，包括内部对象的属性
                var propertyNames = [];
                this.ergodicObject(this, arr[0], function (v, k) {
                    propertyNames.push(k);
                }, true);
                return this.parseTheSameObjectPropertyInArray(arr, propertyNames);
            },
            /**
             * 获取对象属性，若为数组则计算其中数字的平均值或其它
             * @param obj
             * @param propertyNames{Array<string>|string}
             * @param type
             */
            getCalculationInArrayByLinkPropertyNames: function (obj, propertyNames, type) {
                var resultObject = {};
                var _this = this;
                switch (type) {
                    default:
                    case 'sum':
                        this.readLinkProperty(obj, propertyNames, function (value, key) {
                            if (ArrayUtils.isArrayObject(value)) {
                                resultObject = _this.createLinkProperty(resultObject, key, ArrayUtils.getSumInArray(value));
                            }
                        });
                        break;
                    case 'average':
                        this.readLinkProperty(obj, propertyNames, function (value, key) {
                            if (ArrayUtils.isArrayObject(value)) {
                                resultObject = _this.createLinkProperty(resultObject, key, ArrayUtils.getAverageInArray(value));
                            }
                        });
                        break;
                }
                return resultObject;
            }
        }
    });

    // ColorUtils
    factory('ColorUtils', [], function () {
        return {
            /**
             * 转换颜色rgb为16进制
             * @param r
             * @param g
             * @param b
             * @return {string}
             */
            rgbToHex: function (r, g, b) {
                var hex = ((r << 16) | (g << 8) | b).toString(16);
                return "#" + new Array(Math.abs(hex.length - 7)).join("0") + hex;
            },
            /**
             * 转换颜色16进制为rgb
             * @param hex
             * @return {Array}
             */
            hexToRgb: function (hex) {
                hex = hex.replace(/ /g, '');
                var length = hex.length;
                var rgb = [];
                switch (length) {
                    case 4:
                        rgb.push(parseInt(hex[1] + hex[1], 16));
                        rgb.push(parseInt(hex[2] + hex[2], 16));
                        rgb.push(parseInt(hex[3] + hex[3], 16));
                        return rgb;
                    case 7:
                        for (var i = 1; i < 7; i += 2) {
                            rgb.push(parseInt("0x" + hex.slice(i, i + 2)));
                        }
                        return rgb;
                    default:
                        break
                }
            },
            /**
             * 根据两个颜色以及之间的百分比获取渐进色
             * @param start
             * @param end
             * @param percentage
             * @return {*}
             */
            gradientColorsPercentage: function (start, end, percentage) {
                var resultRgb = [];
                var startRgb = this.hexToRgb(start);
                if (end == null) {
                    return start;
                }
                var endRgb = this.hexToRgb(end);
                var totalR = endRgb[0] - startRgb[0];
                var totalG = endRgb[1] - startRgb[1];
                var totalB = endRgb[2] - startRgb[2];
                resultRgb.push(startRgb[0] + totalR * percentage);
                resultRgb.push(startRgb[1] + totalG * percentage);
                resultRgb.push(startRgb[2] + totalB * percentage);
                return this.rgbToHex(resultRgb[0], resultRgb[1], resultRgb[2])
            }
        }
    });

    factory('FunctionUtils', [], function () {
        return {
            /**
             * 获取方法的名字
             * @param func
             * @returns {*}
             */
            getFunctionName: function (func) {
                if (typeof func === 'function' || typeof func === 'object') {
                    var name = ('' + func).match(/function\s*([\w\$]*)\s*\(/);
                }
                return func.name || name[1];
            },
            /**
             * 获取方法的参数名
             * @param func
             * @returns {*}
             */
            getFunctionParams: function (func) {
                if (typeof func === 'function' || typeof func === 'object') {
                    var name = ('' + func).match(/function.*\(([^)]*)\)/);
                    return name[1].replace(/( )|(\n)/g, '').split(',');
                }
                return;
            },
            /**
             * 通过方法的arguments获取调用该方法的函数
             * @param func_arguments
             * @returns {string}
             */
            getCallerName: function (func_arguments) {
                var caller = func_arguments.callee.caller;
                var callerName = '';
                if (caller) {
                    callerName = this.getFunctionName(caller);
                }
                return callerName;
            },
            FunctionBuilder: function (func) {
                var _this = this;
                var fs = [];
                fs.push(func);
                var properties = ['push', 'unshift', 'slice', 'map', 'forEach', 'keys', 'find', 'concat', 'fill', 'shift', 'values'];
                properties.map(function (property) {
                    if (typeof Array.prototype[property] === 'function') {
                        Object.defineProperty(_this, property, {
                            get: function () {
                                return function () {
                                    fs[property].apply(fs, arguments);
                                    return this;
                                }
                            }
                        });
                    }
                });
                this.result = function (context) {
                    var rfs = [];
                    fs.map(function (f, index) {
                        if (typeof f === 'function') {
                            rfs.push(f);
                        }
                    });
                    return function () {
                        var declareVar = {
                            arguments: arguments,
                            this: this
                        };
                        rfs.map(function (f) {
                            var dv = f.apply(context || this, [declareVar]);
                            if (dv) {
                                Object.keys(dv).map(function (key) {
                                    declareVar[key] = dv[key];
                                });
                            }
                        });
                        return declareVar.returnValue;
                    }
                }
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
                        method.apply(context, args)
                    );
                });
                return results;
            }
        }
    });

    factory('UrlUtils', [], function () {
        return {
            urlMatching: function (url, matchUrl) {
                var pattern = new RegExp(matchUrl);
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
                    var index = paramsStr[i].indexOf('=');
                    var ps = new Array(2);
                    if (index !== -1) {
                        ps = [
                            paramsStr[i].substring(0, index),
                            paramsStr[i].substring(index + 1),
                        ];
                    } else {
                        ps[0] = paramsStr[i];
                    }
                    params.push({
                        key: ps[0],
                        value: ps[1]
                    });
                }
                return params;
            },
            margeUrlAndParams: function (url, params) {
                if (url.indexOf('?') !== -1 || !(params instanceof Array)) {
                    return url;
                }
                var paramsStr = [];
                for (var i = 0; i < params.length; i++) {
                    if (params[i].key !== null && params[i].value !== null) {
                        paramsStr.push(params[i].key + '=' + params[i].value);
                    }
                }
                return url + '?' + paramsStr.join('&');
            }
        }
    });

    factory('PointUtils', [], function () {
        var Point2D = function (x, y) {
            this.x = x || 0;
            this.y = y || 0;
        };
        Point2D.prototype = {
            constructor: Point2D,
            /**
             * 获取指定距离和角度对应的平面点
             * @param distance
             * @param deg
             */
            getOtherPointFromDistanceAndDeg: function (distance, deg) {
                var radian = Math.PI / 180 * deg;
                var point = new this.constructor();
                point.x = distance * Math.sin(radian) + this.x;
                point.y = this.y - distance * Math.cos(radian);
                return point;
            },
            /**
             * 获取当前平面点与另一个平面点之间的距离
             * @param p
             * @returns {number}
             */
            getDistanceFromAnotherPoint: function (p) {
                return Math.sqrt((this.x - p.x) * (this.x - p.x) + (this.y - p.y) * (this.y - p.y));
            },
            /**
             * 获取当前平面点与另一个平面点之间的角度
             * @param p
             * @returns {number}
             */
            getDegFromAnotherPoint: function (p) {
                var usedPoint = new Point2D(p.x * 1000000 - this.x * 1000000, p.y * 1000000 - this.y * 1000000);
                var radian = Math.atan2(usedPoint.x * 1000000, usedPoint.y * 1000000);
                var deg = radian * 180 / Math.PI;
                return 180 - deg;
            },
            /**
             * 判断该点是否位于一矩形内部
             * @param x 矩形开始坐标x
             * @param y 矩形开始坐标y
             * @param width 矩形宽
             * @param height 矩形长
             * @returns {boolean}
             */
            isInRect: function (x, y, width, height) {
                var px = this.x;
                var py = this.y;
                if (px < x || px > x + width) {
                    return false;
                }
                return !(py < y || py > y + height);
            }
        };
        return {
            Point2D: Point2D
        }
    });


    factory('PropExpand', ['BaseUtils', 'ObjectUtils', 'ArrayUtils', 'UrlUtils'],
        function (BaseUtils, ObjectUtils, ArrayUtils, UrlUtils) {
            return {
                Object: {
                    getProperty: function (_self, propertyLink) {
                        return ObjectUtils.readLinkProperty(_self, propertyLink);
                    },
                    setProperty: function (_self, propertyLink, value) {
                        ObjectUtils.createLinkProperty(_self, propertyLink, value);
                    },
                    mapConvert: function (_self, mapper) {

                    },
                    keyMap: function (_self, cb) {
                    },
                    keyValues: function (_self, cb) {
                    },
                    keyFilter: function (_self, cb) {
                    },
                },
                Array: {
                    map: function () {
                    },
                    forEach: function () {
                    },
                    filter: function () {
                    },
                    reduce: function () {
                    },
                    keep: function () {
                    },
                    remove: function () {
                    }
                },
                String: {
                    join: function (_self, arr) {
                    },
                }
            }
        });

    _global.everyUtils = function () {
        if (BaseUtils.isArray(arguments[0])) {
            depend.call(arguments[2] || this, arguments[0], arguments[1]);
        } else if (BaseUtils.isFunction(arguments[0])) {
            var args = arguments;
            depend.call(arguments[1] || this, ['FunctionUtils'], function (FunctionUtils) {
                var depends = FunctionUtils.getFunctionParams(args[0]);
                depend(depends, args[0]);
            })
        }
    };

    _global.eUtils = (function () {
        var utils = {};
        if (window.everyUtils) {
            window.everyUtils(function (
                ArrayUtils,
                ObjectUtils,
                BaseUtils,
                FunctionUtils,
                ColorUtils,
                PointUtils,
                UrlUtils) {
                utils = {
                    ArrayUtils: ArrayUtils,
                    ObjectUtils: ObjectUtils,
                    BaseUtils: BaseUtils,
                    ColorUtils: ColorUtils,
                    UrlUtils: UrlUtils,
                    urlUtils: UrlUtils,
                    PointUtils: PointUtils,
                    FunctionUtils: FunctionUtils
                };
            });
        }
        var proxy = {};
        Object.keys(utils).forEach(function (utilName) {
            if (!utilName) {
                return;
            }
            Object.defineProperty(proxy, utilName, {
                get: function () {
                    return utils[utilName];
                }
            });
            Object.keys(utils[utilName]).forEach(function (key) {
                if (!key) {
                    return;
                }
                if (proxy[key]) {
                    return;
                }
                Object.defineProperty(proxy, key, {
                    get: function () {
                        return utils[utilName][key];
                    }
                })
            })
        });
        return proxy;
    })();

    return _global.eUtils;
}));