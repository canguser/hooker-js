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
                var cbObject = {
                    resp: {},
                    parseScript: function (m, args) {
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
                            src = util.urlUtils.margeUrlAndParams(args[0].requestUrl, args[0].requestParams);
                            args[0].src = encodeURI(src);
                            var cbName = 'callback';
                            args[0].requestParams.map(function (kv) {
                                if (kv.key.toLowerCase() === 'cb' || kv.key.toLowerCase() === 'callback') {
                                    cbName = kv.value;
                                }
                            });
                            if (window[cbName]) {
                                global.eHook.unHook(window, cbName, true);
                                global.eHook.hookBefore(window, cbName, function (m, args) {
                                    ajaxChange.cb.resp.call(this, args, util);
                                });
                                console.log('Hooking call back: ' + cbName + ' success.')
                            } else {
                                var isDelete = false;
                                try {
                                    isDelete = delete window[cbName]
                                } catch (e) {
                                    isDelete = false;
                                }
                                if (isDelete) {
                                    Object.defineProperty(window, cbName, {
                                        set: function (v) {
                                            global.eHook.unHook(cbObject.resp, cbName, true);
                                            cbObject.resp[cbName] = v;
                                            global.eHook.hookBefore(cbObject.resp,
                                                cbName, function (m, args) {
                                                    ajaxChange.cb.resp.call(this, args, util);
                                                });
                                        },
                                        get: function () {
                                            return cbObject.resp[cbName];
                                        }
                                    });
                                    console.log('Hooking(proxy) call back: ' + cbName + ' success.')
                                } else {
                                    console.log('Hooking call back: ' + cbName + ' failed.')
                                }
                            }
                        }
                    }
                };
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
                    cbObject.parseScript(m, args);
                }, false);
                global.eHook.hookBefore(Node.prototype, 'insertBefore', function (m, args) {
                    cbObject.parseScript(m, args);
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