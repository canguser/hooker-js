// ==UserScript==
// @name         百度文库转 Word | 百度文库下载器
// @namespace    https://gitee.com/HGJing/everthing-hook/
// @version      0.0.6
// @description  将百度文库内文章中的文本内容转换为 word 并下载，仅支持没有阅读限制的文章（只要没有阅读限制，无论是用券、VIP或付费文章都能下载）
// @require      https://cdn.bootcss.com/jquery/2.2.4/jquery.js
// @require      https://greasyfork.org/scripts/405376-filesaver-html5/code/FileSaver(html5).js?version=816426
// @require      https://greasyfork.org/scripts/372672-everything-hook/code/Everything-Hook.js?version=784972
// @author       Cangshi
// @match        *://wenku.baidu.com/view*
// @match        *://wenku.baidu.com/link*
// @match        *://wenku.baidu.com/share*
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
                            },
                            linksShare: function (){
                                var currentLocation = location.href.split('?')[0];
                                location.href = currentLocation.replace('/link/', '/share/')
                                    .replace('/view/', '/share/')
                                    .replace('.html', '') + '?share_api=1&width=800'
                            },
                            genShadowBG(){
                                if (this.wrapper){
                                    return this.wrapper;
                                }
                                var wrapper = document.createElement('div');
                                wrapper.classList.add('shadow-bg');
                                wrapper.setAttribute('style','position: fixed; bottom: 0; right: 0; left: 0; top: 0; z-index: 9999; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; flex-direction: column;');
                                this.wrapper = wrapper;
                                return wrapper;
                            },
                            addShareDownloadButton: function (){
                               const button = document.createElement('button');
                               const wrapper = this.genShadowBG();
                                button.innerText = '点击下载该文库文档为 word 格式';
                                button.setAttribute('style', 'top: 10px; right: 10px; z-index: 9999; border: 2px solid #fff; padding: 10px; background: #fff; border-radius: 5px; cursor: pointer; color: #fff; font-size: 16px;background: transparent;');
                                wrapper.appendChild(button);
                                const p = document.createElement('p');
                                p.setAttribute('style', 'color: #fff; font-size: 12px; margin-top: 10px; margin-bottom: 10px;');
                                p.innerText = '需要等待背景加载出文字后才能下载...';
                                wrapper.appendChild(p);
                                const _this = this;
                                window.addEventListener('load', function () {
                                    document.body.appendChild(wrapper);
                                    button.addEventListener('click', function () {
                                        button.setAttribute('disabled', 'disabled');
                                        button.style.color = '#ccc';
                                        button.style.cursor = 'not-allowed';
                                        p.innerText = '正在下载...';
                                        window.scroll(0,0)
                                        _this.fetchMoreContent()
                                            .then(function (){
                                                p.innerText = '下载完成，请在浏览器下载内容中查看';
                                                _this.doExport();
                                            })
                                    });
                                });
                            },
                            addPdfDownloadButton:function (){
                                this.importScript('https://unpkg.com/jspdf@2.5.0/dist/jspdf.umd.js')
                                this.importScript('https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js')
                                const wrapper = this.genShadowBG();
                                const button = document.createElement('button');
                                button.innerText = '点击下载该文库文档为 PDF 格式';
                                button.setAttribute('style', 'top: 10px; right: 10px; z-index: 9999; border: 2px solid #fff; padding: 10px; background: #fff; border-radius: 5px; cursor: pointer; color: #fff; font-size: 16px;background: transparent;');
                                wrapper.appendChild(button);
                                const p = document.createElement('p');
                                p.setAttribute('style', 'color: #fff; font-size: 12px; margin-top: 10px;');
                                p.innerText = 'PDF 为图片内容，下载后不可复制...';
                                wrapper.appendChild(p);
                                const _this = this;
                                window.addEventListener('load', function () {
                                    document.body.appendChild(wrapper);
                                    button.addEventListener('click', function () {
                                        button.setAttribute('disabled', 'disabled');
                                        button.style.color = '#ccc';
                                        button.style.cursor = 'not-allowed';
                                        p.innerText = '正在下载中...';
                                        window.scroll(0,0)
                                        _this.fetchMoreContent()
                                            .then(function (){
                                                p.innerText = '正在转换格式中...';
                                                _this.doExportPdf()
                                                    .then(function (){
                                                        p.innerText = '下载完成，请在浏览器下载内容中查看';
                                                    });
                                            })
                                    });
                                });
                            },
                            doExportPdf: function () {
                                var pages = document.querySelectorAll('.reader-page')
                                var pdf = new window.jspdf.jsPDF('', 'pt', 'a4');
                                var promises = [];
                                for (var i = 0; i < pages.length; i++) {
                                    promises.push(window.html2canvas(pages[i]))
                                }
                                return Promise.all(promises)
                                    .then(canvasList=>{
                                        for (var i = 0; i< canvasList.length; i++){
                                            var canvas = canvasList[i];
                                            var imgData = canvas.toDataURL('image/jpeg', 1.0);
                                            pdf.addImage(imgData, 'JPEG', 0, 0, 595.28, 592.28/canvas.width * canvas.height );
                                            if (i < canvasList.length - 1) {
                                                pdf.addPage();
                                            }
                                        }
                                        pdf.save('文库文档.pdf');
                                    })
                            },
                            importScript: function (url){
                                var script = document.createElement('script');
                                script.src = url;
                                document.body.appendChild(script);
                            }
                        }
                    }
                });
            }
        }(window);
        console.log('wenku2word loaded successfully');
        if (/^.*wenku\.baidu\.com\/share\/.*/.test(location.href)) {
            window.wenku2word.addShareDownloadButton();
            window.wenku2word.addPdfDownloadButton();
        }
        window.addEventListener('load', function () {

            var existBtn = $('.core-btn-wrapper > div');
            if (!existBtn || !existBtn.length) {
                return;
            }

            var btn = $('<div></div>')

            if (existBtn) {
                btn = existBtn.clone();
            }

            btn[0].className = 'btn-download btn-pay reader-download';

            btn[0].innerHTML = '文库转 Word / PDF ';

            btn[0].style.marginLeft = '10px';

            btn.click(function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.wenku2word.linksShare();
                /*
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
                */
            });

            $('.toolbar-core-btns-wrap').append(btn[0]);
            $('.core-btn-wrapper').append(btn[0]);
            console.log('button added');
        })
    })(jQuery);
} else {
    console.log('wenku2word loaded failed');
}



