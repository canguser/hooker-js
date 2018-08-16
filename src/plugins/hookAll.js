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
            name: 'NetHook',
            /**
             * 插件装载
             * @param util
             */
            mount: function (util) {
                var cb_names_key = '___hook_cb_names';
                var cb_names_value = localStorage.getItem(cb_names_key);
                var cbObject = {};
                var ajaxObject = {
                    filterPatten: ''
                };
                var ajaxChange = {
                    ajax: {
                        filter: function (patten) {
                            ajaxObject.filterPatten = patten;
                            return this;
                        },
                        req: function () {

                        },
                        resp: function () {

                        },
                        send: function () {

                        }
                    },
                    cb: function () {

                    },
                    hookedCb: function () {
                        localStorage.setItem(cb_names_key, JSON.stringify(Array.prototype.slice.call(arguments, 0)));
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
                                    global.eHook.unHook(cbObject, name, true);
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
                            var isPass = true;
                            if (ajaxObject.filterPatten) {
                                isPass = util.urlUtils.urlMatching(this.responseURL, ajaxObject.filterPatten);
                            }
                            return isPass && ajaxChange.ajax.resp.call(this, arguments, util);
                        },
                        hookSend: function (args) {
                            var isPass = true;
                            if (ajaxObject.filterPatten) {
                                isPass = util.urlUtils.urlMatching(this.requestURL, ajaxObject.filterPatten);
                            }
                            return isPass && ajaxChange.ajax.send.call(this, arguments, util);
                        },
                        hookRequest: function (args) {
                            var isPass = true;
                            if (ajaxObject.filterPatten) {
                                isPass = util.urlUtils.urlMatching(args.url, ajaxObject.filterPatten);
                            }
                            this.requestURL = args.url;
                            return isPass && ajaxChange.ajax.req.call(this, arguments, util);
                        }
                    }
                );
                return ajaxChange;
            }
        });
    }
})(window);