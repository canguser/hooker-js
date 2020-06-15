// ==UserScript==
// @name         百度文库转 Word | 百度文库下载器
// @name:zh-CN   百度文库转 Word | 百度文库下载器
// @namespace    https://gitee.com/HGJing/everthing-hook/
// @version      0.0.1
// @description  将百度文库内文章中的文本内容转换为 word 并下载，仅支持没有阅读限制的文章（只要没有阅读限制，无论是用券、VIP或付费文章都能下载）
// @require      https://cdn.bootcss.com/jquery/2.2.4/jquery.js
// @require      https://greasyfork.org/scripts/372672-everything-hook/code/Everything-Hook.js?version=784972
// @author       Cangshi
// @match        *://wenku.baidu.com/view/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

function wait(ms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, ms);
    })
}

(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports !== "undefined") {
        factory();
    } else {
        var mod = {
            exports: {}
        };
        factory();
        global.FileSaver = mod.exports;
    }
})(this, function () {
    "use strict";

    /*
    * FileSaver.js
    * A saveAs() FileSaver implementation.
    *
    * By Eli Grey, http://eligrey.com
    *
    * License : https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md (MIT)
    * source  : http://purl.eligrey.com/github/FileSaver.js
    */
    // The one and only way of getting global scope in all environments
    // https://stackoverflow.com/q/3277182/1008999
    var _global = typeof window === 'object' && window.window === window ? window : typeof self === 'object' && self.self === self ? self : typeof global === 'object' && global.global === global ? global : void 0;

    function bom(blob, opts) {
        if (typeof opts === 'undefined') opts = {
            autoBom: false
        };else if (typeof opts !== 'object') {
            console.warn('Deprecated: Expected third argument to be a object');
            opts = {
                autoBom: !opts
            };
        } // prepend BOM for UTF-8 XML and text/* types (including HTML)
        // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF

        if (opts.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
            return new Blob([String.fromCharCode(0xFEFF), blob], {
                type: blob.type
            });
        }

        return blob;
    }

    function download(url, name, opts) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'blob';

        xhr.onload = function () {
            saveAs(xhr.response, name, opts);
        };

        xhr.onerror = function () {
            console.error('could not download file');
        };

        xhr.send();
    }

    function corsEnabled(url) {
        var xhr = new XMLHttpRequest(); // use sync to avoid popup blocker

        xhr.open('HEAD', url, false);

        try {
            xhr.send();
        } catch (e) {}

        return xhr.status >= 200 && xhr.status <= 299;
    } // `a.click()` doesn't work for all browsers (#465)


    function click(node) {
        try {
            node.dispatchEvent(new MouseEvent('click'));
        } catch (e) {
            var evt = document.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
            node.dispatchEvent(evt);
        }
    }

    var saveAs = _global.saveAs || ( // probably in some web worker
        typeof window !== 'object' || window !== _global ? function saveAs() {}
            /* noop */
            // Use download attribute first if possible (#193 Lumia mobile)
            : 'download' in HTMLAnchorElement.prototype ? function saveAs(blob, name, opts) {
                var URL = _global.URL || _global.webkitURL;
                var a = document.createElement('a');
                name = name || blob.name || 'download';
                a.download = name;
                a.rel = 'noopener'; // tabnabbing
                // TODO: detect chrome extensions & packaged apps
                // a.target = '_blank'

                if (typeof blob === 'string') {
                    // Support regular links
                    a.href = blob;

                    if (a.origin !== location.origin) {
                        corsEnabled(a.href) ? download(blob, name, opts) : click(a, a.target = '_blank');
                    } else {
                        click(a);
                    }
                } else {
                    // Support blobs
                    a.href = URL.createObjectURL(blob);
                    setTimeout(function () {
                        URL.revokeObjectURL(a.href);
                    }, 4E4); // 40s

                    setTimeout(function () {
                        click(a);
                    }, 0);
                }
            } // Use msSaveOrOpenBlob as a second approach
            : 'msSaveOrOpenBlob' in navigator ? function saveAs(blob, name, opts) {
                    name = name || blob.name || 'download';

                    if (typeof blob === 'string') {
                        if (corsEnabled(blob)) {
                            download(blob, name, opts);
                        } else {
                            var a = document.createElement('a');
                            a.href = blob;
                            a.target = '_blank';
                            setTimeout(function () {
                                click(a);
                            });
                        }
                    } else {
                        navigator.msSaveOrOpenBlob(bom(blob, opts), name);
                    }
                } // Fallback to using FileReader and a popup
                : function saveAs(blob, name, opts, popup) {
                    // Open a popup immediately do go around popup blocker
                    // Mostly only available on user interaction and the fileReader is async so...
                    popup = popup || open('', '_blank');

                    if (popup) {
                        popup.document.title = popup.document.body.innerText = 'downloading...';
                    }

                    if (typeof blob === 'string') return download(blob, name, opts);
                    var force = blob.type === 'application/octet-stream';

                    var isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari;

                    var isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);

                    if ((isChromeIOS || force && isSafari) && typeof FileReader === 'object') {
                        // Safari doesn't allow downloading of blob URLs
                        var reader = new FileReader();

                        reader.onloadend = function () {
                            var url = reader.result;
                            url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;');
                            if (popup) popup.location.href = url;else location = url;
                            popup = null; // reverse-tabnabbing #460
                        };

                        reader.readAsDataURL(blob);
                    } else {
                        var URL = _global.URL || _global.webkitURL;
                        var url = URL.createObjectURL(blob);
                        if (popup) popup.location = url;else location.href = url;
                        popup = null; // reverse-tabnabbing #460

                        setTimeout(function () {
                            URL.revokeObjectURL(url);
                        }, 4E4); // 40s
                    }
                });
    _global.saveAs = saveAs.saveAs = saveAs;

    if (typeof module !== 'undefined') {
        module.exports = saveAs;
    }
});


if (typeof jQuery !== "undefined" && typeof saveAs !== "undefined") {
    (function ($) {
        ~function (global) {
            'use strict';
            if (global.eHook) {
                global.eHook.plugins({
                    name: 'wenku2word',
                    /**
                     * 插件装载
                     * @param util
                     */
                    mount: function (util) {
                        this.hookBefore(Element.prototype, 'removeChild',
                            function (m, args) {
                                var ele = args[0];
                                if (ele && ele.classList && ele.classList.contains('reader-parent')) {
                                    var instead = document.createElement('div');
                                    this.appendChild(instead);
                                    args[0] = instead;
                                }
                            }, false);
                        return {
                            wordExport: function (elements, fileName) {
                                fileName = typeof fileName !== 'undefined' ? fileName : document.title;
                                var constant = {
                                    wordHtml: {
                                        top: "Mime-Version: 1.0\nContent-Base: " + location.href + "\nContent-Type: Multipart/related; boundary=\"NEXT.ITEM-BOUNDARY\";type=\"text/html\"\n\n--NEXT.ITEM-BOUNDARY\nContent-Type: text/html; charset=\"utf-8\"\nContent-Location: " + location.href + "\n\n<!DOCTYPE html>\n<html>\n_html_</html>",
                                        head: "<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n<style>\n_styles_\n</style>\n</head>\n",
                                        body: "<body>_body_</body>"
                                    }
                                };
                                var markup = $(elements).clone();

                                markup.each(function () {
                                    var self = $(this);
                                    if (self.is(':hidden'))
                                        self.remove();
                                });

                                var htmlEnd = "\n";
                                htmlEnd += "--NEXT.ITEM-BOUNDARY--";

                                var fileContent = constant.wordHtml.top.replace("_html_", constant.wordHtml.head.replace("_styles_", '') + constant.wordHtml.body.replace("_body_", markup.text().split('\n').map(t => `<p>${t}</p>`).join(''))) + htmlEnd;

                                var blob = new Blob([fileContent], {
                                    type: "application/msword;charset=utf-8"
                                });
                                saveAs(blob, fileName + ".doc");
                            },
                            doExport: function () {
                                this.wordExport($(".reader-word-layer"));
                            },
                            isLoaded: false,
                            fetchMoreContent() {
                                var goNext = document.querySelector('.goBtn') || document.querySelector('.read-all');
                                let elem = document.documentElement;
                                let elem2 = document.body;
                                let totalHeight = elem.scrollHeight;
                                let scrollTop = elem.scrollTop || elem2.scrollTop;
                                let clientHeight = elem.clientHeight;

                                var _this = this;
                                if (totalHeight - scrollTop <= clientHeight * 1.1 || this.isLoaded) {
                                    this.isLoaded = true;
                                    return Promise.resolve();
                                }
                                if ($(goNext).is(':hidden') || !goNext) {
                                    return wait(200).then(
                                        function () {
                                            window.scroll(0, scrollTop + clientHeight / 4);
                                            return _this.fetchMoreContent();
                                        }
                                    );
                                }
                                goNext && goNext.click();
                                return wait(2000).then(
                                    function () {
                                        return _this.fetchMoreContent();
                                    }
                                );
                            }
                        }
                    }
                });
            }
        }(window);
        console.log('wenku2word loaded successfully');
        window.addEventListener('load', function () {
            var btn = $('<div class="reader-download btn-download btn-pay" style="margin-left: 10px">文库转 Word </div>');
            btn.click(function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.scroll(0, 0);
                var spinner = document.createElement('div');
                spinner.innerText = '解析文章中, 请稍候...';
                spinner.style.position = 'fixed';
                spinner.style.width = '100%';
                spinner.style.height = '100%';
                spinner.style.textAlign = 'center';
                spinner.style.paddingTop = '10rem';
                spinner.style.backgroundColor = 'rgba(255,255,255,.8)';
                spinner.style.zIndex = '99999';
                spinner.style.fontSize = '3rem';
                spinner.style.top = '0';
                spinner.style.left = '0';
                document.body.appendChild(spinner);
                window.wenku2word.fetchMoreContent()
                    .then(function () {
                        spinner.innerText = '解析成功, 即将下载...';
                        return wait(2000)
                    }).then(function () {
                        window.wenku2word.doExport();
                        document.body.removeChild(spinner);
                    }
                );
            });
            $('.toolbar-core-btns-wrap').append(btn);
            $('.core-btn-wrapper').append(btn);
            console.log('button added');
        })
    })(jQuery);
} else {
    console.log('wenku2word loaded failed');
}



