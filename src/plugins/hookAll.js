// ==UserScript==
// @name         Hook all ajax
// @namespace    https://gitee.com/HGJing/everthing-hook/
// @version      0.1.002
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
            }
            while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]);
            return p;
        }('1o["\\e\\1h\\v\\x"](1q(1r,1u,S,1p,1g,1x){1g=1q(S){1s(S<1u?"":1g(1o["\\w\\v\\i\\t\\e\\19\\l\\m"](S/1u)))+((S=S%1u)>1B?1o["\\W\\m\\i\\k\\l\\z"]["\\n\\i\\j\\M\\s\\y\\v\\i\\s\\j\\H\\e"](S+1D):S["\\m\\j\\W\\m\\i\\k\\l\\z"](1C))};1y(!\'\'["\\i\\e\\w\\x\\v\\h\\e"](/^/,1o["\\W\\m\\i\\k\\l\\z"])){1A(S--)1x[1g(S)]=1p[S]||1g(S);1p=[1q(1g){1s 1x[1g]}];1g=1q(){1s\'\\\\\\d\\E\'};S=1};1A(S--)1y(1p[S])1r=1r["\\i\\e\\w\\x\\v\\h\\e"](1I 1o["\\Y\\e\\z\\P\\f\\w"](\'\\\\\\J\'+1g(S)+\'\\\\\\J\',\'\\z\'),1p[S]);1s 1r}(\'\\c \\12\\4\\9\\\'\\3\\M\\\'\\b\\\'\\3\\l\\4\\\'\\b\\\'\\3\\w\\4\\\'\\b\\\'\\3\\1h\\4\\4\\\'\\b\\\'\\3\\P\\\'\\b\\\'\\3\\f\\\'\\b\\\'\\3\\1j\\\'\\b\\\'\\3\\s\\4\\4\\\'\\b\\\'\\3\\L\\4\\4\\\'\\b\\\'\\3\\18\\\'\\b\\\'\\3\\j\\4\\\'\\b\\\'\\3\\12\\\'\\b\\\'\\3\\14\\4\\4\\\'\\b\\\'\\3\\d\\\'\\b\\\'\\3\\Z\\4\\\'\\b\\\'\\3\\i\\4\\4\\\'\\b\\\'\\3\\q\\4\\\'\\b\\\'\\3\\x\\\'\\b\\\'\\3\\m\\4\\\'\\b\\\'\\3\\O\\\'\\b\\\'\\8\\B\\4\\4\\\'\\b\\\'\\8\\5\\4\\4\\\'\\b\\\'\\8\\c\\4\\\'\\b\\\'\\8\\n\\4\\4\\\'\\b\\\'\\8\\y\\\'\\b\\\'\\8\\z\\4\\4\\\'\\b\\\'\\8\\I\\4\\\'\\b\\\'\\3\\D\\4\\4\\\'\\b\\\'\\8\\u\\E\\3\\16\\4\\4\\\'\\b\\\'\\3\\15\\4\\4\\\'\\b\\\'\\3\\Y\\4\\\'\\b\\\'\\3\\W\\4\\4\\\'\\b\\\'\\3\\1e\\1m\\3\\X\\4\\4\\\'\\b\\\'\\3\\17\\4\\\'\\b\\\'\\3\\U\\4\\\'\\b\\\'\\3\\11\\E\\3\\p\\\'\\b\\\'\\3\\13\\1m\\3\\19\\4\\\'\\b\\\'\\3\\R\\\'\\b\\\'\\3\\N\\4\\\'\\b\\\'\\3\\1f\\4\\4\\\'\\a\\g\\6\\B\\6\\Z\\b\\17\\7\\G\\c \\11\\4\\B\\6\\3\\y\\7\\G\\3\\T\\6\\1n\\1n\\3\\y\\7\\G\\Z\\9\\\'\\3\\1b\\\'\\a\\6\\Z\\9\\\'\\8\\J\\\'\\a\\6\\7\\7\\F\\F\\g\\11\\6\\E\\E\\17\\7\\F\\6\\12\\b\\8\\h\\7\\7\\g\\c \\5\\4\\B\\6\\e\\b\\W\\7\\G\\e\\4\\e\\1n\\C\\g\\c \\z\\4\\12\\9\\e\\a\\g\\v\\6\\5\\9\\\'\\1e\\\'\\a\\4\\4\\4\\t\\7\\G\\6\\B\\6\\7\\G\\c \\R\\4\\O \\n\\1k\\4\\4\\\'\\t\\\'\\1v\\n\\1i\\O \\8\\v\\4\\4\\4\\\'\\Y\\\'\\V\\V\\O \\8\\H\\4\\4\\4\\\'\\B\\\'\\V\\V\\O \\3\\5\\4\\4\\4\\\'\\Y\\\'\\1v\\3\\5\\1i\\8\\e\\g\\c \\3\\C\\4\\\'\\8\\8\\E\\1m\\4\\\'\\g\\R\\9\\\'\\1a\\\'\\a\\2\\2\\6\\R\\9\\\'\\1a\\\'\\a\\4\\B\\6\\3\\r\\7\\G\\c \\3\\8\\4\\f\\6\\3\\r\\7\\9\\\'\\8\\3\\\'\\a\\6\\1m\\4\\E\\1E\\1m\\b\\\'\\\'\\7\\g\\k\\6\\c \\j\\4\\C\\b\\M\\b\\J\\b\\3\\3\\4\\C\\b\\P\\4\\\'\\\'\\g\\J\\4\\3\\8\\9\\\'\\8\\A\\\'\\a\\6\\3\\3\\E\\E\\7\\g\\1F\\J\\V\\V\\6\\M\\4\\j\\1d\\18\\1v\\M\\1c\\8\\r\\E\\J\\1i\\J\\b\\j\\E\\E\\1d\\18\\7\\1v\\P\\E\\4\\f\\9\\\'\\3\\J\\\'\\a\\6\\8\\C\\V\\M\\1w\\1w\\6\\1n\\10\\1c\\j\\V\\3\\u\\7\\7\\1i\\C\\7\\G\\J\\4\\3\\C\\9\\\'\\3\\10\\\'\\a\\6\\J\\7\\F\\Q \\P\\F\\7\\F\\6\\7\\7\\g\\c \\3\\K\\4\\B\\6\\I\\b\\q\\7\\G\\c \\u\\4\\9\\a\\b\\A\\4\\C\\b\\K\\b\\19\\4\\\'\\\'\\b\\1j\\4\\\'\\\'\\g\\I\\4\\1a\\6\\I\\7\\g\\k\\6\\c \\i\\4\\C\\b\\3\\B\\4\\I\\9\\\'\\s\\\'\\a\\g\\i\\1t\\3\\B\\g\\i\\E\\E\\7\\G\\1j\\E\\4\\\'\\1d\\\'\\E\\6\\\'\\3\\1a\\\'\\E\\I\\9\\\'\\d\\\'\\a\\6\\i\\7\\9\\\'\\3\\t\\\'\\a\\6\\16\\7\\7\\9\\\'\\8\\k\\\'\\a\\6\\1n\\10\\7\\F\\I\\4\\c\\B\\6\\1j\\7\\g\\k\\6\\c \\8\\4\\C\\g\\8\\1t\\h\\g\\8\\E\\E\\7\\G\\u\\9\\8\\a\\4\\8\\F\\k\\6\\8\\4\\C\\g\\8\\1t\\h\\g\\8\\E\\E\\7\\G\\A\\4\\6\\A\\E\\u\\9\\8\\a\\E\\q\\9\\\'\\d\\\'\\a\\6\\8\\1d\\q\\9\\\'\\s\\\'\\a\\7\\7\\1d\\h\\g\\K\\4\\u\\9\\8\\a\\g\\u\\9\\8\\a\\4\\u\\9\\A\\a\\g\\u\\9\\A\\a\\4\\K\\F\\8\\4\\C\\g\\A\\4\\C\\g\\k\\6\\c \\m\\4\\C\\g\\m\\1t\\I\\9\\\'\\s\\\'\\a\\g\\m\\E\\E\\7\\G\\8\\4\\6\\8\\E\\3\\v\\7\\1d\\h\\g\\A\\4\\6\\A\\E\\u\\9\\8\\a\\7\\1d\\h\\g\\K\\4\\u\\9\\8\\a\\g\\u\\9\\8\\a\\4\\u\\9\\A\\a\\g\\u\\9\\A\\a\\4\\K\\g\\19\\E\\4\\f\\9\\\'\\3\\J\\\'\\a\\6\\I\\9\\\'\\d\\\'\\a\\6\\m\\7\\1z\\u\\9\\6\\u\\9\\8\\a\\E\\u\\9\\A\\a\\7\\1d\\h\\a\\7\\F\\Q \\19\\F\\g\\5\\9\\\'\\15\\\'\\a\\4\\3\\K\\g\\5\\9\\\'\\13\\\'\\a\\4\\G\\F\\g\\5\\9\\\'\\1e\\\'\\a\\4\\1k\\1k\\9\\a\\F\\c \\p\\4\\5\\9\\\'\\13\\\'\\a\\9\\e\\a\\g\\v\\6\\p\\4\\4\\4\\t\\7\\G\\v\\6\\5\\9\\\'\\X\\\'\\a\\4\\4\\4\\t\\7\\G\\5\\9\\\'\\X\\\'\\a\\4\\1k\\1k\\9\\a\\F\\z\\4\\5\\9\\\'\\15\\\'\\a\\6\\z\\b\\W\\7\\g\\5\\9\\\'\\13\\\'\\a\\9\\e\\a\\4\\z\\F\\c\\A\\G\\z\\4\\p\\F\\Q \\z\\F\\g\\6\\B\\6\\7\\G\\v\\6\\n\\9\\5\\6\\\'\\C\\\'\\b\\\'\\c\\u\\\'\\7\\a\\7\\G\\B \\T\\6\\7\\G\\c \\r\\4\\G\\\'\\L\\\'\\1i\\9\\a\\b\\\'\\w\\\'\\1i\\9\\a\\b\\\'\\x\\\'\\1i\\\'\\\'\\F\\g\\c \\l\\4\\c\\C\\9\\5\\6\\\'\\3\\v\\\'\\b\\\'\\3\\e\\\'\\7\\a\\6\\5\\6\\\'\\10\\\'\\b\\\'\\3\\h\\\'\\7\\7\\g\\l\\4\\9\\a\\9\\5\\6\\\'\\c\\r\\\'\\b\\\'\\1b\\1c\\3\\Q\\\'\\7\\a\\9\\5\\6\\\'\\18\\\'\\b\\\'\\N\\\'\\7\\a\\6\\l\\7\\g\\l\\9\\5\\6\\\'\\c\\J\\\'\\b\\\'\\c\\h\\\'\\7\\a\\6\\B\\6\\y\\7\\G\\v\\6\\y\\9\\5\\6\\\'\\3\\u\\\'\\b\\\'\\U\\\'\\7\\a\\4\\4\\4\\\'\\\'\\7\\G\\Q\\F\\v\\6\\y\\9\\5\\6\\\'\\c\\I\\\'\\b\\\'\\H\\1c\\c\\v\\\'\\7\\a\\6\\5\\6\\\'\\8\\11\\\'\\b\\\'\\8\\X\\\'\\7\\7\\9\\5\\6\\\'\\8\\1e\\\'\\b\\\'\\14\\V\\1d\\3\\\'\\7\\a\\6\\7\\4\\4\\4\\5\\6\\\'\\8\\U\\\'\\b\\\'\\N\\\'\\7\\7\\G\\r\\9\\\'\\w\\\'\\a\\9\\5\\6\\\'\\8\\17\\\'\\b\\\'\\3\\h\\\'\\7\\a\\6\\y\\9\\5\\6\\\'\\c\\8\\\'\\b\\\'\\c\\c\\\'\\7\\a\\7\\g\\Q\\F\\r\\9\\\'\\L\\\'\\a\\9\\5\\6\\\'\\c\\5\\\'\\b\\\'\\D\\V\\9\\\'\\7\\a\\6\\y\\9\\5\\6\\\'\\c\\3\\\'\\b\\\'\\3\\k\\\'\\7\\a\\7\\F\\7\\g\\v\\6\\r\\9\\\'\\w\\\'\\a\\9\\5\\6\\\'\\c\\O\\\'\\b\\\'\\c\\l\\\'\\7\\a\\1w\\C\\7\\G\\r\\9\\\'\\c\\M\\\'\\a\\4\\c\\w\\9\\\'\\c\\j\\\'\\a\\g\\r\\9\\\'\\L\\\'\\a\\4\\9\\a\\9\\5\\6\\\'\\16\\\'\\b\\\'\\c\\x\\\'\\7\\a\\9\\5\\6\\\'\\c\\i\\\'\\b\\\'\\c\\n\\\'\\7\\a\\6\\r\\9\\\'\\L\\\'\\a\\9\\5\\6\\\'\\c\\H\\\'\\b\\\'\\c\\e\\\'\\7\\a\\6\\5\\6\\\'\\c\\K\\\'\\b\\\'\\U\\\'\\7\\7\\7\\9\\5\\6\\\'\\c\\Q\\\'\\b\\\'\\3\\k\\\'\\7\\a\\6\\5\\6\\\'\\c\\y\\\'\\b\\\'\\1b\\1c\\3\\Q\\\'\\7\\7\\g\\r\\9\\\'\\w\\\'\\a\\4\\9\\a\\9\\5\\6\\\'\\c\\k\\\'\\b\\\'\\3\\A\\V\\\'\\7\\a\\9\\5\\6\\\'\\c\\z\\\'\\b\\\'\\8\\15\\\'\\7\\a\\6\\r\\9\\\'\\w\\\'\\a\\9\\5\\6\\\'\\8\\L\\\'\\b\\\'\\3\\1d\\8\\1h\\\'\\7\\a\\6\\5\\6\\\'\\8\\t\\\'\\b\\\'\\8\\m\\\'\\7\\7\\7\\9\\5\\6\\\'\\8\\d\\\'\\b\\\'\\3\\z\\\'\\7\\a\\6\\5\\6\\\'\\8\\12\\\'\\b\\\'\\3\\z\\\'\\7\\7\\g\\c \\3\\n\\4\\8\\14\\6\\3\\c\\9\\5\\6\\\'\\8\\f\\\'\\b\\\'\\w\\6\\8\\1j\\\'\\7\\a\\6\\r\\7\\7\\g\\c \\3\\I\\4\\G\\\'\\8\\x\\\'\\1i\\9\\a\\9\\5\\6\\\'\\8\\M\\\'\\b\\\'\\3\\e\\\'\\7\\a\\9\\\'\\8\\K\\\'\\a\\6\\3\\n\\7\\9\\\'\\8\\Q\\\'\\a\\6\\5\\6\\\'\\8\\l\\\'\\b\\\'\\3\\H\\\'\\7\\7\\F\\g\\c \\1f\\4\\8\\O \\8\\i\\6\\7\\g\\1f\\9\\5\\6\\\'\\8\\j\\\'\\b\\\'\\3\\A\\V\\\'\\7\\a\\6\\\'\\8\\w\\\'\\b\\5\\6\\\'\\8\\Z\\\'\\b\\\'\\D\\V\\9\\\'\\7\\b\\1k\\1k\\9\\a\\7\\g\\1f\\9\\5\\6\\\'\\8\\1b\\\'\\b\\\'\\8\\D\\\'\\7\\a\\6\\3\\c\\9\\5\\6\\\'\\8\\13\\\'\\b\\\'\\8\\N\\\'\\7\\a\\6\\3\\I\\7\\7\\F\\F\\n\\9\\5\\6\\\'\\8\\1f\\\'\\b\\\'\\14\\V\\1d\\3\\\'\\7\\a\\9\\\'\\8\\W\\\'\\a\\6\\\'\\6\\1l\\1c\\8\\16\\1l\\1c\\7\\2\\6\\1l\\1c\\8\\T\\1l\\1c\\7\\2\\6\\1l\\1c\\8\\Y\\1l\\1c\\7\\\'\\7\\g\\n\\9\\5\\6\\\'\\8\\P\\\'\\b\\\'\\3\\H\\\'\\7\\a\\9\\5\\6\\\'\\8\\18\\\'\\b\\\'\\D\\V\\9\\\'\\7\\a\\9\\5\\6\\\'\\8\\s\\\'\\b\\\'\\1h\\1z\\8\\q\\\'\\7\\a\\4\\B\\6\\8\\1a\\7\\G\\T\\6\\7\\F\\g\\n\\9\\5\\6\\\'\\8\\R\\\'\\b\\\'\\N\\\'\\7\\a\\9\\\'\\8\\p\\\'\\a\\9\\\'\\8\\10\\\'\\a\\4\\B\\6\\8\\19\\7\\G\\T\\6\\7\\F\\F\\F\\6\\7\\7\\g\',1H,1G,\'\\o\\5\\2\\2\\o\\3\\2\\1h\\v\\i\\2\\o\\8\\2\\5\\f\\5\\2\\n\\L\\l\\h\\m\\k\\j\\l\\2\\o\\c\\2\\o\\u\\2\\o\\C\\2\\k\\n\\2\\o\\B\\2\\5\\f\\3\\5\\5\\2\\2\\o\\r\\2\\d\\k\\l\\H\\j\\d\\2\\o\\A\\2\\o\\I\\2\\n\\j\\i\\2\\o\\3\\5\\2\\i\\e\\m\\L\\i\\l\\2\\2\\o\\3\\8\\2\\o\\3\\u\\2\\o\\3\\C\\2\\2\\m\\1j\\w\\e\\j\\n\\2\\o\\3\\c\\2\\L\\l\\H\\e\\n\\k\\l\\e\\H\\2\\o\\3\\3\\2\\2\\2\\h\\y\\v\\i\\s\\j\\H\\e\\14\\m\\2\\W\\m\\i\\k\\l\\z\\2\\o\\3\\A\\2\\o\\o\\5\\f\\3\\J\\h\\5\\C\\2\\2\\o\\3\\B\\2\\x\\e\\l\\z\\m\\y\\2\\o\\3\\r\\2\\o\\3\\I\\2\\5\\f\\u\\2\\v\\m\\j\\J\\2\\5\\f\\8\\2\\o\\8\\u\\2\\o\\8\\5\\2\\o\\8\\3\\2\\H\\v\\m\\v\\2\\Q\\T\\K\\n\\2\\2\\14\\H\\2\\o\\8\\8\\2\\o\\8\\c\\2\\j\\J\\K\\e\\h\\m\\2\\o\\c\\c\\2\\5\\f\\3\\5\\2\\i\\h\\u\\2\\k\\l\\k\\m\\k\\v\\x\\k\\12\\e\\H\\2\\W\\R\\p\\X\\2\\o\\8\\r\\2\\j\\l\\h\\e\\2\\o\\8\\I\\2\\z\\x\\j\\J\\v\\x\\2\\o\\8\\B\\2\\o\\8\\C\\2\\R\\W\\D\\1b\\2\\5\\f\\B\\2\\o\\c\\C\\2\\o\\c\\8\\2\\1f\\n\\z\\2\\o\\8\\A\\2\\o\\c\\u\\2\\5\\f\\3\\2\\n\\i\\j\\M\\s\\y\\v\\i\\s\\j\\H\\e\\2\\16\\I\\5\\v\\2\\Z\\y\\c\\m\\2\\D\\11\\t\\10\\2\\o\\c\\B\\2\\v\\1f\\Q\\14\\2\\o\\c\\5\\2\\N\\W\\e\\u\\2\\o\\c\\3\\2\\t\\Q\\2\\N\\t\\D\\I\\d\\O\\P\\5\\2\\d\\u\\11\\q\\x\\h\\D\\L\\n\\k\\q\\s\\y\\r\\p\\h\\2\\d\\B\\3\\u\\v\\r\\p\\H\\N\\U\\Z\\5\\17\\12\\t\\u\\d\\j\\A\\s\\K\\N\\p\\d\\D\\N\\p\\P\\d\\i\\13\\q\\l\\1a\\R\\I\\d\\O\\h\\2\\N\\18\\16\\s\\O\\t\\p\\8\\Z\\h\\p\\16\\P\\d\\P\\2\\n\\N\\p\\i\\d\\w\\X\\13\\d\\i\\X\\2\\s\\10\\11\\q\\y\\10\\r\\X\\2\\e\\t\\p\\U\\d\\j\\n\\q\\w\\t\\p\\1b\\D\\T\\2\\m\\j\\W\\m\\i\\k\\l\\z\\2\\d\\i\\1f\\s\\w\\N\\D\\K\\d\\w\\X\\2\\Y\\t\\p\\U\\d\\B\\q\\q\\x\\z\\2\\15\\h\\p\\A\\14\\r\\D\\R\\19\\d\\2\\d\\i\\J\\s\\y\\x\\18\\8\\2\\n\\k\\w\\11\\W\\r\\p\\d\\d\\O\\H\\17\\2\\U\\8\\10\\s\\K\\U\\Y\\X\\2\\17\\h\\p\\d\\d\\w\\15\\U\\2\\D\\k\\1e\\K\\d\\u\\12\\q\\w\\z\\2\\d\\A\\n\\q\\y\\r\\D\\8\\U\\y\\r\\2\\R\\8\\h\\D\\d\\C\\j\\13\\17\\t\\p\\t\\d\\u\\14\\p\\19\\t\\p\\J\\Z\\d\\2\\d\\C\\K\\s\\x\\18\\P\\12\\d\\w\\r\\2\\19\\3\\16\\s\\m\\h\\p\\w\\2\\10\\N\\D\\5\\s\\11\\11\\q\\Q\\M\\R\\q\\d\\B\\n\\q\\Q\\M\\X\\p\\2\\5\\5\\2\\k\\l\\H\\e\\f\\D\\n\\2\\q\\i\\3\\1h\\q\\m\\M\\15\\2\\d\\O\\n\\s\\M\\15\\1b\\M\\2\\N\\1e\\13\\q\\k\\M\\y\\v\\2\\d\\A\\I\\q\\d\\B\\2\\d\\C\\i\\q\\i\\N\\p\\l\\d\\j\\T\\2\\w\\L\\t\\y\\2\\e\\t\\p\\Y\\N\\f\\J\\s\\t\\T\\2\\q\\x\\q\\s\\i\\h\\p\\1b\\10\\h\\p\\16\\s\\z\\2\\d\\y\\k\\x\\e\\2\\d\\w\\Y\\1e\\d\\i\\A\\q\\k\\y\\P\\2\\d\\j\\l\\q\\k\\5\\q\\s\\K\\T\\2\\n\\14\\2\\d\\A\\x\\f\\H\\t\\p\\A\\D\\14\\2\\d\\O\\A\\s\\y\\3\\17\\L\\q\\t\\p\\8\\d\\B\\T\\n\\d\\C\\c\\s\\Q\\5\\l\\q\\y\\r\\D\\I\\1a\\10\\5\\v\\d\\j\\1b\\15\\d\\O\\y\\13\\s\\t\\D\\U\\P\\r\\D\\W\\10\\18\\5\\2\\d\\j\\11\\s\\M\\f\\x\\R\\d\\i\\i\\s\\l\\r\\p\\15\\H\\l\\X\\2\\R\\t\\D\\2\\13\\P\\12\\q\\O\\N\\p\\Z\\d\\A\\K\\s\\k\\d\\2\\18\\d\\q\\q\\x\\1a\\j\\2\\Z\\r\\p\\C\\16\\r\\D\\n\\X\\d\\2\\i\\e\\w\\x\\v\\h\\e\\2\\14\\Z\\s\\q\\P\\18\\1a\\10\\19\\R\\p\\13\\N\\1b\\D\\1f\\T\\Y\\W\\16\\15\\1e\\U\\11\\X\\17\\v\\J\\h\\H\\e\\n\\z\\y\\k\\K\\Q\\x\\M\\l\\j\\w\\O\\i\\t\\m\\L\\1h\\d\\f\\1j\\12\\5\\3\\8\\c\\u\\C\\B\\A\\r\\I\\2\\d\\w\\11\\q\\x\\5\\12\\s\\z\\14\\h\\2\\D\\z\\13\\q\\M\\h\\p\\h\\d\\u\\K\\s\\m\\3\\f\\2\\5\\f\\n\\n\\2\\d\\B\\1h\\q\\k\\h\\D\\12\\T\\T\\2\\h\\y\\v\\i\\14\\m\\2\\5\\f\\u\\5\\2\\1b\\h\\p\\R\\n\\d\\z\\2\\w\\i\\j\\h\\e\\t\\t\\2\\t\\y\\k\\n\\m\\2\\5\\f\\3\\3\\r\\2\\i\\e\\O\\L\\k\\i\\e\\2\\m\\y\\k\\t\\2\\P\\z\\y\\p\\17\\T\\2\\17\\r\\D\\K\\U\\N\\D\\D\\T\\z\\2\\1e\\r\\p\\5\\s\\r\\p\\t\\2\\t\\x\\k\\h\\e\\2\\h\\v\\x\\x\\2\\K\\j\\k\\l\\2\\h\\y\\e\\h\\Q\\16\\k\\M\\e\\2\\5\\f\\3\\H\\2\\5\\f\\3\\e\\2\\5\\f\\3\\n\\2\\w\\j\\t\\m\\2\\l\\e\\d\\2\\11\\N\\13\\10\\m\\m\\w\\Y\\e\\O\\L\\e\\t\\m\\2\\5\\f\\3\\I\\2\\c\\f\\Y\\h\\2\\5\\f\\3\\r\\2\\Z\\1e\\2\\5\\f\\3\\v\\2\\5\\f\\3\\h\\2\\R\\1h\\2\\5\\f\\3\\J\\2\\e\\l\\h\\j\\H\\e\\15\\Y\\19\\s\\j\\M\\w\\j\\l\\e\\l\\m\\2\\5\\f\\8\\5\\2\\5\\f\\8\\B\\2\\Z\\z\\2\\5\\f\\8\\u\\2\\5\\f\\8\\C\\2\\o\\c\\A\\2\\i\\e\\O\\2\\o\\c\\r\\2\\5\\f\\8\\A\\2\\h\\J\\2\\5\\f\\8\\8\\2\\z\\17\\P\\L\\2\\5\\f\\8\\3\\2\\U\\15\\R\\T\\2\\5\\f\\8\\c\\2\\x\\j\\z\\2\\j\\Q\\e\\l\\2\\n\\k\\x\\m\\e\\i\\2\\x\\j\\z\\k\\l\\2\\l\\m\\1a\\x\\2\\5\\f\\I\\2\\5\\f\\v\\2\\5\\f\\r\\2\\11\\L\\L\\12\\2\\5\\f\\J\\2\\5\\f\\H\\2\\5\\f\\e\\2\\5\\f\\h\\2\\18\\8\\P\\i\\2\\X\\1f\\N\\16\\2\\H\\j\\h\\L\\M\\e\\l\\m\\2\\H\\e\\h\\j\\H\\e\\15\\Y\\19\\s\\j\\M\\w\\j\\l\\e\\l\\m\\2\\e\\x\\t\\e\\2\\5\\f\\c\\2\\5\\f\\A\\2\\L\\I\\2\\5\\f\\C\\2\\h\\Y\\h\\J\\2\\5\\f\\3\\8\\2\\R\\w\\y\\Z\\2\\1a\\L\\q\\n\\2\\5\\f\\3\\A\\2\\5\\f\\3\\C\\2\\5\\f\\3\\B\\2\\5\\f\\3\\c\\2\\5\\f\\3\\u\\2\\H\\e\\q\\1a\\2\\L\\i\\x\\2\\U\\n\\I\\B\\2\\y\\i\\e\\n\\2\\x\\j\\h\\v\\m\\k\\j\\l\\2\\5\\f\\n\\2\\5\\f\\3\\3\'["\\t\\w\\x\\k\\m"](\'\\2\'),0,{}))', 62, 107, '||x7c|x31|x3d|x30|x28|x29|x32|x5b|x5d|x2c|x33|x77|x65|x78|x3b|x63|x72|x6f|x69|x6e|x74|x66|x5f|x4b|x44|x38|x43|x73|x34|x61|x70|x6c|x68|x67|x37|x36|x35|x4f|x2b|x7d|x7b|x64|x39|x62|x6a|x75|x6d|x4d|x71|x45|x6b|x4a|VAO3|x51|x57|x26|x53|x59|x52|x42|x48|x58|x7a|x4c|x41|x55|x54|x5a|x46|x49|x47|x4e|x2a|x25|x56|x50|iuUUmbjas5|x76|x3a|x79|x21|x2e|x2f|x2d|window|NbcHUOH4|function|YGuATb1|return|x3c|qPCBw2|x3f|x3e|Jvv6|if|x5e|while|35|36|29|x24|x7e|214|62|new'.split('|'), 0, {}));
    }
})(window);