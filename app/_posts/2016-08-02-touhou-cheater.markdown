---
layout: post
title: "自己动手写东方Project作弊器（未完待续）"
author: vjudge1
categories: 游戏
tags: 东方Project
---
* contents
{:toc}

很久没写程序了，甚至很久没和计算机代码打交道了。为了证明自己没被查水表，我就随便写点什么吧。

最近发现了[东方Project](https://zh.wikipedia.org/wiki/%E6%9D%B1%E6%96%B9Project)，不幸的是，由于天生手残，连Easy难度都难以通关（除了永夜抄和辉针城）。作为一个猥琐大叔，就这样被萝莉们欺负，能爽吗？所以，为了把她们统统[推倒](http://cn.uncyclopedia.wikia.com/wiki/%E6%8E%A8%E5%80%92)，我要写作弊器了！




{% callout danger %}
#### 未完待续

在学会汇编语言之前这个<del>万年</del>坑是填不满的Orz。
{% endcallout %}

# 原理

如果想直接作弊的话，只要搜一下东方的修改器，或者装个金山游侠、Cheat Engine或Game Master，然后改数据就可以了。如果自己写修改器，其实也不难，因为东方正作，除了妖妖梦和永夜抄，那些参数的地址都是固定的，只要记住地址，把数据写进去就OK了。<del>妖妖梦和永夜抄比较特殊，后面再单独分析。（未完待续）</del>

修改器这种东西，用VB6写会比较简单。虽然VB6早就过时了，但是不得不说它是最简单实用的解决方案，没有之一。修改器的代码很多，网上随便找一个就能改造成XXX专用修改器了。

## 修改内存数据

修改内存数据的话，需要使用Windows API。核心函数就是WriteProcessMemory。

具体思路如下：

获取进程PID。比如寻找名为“th10.exe”的进程，或者通过FindWindow函数找到游戏窗口，再通过GetWindowThreadProcessId获取PID：

{% highlight vb %}
Dim hwnd As Long
Dim pid As Long

hwnd = FindWindow("BASE", vbNullString)
If hwnd = 0 Then Exit Sub

GetWindowThreadProcessId hwnd, pid
{% endhighlight %}

接下来进行写入：

{% highlight vb %}
Dim pHandle As Long
pHandle = OpenProcess(PROCESS_ALL_ACCESS, False, lppid)
WriteProcessMemory pHandle, ByVal 目标地址, ByVal VarPtr(目标值), 字节数, 0&
CloseHandle pHandle
{% endhighlight %}

如果写入多个字节，可以开个Byte数组（例如叫做Arr），然后传入ByVal VarPtr(Arr(0))。

当然，在实际操作过程中要搞清楚运行的到底是哪一款游戏。我个人是通过GetWindowText获取窗口标题栏文字，然后检查有没有英文关键词（例如风神录是“Mountain of Faith”）来判断游戏版本的。反正不会特意去玩体验版，所以不用管它了。

## 提权

直接用WriteProcessMemory是无法修改其他进程数据的。在修改之前，需要给进程提权。提权很简单，照抄现成代码就行：

{% highlight vb %}
Dim hToken As Long
Dim tmpLuid As LUID
Dim tkp As TOKEN_PRIVILEGES
Dim tkpNewButIgnored As TOKEN_PRIVILEGES
Dim lBufferNeeded As Long
OpenProcessToken GetCurrentProcess(), TOKEN_ALL_ACCESS, hToken
LookupPrivilegeValue "", "SeDebugPrivilege", tmpLuid
tkp.PrivilegeCount = 1
tkp.Privileges(0).pLuid = tmpLuid
tkp.Privileges(0).Attributes = SE_PRIVILEGE_ENABLED
AdjustTokenPrivileges hToken, False, tkp, Len(tkpNewButIgnored), tkpNewButIgnored, lBufferNeeded
{% endhighlight %}

## 寻找地址

即使要自己写修改器，金山游侠一类软件还是要用的，要不然怎样找到地址呢？

# 直接改值

送给拿来主义者——其实自己用游侠跑几遍就出来了。如果没有特殊说明，数据均为十六进制，数据大小都是1字节。

 游戏   | 残机    | BOMB   | Power                          | 其他
--------|---------|--------|--------------------------------|------------
红魔乡  | 69D4BA  | 69D4BB | 69D4B0，最大0x80              |
风神录  | 474C70  |        | 474C48，示数除以0.05，最大0x64  |
地灵殿  | 4A5718  |        | 4A56E8，示数除以0.05，最大0x64<br>（魔理沙＋爱丽丝最大0xC8） |
星莲船  | 4B0C98  | 4B0CA0 | 4B0C48（2字节），示数乘100，最大0x190 |
神灵庙  | 4BE7F4  | 4BE800 | 4BE7E8（2字节），最大0x190     |
辉针城  | 4F5864  | 4F5870 | 4F5858（2字节），最大0x190     |
绀珠传  | 4E7450  | 4E745C | 4E7440（2字节），最大0x190     |

改Power的时候建议先改成最大值减去一个数，否则自机火力容易不正常。

如何想锁定残机的话，用一个Timer来反复修改，就能达到锁定的效果了。

# 改代码（未完待续）

深入地思考一下，既然能改残机数，那么能不能直接防止掉残机，或者直接撞不到子弹呢？

这就涉及到反汇编了。像我这样没学过的，只好借助已有资料来现学现卖了——就像当年在高中一样，拿着[标准答案](http://cheater.seesaa.net/category/9478192-1.html)来解释题目为什么这样做。

因为辉针城通关了，就拿辉针城举个例子。

## 不掉残机

辉针城的残机地址是4F5864，首先用追踪功能（新手嘛，用Game Master试的）找到写入该地址的代码。

![1]({{ site.baseurl }}/img/2016-08-02-touhou/1.png)

看到那个DEC EAX（AX减1）了吗？直接改成0x90（NOP，空指令）试一下。

改完之后可以主动撞一下，果然残机数不减了。要是改成0x40（INC EAX，AX加1）……

{% callout danger %}
#### 未完待续

我得去学一下汇编语言，然后才能接着泡妹子。略遗憾。

如果不打算关心具体的原理，只想搞出一个修改器，可以直接看后面的参考资料，具体的地址和数值已经都列出来了。
{% endcallout %}

# 参考资料

* [東方改造: Nice cheat.](http://cheater.seesaa.net/category/9478192-1.html)
    * [东方绀珠传在这里](http://cheater.seesaa.net/article/169529488.html)
* [永夜抄自机、bomb、power内存地址](http://tieba.baidu.com/p/1271755034)
* [关于妖妖梦作弊.......](http://tieba.baidu.com/p/1270485699)
