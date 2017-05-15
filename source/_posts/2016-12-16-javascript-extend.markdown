---
title: "JavaScript继承小结"
categories: 备忘录
tags: JavaScript
---
从《JavaScript面向对象编程指南》摘的一些内容，留着收藏。相关概念“原型”和“构造器”的介绍请转到[阮一峰博客的相关文章](http://www.ruanyifeng.com/blog/2011/06/designing_ideas_of_inheritance_mechanism_in_javascript.html)。

<!--more-->

# 防止翻车
如果直接替换了构造函数的prototype，那么记得顺便修正原型的constructor属性。

# ES5

## 基于构造器

### 原型链
```js
function A() {}
A.prototype.name = 'A';
A.prototype.info = 1;

function B() {}
B.prototype = new A();
B.prototype.constructor = B;

B.prototype.name = 'B';
B.prototype.data = 2;
```

### 只继承于原型

进行一下改进：不要单独为继承关系创建新对象。

```js
function A() {}
A.prototype.name = 'A';
A.prototype.info = 1;

function B() {}
B.prototype = A.prototype;
B.prototype.constructor = B;

B.prototype.name = 'B';
B.prototype.data = 2;
```

不过，由于子对象与父对象指向了同一对象，所以一旦子对象对原型进行了修改，父对象也会跟着被修改：

```js
a = new A();
console.log(a.name);    // 输出“B”
console.log(a.data);    // 输出“2”
```

### 临时构造器

使用一个临时的构造函数来防止父子的“连锁”关系，这样既可以扩充子对象，又不会影响父对象。

```js
var extend = function (Child, Parent) {
    var F = function() {};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.uber = Parent.prototype;
};

function A() {}
A.prototype.name = 'A';
A.prototype.info = 1;

function B() {}
extend(B, A);
B.prototype.name = 'B';
B.prototype.data = 2;
```

### 属性拷贝
使用以上几种方法时，name处于父对象，而本方法会把父对象的属性拷贝给子对象（**注意：浅拷贝**）。

```js
var extend2 = function(Child, Parent) {
    var p = Parent.prototype;
    var q = Child.prototype;
    for (var i in p) {
        q[i] = p[i];
    }
    q.uber = p;
};

function A() {}
A.prototype.name = 'A';
A.prototype.info = 1;

function B() {}
extend2(B, A);
B.prototype.name = 'B';
B.prototype.data = 2;
```

本法用属性拷贝代替原型链查询，效率可能会稍逊一些，但减少了原型链上面的查找。

### 借用构造器

```js
function A() {
    this.info = 1;
}
A.prototype.name = 'A';

function B() {
    A.apply(this, arguments);
}
B.prototype.name = 'B';
```

上面代码只继承父对象本身的属性。如果想继承原型，可以：

```js
B.prototype = new A();
```

但这样父对象构造器会被调用两次。因此可以将借用构造器与原型复制结合：

```js
function B() {
    A.apply(this, arguments);
}
extend2(B, A);
B.prototype.name = 'B';
```

## 基于对象
另一种常见的实现是不使用原型、构造器和new关键字。

### 属性拷贝
```js
var extendCopy = function (p) {
    var c = {};
    for (var i in p) {
        c[i] = p[i];
    }
    c.uber = p;
    return c;
};

var a = {
    name: 'A',
    info: 1
};

var b = extendCopy(a);
b.name = 'B';
b.data = 2;
```

以上仍为**浅拷贝**。下面是深拷贝版本的extendCopy：

```js
var extendCopy = function(p, c) {
    c = c || {};
    for (var i in p) {
        if (p.hasOwnProperty(i)) {
            if (typeof p[i] === 'object') {
                c[i] = Array.isArray(p[i]) ? [] : {};
                extendCopy(p[i], c[i]);
            } else {
                c[i] = p[i];
            }
        }
    }
    return c;
};
```

继续修改，也可以做到支持多重继承。

### object()

```js
function object(o) {
    var F = function() {};
    F.prototype = o;
    var n = new F();
    n.uber = o;
    return n;
}

var a = {
    name: 'A',
    info: 1
};

var b = object(a);
b.name = 'B';
b.data = 2;
```

可以将其与“属性拷贝”结合使用：

```js
function object(o, stuff) {
    var F = function() {};
    F.prototype = o;
    var n = new F();
    n.uber = o;

    for (var i in stuff) {
        n[i] = stuff[i];
    }
    return n;
}
```

这样可以一次性地完成对象的扩展。

### 寄生式继承

```js
var b = function(data) {
    var that = object(a);
    that.name = 'B';
    that.data = data;
    return that;
};

var t = b(2);
// 下面的代码也不会出错
var t2 = new b(2);
```

# ES6（未完待续）

# CoffeeScript的实践（未完待续）
