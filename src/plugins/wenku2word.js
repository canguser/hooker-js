// ==UserScript==
// @name         百度文库转 Word
// @name:zh-CN   百度文库转 Word
// @namespace    https://gitee.com/HGJing/everthing-hook/
// @version      0.0.1
// @description  百度文库转 Word
// @require      https://cdn.bootcss.com/jquery/2.2.4/jquery.js
// @require      https://cdn.bootcdn.net/ajax/libs/FileSaver.js/2.0.2/FileSaver.min.js
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
                                var goNext = document.querySelector('.goBtn');
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
                                if ($(goNext).is(':hidden')) {
                                    return wait(200).then(
                                        function () {
                                            window.scroll(0, scrollTop + clientHeight / 4);
                                            return _this.fetchMoreContent();
                                        }
                                    );
                                }
                                goNext.click();
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
            var btn = $('<div class="reader-download btn-download">文库转 Word </div>');
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
            $('.toolbar-core-btns-wrap').append(
                btn
            );
            console.log('button added');
        })
    })(jQuery);
} else {
    console.log('wenku2word loaded failed');
}



