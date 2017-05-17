---
title: "维基百科编程笔记"
categories: 教程
tags:
- 维基百科
- API
- JavaScript
---
最近维基百科严重上瘾，除了写条目和[搞破坏](https://zh.wikipedia.org/wiki/Wikipedia:%E7%A0%B4%E5%9D%8F)，还写了一点脚本。像我这种[电脑高级中手](https://wiki.esu.moe/曹国祥)，有了心得之后，在自己博客上随便写点什么算了，不往百科用户页里面写了。维基百科内有很详细的文档，而且高手非常多，不会的话可以问他们。

<!--more-->

{% callout info %}
#### 更新日志

* 2016年11月21日：把“机器人”一节补完。
* 2017年5月17日：修缮一下内容。
{% endcallout %}

维基百科基于MediaWiki系统，这个系统提供了很多API，所以在维基百科编程（例如写点小工具等）其实很容易。当然，不要拿去搞破坏，否则会让一群认真狂魔给封禁。

为了体验编程的乐趣，必须要注册账号。注册满七天和50次编辑即可变为自动确认用户。如果想刷编辑次数的话，记住，做正经编辑，或者至少不要在正经场合捣乱和冲刷“最近编辑”，否则也会遭到封禁。

如果想测试需要管理员权限的脚本，而且自己不是管理员或者不想/不能在维基站内测试，可以考虑去[Beta站](https://zh.wikipedia.beta.wmflabs.org)（到[Phabricator]((https://phabricator.wikimedia.org))申请权限）或[PublicTestWiki](https://publictestwiki.com)（在站内申请权限）测试。

下面假设自己的用户名叫做Example。

# JavaScript

自己的JavaScript脚本必须放在`User:Example/`下面。如果想每次打开一个页面都自动执行的话，请把代码放到`User:Example/common.js`中——在维基百科不需要[油猴](https://zh.wikipedia.org/zh/Greasemonkey)插件。

## 引用其他脚本
新接触JS的维基用户往往是为了导入一些实用的小工具。可以用以下两种代码来加载代码：

```js
// 加载某个URL的脚本。注意像GitHub的Raw那样强行要求text/plain的网址是无效的。
mw.loader.load('https://wikiplus-app.smartgslb.com/Main.js');
// 加载某个用户（包括自己）的脚本
// 虽然有 importScript 函数，但那个是中文维基自己搞的。
mw.loader.load('https://zh.wikipedia.org/w/index.php?title=User:逆襲的天邪鬼/js/link-ts.js&action=raw&ctype=text/javascript');
// 加载某个 CSS
mw.loader.load('https://zh.wikipedia.org/w/index.php?title=User:逆襲的天邪鬼/common.css&action=raw&ctype=text/css', 'text/css');
```

mw.loader.load 不会监控脚本加载状态。如果需要监控脚本加载情况，可以用 $.getScript()。

## 开始编程
只要会JavaScript，只要不对别人产生不良影响，怎么写都行。

调试脚本是件很麻烦的事情。可以在浏览器的控制台中测试，也可以一边修改页面一边测试。建议在自己电脑的编辑器上面写，写得差不多再提交到维基百科中运行。

## API
目前维基百科自带 jQuery，版本1.11.3，拿去用就行了。维基百科还提供了 jQuery UI 等组件，可以通过类似`mw.loader.using('jquery.ui.dialog');`的代码来加载。mw.loader.using 函数返回一个 Promise。

MediaWiki 提供了大量 API，可以轻松地获取页面信息、更改页面内容等。所有 JavaScript API 都在`mw`之中，而API都通过`https://zh.wikipedia.org/w/api.php`调用，详细内容可以见[JS 参考手册](https://doc.wikimedia.org/mediawiki-core/master/js/#!/api/mw-property-config)和[API 参考](https://www.mediawiki.org/wiki/API:Main_page/zh)。另外维基百科也提供了一个[API 沙盒](https://zh.wikipedia.org/wiki/Special:ApiSandbox)以便查看详情和测试。

除了传统的 API，维基百科也提供了 RESTful 的 API，详见[文档](https://zh.wikipedia.org/api/rest_v1/)。

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
            titles: pageName,           // 多个页面用“|”分隔
            redirects: true,            // 解析重定向
            converttitles: true,        // 自动处理简繁转换。仅限中文维基。
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
        error: function (xhr) {
            alert('请求失败');
        }
    });
}
```

query 功能其实非常多，这里只列出了一个最简单的。实际上你还可以拿它查页面历史等。

### 改写某页面内容（客户端）

```js
function edit(pageName, text, summary) {
    $.ajax({
        url: mw.util.wikiScript('api'),
        data: {
            format: 'json',
            action: 'edit',
            title: pageName,        // 页面名称
            summary: summary,       // 编辑摘要
            text: text,             // 页面内容
            redirect: true,         // 自动处理重定向
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
                    alert('你已遭到封禁');
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

大量编辑时尽量控制频率。在中文维基百科，尽量不要超过 3 次/分钟。

<div style="display: none;">
如果页面被保护，那么data.error.code会返回“protectedpage”。

如果是新用户触发了验证码（所以建议先把自己刷到自动确认用户，免得麻烦），那么会返回：

```json
{"edit":{"captcha":{"type":"image","mime":"image/png","id":"1027249016","url":"/w/index.php?title=Special:%E9%AA%8C%E8%AF%81%E7%A0%81/image&wpCaptchaId=1027249016"},"result":"Failure"}}
```

这时需要人工识别验证码，在下次提交时加入 captchaword（验证码内容）和 captchaid（上面的id）两个参数。

如果因触发防滥用过滤器而收到警告，那么编辑会失败，然后 data 会返回和下面类似的字符串：

```json
{"edit":{"code":"abusefilter-warning","message":{"key":"abusefilter-warning","params":["编辑其他用户的用户页",27]},"abusefilter":{"id":27,"description":"编辑其他用户的用户页","actions":["warn"]},"info":"Hit AbuseFilter: 编辑其他用户的用户页","warning":"<b>警告：</b>此操作已被自动识别为有害……","result":"Failure"}}
```

重新提交一次即可。

如果被防滥用过滤器阻止，那么 data 会返回：

```json
{"edit":{"code":"abusefilter-disallowed","message":{"key":"abusefilter-disallowed","params":["移除所有分类（新用户）",28]},"abusefilter":{"id":28,"description":"移除所有分类（新用户）","actions":["disallow"]},"info":"Hit AbuseFilter: 移除所有分类（新用户）","warning":"<table...>...</table>\n","result":"Failure"}}
```

如果被垃圾过滤器阻止（例如插入 t.cn 短网址），那么会返回：

```json
{"edit":{"spamblacklist":"t.cn","result":"Failure"}}
```
</div>

# 模板
维基百科上面的[Help:模板](https://zh.wikipedia.org/wiki/Help:%E6%A8%A1%E6%9D%BF)和[Help:解析器函数](https://zh.wikipedia.org/wiki/Help:%E8%A7%A3%E6%9E%90%E5%99%A8%E5%87%BD%E6%95%B0)已经讲得很详细了。如果不想看长篇大论，下面是简化版：

&#123;&#123;&#123;1&#125;&#125;&#125;就是套用模板时的第一个参数，&#123;&#123;&#123;1&#124;默认值&#125;&#125;&#125;会指定一个默认值。假如模板叫 Template:a，内容是“&#123;&#123;&#123;1&#125;&#125;&#125;，&#123;&#123;&#123;2&#124;默认值&#125;&#125;&#125;”，那么&#123;&#123;a&#125;&#125;会返回“，默认值”，&#123;&#123;a&#124;123&#124;456&#125;&#125;会返回“123，456”。

解析器函数包括 expr、if、ifeq、ifexist、ifexpr、switch、time、language、babel、invoke 等。大致用法如下：

 代码 | 结果
-----|------
&#123;&#123; #expr: 1+1 &#125;&#125; | 2
&#123;&#123; #if: 字符串 &#124; 它是空白 &#124; 它不是空白 &#125;&#125; | 它不是空白
&#123;&#123; #ifeq: 字符串 &#124; 字符串2 &#124; 相等 &#124; 不等 &#125;&#125; | 不等
&#123;&#123; #ifexist: Wikipedia:首页 &#124; 存在 &#124; 不存在 &#125;&#125; | 存在
&#123;&#123; #ifexpr: 1+1 &#124; 不等于0 &#124; 等于0 &#125;&#125; | 不等于0
&#123;&#123; #switch: 3 &#124; 1=a &#124; 2=b &#124; 3=c &#124; #default=4 &#125;&#125; | c
&#123;&#123; #invoke:String &#124; replace &#124; abc &#124; a &#124; b &#125;&#125; | bbc

其中 invoke 涉及 lua 编程。

再给一条建议：设计复杂模板时一点一点来，而且先把缩进和代码排版弄好。

# lua
如果模板非常复杂，那么可以改用 lua 脚本来生成。MediaWiki 上面有一个非常详细的[入门教程](https://www.mediawiki.org/wiki/Extension:Scribunto/Lua_reference_manual)，即使没学过 lua 可以借助这个教程从零开始。

在维基百科，lua脚本页面必须以“Module:”（“模块:”）开头。如果想建立测试脚本，则通常使用“Module:沙盒”。

调试模块之前，可以找个沙盒页面把 invoke 写好，然后在编辑代码时预览那个页面。

## 基本格式

脚本需要返回一个 table，所有对外公开的函数都需要放到那个 table 里。函数只有一个参数，frame，它是把&#123;&#123;#invoke:&#125;&#125;后面参数等信息包装好之后的东西。

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

假如脚本位于`Module:沙盒/Example`，函数叫 fun，维基文本是&#123;&#123;#invoke:沙盒/Example &#124; fun &#124; aaaaa &#124; info=bbbb&#125;&#125;，那么可以用以下方法获取参数：

```lua
local text = frame.args[1]
local info = frame.args.info
```

获取某个页面的内容（注意，模板会被展开）：

```lua
local content = mw.title.new('Wikipedia:首页'):getContent()
```

使用别的模块：

```lua
local f = require('Module:沙盒/Example/其他模块')
f.fun()
```

# 机器人
详细内容可以见[Wikipedia:制作机器人](https://zh.wikipedia.org/wiki/Wikipedia:%E8%A3%BD%E4%BD%9C%E6%A9%9F%E5%99%A8%E4%BA%BA)。

## 原理
机器人的原理和脚本基本一样，也是通过 MediaWiki 提供的 API 进行编辑。不过，各计划通常会要求机器人使用专门账号并且在经过批准之后才投入运作。维基百科要求自动化程序必须使用自己的 User-Agent，没有 User-Agent 或者伪装成浏览器（然后让管理员发现）会导致 500。

机器人在运行之前需要登录，而且访问API的脚本需要保存Cookie，否则无法保持登录状态。你可以用账号本身的密码进行登录，也可以选择最安全的 OAuth，不过大家通常都用[机器人密码](https://zh.wikipedia.org/wiki/Special:BotPasswords)，因为 OAuth 需要额外申请。

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

有些机器人的作者公开了源代码，例如[Cewbot](https://zh.wikipedia.org/wiki/User:Cewbot)（Node.js）、[Antigng-bot](https://zh.wikipedia.org/wiki/User:Antigng-bot)（C 语言orz）等，可以前去膜拜一下。另外，在 Tool Labs 上运行的机器人必须使用采用自由软件许可的项目。

## Tool Labs
维基媒体基金会提供了一个免费空间，大家可以在上面进行架网站、跑机器人等活动。只需要到 [Wikitech](https://wikitech.wikimedia.org/wiki/Main_Page)注册一个账户，然后申请 shell 权限。审核通过后你就可以把自己的 SSH 公钥加入到 Wikitech 的系统设置中并登录。服务器为 login.tools.wmflabs.org 和 dev.tools.wmflabs.org（如果需要编译等操作请用这个）。

Tool Labs 的规矩比较多，所以在实际操作之前应该仔细阅读各项说明文件，以免意外翻车。

Labs 各软件配置：

软件     | 版本
--------|-------
系统     | Ubuntu 14.04.4
Linux   | 3.13.0
Python  | 2.7.6 / 3.4.3
Ruby    | 1.9.3
PHP     | 5.5.9
Node.js | 0.10.25
Perl    | 5.18.2

如果想跑任务（网站、机器人等），那么你需要[到这个地方](http://tools.wmflabs.org/)建立一个工具账户。常驻型程序必须通过工具用户（在 shell 中通过`become XXX`登录）和 jsub/jstart 命令执行，例如：

    jstart -N myjob -cwd -l release=trusty -mem 512m python job.py

用 jsub 跑 Node.js 时记得给内存分大一点，否则肯定会挂。

不要以为 Labs 自带的 Node.js 版本很旧——维基大佬 [Kanashimi](https://zh.wikipedia.org/wiki/User:Kanashimi)在`/shared/bin/node`放了一个最新版的 node。

因为大家都在同一个主机上面登录，所以你需要注意保护密码等敏感信息。可以把密码写到一个专门的文件中，让程序读这个文件，而且 chmod o-r。

## 注意事项
如果未经批准，可以利用自己的用户页进行测试，或者到 [test2wiki](https://test2.wikipedia.org)进行测试。有条件的话也可以自行架设 Wiki，这样就不会对其他人造成负面影响了。

测试时应当控制频率，以免冲刷“最近修改”。即使已经获得 bot flag 也应该稍微控制一下频率——你总不希望系统管理员以为你在 DoS 然后把你屏蔽吧？
