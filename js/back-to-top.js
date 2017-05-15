/**
 * “回到顶端”按钮的显示/隐藏与动作。
 */

$(function () {
    'use strict';

    var $window = $(window),
        $button = $('#back-to-top'),
        $footer = $('.blog-footer'),
        fadeSpeed = 500,
        scrollSpeed = 500,
        minTop = 100;

    var buttonBottom = parseInt($button.css('bottom'));

    $window.on('scroll', function () {
        var top = $window.scrollTop();
        if (top > minTop) {
            // Hack for footer
            var docHeight = Math.max($(document).height(), $(window).height());
            if (top + $window.innerHeight() > docHeight - $footer.outerHeight()) {
                $button.css('bottom', (buttonBottom + ((top + $window.innerHeight()) - (docHeight - $footer.outerHeight()))) + 'px');
            } else {
                $button.css('bottom', buttonBottom + 'px');
            }

            $button.fadeIn(fadeSpeed);
        } else {
            $button.fadeOut(fadeSpeed);
        }
    });

    $button.click(function() {
        $('html,body').animate({
            scrollTop: '0'
        }, scrollSpeed);
    });
});
