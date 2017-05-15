---
title:  "精简Visual Studio 2015"
categories: 教程
tags:
- Visual Studio
- 系统维护
---
一装Visual Studio 2015，几个G的硬盘空间就轻轻松松地消失了。过去的VS还能选择装什么东西，现在似乎基本上没什么可选择的。那么怎样才能精简Visual Studio，把不需要的东西都删除？

<!--more-->

两种思路：一种是避免安装不需要的东西，另一种是把不需要的组件删除。

{% callout danger %}
#### 危险！

本文内容很危险，而且似乎成效不大。小心操作，如果出错，你将不得不重装VS！
{% endcallout %}

安装之前首先需要留足空间，C盘最好超过10GB，免得麻烦。

# 精简安装

官方指出，通过无人职守安装，可以决定只安装哪些组件，不安装哪些组件。

如果网络没毛病的话，建议使用在线安装的那个安装程序，因为离线安装的话补丁是单独装的，要白白占掉很多空间，在线装的话补丁是已经打好的。

[官方的教程](https://msdn.microsoft.com/zh-cn/library/ee225237(v=vs.140).aspx)说的比较清楚，照做即可。它大致思路如下：

1. 敲个命令，把安装文件下载到本地。
2. 敲第二条命令，生成AdminDeployment.xml，由你自己修改。[这里](https://gist.github.com/riezebosch/84ea3a7dcac34f93eea0)有一个修改后的例子（需要翻墙）。
3. 第三条命令，让安装程序利用这个AdminDeployment.xml来进行安装。

# 删除无用组件

原文：[http://blog.sujay.sarma.in/tutorial/removing-visual-studio-bloatware/](http://blog.sujay.sarma.in/tutorial/removing-visual-studio-bloatware/)

肯定会有一些用不着的东西被装上了。我们可以挨个卸载——

首先下载[TotalUninstaller](http://totaluninstaller.codeplex.com/)，它的特点是可以进行模糊搜索，把含有关键词的、通过Windows Installer安装的软件统统卸载。

以管理员身份启动命令提示符，输入

    TotalUninstaller.exe /ListAll > a.txt

打开a.txt，看看里面哪些安装包是不需要的（注意，里面不光有VS，还有其他软件），总结出一些关键词。

接下来编辑TotalUninstaller.exe.config，里面应该有`<ProductsToUninstall>`，我把它改成了（**注意，不要照抄，否则后果会很惨！**）

```xml
<ProductsToUninstall>
    <add key="1" value="Advertising"/>
    <add key="2" value="Windows Phone"/>
    <add key="3" value="FSharp"/>
    <add key="4" value="Visual F#"/>
    <add key="5" value="LightSwitch"/>
    <add key="6" value="Workflow"/>
    <add key="7" value="Desktop SDK"/>
    <add key="8" value="Windows Store App"/>
    <add key="9" value="Azure"/>
    <add key="10" value="ARM"/>
    <add key="11" value="Office365"/>
    <add key="12" value="Application Insights"/>
    <add key="13" value="Blend"/>
    <add key="14" value="XAML"/>
</ProductsToUninstall>
```

然后

    TotalUninstaller.exe /Uninstall

程序就会自动搜索含有那些关键词的安装包，挨个卸载。

不过收益似乎不太大——才放掉了800多MB。

# 删除缓存

最后，`C:\ProgramData\Package Cache`是当然要消灭的！能够省下近3GB空间！

消灭的时候注意，不要直接删光，否则以后Visual Studio安装程序无法正常打开。用`del C:\ProgramData\Package Cache\*.cab /s /q /f`删会好一些。

因为脑袋正常的人不会天天在那儿玩Visual Studio安装程序，所以，以后真的需要修改或修复的时候，重新下载安装程序就行了。

经过试验，试图通过建立符号链接来转移文件的方法是不可行的。
