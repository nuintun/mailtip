/**
 * 邮件输入自动提示插件
 * author Newton
 * $(selector).mailtip({
 *    mails: [], 需要提示的邮箱列表
 *    afterselect： function(mail){}, 选择后的回调，this指向文本元素，并传入当前选择的邮箱
 *    width: null, 提示框的宽度，如果传值则为所传入的值，否则为自动和文本框等宽
 *    offsettop: 0, 相对于默认向上偏移量
 *    offsetleft: 0, 相对于默认向上偏移量
 *    zindex: 1000 z-index值
 * });
 * css style
 * ul.mailtip{float: none;background-color: #fcfeff;list-style: none;border:1px solid #97bccc;border-radius: 0px 0px 10px 10px;overflow: hidden; border-top: none;}
 * ul.mailtip li p{text-align: left;line-height: 30px;cursor: pointer; margin: 0 9px; overflow: hidden; word-wrap: break-word; height: 30px;}
 * ul.mailtip li:last-child{border-radius: 0px 0px 10px 10px;}
 * ul.mailtip li.active{background: #eaeaea;}
 * ul.mailtip li.hover{background: #e7f6ff;}
 */
(function ($){
    //探测oninput事件支持
    var hasInputEvent = 'oninput' in document.createElement('input');
    //字符串转正则函数
    function parseRegExp(pattern, attributes){
        var imp = /[\^\.\\\|\(\)\*\+\-\$\[\]\?]/igm;
        pattern = pattern.replace(imp, function (match){
            return '\\' + match;
        });
        return new RegExp(pattern, attributes);
    }

    //创建提示条
    var createTip = function (input, config){
        var tip = null;
        //只在第一次按键时生成列表
        if (!input.data('data-mailtip')) {
            var wrap = input.parent();
            //如果外层控件没有设置定位，就去给外层设置相对定位。
            !/absolute|relative/i.test(wrap.css('position')) && wrap.css('position', 'relative');
            //关闭自动完成
            input.attr('autocomplete', 'off');

            var offset = input.offset();
            var wrapOffset = wrap.offset();

            tip = $('<ul class="mailtip" style="display: none; float: none; position:absolute; margin: 0; padding: 0; z-index: ' + config.zindex + '"></ul>');

            //放入DOM树
            input.after(tip);

            tip.css({
                top: offset.top - wrapOffset.top + input.outerHeight() + config.offsettop,
                left: offset.left - wrapOffset.left + config.offsetleft,
                width: config.width || input.outerWidth() - tip.outerWidth() + tip.width()
            });

            //绑定鼠标事件
            tip.delegate('li', 'mouseenter mouseleave click', function (e){
                switch (e.type) {
                    case 'mouseenter':
                        $(this).addClass('hover');
                        break;
                    case 'click':
                        var mail = $(this).attr('title');
                        input.val(mail).focus();
                        config.afterselect.call(input[0], mail);
                        break;
                    case 'mouseleave':
                        $(this).removeClass('hover');
                        break;
                    default:
                        break;
                }
            });

            //点击其它地方关闭提示框
            $(document).bind('click', function (e){
                if (e.target === input[0]) return;
                tip.hide();
            });

            input.data('data-mailtip', tip);
        }

        return tip || input.data('data-mailtip');
    };

    //创建提示列表项
    var createLists = function (value, mails){
        var lists = '';
        var hasAt = /@/.test(value);
        if (hasAt) {
            var arr = value.split('@');
            if (arr.length > 2) return lists;
            value = arr[0];
            var regx = parseRegExp('@' + arr[1], 'i');
        }

        value = hasAt ? value.split('@')[0] : value;

        for (var i = 0, len = mails.length; i < len; i++) {
            if (hasAt && !regx.test(mails[i])) continue;
            lists += '<li title="' + value + mails[i] + '" style="margin: 0; padding: 0; float: none;"><p>' + value + mails[i] + '</p></li>';
        }

        return lists.replace(/^<li([^>]*)>/, '<li$1 class="active">');
    };

    //改变列表激活状态
    var changeActive = function (panle, up){
        //如果提示框隐藏跳出执行
        if (panle.css('display') === 'none') return;
        var liActive = panle.find('li.active');
        if (up) {
            var liPrev = liActive.prev();
            liPrev = liPrev.length ? liPrev : panle.find('li:last');
            liActive.removeClass('active');
            liPrev.addClass('active');
        } else {
            var liNext = liActive.next();
            liNext = liNext.length ? liNext : panle.find('li:first');
            liActive.removeClass('active');
            liNext.addClass('active');
        }
    };

    //展示隐藏提示
    var toggleTip = function (val, tip, mails){
        //如果输入为空，带空格，中文字符，英文逗号，@开头，或者两个以上@直接隐藏提示
        if (!val || /[,]|[\u4e00-\u9fa5]|\s|^@/.test(val) | val.split('@').length > 2) {
            tip.hide();
        } else {
            var lists = createLists(val, mails);
            //如果返回的有列表项展开提示，否则隐藏。
            if (lists) {
                tip.html(lists).show();
            } else {
                tip.hide();
            }
        }
    };

    //调用接口
    $.fn.mailtip = function (config){
        var defaults = {
            mails: ['@qq.com', '@163.com', '@sina.com', '@gmail.com', '@126.com', '@139.com', '@189.com', '@sohu.com', '@msn.com', '@hotmail.com', '@yahoo.com', '@yahoo.com.cn'],
            afterselect: $.noop,
            width: null,
            offsettop: 0,
            offsetleft: 0,
            zindex: 1000
        };

        config = $.extend({}, defaults, config);
        config.afterselect = typeof config.afterselect === 'function' ? config.afterselect : defaults.afterselect;
        config.width = typeof config.width === 'number' ? config.width : defaults.width;
        config.offsettop = typeof config.offsettop === 'number' ? config.offsettop : defaults.offsettop;
        config.offsetleft = typeof config.offsetleft === 'number' ? config.offsetleft : defaults.offsetleft;
        config.zindex = typeof config.zindex === 'number' ? config.zindex : defaults.zindex;

        return this.each(function (){
            //缓存当前输入框对象
            var input = $(this);
            //初始提示框
            var tip = createTip(input, config);

            //绑定事件
            input.bind('keydown input propertychange', function (e){
                if (e.type === 'keydown') {
                    //根据按键执行不同操作
                    switch (e.keyCode) {
                        //退格键
                        case 8:
                            //妹哦！IE9以上input事件有BUG,退格键不会触发input事件，所以就有了这个hack！
                            if ($.browser.msie && $.browser.version >= 9) input.trigger('input');
                            break;
                        case 9:
                            tip.hide();
                            break;
                        //向上键
                        case 38:
                            changeActive(tip, true);
                            break;
                        //向下键
                        case 40:
                            changeActive(tip);
                            break;
                        //回车键
                        case 13:
                            //如果提示框隐藏跳出执行
                            if (tip.css('display') === 'none') return;
                            e.preventDefault();
                            var mail = tip.find('li.active').attr('title');
                            input.val(mail).focus();
                            tip.hide();
                            config.afterselect.call(input[0], mail);
                            break;
                        default:
                            break;
                    }
                } else {
                    if (hasInputEvent) {
                        toggleTip(input.val(), tip, config.mails);
                    } else if (e.originalEvent.propertyName === 'value') {
                        toggleTip(input.val(), tip, config.mails);
                    }
                }
            });
        });
    };
}(jQuery));
