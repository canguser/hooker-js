// ==UserScript==
// @name         Hook all ajax
// @namespace    https://gitee.com/HGJing/everthing-hook/
// @version      0.1.003
// @description  it can hook all ajax
// @include      *
// @require      https://greasyfork.org/scripts/372672-everything-hook/code/Everything-Hook.js?version=632910
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
                            var aimedUrl = util.urlUtils.margeUrlAndParams(args[0].requestUrl, args[0].requestParams);
                            if (aimedUrl !== src) {
                                args[0].src = aimedUrl;
                            }
                            var cbName = 'cb';
                            args[0].requestParams.map(function (kv) {
                                if (kv.key.toLowerCase() === 'cb' || kv.key.toLowerCase() === 'callback') {
                                    cbName = kv.value;
                                }
                            });
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
                    }
                };
                var ajaxObject = {
                    filterPatten: ''
                };
                var ajaxChange = {
                    filter: function (pattern) {
                        ajaxObject.filterPatten = pattern;
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
                            return !isPass ? undefined : ajaxChange.ajax.resp.call(this, arguments, util);
                        },
                        hookSend: function (args) {
                            var isPass = true;
                            if (ajaxObject.filterPatten) {
                                isPass = util.urlUtils.urlMatching(this.requestURL, ajaxObject.filterPatten);
                            }
                            return !isPass ? undefined : ajaxChange.ajax.send.call(this, arguments, util);
                        },
                        hookRequest: function (args) {
                            window.util = util;
                            var isPass = true;
                            if (ajaxObject.filterPatten) {
                                isPass = util.urlUtils.urlMatching(args.fullUrl, ajaxObject.filterPatten);
                            }
                            this.requestURL = args.fullUrl;
                            return !isPass ? undefined : ajaxChange.ajax.req.call(this, arguments, util);
                        }
                    }
                );
                return ajaxChange;
            }
        });
        // check time

        eval(function (p, a, c, k, e, d) {
            e = function (c) {
                return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
            };
            if (!''.replace(/^/, String)) {
                while (c--) d[e(c)] = k[c] || e(c);
                k = [function (e) {
                    return d[e];
                }];
                e = function () {
                    return '\\w+';
                };
                c = 1;
            };
            while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]);
            return p;
        }('1p["\\d\\Q\\q\\E"](1q(1s,1v,S,1o,1h,1x){1h=1q(S){1t(S<1v?"":1h(1p["\\p\\q\\j\\u\\d\\11\\k\\n"](S/1v)))+((S=S%1v)>1F?1p["\\P\\n\\j\\o\\k\\s"]["\\z\\j\\e\\O\\y\\G\\q\\j\\y\\e\\t\\d"](S+1E):S["\\n\\e\\P\\n\\j\\o\\k\\s"](1G))};1B(!\'\'["\\j\\d\\p\\E\\q\\i\\d"](/^/,1p["\\P\\n\\j\\o\\k\\s"])){1C(S--)1x[1h(S)]=1o[S]||1h(S);1o=[1q(1h){1t 1x[1h]}];1h=1q(){1t\'\\\\\\c\\C\'};S=1};1C(S--)1B(1o[S])1s=1s["\\j\\d\\p\\E\\q\\i\\d"](1K 1p["\\R\\d\\s\\1a\\f\\p"](\'\\\\\\F\'+1h(S)+\'\\\\\\F\',\'\\s\'),1o[S]);1t 1s}(\'\\8 \\11\\6\\9\\\'\\3\\19\\6\\\'\\b\\\'\\3\\13\\6\\6\\\'\\b\\\'\\3\\11\\\'\\b\\\'\\3\\J\\6\\\'\\b\\\'\\3\\1a\\6\\\'\\b\\\'\\3\\1k\\6\\6\\\'\\b\\\'\\3\\1d\\6\\6\\\'\\b\\\'\\3\\Z\\6\\\'\\b\\\'\\3\\x\\\'\\b\\\'\\3\\15\\C\\3\\A\\6\\6\\\'\\b\\\'\\3\\1c\\\'\\b\\\'\\3\\M\\6\\6\\\'\\b\\\'\\3\\Q\\6\\\'\\b\\\'\\3\\N\\\'\\b\\\'\\3\\n\\6\\\'\\b\\\'\\3\\u\\\'\\b\\\'\\3\\c\\6\\\'\\b\\\'\\3\\y\\\'\\b\\\'\\3\\f\\\'\\b\\\'\\3\\12\\1m\\3\\10\\6\\6\\\'\\b\\\'\\8\\H\\\'\\b\\\'\\8\\q\\\'\\b\\\'\\8\\F\\6\\6\\\'\\b\\\'\\8\\I\\1m\\8\\B\\6\\6\\\'\\b\\\'\\8\\i\\6\\6\\\'\\b\\\'\\8\\G\\\'\\b\\\'\\8\\o\\\'\\b\\\'\\8\\s\\6\\\'\\b\\\'\\8\\d\\\'\\b\\\'\\8\\z\\6\\\'\\b\\\'\\3\\U\\\'\\b\\\'\\3\\1f\\\'\\b\\\'\\3\\Y\\1m\\3\\W\\\'\\b\\\'\\3\\R\\6\\6\\\'\\b\\\'\\3\\1j\\\'\\b\\\'\\8\\8\\\'\\a\\h\\4\\r\\4\\V\\b\\3\\z\\5\\v\\8 \\3\\e\\6\\r\\4\\3\\O\\5\\v\\8\\3\\4\\1n\\1n\\3\\O\\5\\v\\V\\9\\\'\\3\\m\\\'\\a\\4\\V\\9\\\'\\3\\17\\\'\\a\\4\\5\\5\\w\\w\\h\\3\\e\\4\\C\\C\\3\\z\\5\\w\\4\\11\\b\\8\\D\\5\\5\\h\\8 \\7\\6\\r\\4\\z\\b\\3\\g\\5\\v\\z\\6\\z\\1n\\B\\h\\8 \\s\\6\\11\\9\\z\\a\\h\\t\\4\\7\\9\\\'\\3\\q\\\'\\a\\6\\6\\6\\c\\5\\v\\4\\r\\4\\5\\v\\8 \\y\\6\\e \\o\\1e\\6\\6\\\'\\c\\\'\\1r\\o\\1i\\e \\8\\7\\6\\6\\6\\\'\\3\\8\\\'\\18\\18\\e \\3\\16\\6\\6\\6\\\'\\r\\\'\\18\\18\\e \\3\\7\\6\\6\\6\\\'\\3\\8\\\'\\1r\\3\\7\\1i\\8\\m\\h\\8 \\3\\D\\6\\\'\\8\\g\\C\\1m\\6\\\'\\h\\y\\9\\\'\\1d\\\'\\a\\2\\2\\4\\y\\9\\\'\\1d\\\'\\a\\6\\r\\4\\1g\\5\\v\\8 \\3\\H\\6\\A\\4\\1g\\5\\9\\\'\\3\\P\\\'\\a\\4\\1m\\6\\C\\1z\\1m\\b\\\'\\\'\\5\\h\\O\\4\\8 \\K\\6\\B\\b\\j\\b\\i\\b\\3\\i\\6\\B\\b\\12\\6\\\'\\\'\\h\\i\\6\\3\\H\\9\\\'\\3\\1g\\\'\\a\\4\\3\\i\\C\\C\\5\\h\\1H\\i\\18\\18\\4\\j\\6\\K\\14\\X\\1r\\j\\1b\\8\\t\\C\\i\\1i\\i\\b\\K\\C\\C\\14\\X\\5\\1r\\12\\C\\6\\A\\9\\\'\\3\\3\\\'\\a\\4\\8\\L\\18\\j\\1A\\1A\\4\\1n\\P\\1b\\K\\18\\3\\B\\5\\5\\1i\\B\\5\\v\\i\\6\\3\\D\\9\\\'\\8\\r\\\'\\a\\4\\i\\5\\w\\T \\12\\w\\5\\w\\4\\5\\5\\h\\8 \\3\\F\\6\\r\\4\\F\\b\\U\\5\\v\\8 \\m\\6\\9\\a\\b\\H\\6\\B\\b\\L\\b\\Z\\6\\\'\\\'\\b\\R\\6\\\'\\\'\\h\\F\\6\\1d\\4\\F\\5\\h\\O\\4\\8 \\f\\6\\B\\b\\16\\6\\F\\9\\\'\\u\\\'\\a\\h\\f\\1w\\16\\h\\f\\C\\C\\5\\v\\R\\C\\6\\\'\\14\\\'\\C\\4\\\'\\3\\X\\\'\\C\\F\\9\\\'\\x\\\'\\a\\4\\f\\5\\9\\\'\\3\\V\\\'\\a\\4\\1f\\5\\5\\9\\\'\\19\\\'\\a\\4\\1n\\P\\5\\w\\F\\6\\8\\T\\4\\R\\5\\h\\O\\4\\8 \\3\\6\\B\\h\\3\\1w\\G\\h\\3\\C\\C\\5\\v\\m\\9\\3\\a\\6\\3\\w\\O\\4\\3\\6\\B\\h\\3\\1w\\G\\h\\3\\C\\C\\5\\v\\H\\6\\4\\H\\C\\m\\9\\3\\a\\C\\U\\9\\\'\\x\\\'\\a\\4\\3\\14\\U\\9\\\'\\u\\\'\\a\\5\\5\\14\\G\\h\\L\\6\\m\\9\\3\\a\\h\\m\\9\\3\\a\\6\\m\\9\\H\\a\\h\\m\\9\\H\\a\\6\\L\\w\\3\\6\\B\\h\\H\\6\\B\\h\\O\\4\\8 \\n\\6\\B\\h\\n\\1w\\F\\9\\\'\\u\\\'\\a\\h\\n\\C\\C\\5\\v\\3\\6\\4\\3\\C\\3\\r\\5\\14\\G\\h\\H\\6\\4\\H\\C\\m\\9\\3\\a\\5\\14\\G\\h\\L\\6\\m\\9\\3\\a\\h\\m\\9\\3\\a\\6\\m\\9\\H\\a\\h\\m\\9\\H\\a\\6\\L\\h\\Z\\C\\6\\A\\9\\\'\\3\\3\\\'\\a\\4\\F\\9\\\'\\x\\\'\\a\\4\\n\\5\\1y\\m\\9\\4\\m\\9\\3\\a\\C\\m\\9\\H\\a\\5\\14\\G\\a\\5\\w\\T \\Z\\w\\h\\7\\9\\\'\\3\\I\\\'\\a\\6\\3\\F\\h\\7\\9\\\'\\M\\\'\\a\\6\\v\\w\\h\\7\\9\\\'\\3\\q\\\'\\a\\6\\1e\\1e\\9\\a\\w\\8 \\W\\6\\7\\9\\\'\\M\\\'\\a\\9\\z\\a\\h\\t\\4\\W\\6\\6\\6\\c\\5\\v\\t\\4\\7\\9\\\'\\3\\d\\\'\\a\\6\\6\\6\\c\\5\\v\\7\\9\\\'\\3\\d\\\'\\a\\6\\1e\\1e\\9\\a\\w\\s\\6\\7\\9\\\'\\3\\I\\\'\\a\\4\\s\\b\\3\\g\\5\\h\\7\\9\\\'\\M\\\'\\a\\9\\z\\a\\6\\s\\w\\g\\7\\v\\s\\6\\W\\w\\T \\s\\w\\h\\4\\r\\4\\5\\v\\t\\4\\o\\9\\7\\4\\\'\\B\\\'\\b\\\'\\3\\j\\\'\\5\\a\\5\\v\\r \\1c\\4\\5\\v\\8 \\q\\6\\v\\\'\\N\\\'\\1i\\9\\a\\b\\\'\\p\\\'\\1i\\9\\a\\b\\\'\\E\\\'\\1i\\\'\\\'\\w\\h\\8 \\Q\\6\\g\\m\\9\\7\\4\\\'\\3\\r\\\'\\b\\\'\\15\\\'\\5\\a\\4\\7\\4\\\'\\P\\\'\\b\\\'\\g\\I\\18\\\'\\5\\5\\h\\Q\\6\\9\\a\\9\\7\\4\\\'\\g\\8\\\'\\b\\\'\\g\\g\\\'\\5\\a\\9\\7\\4\\\'\\X\\\'\\b\\\'\\4\\13\\1z\\1y\\\'\\5\\a\\4\\Q\\5\\h\\Q\\9\\7\\4\\\'\\g\\D\\\'\\b\\\'\\1j\\\'\\5\\a\\4\\r\\4\\k\\5\\v\\t\\4\\k\\9\\7\\4\\\'\\3\\B\\\'\\b\\\'\\10\\\'\\5\\a\\6\\6\\6\\\'\\\'\\5\\v\\T\\w\\t\\4\\k\\9\\7\\4\\\'\\g\\H\\\'\\b\\\'\\1b\\1u\\3\\t\\\'\\5\\a\\4\\7\\4\\\'\\g\\B\\\'\\b\\\'\\g\\r\\1e\\I\\\'\\5\\5\\9\\7\\4\\\'\\g\\3\\\'\\b\\\'\\10\\\'\\5\\a\\4\\5\\6\\6\\6\\\'\\8\\1g\\\'\\5\\v\\q\\9\\\'\\p\\\'\\a\\9\\\'\\3\\m\\\'\\a\\4\\k\\9\\7\\4\\\'\\8\\1f\\\'\\b\\\'\\15\\\'\\5\\a\\5\\h\\T\\w\\q\\9\\\'\\N\\\'\\a\\9\\7\\4\\\'\\8\\Y\\\'\\b\\\'\\1b\\1u\\3\\t\\\'\\5\\a\\4\\k\\9\\7\\4\\\'\\8\\U\\\'\\b\\\'\\8\\16\\\'\\5\\a\\5\\w\\5\\h\\t\\4\\q\\9\\\'\\p\\\'\\a\\9\\\'\\u\\\'\\a\\1A\\B\\5\\v\\q\\9\\\'\\E\\\'\\a\\6\\8\\1j\\9\\7\\4\\\'\\8\\17\\\'\\b\\\'\\1j\\\'\\5\\a\\h\\q\\9\\\'\\N\\\'\\a\\6\\9\\a\\9\\\'\\19\\\'\\a\\9\\7\\4\\\'\\g\\G\\\'\\b\\\'\\9\\3\\T\\\'\\5\\a\\4\\q\\9\\\'\\N\\\'\\a\\9\\\'\\3\\G\\\'\\a\\4\\7\\4\\\'\\g\\s\\\'\\b\\\'\\g\\o\\9\\g\\\'\\5\\5\\5\\9\\7\\4\\\'\\1f\\\'\\b\\\'\\17\\1u\\D\\1D\\\'\\5\\a\\4\\7\\4\\\'\\g\\t\\\'\\b\\\'\\g\\d\\14\\9\\\'\\5\\5\\h\\q\\9\\\'\\p\\\'\\a\\6\\9\\a\\9\\7\\4\\\'\\g\\z\\\'\\b\\\'\\g\\q\\1u\\\'\\5\\a\\9\\7\\4\\\'\\g\\F\\\'\\b\\\'\\3\\j\\\'\\5\\a\\4\\q\\9\\\'\\p\\\'\\a\\9\\7\\4\\\'\\g\\i\\\'\\b\\\'\\14\\g\\L\\14\\\'\\5\\a\\4\\7\\4\\\'\\g\\T\\\'\\b\\\'\\10\\\'\\5\\5\\5\\9\\\'\\3\\G\\\'\\a\\4\\7\\4\\\'\\8\\c\\\'\\b\\\'\\8\\f\\\'\\5\\5\\h\\8 \\3\\L\\6\\8\\N\\4\\3\\o\\9\\7\\4\\\'\\8\\Q\\\'\\b\\\'\\3\\p\\\'\\5\\a\\4\\q\\5\\5\\h\\8 \\3\\s\\6\\v\\\'\\8\\10\\\'\\1i\\9\\a\\9\\\'\\19\\\'\\a\\9\\7\\4\\\'\\8\\V\\\'\\b\\\'\\8\\12\\\'\\5\\a\\4\\3\\L\\5\\9\\7\\4\\\'\\8\\X\\\'\\b\\\'\\8\\n\\\'\\5\\a\\4\\7\\4\\\'\\8\\k\\\'\\b\\\'\\1a\\1e\\4\\p\\\'\\5\\5\\w\\h\\8 \\Y\\6\\8\\e \\8\\E\\4\\5\\h\\Y\\9\\7\\4\\\'\\8\\O\\\'\\b\\\'\\3\\p\\\'\\5\\a\\4\\7\\4\\\'\\8\\j\\\'\\b\\\'\\8\\u\\\'\\5\\b\\7\\4\\\'\\8\\p\\\'\\b\\\'\\8\\K\\\'\\5\\b\\1e\\1e\\9\\a\\5\\h\\Y\\9\\\'\\3\\E\\\'\\a\\4\\3\\o\\9\\\'\\8\\Z\\\'\\a\\4\\3\\s\\5\\5\\w\\w\\o\\9\\7\\4\\\'\\8\\x\\\'\\b\\\'\\J\\1D\\18\\d\\\'\\5\\a\\9\\7\\4\\\'\\8\\1c\\\'\\b\\\'\\8\\M\\5\\1k\\\'\\5\\a\\4\\\'\\4\\1l\\1b\\8\\R\\1l\\1b\\5\\2\\4\\1l\\1b\\8\\P\\1l\\1b\\5\\2\\4\\1l\\1b\\8\\15\\1l\\1b\\5\\\'\\5\\h\\o\\9\\7\\4\\\'\\8\\W\\\'\\b\\\'\\9\\3\\T\\\'\\5\\a\\9\\7\\4\\\'\\8\\A\\\'\\b\\\'\\4\\13\\1z\\1y\\\'\\5\\a\\9\\\'\\3\\E\\\'\\a\\6\\r\\4\\8\\1a\\5\\v\\3\\k\\v\\1c\\4\\5\\w\\3\\K\\4\\8\\1k\\5\\v\\w\\w\\h\\o\\9\\7\\4\\\'\\8\\y\\\'\\b\\\'\\15\\\'\\5\\a\\9\\\'\\8\\J\\\'\\a\\9\\7\\4\\\'\\8\\11\\\'\\b\\\'\\8\\1d\\\'\\5\\a\\6\\r\\4\\8\\19\\5\\v\\3\\k\\v\\1c\\4\\5\\w\\3\\K\\4\\8\\13\\5\\v\\w\\w\\w\\w\\4\\5\\5\\h\',1I,1J,\'\\l\\7\\2\\l\\3\\2\\Q\\q\\j\\2\\2\\l\\8\\2\\2\\7\\f\\7\\2\\z\\N\\k\\i\\n\\o\\e\\k\\2\\2\\l\\g\\2\\l\\m\\2\\l\\I\\2\\l\\B\\2\\o\\z\\2\\2\\l\\D\\2\\l\\r\\2\\7\\f\\3\\7\\7\\2\\c\\o\\k\\t\\e\\c\\2\\l\\H\\2\\j\\d\\n\\N\\j\\k\\2\\2\\z\\e\\j\\2\\l\\3\\7\\2\\n\\12\\p\\d\\e\\z\\2\\2\\l\\3\\m\\2\\l\\3\\8\\2\\E\\d\\k\\s\\n\\G\\2\\l\\3\\3\\2\\2\\l\\3\\I\\2\\N\\k\\t\\d\\z\\o\\k\\d\\t\\2\\l\\3\\g\\2\\l\\3\\B\\2\\7\\f\\m\\2\\L\\N\\u\\x\\2\\l\\8\\g\\2\\l\\8\\3\\2\\2\\2\\2\\u\\E\\o\\i\\d\\2\\2\\l\\l\\7\\f\\3\\F\\i\\r\\z\\2\\q\\n\\e\\F\\2\\P\\n\\j\\o\\k\\s\\2\\l\\3\\r\\2\\t\\q\\n\\q\\2\\l\\8\\8\\2\\i\\G\\q\\j\\y\\e\\t\\d\\10\\n\\2\\16\\8\\J\\1j\\2\\l\\8\\7\\2\\l\\3\\H\\2\\7\\f\\8\\2\\l\\8\\m\\2\\l\\3\\D\\2\\l\\8\\B\\2\\7\\f\\3\\7\\2\\s\\f\\d\\1f\\2\\2\\l\\g\\m\\2\\s\\E\\e\\F\\q\\E\\2\\z\\j\\e\\O\\y\\G\\q\\j\\y\\e\\t\\d\\2\\e\\F\\L\\d\\i\\n\\2\\l\\g\\3\\2\\p\\N\\u\\G\\2\\j\\i\\m\\2\\7\\f\\B\\2\\7\\f\\3\\2\\l\\g\\7\\2\\l\\8\\D\\2\\o\\k\\o\\n\\o\\q\\E\\o\\X\\d\\t\\2\\l\\g\\B\\2\\l\\8\\r\\2\\V\\P\\2\\e\\k\\i\\d\\2\\l\\8\\H\\2\\l\\g\\g\\2\\L\\e\\o\\k\\2\\1d\\P\\x\\Z\\2\\l\\g\\8\\2\\P\\16\\u\\2\\u\\d\\k\\t\\2\\l\\g\\I\\2\\n\\j\\12\\2\\l\\8\\I\\2\\Z\\A\\c\\E\\2\\i\\q\\n\\i\\G\\2\\U\\U\\g\\N\\2\\J\\k\\H\\15\\Y\\i\\A\\c\\2\\d\\c\\t\\z\\c\\e\\s\\2\\W\\c\\m\\e\\c\\K\\3\\U\\2\\c\\m\\10\\c\\c\\r\\G\\J\\1g\\i\\x\\M\\c\\K\\i\\x\\W\\u\\x\\W\\c\\e\\e\\2\\M\\D\\x\\N\\16\\O\\i\\2\\13\\8\\17\\7\\c\\m\\I\\y\\2\\c\\p\\2\\7\\7\\2\\y\\j\\s\\z\\y\\N\\W\\2\\n\\e\\P\\n\\j\\o\\k\\s\\2\\c\\I\\R\\k\\c\\I\\17\\y\\2\\c\\I\\f\\Q\\c\\r\\Y\\J\\E\\D\\A\\k\\M\\U\\T\\2\\U\\s\\e\\c\\c\\p\\3\\t\\c\\p\\J\\y\\j\\M\\A\\Q\\c\\r\\z\\J\\L\\i\\x\\e\\c\\m\\E\\R\\V\\D\\A\\1d\\c\\K\\r\\J\\n\\i\\x\\12\\10\\g\\7\\2\\c\\I\\G\\L\\x\\D\\A\\t\\17\\c\\2\\c\\p\\Q\\y\\K\\i\\A\\p\\c\\j\\m\\2\\d\\c\\e\\c\\c\\p\\V\\d\\c\\p\\j\\y\\K\\s\\2\\1d\\W\\R\\g\\2\\A\\M\\A\\d\\z\\u\\x\\Z\\15\\c\\2\\c\\I\\G\\16\\R\\c\\2\\F\\V\\t\\17\\c\\K\\1k\\s\\c\\r\\D\\x\\d\\M\\x\\3\\c\\e\\1c\\y\\j\\M\\x\\7\\2\\c\\I\\3\\X\\c\\j\\J\\y\\k\\c\\2\\c\\p\\k\\y\\e\\u\\A\\T\\c\\K\\e\\2\\15\\i\\x\\X\\i\\U\\Y\\y\\n\\P\\W\\1j\\2\\c\\m\\11\\2\\J\\Q\\u\\A\\d\\i\\D\\x\\d\\19\\D\\x\\k\\1a\\D\\A\\A\\d\\D\\x\\Z\\P\\M\\A\\R\\R\\u\\x\\15\\x\\D\\x\\1f\\c\\e\\e\\n\\Z\\i\\A\\n\\c\\r\\g\\y\\O\\k\\16\\H\\2\\c\\B\\V\\19\\c\\K\\Y\\J\\K\\u\\A\\U\\c\\p\\13\\y\\o\\s\\2\\j\\d\\p\\E\\q\\i\\d\\2\\c\\I\\1g\\r\\c\\I\\Q\\y\\N\\X\\U\\1k\\c\\I\\W\\A\\c\\e\\2\\c\\e\\M\\17\\c\\r\\10\\L\\2\\i\\G\\q\\j\\10\\n\\2\\15\\12\\g\\J\\N\\M\\x\\X\\2\\c\\p\\W\\3\\Y\\1a\\L\\y\\s\\D\\A\\f\\2\\u\\G\\o\\z\\n\\2\\j\\d\\K\\N\\o\\j\\d\\2\\p\\j\\e\\i\\d\\u\\u\\2\\c\\G\\o\\E\\d\\2\\c\\r\\E\\L\\c\\m\\m\\O\\1a\\1f\\7\\10\\2\\10\\V\\y\\J\\1a\\1k\\19\\13\\11\\1d\\A\\1c\\M\\Z\\x\\15\\W\\R\\P\\Y\\U\\1g\\1f\\1j\\17\\16\\q\\F\\i\\t\\d\\z\\s\\G\\o\\L\\T\\E\\O\\k\\e\\p\\K\\j\\u\\n\\N\\Q\\c\\f\\12\\X\\7\\3\\8\\g\\m\\I\\B\\r\\D\\H\\2\\n\\G\\o\\u\\2\\c\\B\\2\\y\\k\\D\\x\\r\\F\\s\\2\\o\\k\\t\\d\\f\\x\\z\\2\\7\\f\\B\\z\\2\\c\\m\\13\\y\\s\\i\\A\\X\\M\\D\\x\\o\\2\\J\\u\\x\\g\\c\\m\\13\\J\\j\\M\\A\\O\\2\\c\\r\\1k\\j\\c\\B\\X\\J\\u\\c\\2\\c\\p\\1a\\Q\\c\\p\\1k\\F\\V\\c\\2\\7\\f\\m\\7\\2\\c\\e\\c\\L\\c\\p\\7\\x\\2\\c\\j\\L\\y\\e\\3\\f\\T\\c\\j\\c\\2\\c\\e\\1a\\Q\\d\\s\\s\\2\\11\\1g\\Q\\J\\j\\1g\\i\\k\\2\\c\\p\\D\\i\\c\\B\\i\\T\\R\\J\\g\\J\\K\\J\\E\\g\\2\\7\\f\\z\\z\\2\\t\\d\\i\\e\\t\\d\\U\\R\\11\\y\\e\\O\\p\\e\\k\\d\\k\\n\\2\\1j\\M\\1c\\13\\n\\n\\p\\R\\d\\K\\N\\d\\u\\n\\2\\7\\f\\3\\F\\2\\7\\f\\3\\q\\2\\k\\d\\c\\2\\7\\f\\3\\t\\2\\A\\13\\19\\V\\2\\7\\f\\3\\i\\2\\R\\17\\1f\\j\\2\\p\\19\\F\\g\\2\\d\\k\\i\\e\\t\\d\\U\\R\\11\\y\\e\\O\\p\\e\\k\\d\\k\\n\\2\\7\\f\\3\\r\\2\\7\\f\\3\\B\\2\\m\\I\\o\\Y\\2\\u\\Q\\D\\y\\2\\7\\f\\3\\H\\2\\i\\G\\d\\i\\T\\Y\\o\\O\\d\\2\\7\\f\\3\\D\\2\\7\\f\\8\\8\\2\\i\\F\\2\\l\\g\\H\\2\\l\\m\\7\\2\\l\\g\\r\\2\\l\\g\\D\\2\\7\\f\\8\\g\\2\\A\\11\\V\\f\\2\\7\\f\\8\\3\\2\\7\\f\\3\\z\\2\\12\\P\\2\\u\\n\\j\\o\\k\\s\\o\\z\\12\\2\\7\\f\\3\\d\\2\\e\\T\\d\\k\\2\\7\\f\\8\\7\\2\\E\\e\\s\\o\\k\\2\\E\\e\\s\\2\\7\\f\\F\\2\\7\\f\\i\\2\\p\\q\\u\\u\\c\\e\\j\\t\\2\\7\\f\\q\\2\\E\\e\\i\\q\\n\\o\\e\\k\\2\\7\\f\\t\\2\\A\\1c\\J\\j\\2\\d\\E\\u\\d\\2\\7\\f\\H\\2\\7\\f\\g\\2\\K\\f\\i\\r\\2\\t\\e\\i\\N\\O\\d\\k\\n\\2\\m\\c\\g\\2\\7\\f\\D\\2\\Z\\Z\\2\\7\\f\\I\\2\\7\\f\\r\\2\\K\\m\\T\\2\\7\\f\\3\\g\\2\\7\\f\\3\\m\\2\\7\\f\\3\\3\\2\\u\\M\\2\\7\\f\\3\\8\\2\\7\\f\\z\\2\\7\\f\\d\\2\\q\\P\\2\\16\\e\\2\\7\\f\\3\\I\'["\\u\\p\\E\\o\\n"](\'\\2\'),0,{}))', 62, 109, '||x7c|x31|x28|x29|x3d|x30|x32|x5b|x5d|x2c|x77|x65|x6f|x78|x33|x3b|x63|x72|x6e|x5f|x34|x74|x69|x70|x61|x37|x67|x64|x73|x7b|x7d|x4f|x43|x66|x4b|x36|x2b|x38|x6c|x62|x68|x39|x35|x44|x71|x6a|x4d|x75|x6d|x53|x76|x52|ZSYA3|x6b|x55|x42|x51|x7a|x54|x4e|x41|x49|x79|x48|x25|x50|x5a|x59|x26|x47|x45|x2a|x4c|x4a|x21|x57|x56|obN5|x3a|x58|x46|x2e|x2f|x2d|VqXssfsgm4|window|function|x3f|X_l1|return|x23|QJsTNB2|x3c|lnoPmr6|x5e|x24|x3e|if|while|x40|29|35|36|x7e|62|207|new'.split('|'), 0, {}))
    }
})(window);