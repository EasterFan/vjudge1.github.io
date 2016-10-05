/**
 * 通过feed.xml实现搜索功能
 * Thanks for liberize (https://github.com/liberize/liberize.github.com)
 */

var htmlEscape = function(str) {
	return String(str).replace(/[&<>"'\/]/g, function(ch) {
		return ({
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': '&quot;',
			"'": '&#39;',
			"/": '&#x2F;'
		})[ch];
	});
};

var doSearch = function(keyword, callback, errorCallback) {
	'use strict';

	var findEntries = function(entries, keyword) {
		var matches = [];
		var rq = new RegExp(keyword, 'im');
		for (var i = 0; i < entries.length; i++) {
			var entry = entries[i].querySelectorAll('title,link,published,content');
			var node  = {
				title:   entry[0].innerHTML,
				link:    entry[1].attributes[0].nodeValue,
				date:    new Date(entry[2].innerHTML),
				content: entry[3].innerHTML
			};
			if (rq.test(node.title) || rq.test(node.content)) {
				matches.push(node);
			}
		}
		return matches;
	};

	$.ajax({
		url: '/feed.xml?r=' + (Math.random() * 99999999999),
		dataType: 'xml',
		error: function(jqxhr, status) {
			if (typeof errorCallback === 'function') {
				errorCallback(status);
			}
		},
		success: function(data) {
			var entries = data.getElementsByTagName('entry');
			callback(findEntries(entries, keyword));
		}
	});
};

$(function () {
	'use strict';

	var keyword = $.request.queryString.s;

	$('#keyword').val(keyword);
	$('#keywordlabel').text(keyword);

	doSearch(keyword, function (matches) {
		var $dummy = $('.dummy');
		var $searchlist = $('#searchlist');
		for (var i = 0; i < matches.length; i++) {
			var $row = $dummy.clone();
			var match = matches[i];
			$('[data-field=date]', $row).text(match.date.toLocaleDateString());
			$('[data-field=title]', $row).append('<a href="' + match.link + '">' + htmlEscape(match.title) + '</a>');
			$row.removeClass('dummy');
			$searchlist.append($row);
		}
		$searchlist.slideDown();
	});
});
