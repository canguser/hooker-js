// ==UserScript==
// @name         Copying Lifted 解除复制限制
// @name:en      Copying Lifted
// @name:zh-CN   Copying Lifted 解除复制限制
// @namespace    https://palerock.cn
// @version      0.2
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
    document.querySelectorAll('*')
        .forEach(function (ele) {
            ele.oncopy = undefined;
        });
}

'use strict';
~function (global) {
    function generate() {
        return function () {
            this.hookBefore(EventTarget.prototype, 'addEventListener',
                function (m, args) {
                    if (args[0] === 'copy') {
                        console.log('[AllowCopy Plugins]', 'prevent copy handler');
                        args[0] = 'prevent copy handler'
                    }
                }, false);

            global.addEventListener('keydown', function (e) {
                if (e.ctrlKey || e.keyCode === 224 || e.keyCode === 17 || e.keyCode === 91 || e.keyCode === 93) {
                    removeCopyEvent();
                }
            });

            global.addEventListener('contextmenu', function (e) {
                removeCopyEvent();
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