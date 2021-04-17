# 计时器掌控者，视频广告一秒跳过，倒计时瞬间归零，几乎支持所有网站 [![gitee.png](https://palerock.cn/api-provider/files/view?identity=L2FydGljbGUvaW1hZ2UvMjAyMDA2MjkxNTQyMTMwNzVXcWZyU2dTbC5wbmc=&w=20)](https://gitee.com/HGJing/hooker-js/tree/master/src/plugins/timer-hooker "Gitee")  [![github.png](https://palerock.cn/api-provider/files/view?identity=L2FydGljbGUvaW1hZ2UvMjAyMDA2MjkxNjU3NDkzMDkybWNLRXhHMi5wbmc=&w=20)](https://github.com/canguser/hooker-js/tree/master/src/plugins/timer-hooker "Github")

![Daily Installs](https://palerock.cn/node-service/images/greasyfork/views-info/372673)
![Daily Installs](https://palerock.cn/node-service/images/greasyfork/stats/daily-installs/372673)
![Daily Updates](https://palerock.cn/node-service/images/greasyfork/stats/daily-updates/372673)
![Total Installs](https://palerock.cn/node-service/images/greasyfork/stats/total-installs/372673)
![得分](https://palerock.cn/node-service/images/greasyfork/info/fan_score/372673?name=得分&rcolor=orange)
![好评](https://palerock.cn/node-service/images/greasyfork/info/good_ratings/372673?name=好评&rcolor=darkcyan)
![许可证](https://palerock.cn/node-service/images/greasyfork/info/license/372673?name=许可证&rcolor=blueviolet)

> 支持几乎所有视频网站和用于其他用途的任一网站，可以自行发掘出更多的用处。   
原理是**控制网页计时器**，几乎**所有**通过计时器实现的内容都可以变速。

### 使用方法：
1. 安装（地址：[GreasyFork](https://greasyfork.org/scripts/372673)）
2. 网页左边有悬浮的能量球，鼠标移动过去有加速选项，你可以选择加速或减速，最上面的悬浮球表明现在的倍速
3. 加速跳过某广告后，需要点击最后一个悬浮球恢复默认速度
4. 该插件支持所有的网页限时广告的跳过，如腾讯，爱奇艺，优酷等等。
5. 快捷键操作：
    - `’ctrl‘+‘=’` 或 `’ctrl‘+'>'` : 倍率+2
    - `’alt‘+‘=’` 或 `’alt‘+‘>’` : 倍率x2
    - `’ctrl‘+‘-’` 或 `’ctrl‘+‘<’` : 倍率-2
    - `’alt‘+‘-’` 或 `’ctrl‘+‘<’` : 倍率/2
    - `’ctrl‘+‘0’` 或 `’alt‘+‘0’` : 倍率恢复为1
    - `’ctrl‘+‘9’` 或 `’alt‘+‘9’` : 弹出自定义倍率输入框
6. 在播放视频时，使用该插件可以对视频快进或慢放（注意必须使用 HTML5 视频播放器，Flash 播放器是无效的哦）
7. **最后，创作不易，喜欢该插件的朋友可以扫描最下方的二维码，捐赠作者，你的鼓励就是我的动力，谢谢！**  

> 由于不同使用人群使用该插件可能基于不同目的，一些较小众的功能需求不会作为更新推送给所有人，如有需要可以有偿捐赠并留言

### 关于反馈
- 欢迎各种反馈或建议，拒绝恶意差评
- 如果是插件在任何网站都不生效，那肯定是环境问题，请检查以下几点
    - 浏览器内核是否为 webkit，推荐谷歌浏览器
    - 尝试关闭其它插件并重新安装后再试
    - 清理浏览器缓存
- 如果是某个网站不能生效或者影响该网站的正常显示，请以以下格式反馈在 [https://greasyfork.org/scripts/372673/feedback](https://greasyfork.org/scripts/372673/feedback)
    具体格式如下：

    ```
    网站链接：（必须给出具体页面的链接，不能是一个大的网页，如果需要登录才能看到，需要私信用户名以及密码）
    反馈原因: （计时器不生效/影响网页正常使用/建议）
    描述：（描述具体情况，以方便找到问题并修复）
    ```

    **必须遵循该格式，否则反馈一律无视！**

    在版本修复前可以自己添加规则排除该插件对指定网站生效: [油猴插件怎么配置能让插件只在特定的网页生效？](https://palerock.cn/articles/001w1s6gHGV)

### 更新日志

- 2021-04-17 [1.0.61]
    - 修复某些网页视频加速失效的问题，如百度云盘

- 2021-03-12 [1.0.60]
    - 修复某些网页视频加速失效的问题，如腾讯视频（百度云的视频不能确定是否已修复，望大家测试后反馈）

- 2021-01-28 [1.0.58 - 1.0.59]
    - 修复传统计时器有时会控制失效的问题

- 2020-12-18 [1.0.52 - 1.0.57]
    - 修复在一些网站中图片无法加载的问题

- 2020-11-30 [1.0.51]
    1. 新增快捷键：`’ctrl‘+‘9’` 或 `’alt‘+‘9’` : 弹出自定义倍率输入框
    2. 将以前乘4倍率或除以4倍率都改为乘2或除以2
    3. 修改鼠标触发悬浮球的范围，现在只有当鼠标移到第一个悬浮球才会触发其它悬浮按钮
    4. 修改悬浮球以及倍率改变结果样式

- 2020-08-10 [1.0.50]
    
    修复在一些网站中（如：Twitter）悬浮球点击无效的问题

- 2020-04-05 [1.0.39]
    
    修复一些网站兼容问题，现在可以正常的在大部分网页中正常工作了

<details><summary><b>查看更早的更新</b></summary>
<p>
<br>
- 2020-03-27 [1.0.37]

    修复影响iCloud等网站的页面正常加载的问题

    优化算法以避免多次出现影响相应网站加载的问题
<br>
- 2020-03-19 [1.0.31]

    现在只会出现一个悬浮球了，在网页的最左边，这个悬浮球可以控制所有的视频或计时器

    现在悬浮球会更快的出现在页面中

    界面小幅度修改
<br>
- 2020-03-16 [1.0.20]

    修复一个问题，该问题导致但不限于 B 站中的视频再变速后无法暂停
<br>
- 2020-03-03 [1.0.10]

    修复在某些网站中无法加速的issue, 如在百度网盘中播放视频
<br>
- 2020-02-27 [1.0.09]

    修复在部分网页中其网页内容无法点击的问题
<br>
- 2019-12-02 [1.0.01]

    代码小部分重构，提升版本号

    修复一些小问题
<br>
- 2019-09-05 [0.3.0003]

    修复在一些网站加载异常的问题。
<br>
- 2019-08-27 [0.3.0001]

    （实验性特性）支持优酷广告跳过

    （实验性特性）现在加速也对HTML5视频生效，这意味着你可以对视频快进或慢放啦。
<br>
- 2019-01-10 [0.2.0111]

    快捷键微调，原来的快捷键不变，现在也可以使用按键 '<' 和 '>' 代替 '-' 和 '=' 的功能，以防止快捷键冲突。具体看上面第五点快捷键操作。
<br>
- 2018-12-26 [0.2.0105]

    大版本issue修复，修复大部分网页打开出错的问题。

    测试特性：现在对网页加速也会加速网页的时间流逝（即浏览器获取到的本地时间也会随时间加速而获取到加速后的时间）。

    例如：加速前获取当前时间是10.00am, 60倍加速持续1分钟，此时获取当前时间就不该是10.01am而是11.00am
<br>
- 2018-11-19 [0.2.0049]

    测试性修复一些网页无法正常工作的issue
<br>
- 2018-10-30 [0.2.0048]

    更正天猫页面显示不正常的issue
<br>
- 2018-10-21 [0.2.0047]

    修复会影响JD登录的bug
<br>
- 2018-10-08 [0.2.0045]

    修复在爱奇艺中无法工作的情况
<br>
- 2018-09-29 [0.2.0022]

    修正快捷键操作：’ctrl‘+‘=’ : 倍率+2, ’alt‘+‘=’ : 倍率x4, ’ctrl‘+‘-’ : 倍率-2, ’alt‘+‘-’ : 倍率/4, ’ctrl‘+‘0’ 或 ’alt‘+‘0’ : 倍率恢复为1
<br>
- 2018-09-29 [0.2.0020]

    支持快捷键操作：’ctrl‘+‘=’ : 倍率+2, ’shift‘+‘=’ : 倍率x4, ’ctrl‘+‘-’ : 倍率-2, ’shift‘+‘-’ : 倍率/4, ’ctrl‘+‘0’ : 倍率恢复为1

    全屏显示倍率信息
<br>
</p>
</details>
    
### 其它

项目首页：[https://palerock.cn/projects/0060cG6sIfY](https://palerock.cn/projects/0060cG6sIfY)  
开源地址：
- Gitee: [https://gitee.com/HGJing/hooker-js/tree/master/src/plugins/timer-hooker](https://gitee.com/HGJing/hooker-js/tree/master/src/plugins/timer-hooker)  
- Github: [https://github.com/canguser/hooker-js/tree/master/src/plugins/timer-hooker](https://github.com/canguser/hooker-js/tree/master/src/plugins/timer-hooker)  

附图：  
- ![image.png](https://palerock.cn/api-provider/files/view?identity=L2FydGljbGUvaW1hZ2UvMjAyMDEwMjExMzQzNTAxMzE0VndKbTlEcS5wbmc=&w=300)
- ![image.png](https://palerock.cn/api-provider/files/view?identity=L2FydGljbGUvaW1hZ2UvMjAyMDEwMjExMzQ4MjAxNDROVGcySlgzbC5wbmc=&w=300)
- ![image.png](https://palerock.cn/api-provider/files/view?identity=L2FydGljbGUvaW1hZ2UvMjAyMDEwMjExMzQ4MzI0NDV6dDFDOWdlUS5wbmc=&w=300)



> **转载，复用，修改该插件**需注明出处，未经允许**不得用于商用或盈利**  
**Created By**: [苍石居](https://palerock.cn)