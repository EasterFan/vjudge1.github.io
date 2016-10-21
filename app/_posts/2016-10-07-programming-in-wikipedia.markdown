---
layout: post
title: "维基百科编程笔记"
author: vjudge1
categories: 编程
tags: 维基百科 API Scripting
---
* contents
{:toc}

最近维基百科严重上瘾，除了写条目和[搞破坏](https://zh.wikipedia.org/wiki/Wikipedia:%E7%A0%B4%E5%9D%8F)，还写了一点脚本。像我这种[电脑高级中手](https://wiki.esu.moe/曹国祥)，有了心得之后，在自己博客上随便写点什么算了，不往百科用户页里面写了。维基百科内有很详细的文档，而且高手非常多，不会的话可以问他们。




{% callout %}
#### 更新日志

2016年11月21日：把“机器人”一节补完。
{% endcallout %}

维基百科基于MediaWiki系统，这个系统提供了很多API，所以对维基百科编程（例如写点小工具等）其实很容易。当然，不要拿去搞破坏，否则会被一群认真狂魔给封禁。

为了体验编程的乐趣，必须要注册账号。注册满七天和50次编辑即可变为自动确认用户。如果想刷编辑次数的话，记住，做正经编辑，或者至少不要在正经场合捣乱和冲刷“最近编辑”，否则也会被封禁。

下面假设自己的用户名叫做Example。

# JavaScript

首先，自己的JavaScript脚本必须放在`User:Example/`下面。如果想每次打开一个页面都自动执行的话，请把代码放到`User:Example/common.js`中——在维基百科不需要[油猴](https://zh.wikipedia.org/zh/Greasemonkey)插件。

## 引用其他脚本
新接触JS的维基用户往往是为了导入一些实用的小工具。可以用以下两种代码来加载代码：

```js
// 加载某个URL的脚本。注意像GitHub的Raw那样强行要求text/plain的网址是无效的。
mw.loader.load('https://wikiplus-app.smartgslb.com/Main.js');
// 加载某个用户（包括自己）的脚本
importScript('User:和平奮鬥救地球/link-ts.js');
```

## 开始编程
只要会JavaScript，只要不对别人产生不良影响，怎么写都行。

因为调试脚本是件很麻烦的事情，建议在自己的浏览器上安装油猴（Greasemonkey/Tampermonkey）插件。写得差不多再提交到维基百科中。当然如果想刷编辑次数的话就当我什么都没说。

这样做的话，脚本的加载时机是不同的。正常情况下，用户脚本（common.js）是在皮肤脚本加载完成后加载的，这时网页内容已经差不多加载完了。使用油猴的话会早一些。

## API
目前维基百科自带jQuery，版本1.11.3，拿去用就行了。维基百科还提供了jQuery UI等组件，可以通过类似`mw.loader.using('jquery.ui.dialog');`的代码来加载。

MediaWiki提供了很多API，用于获取信息、更改内容等。所有JavaScript API都在`mw`之中，而API都通过`https://zh.wikipedia.org/w/api.php`调用，详细内容可以见[JS参考手册](https://doc.wikimedia.org/mediawiki-core/master/js/#!/api/mw-property-config)和[API参考](https://www.mediawiki.org/wiki/API:Main_page/zh)。

举一些例子：

### 获取当前页面完整名称

```js
var name = mw.config.get('wgPageName');
```

### 在“查看历史”右面添加一个菜单

```js
var node = mw.util.addPortletLink('p-cactions', '#', 'Hello');
$(node).click(function (e) {
    e.preventDefault();
    alert('Hello world!');
});
```

### 获取某页面内容（客户端）

```js
function query(pageName) {
    $.ajax({
        url: mw.util.wikiScript('api'),
        data: {
            action: 'query',
            prop: 'revisions',
            rvprop: 'content',
            titles: pageName,       // 多个页面用“|”分隔
            redirects: true,        // 解析重定向
            format: 'json'
        },
        dataType: 'json',
        type: 'POST',
        success: function (data) {
            if (data.query) {
                var pages = data.query.pages;
                for (var pageid in pages) {
                    var page = pages[pageid];
                    if ('missing' in page) {
                        alert('页面' + page.title + '不存在');
                    } else {
                        alert('页面' + page.title + '的内容是：\n' + page.revisions[0]['*']);
                    }
                }
            }
        },
        error: function( xhr ) {
            alert('请求失败');
        }
    });
}
```

query功能其实非常多，这里只列出了一个最简单的……

### 改写某页面内容（客户端）

```js
function edit(pageName, text, summary) {
    $.ajax({
        url: mw.util.wikiScript('api'),
        data: {
            format: 'json',
            action: 'edit',
            title: pageName,
            summary: summary,
            text: text,
            token: mw.user.tokens.get('editToken')
        },
        dataType: 'json',
        type: 'POST',
        success: function (data) {
            if (data && data.edit && data.edit.result === 'Success') {
                alert('成功');
            } else if (data && data.edit && data.edit.result === 'Failure') {
                if (data.edit.captcha) {
                    alert('需要验证码，id=' + data.edit.captcha.id + '，url=' + data.edit.captcha.url);
                    // 这时需要人工识别验证码，在下次提交时需要加入captchaword（验证码内容）和captchaid（上面的id）两个参数。
                } else if (data.edit.code === 'abusefilter-warning') {
                    alert('被防滥用过滤器警告');
                    // 如果确定自己的编辑没有问题，再提交一次即可。
                } else if (data.edit.code === 'abusefilter-disallowed') {
                    alert('被防滥用过滤器阻止');
                } else if (data.edit.spamblacklist) {
                    alert('被垃圾过滤器阻止');
                } else {
                    alert('未知错误');
                }
            } else if (data && data.error) {
                if (data.error.code === 'protectedpage') {
                    alert('页面被保护');
                } else if (data.error.code === 'blocked') {
                    alert('你已被封禁');
                } else {
                    alert('错误' + data.error.code + '：' + data.error.info);
                }
            } else {
                alert('未知错误');
            }
        },
        error: function( xhr ) {
            alert('请求失败');
        }
    });
}
```

关于详细参数、错误码等信息，可见[API:Edit](https://www.mediawiki.org/wiki/API:Edit)。

注意，这段代码不会自动追踪重定向页——如果标题是个重定向页，那么重定向页本身会被改写。

如果这段代码不正确地用在了正经场合（例如条目或计划页），你就等着被管理员收拾吧……

{% comment %}
如果页面被保护，那么data.error.code会返回“protectedpage”。

如果是新用户触发了验证码（所以建议先把自己刷到自动确认用户，免得麻烦），那么会返回：

```json
{"edit":{"captcha":{"type":"image","mime":"image/png","id":"1027249016","url":"/w/index.php?title=Special:%E9%AA%8C%E8%AF%81%E7%A0%81/image&wpCaptchaId=1027249016"},"result":"Failure"}}
```

这时需要人工识别验证码，在下次提交时加入captchaword（验证码内容）和captchaid（上面的id）两个参数。

如果因触发防滥用过滤器而被警告，那么编辑会失败，然后data会返回和下面类似的字符串：

```json
{"edit":{"code":"abusefilter-warning","message":{"key":"abusefilter-warning","params":["编辑其他用户的用户页",27]},"abusefilter":{"id":27,"description":"编辑其他用户的用户页","actions":["warn"]},"info":"Hit AbuseFilter: 编辑其他用户的用户页","warning":"<b>警告：</b>此操作已被自动识别为有害……","result":"Failure"}}
```

重新提交一次即可。

如果被防滥用过滤器阻止，那么data会返回：

```json
{"edit":{"code":"abusefilter-disallowed","message":{"key":"abusefilter-disallowed","params":["移除所有分类（新用户）",28]},"abusefilter":{"id":28,"description":"移除所有分类（新用户）","actions":["disallow"]},"info":"Hit AbuseFilter: 移除所有分类（新用户）","warning":"<table...>...</table>\n","result":"Failure"}}
```

如果被垃圾过滤器阻止，那么会返回：

```json
{"edit":{"spamblacklist":"t.cn","result":"Failure"}}
```
{% endcomment %}

# 模板
维基百科上面的[Help:模板](https://zh.wikipedia.org/wiki/Help:%E6%A8%A1%E6%9D%BF)和[Help:解析器函数](https://zh.wikipedia.org/wiki/Help:%E8%A7%A3%E6%9E%90%E5%99%A8%E5%87%BD%E6%95%B0)已经讲得很详细了。如果不想看长篇大论，下面是简化版：

{% raw %}{{{1}}}就是套用模板时的第一个参数，{{{1&#124;默认值}}}会指定一个默认值。假如模板叫Template:a，内容是“{{{1}}}，{{{2&#124;默认值}}}”，那么{{a}}会返回“，默认值”，{{a&#124;123&#124;456}}会返回“123，456”。{% endraw %}

解析器函数包括expr、if、ifeq、ifexist、ifexpr、switch、time、language、babel、invoke等。大致用法如下：

 代码 | 结果
-----|------
{% raw %}{{ #expr: 1+1 }}{% endraw %} | 2
{% raw %}{{ #if: 字符串 &#124; 它是空白 &#124; 它不是空白 }}{% endraw %} | 它不是空白
{% raw %}{{ #ifeq: 字符串 &#124; 字符串2 &#124; 相等 &#124; 不等 }}{% endraw %} | 不等
{% raw %}{{ #ifexist: Wikipedia:首页 &#124; 存在 &#124; 不存在 }}{% endraw %} | 存在
{% raw %}{{ #ifexpr: 1+1 &#124; 不等于0 &#124; 等于0 }}{% endraw %} | 不等于0
{% raw %}{{ #switch: 3 &#124; 1=a &#124; 2=b &#124; 3=c &#124; #default=4 }}{% endraw %} | c
{% raw %}{{ #invoke:String &#124; replace &#124; abc &#124; a &#124; b }}{% endraw %} | bbc

其中invoke就要涉及lua编程了。

# lua
如果模板非常复杂，那么可以改用lua脚本来生成。

MediaWiki上面有一个非常详细的[入门教程](https://www.mediawiki.org/wiki/Extension:Scribunto/Lua_reference_manual)，即使没学过lua也没关系。

在维基百科，lua脚本页面必须以“Module:”（“模块:”）开头。如果想建立测试页面，则需要以“Module:沙盒/Example/”开头。

在调试模块之前，可以找个沙盒页面把invoke写好，然后在编辑代码时预览那个页面。

## 基本格式

脚本需要返回一个table，所有对外公开的函数都需要放到那个table里。函数只有一个参数，frame，它是把{% raw %}{{#invoke:}}{% endraw %}后面参数等信息包装好之后的东西。

```lua
f = {}

function f.fun(frame)
    ...
    -- error('报错')
    return '字符串'
end

return f
```

## 示例

假如脚本位于`Module:沙盒/Example`，函数叫fun，维基文本是{% raw %}{{#invoke:沙盒/Example &#124; fun &#124; aaaaa &#124; info=bbbb}}{% endraw %}，那么可以用以下方法获取参数：

```lua
local text = frame.args[1]
local info = frame.args.info
```

获取某个页面的内容（注意，有些模板会被展开）：

```lua
local content = mw.title.new('Wikipedia:首页'):getContent()
```

使用别的模块：

```lua
local f = require('Module:沙盒/Example/其他模块')
f.fun()
```

# GNU LilyPond
只是稍微提个醒，如果闲得蛋疼，可以在维基百科里排个简单的钢琴谱，而且可以播放出来！详见[Help:乐谱](https://zh.wikipedia.org/wiki/Help:%E4%B9%90%E8%B0%B1)。

举个例子，[和平大佬随手写的一段](https://zh.wikipedia.org/w/index.php?oldid=41405796)。

注意不要侵权。

# 机器人
详细内容可以见[Wikipedia:制作机器人](https://zh.wikipedia.org/wiki/Wikipedia:%E8%A3%BD%E4%BD%9C%E6%A9%9F%E5%99%A8%E4%BA%BA)。

## 原理
前面JavaScript一节已经给出了机器人的基本原理——那段代码其实已经可以当作人工辅助机器人来用。

维基百科要求自动化程序必须使用自己的User-Agent，没有User-Agent或者伪装成浏览器会导致403。

机器人在实作之前需要登录，而且访问API的脚本需要保存Cookie否则无法保持登录状态。登录当然不应该使用帐号本身的密码：最安全的方法是通过OAuth，不过一般情况下[生成机器人密码](https://zh.wikipedia.org/wiki/Special:BotPasswords)足矣（前者需要申请，后者不需要）。

以使用[request](https://github.com/request/request)库的Node.js代码为例：

```js
var request = require('request').defaults({jar: true});
request.post({
    url: url,
    headers: {
        'User-Agent': USERAGENT
    },
    form: {
        action: 'query',
        meta: 'tokens',
        type: 'login',
        format: 'json'
    }
}, function (error, response, body) {
    if (!error && response.statusCode === 200) {
        var token = JSON.parse(body).query.tokens.logintoken;

        request.post({
            url: url,
            headers: {
                'User-Agent': USERAGENT
            },
            form: {
                action: 'login',
                lgname: '用户名',       // 如果使用机器人密码，那么用户名中含有“@”号。
                lgpassword: '密码',
                lgtoken: token,
                format: 'json'
            }
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var result = JSON.parse(body).login.result;
                if (result === 'Success') {
                    // 登录成功
                } else {
                    // 登录失败，例如用户不存在、密码错误等，详见
                    // https://www.mediawiki.org/wiki/API:Login#The_login_action
                }
            } else {
                // 错误
            }
        });
    } else {
        // 错误
    }
});
```

有些机器人的作者公开了源代码，例如[Cewbot](https://zh.wikipedia.org/wiki/User:Cewbot)（Node.js）、[Antigng-bot](https://zh.wikipedia.org/wiki/User:Antigng-bot)（C语言orz）等，可以前去膜拜一下。另外，在Tools Lab上运行的机器人必须使用采用自由软件许可的项目。

## Tools Lab
维基媒体基金会提供了一个免费空间，大家可以在上面进行架网站、跑机器人等活动，当然，得和维基媒体基金会的计划有关。只需要到[Wikitech](https://wikitech.wikimedia.org/wiki/Main_Page)注册一个账户，然后申请Tools权限。之后管理员审核通过后会赋予你shell权限。把自己的SSH公钥加入到Wikitech的系统设置中就可以通过ssh登录。

Tools Lab的规矩比较多（而且大伙儿都在同一个主机上面登录），所以在实际操作之前应该仔细阅读各项说明文件，以免意外翻车。

Lab各软件配置：

软件     | 版本
--------|-------
系统     | Ubuntu 14.04.4
Linux   | 3.13.0
Python  | 2.7.6 / 3.4.3
Ruby    | 1.9.3
PHP     | 5.5.9
Node.js | 0.10.25
Perl    | 5.18.2

用jsub（常驻型程序必须通过jsub运行）跑Node.js时记得给内存分大一点，否则肯定会挂。

## 注意事项
维基百科不允许未经批准的机器人进行编辑（但是可以在不会对维基百科造成任何影响的地方例如沙盒进行测试），即使已有机器人权限也要严格按照申请进行，所以进行每一种正式编辑之前都要进行申请。

此外也可以到[test2wiki](https://test2.wikipedia.org)进行测试。

# 其他问题

## 电脑高手们
这个列表可能会持续更新：

* [Liangent](https://zh.wikipedia.org/wiki/User_talk:Liangent)：才女，Orz。（个人用户页被技术那边的人给整丢了）
* [Jimmy Xu](https://zh.wikipedia.org/wiki/User:Jimmy_Xu)：Orz
* [Antigng](https://zh.wikipedia.org/wiki/User:Antigng)：Orz
* [妹空酱](https://zh.moegirl.org/User_talk:妹空酱)/[镜音铃](https://zh.wikipedia.org/wiki/User:镜音铃)：Wikiplus作者，Orz
* [Kanashimi](https://zh.wikipedia.org/wiki/User:Kanashimi)：Orz
* 还有一堆潜水的大神们……Orz。

详见[机器人列表](https://zh.wikipedia.org/wiki/Special:%E7%94%A8%E6%88%B7%E5%88%97%E8%A1%A8/bot)。

## 版权
目前维基百科采用CC BY-SA 3.0（未来可能会改为4.0）和GFDL两个许可协议，因此不要粘GPL等协议的代码。

举个例子，Wikiplus是个实用的小工具，然而一方面作者本人认为工具还不够好，另一方面程序采用Apache协议授权，所以作者不应该往维基百科里面放，维基百科也不会接受。这种情况下，如果是JavaScript脚本，那么可以把代码放到别的地方，然后再通过mw.loader.load加载过来。

再举个例子，本博客采用CC BY-NC-SA 4.0许可，所以，尽管内容跟维基百科紧密相关，而且还是自己写的，就是不能直接粘过去。

## 关于自动化修改和破坏
如果想对很多页面进行修改的话，可以申请自动维基浏览器使用权，也可以申请机器人，或者请求其他人用机器人进行修改。实施自动化或半自动化修改应当先申请或打招呼，保证自己的修改不会引发争议，否则容易招致封禁。

如果纯粹是想通过编程来破坏维基百科的话，建议不要这样做，因为破坏很快就能被恢复，而且自己会被管理员给收拾一顿（封禁）。真想搞破坏的话，应当做好充分的技术准备，制定周密的计划，然后再进行行动——像[这位](https://wiki.esu.moe/张祥如)或[这位](https://wiki.esu.moe/曹国祥)那样洗版是不行的。

如果不想引起任何争议的话，可以在自己电脑上架个MediaWiki，这样的话无论如何破坏和滥权都没问题（曹国铁路除外——只要架个网站就会迅速坠毁，回归虚无）。维基百科所使用的插件见[Special:版本](https://zh.wikipedia.org/wiki/Special:%E7%89%88%E6%9C%AC)。
