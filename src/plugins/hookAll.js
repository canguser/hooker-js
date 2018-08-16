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
                    filter: function (patten) {
                        ajaxObject.filterPatten = patten;
                        return this;
                    },
                    ajax: {
                        req: function () {

                        },
                        resp: function () {

                        },
                        send: function () {

                        }
                    },
                    cb: {
                        req: function () {

                        },
                        resp: function () {

                        }
                    },
                };
                // hook jsonp
                global.eHook.hookBefore(Node.prototype, 'appendChild', function (m, args) {
                    if (args[0].localName === 'script') {
                        var src = decodeURI(args[0].src);
                        var isPass = true;
                        if (ajaxObject.filterPatten) {
                            isPass = util.urlUtils.urlMatching(src, ajaxObject.filterPatten);
                        }
                        if (!isPass) {
                            return;
                        }
                        args[0].requestParams = util.urlUtils.getParamFromUrl(src);
                        args[0].requestUrl = util.urlUtils.getUrlWithoutParam(src);
                        ajaxChange.cb.req.call(this, args[0], util);
                    }
                }, false);
                global.eHook.hookBefore(Node.prototype, 'insertBefore', function (m, args) {
                    if (args[0].localName === 'script') {
                        var src = decodeURI(args[0].src);
                        var isPass = true;
                        if (!isPass) {
                            return;
                        }
                        if (ajaxObject.filterPatten) {
                            isPass = util.urlUtils.urlMatching(src, ajaxObject.filterPatten);
                        }
                        args[0].requestParams = util.urlUtils.getParamFromUrl(src);
                        args[0].requestUrl = util.urlUtils.getUrlWithoutParam(src);
                        ajaxChange.cb.req.call(this, args[0], util);
                    }
                }, false);

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