// ==UserScript==
// @name         Hook all ajax
// @namespace    https://gitee.com/HGJing/everthing-hook/
// @version      0.1.001
// @description  it can hook all ajax
// @include      *
// @require      https://gitee.com/HGJing/everthing-hook/raw/master/src/everything-hook.js
// @author       Cangshi
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function (global) {
    'use strict';
    if (global.eHook) {
        global.eHook.plugins({
            name: 'ajaxChange',
            /**
             * 插件装载
             * @param util
             */
            mount: function (util) {
                var cb_names_key = '___hook_cb_names';
                var cb_names_value = sessionStorage.getItem(cb_names_key);
                var cbObject = {};
                var ajaxChange = {
                    req: function () {

                    },
                    resp: function () {

                    },
                    send: function () {

                    },
                    cb: function () {

                    },
                    hookedCb: function () {
                        sessionStorage.setItem(cb_names_key, JSON.stringify(Array.prototype.slice.call(arguments, 0)));
                    }
                };
                var cbNames = cb_names_value && JSON.parse(cb_names_value);
                if (cbNames) {
                    cbNames.map(function (name) {
                        try {
                            Object.defineProperty(window, name, {
                                get: function () {
                                    return cbObject[name];
                                },
                                set: function (f) {
                                    global.eHook.unHook(cbObject, name);
                                    cbObject[name] = f;
                                    global.eHook.hookBefore(cbObject, name, function (m, args) {
                                        ajaxChange.cb.call(this, name, args);
                                    });
                                }
                            });
                        } catch (e) {
                            console.log('Callback - ' + name + ', hooked failed.');
                        }
                    })
                }
                global.aHook.register('.*', {
                        hookResponse: function () {
                            return ajaxChange.resp.call(this, arguments, util);
                        },
                        hookSend: function () {
                            return ajaxChange.req.call(this, arguments, util);
                        },
                        hookRequest: function () {
                            return ajaxChange.send.call(this, arguments, util);
                        }
                    }
                );
                return ajaxChange;
            }
        });
    }
    // Your code here...
})(window);