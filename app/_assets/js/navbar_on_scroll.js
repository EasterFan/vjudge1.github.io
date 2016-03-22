var NavbarOnScroll = function (navbar, options) {
    'use strict';

    if (typeof options === 'undefined') {
        options = {};
    }

    var $window = $(window),
        $navbar = $(navbar),
        $span = $navbar.parent(),
        fadeSpeed = options.fadeSpeed ? options.fadeSpeed : 300,
        scrollSpeed = options.scrollSpeed ? options.scrollSpeed : 100,
        minTop = options.minTop ? options.minTop : 100,
        fixedStyle = options.fixedStyle ? options.fixedStyle : 'navbar-fixed-top',
        anim = false,
        lastTop = $window.scrollTop(),
        span = parseInt($navbar.css('height')) + parseInt($navbar.css('margin-bottom'));

    var checkScroll = function () {
        var currentTop = $window.scrollTop();
        if (currentTop < minTop) {
            anim = false;
        } else {
            var delta = currentTop - lastTop;
            if (delta < -scrollSpeed && !$navbar.hasClass(fixedStyle)) {
                $span.css('height', span);
                $navbar
                    .hide()
                    .addClass(fixedStyle)
                    .fadeIn(fadeSpeed, function () {
                        anim = false;
                    });
            } else if (delta > scrollSpeed && $navbar.hasClass(fixedStyle)) {
                $navbar.fadeOut(fadeSpeed, function () {
                    $span.css('height', '');
                    $navbar.removeClass(fixedStyle).show();
                    anim = false;
                });
            } else {
                anim = false;
            }
        }
    };

    $window.on('scroll', function () {
        var top = $window.scrollTop();

        if (top < minTop) {
            $span.css('height', '');
            $navbar.removeClass(fixedStyle).show();
        } else if (!anim) {
            anim = true;
            lastTop = top;
            setTimeout(checkScroll, 300);
        }
    });
};
