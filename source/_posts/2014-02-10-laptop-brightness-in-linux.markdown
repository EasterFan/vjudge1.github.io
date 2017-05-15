---
title: "Ubuntu 调整笔记本电脑屏幕亮度"
categories: 折腾记录
tags:
- Linux
---
装完 Ubuntu 之后没法给笔记本电脑调亮度了。花了很多时间来探索，最后找到了解决方法。这里我只写一写自己电脑（Lenovo V470，Intel HD3000 + Nvidia GT540M）的情况，更详细的资料可见 [Archlinux Wiki](https://wiki.archlinux.org/index.php/Backlight)。

<!--more-->

# 调亮度

在“系统设置”中拖动滑块，没用。于是我试了一下

    echo 500 > /sys/class/backlight/intel_backlight/brightness

还是不行。接下来我改了一下内核参数——修改`/etc/default/grub`中的`GRUB_CMDLINE_LINUX`，加入

    acpi_osi=Linux acpi_backlight=vendor

运行`sudo update-grub`命令。重启之后能通过“系统设置”调亮度了。

# 按键

可以调亮度了，但是<kbd>Fn+Up</kbd>和<kbd>Fn+Down</kbd>不对，按完之后屏幕亮度没改，而且还敲出了一个“±”。我猜大概是热键映射有问题，于是运行了`xev`命令，按一下按键，观察终端输出结果：

```text
KeyPress event, serial 36, synthetic NO, window 0x4400001,
    root 0xc0, subw 0x0, time 1819651, (328,228), root:(1136,430),
    state 0x0, keycode 126 (keysym 0xb1, plusminus), same_screen YES,
    XLookupString gives 2 bytes: (c2 b1) "±"
    XmbLookupString gives 2 bytes: (c2 b1) "±"
    XFilterEvent returns: False

KeyRelease event, serial 36, synthetic NO, window 0x4400001,
    root 0xc0, subw 0x0, time 1819657, (328,228), root:(1136,430),
    state 0x0, keycode 126 (keysym 0xb1, plusminus), same_screen YES,
    XLookupString gives 2 bytes: (c2 b1) "±"
    XFilterEvent returns: False

KeyPress event, serial 36, synthetic NO, window 0x4400001,
    root 0xc0, subw 0x0, time 1826429, (328,228), root:(1136,430),
    state 0x0, keycode 120 (keysym 0x0, NoSymbol), same_screen YES,
    XLookupString gives 0 bytes:
    XmbLookupString gives 0 bytes:
    XFilterEvent returns: False

KeyRelease event, serial 36, synthetic NO, window 0x4400001,
    root 0xc0, subw 0x0, time 1826435, (328,228), root:(1136,430),
    state 0x0, keycode 120 (keysym 0x0, NoSymbol), same_screen YES,
    XLookupString gives 0 bytes:
    XFilterEvent returns: False
```

很明显错了。再敲两条命令

```bash
sudo xmodmap -e "keycode 126 = XF86MonBrightnessUp"
sudo xmodmap -e "keycode 120 = XF86MonBrightnessDown"
```

好了。把这两条命令做成启动脚本，问题搞定。（但是放到`/etc/rc.local`的话不行）

# 后续（2017年）

现在我用的是 Archlinux，还是那台电脑，但遇到的问题和三年前不同：“系统设置”无效，通过 sysfs 或 xbacklight 修改有效。我按照[Archlinux Wiki 相关文章](https://wiki.archlinux.org/index.php/Backlight#sysfs_modified_but_no_brightness_change)最低下那条方法进行修改，弄了一个 xbacklightmon，然后把它设置成 systemd 服务，于是就好了。

启动脚本这样做：先按 Archlinux Wiki 把 xbacklightmon 做好，建立`/usr/lib/systemd/user/xbacklightmon.service`：

```ini
[Unit]
Description=xbacklightmon

[Service]
ExecStart=/usr/local/bin/xbacklightmon

[Install]
WantedBy=default.target
```

接下来输入

```bash
systemctl enable xbacklightmon --user
systemctl start xbacklightmon --user
```

OK。
