// ==UserScript==
// @name         Copying Lifted 解除复制限制
// @name:en      Copying Lifted
// @name:zh-CN   Copying Lifted 解除复制限制
// @namespace    https://palerock.cn
// @version      0.3
// @description:en  Allow your copying in anywhere.
// @description:zh-CN  让你在几乎所有网页里自由地复制粘贴，而不用担心被限制，或者被篡改复制内容
// @require      https://greasyfork.org/scripts/372672-everything-hook/code/Everything-Hook.js?version=659315
// @include      *
// @author       Cangshi
// @match        http://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

function removeCopyEvent() {
    Array.prototype.concat.call(document.querySelectorAll('*'), document)
        .forEach(function (ele) {
            ele.oncopy = undefined;
            ele.oncontextmenu = undefined;
        });
}

'use strict';
~function (global) {
    function generate() {
        return function () {

            global.addEventListener('contextmenu', function (e) {
                removeCopyEvent();
            });

            global.addEventListener('keydown', function (e) {
                if (e.ctrlKey || e.keyCode === 224 || e.keyCode === 17 || e.keyCode === 91 || e.keyCode === 93) {
                    removeCopyEvent();
                }
            });

            this.hookBefore(EventTarget.prototype, 'addEventListener',
                function (m, args) {
                    if (args[0] === 'copy' || args[0] === 'contextmenu') {
                        args[0] = 'prevent ' + args[0] + ' handler';
                        console.log('[AllowCopy Plugins]', args[0]);
                    }
                }, false);

            var style = 'body * :not(input):not(textarea){-webkit-user-select:auto!important;-moz-user-select:auto!important;-ms-user-select:auto!important;user-select:auto!important}';

            var stylenode = document.createElement('style');

            stylenode.setAttribute("type", "text/css");
            if (stylenode.styleSheet) {// IE
                stylenode.styleSheet.cssText = style;
            } else {// w3c
                var cssText = document.createTextNode(style);
                stylenode.appendChild(cssText);
            }

            document.addEventListener('readystatechange', function () {
                if (document.readyState === "interactive" || document.readyState === "complete") {
                    setTimeout(function () {
                        document.head.appendChild(stylenode);
                        console.log('[AllowCopy Plugins] css applied')
                    }, 2000);
                }
            });

            console.log('[AllowCopy Plugins]', 'works.');
        }
    }


    if (global.eHook) {
        global.eHook.plugins({
            name: 'allowCopy',
            /**
             * 插件装载
             * @param util
             */
            mount: generate()
        });
    }
}(window);