/**
 * Bootstrap callout style
 *
 * Syntax:
 *   {% callout [type] %}
 *   Callout content
 *   {% endcallout %}
 */

hexo.extend.tag.register('callout', (args, content) => {
    let calloutType = args.length ? args[0] : 'default';
    return `<div class="bs-callout bs-callout-${calloutType}">
                ${hexo.render.renderSync({text: content, engine: 'markdown'})}
            </div>`;
}, true);
