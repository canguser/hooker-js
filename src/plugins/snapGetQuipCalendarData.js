// ==UserScript==
// @name         Quip Get Calendar Data
// @namespace    https://gitee.com/HGJing/everthing-hook/
// @version      0.1.001
// @description  it can get the quip site's calendar data.
// @include      https://snapbi.quip.com/mq8HAz8ayqRt
// @require      https://gitee.com/HGJing/everthing-hook/raw/master/src/everything-hook.js
// @author       Cangshi
// @match        https://snapbi.quip.com/mq8HAz8ayqRt
// @run-at       document-start
// @grant        none
// ==/UserScript==
/**
 * ---------------------------
 * Time: 2018/08/15 16:10.
 * Author: Cangshi
 * View: http://palerock.cn
 * ---------------------------
 */
//               https://code.jquery.com/jquery-3.3.1.min.js
~function (global) {
    let generate = function ($) {
        return function (util) {
            let origins = [];
            if (global.aHook) {
                let aHook = global.aHook;
                aHook.register('.*/-/load-data/open-object/1.*', {
                        hookResponse: function (e) {
                            let result = JSON.parse(this.response);
                            let c = result.preserialized[2];
                            let oMap = {};
                            c.map((o) => {
                                return {
                                    id: o[1],
                                    cid: o[13] && o[13][1] && o[13][1][0],
                                    type: (() => {
                                        let a16 = o[16];
                                        if (a16 && a16.length === 31
                                            && a16[30] === 5 && o[12]
                                            && o[12][1] && o[12][1][1]
                                        ) {
                                            return 'event';
                                        } else {
                                            return 'other'
                                        }
                                    })(),
                                    info: o[12],
                                }
                            }).map((item) => {
                                oMap[item.id] = item;
                                return item;
                            }).map((item) => {
                                if (item.cid && item.type === 'event') {
                                    let r = oMap[item.cid];
                                    if (!r) {
                                        console.log(item)
                                    }
                                    if (r && r.cid) {
                                        let result = {
                                            title: item.info[1][1],
                                            info: JSON.parse(oMap[r.cid].info[22][1]),
                                        };
                                        result.info.dateRange = JSON.parse(result.info.dateRange.v);
                                        let start = result.info.dateRange.start.split(',');
                                        let end = result.info.dateRange.end.split(',');
                                        start[1] = parseInt(start[1]) + 1 % 12;
                                        end[1] = parseInt(end[1]) + 1 % 12;
                                        result.info.dateRange = {
                                            start: start.join(','),
                                            end: end.join(','),
                                        };
                                        result.info.lastname = result.title.split(' ')[0];
                                        result.info.simpleTitle = result.title.substring(result.title.indexOf(' ') + 1);
                                        origins.push(result);
                                    }
                                }
                            });
                            console.log(origins);
                            console.log(JSON.stringify(origins).replace(/\'/g, '\\\''));
                        },
                        hookSend: function (args) {
                            let as = args[0];
                            let p = {};
                            let params = as.split('&');
                            params.map(function (param) {
                                let kv = param.split('=');
                                p[kv[0]] = kv.length >= 1 && kv[1];
                            });
                            console.log(p);
                            console.log(this);
                        }
                    }
                );
            }
            return {
                getData: function () {
                    return origins;
                }
            }
        }
    };
    if (global.eHook) {
        global.eHook.plugins({
            name: 'snapQuip',
            /**
             * 插件装载
             * @param util
             */
            mount: generate(global.$)
        });
    }
}(window);