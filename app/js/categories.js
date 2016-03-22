/**
 * 分类展示：点击右侧的分类展示时，左侧的文章标题展开或者收起。
 */
$(function () {
    'use strict';

    $('.item').click(function() {
        var cate = $(this).data('cate');
        $('.post-list[data-list-cate!=' + cate + ']').hide(250);
        $('.post-list[data-list-cate=' + cate + ']').show(400);
        $('#categorization').text(cate);
    });
    var s = $.request.queryString.c;
    if (s) {
        $('.item[data-cate=' + s + ']').click();
    }
});
