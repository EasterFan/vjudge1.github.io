'use strict';

function bsPaginatorHelper(options) {
    /* jshint validthis: true */
    options = options || {};

    let current = options.current || this.page.current || 0;
    let total = options.total || this.page.total || 1;
    let endSize = options.hasOwnProperty('end_size') ? +options.end_size : 1;
    let midSize = options.hasOwnProperty('mid_size') ? +options.mid_size : 2;
    let space = options.hasOwnProperty('space') ? options.space : '&hellip;';
    let base = options.base || this.page.base || this.config.root || '';
    let format = options.format || this.config.pagination_dir + '/%d/';
    let prevText = options.prev_text || 'Prev';
    let nextText = options.next_text || 'Next';
    let prevNext = options.hasOwnProperty('prev_next') ? options.prev_next : true;
    let transform = options.transform;
    let self = this;
    let result = '';

    if (!current) {
        return '';
    }

    let currentPage = `<li class="active"><span class="page-number">${
        transform ? transform(current) : current
        }</span></li>`;

    const link = i => self.url_for(i === 1 ? base : base + format.replace('%d', i));

    const pageLink = i => `<li><a class="page-number" href="${link(i)}">
        ${transform ? transform(i) : i}
        </a></li>`;

    // Display the link to the previous page
    if (prevNext) {
        if (current > 1) {
            result += `<li><a class="page-prev" rel="prev"
                href="${link(current - 1)}">${prevText}</a></li>`;
        } else {
            result += `<li class="disabled"><span class="page-prev">${prevText}</span></li>`;
        }
    }

    if (options.show_all) {
        // Display pages on the left side of the current page
        for (let i = 1; i < current; i++) {
            result += pageLink(i);
        }

        // Display the current page
        result += currentPage;

        // Display pages on the right side of the current page
        for (let i = current + 1; i <= total; i++) {
            result += pageLink(i);
        }
    } else {
        // It's too complicated. May need refactor.
        let leftEnd = current <= endSize ? current - 1 : endSize;
        let rightEnd = total - current <= endSize ? current + 1 : total - endSize + 1;
        let leftMid = current - midSize <= endSize ? current - midSize + endSize : current - midSize;
        let rightMid = current + midSize + endSize > total ? current + midSize - endSize : current + midSize;
        let spaceHtml = `<li class="disabled"><span class="page-space">${space}</span></li>`;

        // Display pages on the left edge
        for (let i = 1; i <= leftEnd; i++) {
            result += pageLink(i);
        }

        // Display spaces between edges and middle pages
        if (space && current - endSize - midSize > 1) {
            result += spaceHtml;
        }

        // Display left middle pages
        if (leftMid > leftEnd) {
            for (let i = leftMid; i < current; i++) {
                result += pageLink(i);
            }
        }

        // Display the current page
        result += currentPage;

        // Display right middle pages
        if (rightMid < rightEnd) {
            for (let i = current + 1; i <= rightMid; i++) {
                result += pageLink(i);
            }
        }

        // Display spaces between edges and middle pages
        if (space && total - endSize - midSize > current) {
            result += spaceHtml;
        }

        // Dispaly pages on the right edge
        for (let i = rightEnd; i <= total; i++) {
            result += pageLink(i);
        }
    }

    // Display the link to the next page
    if (prevNext) {
        if (current < total) {
            result += `<li><a class="page-next" rel="next"
                href="${link(current + 1)}">${nextText}</a></li>`;
        } else {
            result += '<li class="disabled"><span class="page-next">' + nextText + '</span></li>';
        }
    }

    return `<nav><ul class="pagination">${result}</ul></nav>`;
}

hexo.extend.helper.register('bs_paginator', bsPaginatorHelper);
