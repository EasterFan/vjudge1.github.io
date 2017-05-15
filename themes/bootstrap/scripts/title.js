hexo.extend.helper.register('generateTitle', page => {
    let title = page.title;

    if (page.archive) {
        title = 'Archives';

        if (page.month){
            title += ': ' + page.year + '/' + page.month;
        } else if (page.year){
            title += ': ' + page.year;
        }
    } else if (page.category) {
        title = 'Category: ' + page.category;
    } else if (page.tag) {
        title = 'Tag: ' + page.tag;
    }

    return title || hexo.config.title;
});
