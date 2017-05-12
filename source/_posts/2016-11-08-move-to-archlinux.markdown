---
title: "换成Arch Linux系统的一些记录"
categories: 备忘录
tags:
- Linux
- wine
- 東方Project
- npm
- 配置
- 系统维护
---
又写很水的内容了——突然想把系统换成Arch Linux（64位，GNOME 3桌面），所以记录一下一些配置的要点。当然，具体的安装过程就不写了，网上教程很多，搜一下就能找到。

# 基本
## 代理
稍有常识的人都能看出，如果我们的电脑不挂代理，那些特别的软件难道还能设置得了嘛？

我推荐使用[MEOW](https://github.com/renzhn/MEOW)，它可以把各种常见的代理转化为HTTP代理，而且是白名单制（只有白名单的网站不走代理），非常方便。

想自动启动的话，建立一个文件`~/.config/autostart/meow.desktop`，在其中输入

```ini
[Desktop Entry]
Type=Application
Name=meow
Exec=/home/xxx/MEOW
```

当然也可以做成systemd服务（user）。

为了在命令行中享受到代理，可以在自己的shell的配置文件中加入：

```bash
export HTTP_PROXY=http://127.0.0.1:7777
export HTTPS_PROXY=http://127.0.0.1:7777
```

当然，跑pacman和滚Arch的时候没必要走代理，所以可以把镜像站的网址放到白名单里。

### npm

npm不用代理，直接换[淘宝镜像](https://npm.taobao.org/)：

```
npm config set registry https://registry.npm.taobao.org
npm config set disturl https://npm.taobao.org/dist

npm set registry https://registry.npm.taobao.org
npm set disturl https://npm.taobao.org/dist
npm set chromedriver_cdnurl http://cdn.npm.taobao.org/dist/chromedriver
npm set operadriver_cdnurl http://cdn.npm.taobao.org/dist/operadriver
npm set phantomjs_cdnurl http://cdn.npm.taobao.org/dist/phantomjs
npm set fse_binary_host_mirror https://npm.taobao.org/mirrors/fsevents
npm set sass_binary_site http://cdn.npm.taobao.org/dist/node-sass
npm set electron_mirror http://cdn.npm.taobao.org/dist/electron/
```

### gem

换用[Ruby China的镜像](https://gems.ruby-china.org)：

```
gem sources --add https://gems.ruby-china.org/ --remove https://rubygems.org/
bundle config mirror.https://rubygems.org https://gems.ruby-china.org
```

## AUR
为了能够多装些东西，我安装了yaourt。具体操作网上有，可以用archlinuxcn源。

配置好之后就可以yaourt地安装软件了。

## 字体
在决定手动安装字体之前，可以先到[ArchWiki的“字体”页面](https://wiki.archlinux.org/index.php/Fonts)上转转——很多字体可以通过pacman和yaourt来搞定。

我推荐三个编程字体：一个是Monaco（Mac系统的字体），一个是Source Code Pro，还有一个是Windows系统的Consolas。

对于中文字体，不想用文泉驿的话，我再推荐一个Google制作的Noto Sans CJK字体。不过最后我还是用微软雅黑了。

## 输入法
为了配合Sublime Text等软件，我把输入法平台换成了fcitx。另外我一直使用中州韵输入法（放弃了搜狗），所以：

```
sudo pacman -S fcitx fcitx-im fcitx-rime
```

在`~/.xprofile`（文件名全小写，如果没有该文件那么就新建一个）中输入：

```bash
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS="@im=fcitx"
```

接下来需要禁用iBus。在终端中输入：

```
gsettings set org.gnome.settings-daemon.plugins.keyboard active false
```

然后到“系统设置”->“地区和语言”把所有输入法删掉，这样iBus就不会干扰fcitx了。

fcitx的界面和GNOME的界面看起来不协调，可以通过`sudo pacman -S gnome-tweak-tool`安装“GNOME优化工具”，再借助它安装一个名为“Input method panel”的扩展程序来调整。

中州韵输入法的配置都在`~/.config/fcitx/rime`中，自己改改就能用了。为了不跟中州韵冲突，fcitx本身的切换输入法键（Shift）和全半角切换键得关掉。

## 清理孤立软件包

滚时间长了，体验然后卸载的软件多了，肯定会产生一些无用的软件包。输入以下命令清理：

```
sudo pacman -Rns $(pacman -Qtdq)
```

另外可以通过`sudo pacman -Scc`来清理缓存。

## 界面

我用的 GTK 主题叫 Arc-Flatabulous，图标主题是 Numix 和 Papirus，Shell 主题是 Dark Mode，这些主题用 yaourt 搜一下就有了。

一些扩展：Alternatetab、Applications Menu、Dash to dock、Input method panel、Media player indicator、Screenshot locations、Services systemd、Topicons plus、User themes

## 终端模拟器

我现在用的是 Tilix，可以通过 yaourt 安装。另外发现一个叫做 [Hyper](http://hyper.is/) 的终端模拟器，它可以像 Atom 编辑器那样 Hack，不过我还没开始研究（已知中文会出问题）。

# 编程软件

## Vim
[我的Vim配置文件](https://github.com/vjudge1/misc/blob/master/config/vimrc)是过去写好的，所以直接搬来用了。

大致的情况就是使用Vundle作为插件管理器，然后塞了一大堆插件。其中最难配置的就是[YouCompleteMe](https://github.com/Valloric/YouCompleteMe)，不过在Linux中的配置可比在Windows和Mac系统中轻松多了。

终端版无法正确处理剪贴板，因此也可以`yaourt -S vim-clipboard`。

## Sublime Text
不要`yaourt -S sublime-text-dev`，那个版本没法敲汉字。我们应当`yaourt -S sublime-text-dev-imfix`。

如果PATH变量是在`.zshrc`中设置的，那么Sublime Text可能会注意不到（废话）。对于某些插件来说，你需要修复一下这个问题，或者手动给它们指定PATH。这个症状在Mac中也会出现。

提示“软件包冲突”的话，那么你可以改一下PKGBUILD，去掉zh_CN和zh_TW中的一个——去掉zh_TW的话就是大陆版的“九二共识”，去掉zh_CN的话就是大陆版的“台独”。

## Atom
Sublime Text的输入法问题实在令人头疼，即使把iBus换成fcitx有时候还是不好使。另外Atom本身也是个很棒的编辑器，所以自然要跟Sublime Text换着用。

因为Atom很火，直接通过pacman安装就行了：

```
sudo pacman -S atom apm
```

在调用apm的时候，你需要挂代理，否则apm就直接废了。具体做法就是

```
apm config proxy http://127.0.0.1:7777
apm config https-proxy http://127.0.0.1:7777
apm config set strict-ssl false
```

## Python
Arch默认的Python是3.x，而且没有提供一种切换Python版本的工具。为了使2.x成为默认Python，按照官方给出的方法，我是这样做的：

```
mkdir ~/.bin
ln -s /usr/bin/python2 ~/.bin/python
ln -s /usr/bin/pip2 ~/.bin/pip
ln -s /usr/bin/python2-config ~/.bin/python-config
```

最后在PATH中保证`/home/xxx/.bin`排在`/usr/bin`前面即可。

## 关于本博客（Jekyll 版）
敲`grunt serve`的时候突然冒出满屏幕的“Warning: watch ... ENOSPC”警告，根本无法预览，所以搜到了[StackOverflow的解决方案](http://stackoverflow.com/questions/16748737/grunt-watch-error-waiting-fatal-error-watch-enospc)。他们的系统敲的是：

```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

那是Ubuntu系统。我们Arch系统要敲

```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.d/99-sysctl.conf && sudo sysctl --system
```

后来换成 Hexo 就没有这个问题了。

# 日常软件
## Google Chrome
就一行命令：

```
yaourt -S google-chrome
```

## QQ
我去年写过一个[在Linux上面跑QQ的文章](/2015/08/21/wineqq/)，现在那个WineQQ还在，而且仍然好使，照做即可。

当然，有 AUR 那篇文章就“白写”了。

## Office
对我来说 LibreOffice 足够用了。我还有个 Windows 平板所以不担心兼容性的问题。

# 游戏

## 东方Project

在Arch里玩东方Project只需这样做：开启multilib支持（64位系统才需要），在`/etc/pacman.conf`里加一句

```ini
[multilib]
Include = /etc/pacman.d/mirrorlist
```

然后装wine和解码器（32位系统直接去掉命令中的“lib32”）：

```
sudo pacman -S wine
sudo pacman -S lib32-alsa-lib lib32-pulse-lib lib32-libpulse lib32-alsa-plugins lib32-mpg123 lib32-sdl lib32-openal lib32-gst-plugins-base lib32-gstreamer gst-libav lib32-gst-plugins-good
```

然后就OK了。

注意：
1. 如果游戏乱码，请设置LC_ALL变量，例如：`LC_ALL=zh_CN.UTF-8 wine th06.exe`。Mac系统也是这样处理的。不要听网上说改LANG，没用的。
2. 想全屏游戏的话，桌面不要用Wayland，而是应当换回Xorg，否则不仅进不去而且还会崩终端或桌面。
3. 不知道什么原因，新版wine跑辉针城或以上游戏的时候游戏速度会非常快……

## Steam

只需要：

```
yaourt -S steam steam-native-runtime
```

不过Steam没法通过optirun来启动。所以我暂时想到的方法是：把Steam放在那里挂着，然后自己手动通过optirun来运行游戏：

```
optirun ~/.steam/steam/steamapps/common/Portal\ 2/portal2.sh -game portal2 -steam
```

不幸的是，对于《半条命2》、《传送门》等起源引擎游戏，中文可能连豆腐块都看不到——直接是“无字天书”。这是因为游戏引擎把字体名称写死了，测量中文字符时直接宽度为零，所以我们要做个字体替换，把写死的“Nimbus Sans”字体换成文泉驿：

```xml
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>

<match target="pattern">
   <test qual="any" name="family"><string>Nimbus Sans</string></test>
   <edit name="family" mode="assign" binding="same"><string>WenQuanYi Zen Hei</string></edit>
</match>

</fontconfig>
```

保存到`~/.config/fontconfig/fonts.conf`，这样就能显示汉字了。

## MIDI
如果需要 MIDI，可以这样配置：

1. 安装 FluidSynth
2. 安装一个 SoundFont，例如 Windows 系统的 SoundFont 文件叫做 2gmgsmt.sf2。
3. 按[Archlinux Wiki上面的内容](https://wiki.archlinux.org/index.php/FluidSynth)修改`/etc/conf.d/fluidsynth`，把 SoundFont 文件设置好，并将 FluidSynth 配置成 systemd 服务，启动。
4. 如果 Wine 程序需要 MIDI，那么还要改一下注册表：`HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\MIDIMap`（没有就新建一个），新建一个字符串值，名称为`CurrentInstrument`，并设为“\#1”。
