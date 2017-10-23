Everything-Hook
===============

简介：用于劫持方法，进行AOP切点操作

Hello world:

```
eHook.hookBefore(window,'alert',function(method,args){
	args[0] = args[0] + '[被劫持的参数]';
});
alert('hello eHook');
```

全局对象：eHook，aHook

 - eHook：包含aop劫持的基本方法 
 - aHook：包含Ajax Url劫持的基本方法

文档正在书写中，敬请期待。