---
layout: post
title: "自己动手写東方Project作弊器（二）（未完待续）"
author: vjudge1
categories: 游戏
tags: 東方Project 反汇编
---
* contents
{:toc}
東方的射击类游戏还没修改完。接着折腾。（没有耐心的话可以直接看结尾附带的链接。）




{% callout %}
#### 未完待续

东方的游戏太多了，挨个作弊作不过来……以后本文还会慢慢地更新。<span class="blackout">可能是因为妹子太多泡不过来了。</span>
{% endcallout %}

# 红魔乡

红魔乡似乎加壳了。虽然对作弊器研究没有影响，但是上一篇文章提到的“参考资料”的作者研究了脱壳的问题，所以我直接贴个地址：[东方红魔乡脱壳](http://tieba.baidu.com/p/3730028296)

# 妖妖梦和永夜抄
![吃货](https://static.mengniang.org/common/2/29/Th135Youmu%26Yuyuko.gif)

妖妖梦和永夜抄的作弊与其他正作略有区别。不同之处在于：

1. 残机、BOMB、Power等数据以浮点数形式储存（不知为何ZUN神主突然想拿float当int使）。
2. 地址是动态的，即使是续关，地址都会发生变化。
3. 直接改数值的话游戏会崩掉。

了解这些情况之后，应当先练习一下妖妖梦和永夜抄，至少要撑到第三四关（囧），否则很可能搜不到数据。练得差不多之后继续开修改器搜索。但是，找到数据之后，不要停止游戏，而是应当立马开启追踪。然后，剩下的事情就和其他作品差不多了。

以永夜抄为例：

通过搜索，找到了存放生命值的地址是2D0EB84。

![]({{ site.baseurl }}/img/2016-08-18-touhou-2/th8_1.png)

追踪对这个地址的读写（注意float是4字节），找到两个地址43C66D和43C676。

![]({{ site.baseurl }}/img/2016-08-18-touhou-2/th8_2.png)

![]({{ site.baseurl }}/img/2016-08-18-touhou-2/th8_3.png)

<del>对于那个FILD指令，加残机的时候进去的数字是1，掉残机时进去的数字是-1。</del>何必管它呢？直接把43C676处的指令（FSTP那个）填成3个90（NOP），这样改就不掉残机数了（不过也不增加了）。

稍微深入地跟踪一下，发现Miss时是由44D100处调用改残机数的指令，前面（44D0F9处）有个PUSH -1——经过试验，将44D0FA改成00也能不掉残机数。

大胆地往前找CALL，反复加断点，并结合[上篇文章]({{site.baseurl}}/2016/08/12/touhou-cheater.html)的经验（判定时会读写自机的状态），可以发现：

![]({{ site.baseurl }}/img/2016-08-18-touhou-2/th8_4.png)

在Miss过程中，44C48A（CALL 0044CBF0）会被不断地调用。44C482处的“CMP EDX, 2”是判断自机状态（由前文经验得知），也就是说，状态2表示“正在挂掉”。继续追踪，发现这个状态被写在了17D5EF8里面，而且这个地址是固定的。不过这次不要再野蛮地改成RET了，否则游戏会崩——其实改成NOP就行了。

备注：在永夜抄中，自机Miss的一瞬间会有一个短暂的暂停——等待玩家发动决死。有人给出了跳过这段等待时间的方法，照着改就行：[永夜抄自机、bomb、power内存地址](http://tieba.baidu.com/p/1271755034)。

# 花映塚（未完待续）

# 妖精大战争
<del>我的[琪露诺](https://zh.moegirl.org/%E7%90%AA%E9%9C%B2%E8%AF%BA)那么强，用得着作弊吗？</del>

妖精大战争的作弊比较容易，不过干劲的设定与残机数量略有区别。最初的干劲是200%，实际上在内存中的数值是20000（十进制）。

很容易就能搜到具体地址4B4D64，固定的。追踪发现，干劲上升和下降都是同一指令在起作用（下图42729C）。

![]({{ site.baseurl }}/img/2016-08-18-touhou-2/th128_1.png)

如果不想上升也不想下降，直接写入6个90（NOP）就可以了。如果想上升不想下降，我们注意ECX的值，还有427277处的指令，可以发现干劲的变化值被存到堆栈里面了。继续追踪调用这段代码的CALL，找到了43CDDF（下图）。

![]({{ site.baseurl }}/img/2016-08-18-touhou-2/th128_2.png)

看到43CDD8处的PUSH -2710了吗？Miss一下就掉100%干劲，乘100再转成十六进制，正好2710。所以改成PUSH 0就完事儿了。需要注意的是，在EX关，魔理沙的大招（激光）也会让小[⑨](https://zh.moegirl.org/%E7%90%AA%E9%9C%B2%E8%AF%BA#.E2.80.9C.E2.91.A8.E2.80.9D.E5.8F.8A.E2.80.9C.E7.AC.A8.E8.9B.8B.E2.80.9D.E4.B9.8B.E5.90.8D.E7.9A.84.E7.94.B1.E6.9D.A5)掉干劲。有兴趣的话自己研究吧。

妖精大战争的无敌方法和[前文]({{site.baseurl}}/2016/08/12/touhou-cheater.html)完全一样，本文不再重复叙述了。直接给出“答案”：把43D0C0处改为C2 04 00（RETN 4）。

# 弹幕天邪鬼（未完待续）
![鬼人正邪](https://static.mengniang.org/common/0/00/%E9%AC%BC%E4%BA%BA%E6%AD%A3%E9%82%AAz.png)

<div style="-moz-transform:scaleY(-1);-webkit-transform:scaleY(-1);-o-transform:scaleY(-1);transform:scaleY(-1);">
（未完待续）
</div>

# 东方文花帖 & DS（未完待续）

# 参考资料

* [東方改造: Nice cheat.](http://cheater.seesaa.net/category/9478192-1.html)
    * [东方绀珠传作弊](http://cheater.seesaa.net/article/169529488.html)
* [永夜抄自机、bomb、power内存地址](http://tieba.baidu.com/p/1271755034)
* [关于妖妖梦作弊.......](http://tieba.baidu.com/p/1270485699)
* [东方红魔乡脱壳](http://tieba.baidu.com/p/3730028296)
