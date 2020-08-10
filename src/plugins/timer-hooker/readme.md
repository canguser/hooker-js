# 视频广告加速跳过，一秒跳过广告，支持几乎任何视频网站，VIP破解 [![gitee.png](https://palerock.cn/api-provider/files/view?identity=L2FydGljbGUvaW1hZ2UvMjAyMDA2MjkxNTQyMTMwNzVXcWZyU2dTbC5wbmc=&w=20)](https://gitee.com/HGJing/everthing-hook/tree/master/src/plugins/timer-hooker "Gitee") 

![Daily Installs](https://palerock.cn/node-service/images/greasyfork/views-info/372673)
![Daily Installs](https://palerock.cn/node-service/images/greasyfork/stats/daily-installs/372673)
![Daily Updates](https://palerock.cn/node-service/images/greasyfork/stats/daily-updates/372673)
![Total Installs](https://palerock.cn/node-service/images/greasyfork/stats/total-installs/372673)
![得分](https://palerock.cn/node-service/images/greasyfork/info/fan_score/372673?name=得分&rcolor=orange)
![好评](https://palerock.cn/node-service/images/greasyfork/info/good_ratings/372673?name=好评&rcolor=darkcyan)
![许可证](https://palerock.cn/node-service/images/greasyfork/info/license/372673?name=许可证&rcolor=blueviolet)

#### 支持腾讯，优酷，爱奇艺等几乎所有视频网站和用于其他用途的任一网站（其他用途自行研究哦）
#### 原理是控制网页计时器，几乎所有通过计时器实现的内容都可以变速

**拒绝恶意差评，有问题可以提出来，恶意差评请绕道，地方太小容不下**

### 使用方法：
1. 安装（地址：[GreasyFork](https://greasyfork.org/scripts/372673)）
2. 网页左边有悬浮的能量球，鼠标移动过去有加速选项，你可以选择加速或减速，最上面的悬浮球表明现在的倍速
3. 加速跳过某广告后，需要点击最后一个悬浮球恢复默认速度
4. 该插件支持所有的网页限时广告的跳过，如腾讯，爱奇艺，优酷等等。
5. 快捷键操作：`’ctrl‘+‘=’` 或 `’ctrl‘+'>'` : 倍率+2, `’alt‘+‘=’` 或 `’alt‘+‘>’` : 倍率x4, `’ctrl‘+‘-’` 或 `’ctrl‘+‘<’` : 倍率-2, `’alt‘+‘-’` 或 `’ctrl‘+‘<’` : 倍率/4, `’ctrl‘+‘0’` 或 `’alt‘+‘0’` : 倍率恢复为1
6. 在播放视频时，使用该插件可以对视频快进或慢放（注意必须使用 HTML5 视频播放器，Flash 播放器是无效的哦）
7. 最后，创作不易，喜欢该插件的朋友可以扫描最下方的二维码，捐赠作者，你的鼓励就是我的动力，谢谢！  

**由于不同使用人群使用该插件可能基于不同目的，一些较小众的功能需求不会作为更新推送给所有人，如有需要可以有偿捐赠并留言**

### 更新日志：(大家遇到bug请及时反馈，我会以最快的速度修复的)

- 2020-04-05 [1.1.50]
    
    修复在一些网站中（如：Twitter）悬浮球点击无效的问题

- 2020-04-05 [1.1.39]
    
    修复一些网站兼容问题，现在可以正常的在大部分网页中正常工作了

- 2020-03-27 [1.1.37]

    修复影响iCloud等网站的页面正常加载的问题

    优化算法以避免多次出现影响相应网站加载的问题

- 2020-03-19 [1.1.31]

    现在只会出现一个悬浮球了，在网页的最左边，这个悬浮球可以控制所有的视频或计时器
    
    现在悬浮球会更快的出现在页面中
    
    界面小幅度修改

- 2020-03-16 [1.1.20]

    修复一个问题，该问题导致但不限于 B 站中的视频再变速后无法暂停

- 2020-03-03 [1.1.10]

    修复在某些网站中无法加速的issue, 如在百度网盘中播放视频

- 2020-02-27 [1.1.09]

    修复在部分网页中其网页内容无法点击的问题

- 2019-12-02 [1.1.01]

    代码小部分重构，提升版本号
    
    修复一些小问题

- 2019-09-05 [0.3.0003]

    修复在一些网站加载异常的问题。

- 2019-08-27 [0.3.0001]

    （实验性特性）支持优酷广告跳过
    
    （实验性特性）现在加速也对HTML5视频生效，这意味着你可以对视频快进或慢放啦。

- 2019-01-10 [0.2.0111]

    快捷键微调，原来的快捷键不变，现在也可以使用按键 '<' 和 '>' 代替 '-' 和 '=' 的功能，以防止快捷键冲突。具体看上面第五点快捷键操作。

- 2018-12-26 [0.2.0105]

    大版本issue修复，修复大部分网页打开出错的问题。
    
    测试特性：现在对网页加速也会加速网页的时间流逝（即浏览器获取到的本地时间也会随时间加速而获取到加速后的时间）。
    
    例如：加速前获取当前时间是10.00am, 60倍加速持续1分钟，此时获取当前时间就不该是10.01am而是11.00am

- 2018-11-19 [0.2.0049]

    测试性修复一些网页无法正常工作的issue

- 2018-10-30 [0.2.0048]

    更正天猫页面显示不正常的issue

- 2018-10-21 [0.2.0047]

    修复会影响JD登录的bug

- 2018-10-08 [0.2.0045]

    修复在爱奇艺中无法工作的情况

- 2018-09-29 [0.2.0022]

    修正快捷键操作：’ctrl‘+‘=’ : 倍率+2, ’alt‘+‘=’ : 倍率x4, ’ctrl‘+‘-’ : 倍率-2, ’alt‘+‘-’ : 倍率/4, ’ctrl‘+‘0’ 或 ’alt‘+‘0’ : 倍率恢复为1

- 2018-09-29 [0.2.0020]

    支持快捷键操作：’ctrl‘+‘=’ : 倍率+2, ’shift‘+‘=’ : 倍率x4, ’ctrl‘+‘-’ : 倍率-2, ’shift‘+‘-’ : 倍率/4, ’ctrl‘+‘0’ : 倍率恢复为1
    
    全屏显示倍率信息
    
### 最后，转载，复用，修改该插件需注明出处，未经允许不得用于商用或盈利

> Power by [苍石居](https://palerock.cn)