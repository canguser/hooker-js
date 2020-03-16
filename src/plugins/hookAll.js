// ==UserScript==
// @name         Hook all ajax
// @namespace    https://gitee.com/HGJing/everthing-hook/
// @version      0.1.018
// @description  it can hook all ajax
// @include      *
// @require      http://localhost:63342/everthing-hook/src/everything-hook.js
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
                        if (args[0].localName !== 'script') {
                            return;
                        }
                        var src = decodeURI(args[0].src);
                        var isPass = true;
                        if (ajaxObject.filterPatten) {
                            isPass = util.urlUtils.urlMatching(src, ajaxObject.filterPatten);
                        }
                        if (!isPass || !ajaxChange.cb.req) {
                            return;
                        }
                        var urls = src.split(',');
                        if (urls.length > 1) {
                            return;
                        }
                        args[0].requestParams = util.urlUtils.getParamFromUrl(src);
                        args[0].requestUrl = util.urlUtils.getUrlWithoutParam(src);
                        ajaxChange.cb.req.call(this, args[0], util);
                        var aimedUrl = util.urlUtils.margeUrlAndParams(args[0].requestUrl, args[0].requestParams);
                        if (aimedUrl !== src) {
                            args[0].src = aimedUrl;
                        }
                        var cbName = undefined;
                        args[0].requestParams.map(function (kv) {
                            if (kv.key.toLowerCase() === 'cb' || kv.key.toLowerCase() === 'callback') {
                                cbName = kv.value;
                            }
                        });
                        if (!cbName || !ajaxChange.cb.resp) {
                            return;
                        }
                        if (window[cbName]) {
                            global.eHook.removeHookMethod(window, cbName);
                            global.eHook.hookBefore(window, cbName, function (m, args) {
                                ajaxChange.cb.resp.call(window, args, util);
                                // console.log('Hooking call back: ' + cbName + ' success.')
                            }, false);
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
                };
                var isAutoInit = localStorage.getItem('__hook_all_auto_init');
                if (!isAutoInit) {
                    localStorage.setItem('__hook_all_auto_init', JSON.stringify(true));
                    isAutoInit = localStorage.getItem('__hook_all_auto_init');
                }
                var ajaxObject = {
                    filterPatten: '',
                    isAutoInit: isAutoInit && isAutoInit !== 'false'
                };
                var ajaxChange = {
                    filter: function (pattern) {
                        ajaxObject.filterPatten = pattern;
                        return this;
                    },
                    ajax: {
                        req: undefined,
                        resp: undefined,
                        send: undefined
                    },
                    cb: {
                        req: undefined,
                        resp: undefined
                    },
                    setting: {
                        autoInit: function (b) {
                            ajaxObject.isAutoInit = b;
                            localStorage.setItem('__hook_all_auto_init', JSON.stringify(b));
                        }
                    },
                    init: function () {
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
                                    return !isPass ? undefined : ajaxChange.ajax.resp && ajaxChange.ajax.resp.call(this, arguments, util);
                                },
                                hookSend: function (args) {
                                    var isPass = true;
                                    if (ajaxObject.filterPatten) {
                                        isPass = util.urlUtils.urlMatching(this.requestURL, ajaxObject.filterPatten);
                                    }
                                    return !isPass ? undefined : ajaxChange.ajax.send && ajaxChange.ajax.send.call(this, arguments, util);
                                },
                                hookRequest: function (args) {
                                    window.util = util;
                                    var isPass = true;
                                    if (ajaxObject.filterPatten) {
                                        isPass = util.urlUtils.urlMatching(args.fullUrl, ajaxObject.filterPatten);
                                    }
                                    this.requestURL = args.fullUrl;
                                    return !isPass ? undefined : ajaxChange.ajax.req && ajaxChange.ajax.req.call(this, arguments, util);
                                }
                            }
                        );
                    },
                    onInit: function () {
                    }
                };
                ajaxChange.onInit();
                // if (ajaxObject.isAutoInit) {
                ajaxChange.init();
                // }

                return ajaxChange;
            }
        });
    }
})(window);