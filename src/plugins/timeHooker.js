// ==UserScript==
// @name         TimerHooker
// @namespace    https://gitee.com/HGJing/everthing-hook/
// @updateURL    https://gitee.com/HGJing/everthing-hook/raw/master/src/plugins/timeHooker.js
// @version      0.2.0005
// @description  it can hook the timer speed to change.
// @include      *
// @require      https://gitee.com/HGJing/everthing-hook/raw/master/src/everything-hook.js
// @author       Cangshi
// @match        http://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
/**
 * ---------------------------
 * Time: 2017/11/20 19:28.
 * Author: Cangshi
 * View: http://palerock.cn
 * ---------------------------
 */
//               https://code.jquery.com/jquery-3.3.1.min.js
~function (global) {

    var generate = function () {
        return function (util) {
            var _this = this;
            var timerHooker = {
                // 用于储存计时器的id和参数
                _intervalIds: {},
                // 计时器速率
                __percentage: 1.0,
                // 劫持前的原始的方法
                _setInterval: window['setInterval'],
                _clearInterval: window['clearInterval'],
                _setTimeout: window['setTimeout'],
                /**
                 * 初始化方法
                 */
                init: function () {
                    var __this = this;
                    // 劫持循环计时器
                    _this.hookReplace(window, 'setInterval', function (setInterval) {
                        return function () {
                            // 储存原始时间间隔
                            arguments[2] = arguments[1];
                            // 获取变速时间间隔
                            arguments[1] *= __this._percentage;
                            var resultId = setInterval.apply(window, arguments);
                            // 保存每次使用计时器得到的id以及参数等
                            __this._intervalIds[resultId] = {
                                args: arguments,
                                nowId: resultId
                            };
                            return resultId;
                        };
                    });
                    // 劫持循环计时器的清除方法
                    _this.hookBefore(window, 'clearInterval', function (method, args) {
                        var id = args[0];
                        if (__this._intervalIds[id]) {
                            args[0] = __this._intervalIds[id].nowId;
                        }
                        // 清除该记录id
                        delete __this._intervalIds[id];
                    });
                    // 劫持单次计时器setTimeout
                    _this.hookBefore(window, 'setTimeout', function (method, args) {
                        args[1] *= __this._percentage;
                    });
                    // 保护方法不被篡改
                    _this.protect(window, 'setInterval');
                    _this.protect(window, 'clearInterval');
                    // 设定百分比属性被修改的回调
                    Object.defineProperty(__this, '_percentage', {
                        get: function () {
                            return __this.__percentage;
                        },
                        set: function (percentage) {
                            if (percentage == __this.__percentage) {
                                return percentage;
                            }
                            __this._onChange.call(__this, percentage);
                            __this.__percentage = percentage;
                            return percentage;
                        }
                    });
                    // 界面半圆按钮点击的方法
                    window.changTime = function (anum, cnum, isa, isr) {
                        if (isr) {
                            timer.change(1);
                            return;
                        }
                        if (!timer) {
                            return;
                        }
                        var result;
                        if (!anum && !cnum) {
                            var t = prompt("输入欲改变计时器变化倍率（当前：" + 1 / __this._percentage + "）");
                            if (t == undefined) {
                                return;
                            }
                            if (isNaN(parseFloat(t))) {
                                alert("请输入正确的数字");
                                changTime();
                                return;
                            }
                            if (parseFloat(t) <= 0) {
                                alert("倍率不能小于等于0");
                                changTime();
                                return;
                            }
                            result = 1 / parseFloat(t);
                        } else {
                            if (isa && anum) {
                                if (1 /__this._percentage <= 1 && anum < 0) {
                                    return;
                                }
                                result = 1 / (1 / __this._percentage + anum);
                            } else {
                                if (cnum < 0) {
                                    cnum = 1 / -cnum
                                }
                                result = 1 / ((1 / __this._percentage) * cnum);
                            }
                        }
                        timer.change(result);
                    };
                    var style = '._th-container ._th-item{margin-bottom:3px;position:relative;width:30px;height:30px;cursor:pointer;opacity:.3;background-color:aquamarine;border-radius:100%;text-align:center;line-height:30px;-webkit-transition:all .5s;-o-transition:all .5s;transition:all .5s;right:30px}._th-container ._th-item._item-x2{margin-left:18px;width:40px;height:40px;line-height:40px}._th-container ._th-item._item-x-2{margin-left:17px;width:38px;height:38px;line-height:38px}._th-container ._th-item._item-x4{width:36px;height:36px;margin-left:16px;line-height:36px}._th-container ._th-item._item-x-4{width:32px;height:32px;line-height:32px;margin-left:14px}._th-container ._th-item._item-reset{width:30px;line-height:30px;height:30px;margin-left:10px}._th-click-hover{position:relative;-webkit-transition:all .5s;-o-transition:all .5s;transition:all .5s;height:50px;width:50px;cursor:pointer;opacity:.3;border-radius:100%;background-color:aquamarine;text-align:center;line-height:50px;right:0}._th-container:hover{left:-10px}._th-container{font-size:12px;-webkit-transition:all .5s;-o-transition:all .5s;transition:all .5s;left:-40px;top:20%;position:fixed;-webkit-box-sizing:border-box;box-sizing:border-box;z-index:99999}._th-container ._th-item:hover{opacity:.8;background-color:#5fb492;color:aliceblue}._th-container:hover ._th-click-hover{opacity:.8}._th-container:hover ._th-item{opacity:.6;right:0}._th-container ._th-click-hover:hover{opacity:.8;background-color:#5fb492;color:aliceblue}';

                    // 在页面左边添加一个半圆便于修改
                    var html = '<div class="_th-container">\n' +
                        '    <div class="_th-click-hover" onclick="changTime()">\n' +
                        '        x' + 1 / __this._percentage + '\n' +
                        '    </div>\n' +
                        '    <div class="_th-item _item-x2" onclick="changTime(2,0,true)">&gt;</div>\n' +
                        '    <div class="_th-item _item-x-2" onclick="changTime(-2,0,true)">&lt;</div>\n' +
                        '    <div class="_th-item _item-x4" onclick="changTime(0,4)">&gt;&gt;</div>\n' +
                        '    <div class="_th-item _item-x-4" onclick="changTime(0,-4)">&lt;&lt;</div>\n' +
                        '    <div class="_th-item _item-reset" onclick="changTime(0,0,false,true)">O</div>\n' +
                        '</div>';
                    var stylenode = document.createElement('style');
                    stylenode.setAttribute("type", "text/css");
                    if (stylenode.styleSheet) {// IE
                        stylenode.styleSheet.cssText = style;
                    } else {// w3c
                        var cssText = document.createTextNode(style);
                        stylenode.appendChild(cssText);
                    }
                    var node = document.createElement('div');
                    node.innerHTML = html;
                    window.addEventListener('load', function () {
                        document.head.appendChild(stylenode);
                        document.body.appendChild(node);
                    });
                },
                /**
                 * 当计时器速率被改变时调用的回调方法
                 * @param percentage
                 * @private
                 */
                _onChange: function (percentage) {
                    // 改变所有的循环计时
                    util.ergodicObject(this, this._intervalIds, function (idObj, id) {
                        idObj.args[1] = idObj.args[2] * percentage;
                        // 结束原来的计时器
                        this._clearInterval.call(window, idObj.nowId);
                        // 新开一个计时器
                        idObj.nowId = this._setInterval.apply(window, idObj.args);
                    });
                },
                /**
                 * 调用该方法改变计时器速率
                 * @param percentage
                 */
                change: function (percentage) {
                    this._percentage = percentage;
                    var oldNode = document.getElementsByClassName('_th-click-hover');
                    oldNode[0].innerHTML = 'x' + 1 / this._percentage;
                }
            };
            // 默认初始化
            timerHooker.init();
            return timerHooker;
        }
    };

    if (global.eHook) {
        global.eHook.plugins({
            name: 'timer',
            /**
             * 插件装载
             * @param util
             */
            mount: generate()
        });
    }
}(window);