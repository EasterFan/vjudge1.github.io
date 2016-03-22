$(function () {
    'use strict';

    // 处理文章的外部链接
    $('a[href^="http"]', '#article').each(function() {
        var h = $(this).html();
        $(this).html(h + '<i class="fa fa-external-link external-link"></i>');
    });

    // 处理文章表格
    $('table', '#article').addClass('table table-striped table-bordered');

    // Anchor.js
    if (anchors) {
        anchors.options.placement="left";
        anchors.add('article h1,h2,h3,h4');
    }

    // 处理目录
    function generateContent() {
        //$('#markdown-toc').addClass('hidden-md').addClass('hidden-lg');
        var $toc = $('#markdown-toc');
        if (typeof $toc.html() === 'undefined') {
            $('#content').hide();
        } else {
            var html = $toc.html();
            $('#content-ul').html(html);
            $('body').scrollspy({
                target: '#content'
            });
            $('#content-ul').affix({
                offset: {
                    top: 250,
                    bottom: function() {
                        return (this.bottom = $('footer').outerHeight(true) + $('#disqus_thread').outerHeight(true) + 150);
                    }
                }
            });
            $('#contents-sidebar').show();
            $('#contents-sidebar-ul').html(html);
        }
        $('a', '#sb-content').each(function() {
            var $element = $(this);
            var href = $element.attr('href');
            $element.attr('data-target', href).attr('href', 'javascript:;').click(function() {
                $('#sidebar-mobile').sidebar('hide').one('hidden.sb.sidebar', function() {
                    location.href = href;
                });
            });
        });
    }

    generateContent();

    if (document.getElementById('sidebar')) {
        $('#nav-sidebar-content').html($('#sidebar').html());
    }
});
