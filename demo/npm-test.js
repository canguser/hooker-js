var hookJS = require('../build/hook-js-mini');

var eHook = hookJS.eHook;

eHook.hookBefore(
    console, 'log', function (m, args) {
        args[1] = 'logged after';
    }
);

console.log('hello HookJS', '?');