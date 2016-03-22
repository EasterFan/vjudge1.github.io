/**
 * “回到顶端”按钮的显示/隐藏与动作。
 * @param {String} button  “回到顶端”按钮的选择器
 * @param {Object} options 包括fadeSpeed、scrollSpeed和minTop
 */
var BackToTop = function(button, options) {
    'use strict';

    if (typeof options === 'undefined') {
        options = {};
    }

    var $window = $(window),
        $button = $(button),
        fadeSpeed = options.fadeSpeed ? options.fadeSpeed : 500,
        scrollSpeed = options.scrollSpeed ? options.scrollSpeed : 500,
        minTop = options.minTop ? options.minTop : 100;

    $window.on('scroll', function () {
        if ($window.scrollTop() > minTop) {
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
};
