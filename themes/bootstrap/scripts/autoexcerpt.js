/**
 * Generate excerpts automatically
 *
 * Returns:
 * {
 *     isExcerpt: true/false,
 *     content: ...
 * }
 */
'use strict';

const placeholder = '\uFFFC';
const rPlaceholder = /(?:<|&lt;)\!--\uFFFC(\d+)--(?:>|&gt;)/g;
const rEscapeContent = /<escape(?:[^>]*)>([\s\S]*?)<\/escape>/g;

const renderSync = (source, markdown) => {
    let ctx = hexo.render.context;
    let config = ctx.config;
    let cache = [];
//    let tag = ctx.extend.tag;

    let data = { content: markdown };

    const escapeContent = (str) => `<!--${placeholder}${cache.push(str) - 1}-->`;

/*
    const tagFilter = content => {
        // Replace cache data with real contents
        content = content.replace(rPlaceholder, function() {
            return cache[arguments[1]];
        });

        // Render with Nunjucks
        data.content = content;
        return tag.renderSync(data.content, data);
    };
*/

    ctx.execFilterSync('before_post_render', data, {context: ctx});
    data.content = data.content.replace(rEscapeContent, (match, content) => escapeContent(content));

    // Escape all Swig tags
    /*
    data.content = data.content
      .replace(rSwigFullBlock, escapeContent)
      .replace(rSwigBlock, escapeContent)
      .replace(rSwigComment, '')
      .replace(rSwigVar, escapeContent);
    */

    let options = data.markdown || {};
    if (!config.highlight.enable) {
        options.highlight = null;
    }

    // Render with markdown or other renderer
    data.content = ctx.render.renderSync({
        text: data.content,
        path: source,
        engine: data.engine,
        toString: true,
        // onRenderEnd: tagFilter
    }, options);

    // Render with Nunjucks
    // data.content = tag.renderSync(data.content, data);

    // Run "after_post_render" filters
    ctx.execFilterSync('after_post_render', data, {context: ctx});

    return data.content;
};

hexo.extend.helper.register('generateExcerpt', page => {
    let raw = page.raw;
    let excerptDepth = hexo.theme.config.excerpt_depth || 0;

    let outputmd = raw;
    let isExcerpt = false;

    if (excerptDepth > 0) {
        let pos = raw.indexOf('\n'.repeat(excerptDepth));
        if (pos > -1) {
            outputmd = raw.substring(0, pos);
        }
    }

    return {
        isExcerpt: isExcerpt,
        content: renderSync(page.source, outputmd)
    };
});
