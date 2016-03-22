$(function () {
    'use strict';

    BackToTop('#top');
    NavbarOnScroll('#navbar');

    // 初始化 tip
    $('[data-toggle="tooltip"]').tooltip();

    // 处理页面链接
    $('a[href^="http"]').each(function() {
        $(this).attr('target', '_blank');
    });
});
