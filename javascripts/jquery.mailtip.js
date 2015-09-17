/**
 * Mail autocomplete
 * Author: nuintun
 * $(selector).mailtip({
 *   mails: [], // email domain list
 *   onselected： function(mail){}, // callback on selected
 *   width: 'auto', // popup tip's width
 *   offsetTop: -1, // offset top relative default position
 *   offsetLeft: 0, // offset left relative default position
 *   zIndex: 10 // popup tip's z-index
 * });
 */

'use strict';

(function ($){
  // is ie 9
  var ISIE9 = /MSIE 9.0/i.test(window.navigator.userAgent);
  // is support oninput event
  var hasInputEvent = 'oninput' in document.createElement('input');

  /**
   * is a number
   * @param val
   * @returns {boolean}
   */
  function isNumber(val){
    return typeof val === 'number' && isFinite(val);
  }

  /**
   * parse string to regexp
   * @param pattern
   * @param attributes
   * @returns {RegExp}
   */
  function parseRegExp(pattern, attributes){
    var imp = /[\^\.\\\|\(\)\*\+\-\$\[\]\?]/igm;

    pattern = pattern.replace(imp, function (match){
      return '\\' + match;
    });

    return new RegExp(pattern, attributes);
  }

  /**
   * create popup tip
   * @param input
   * @param config
   * @returns {*}
   */
  function createTip(input, config){
    var tip = null;

    // only create tip and binding event once
    if (!input.data('data-mailtip')) {
      var wrap = input.parent();

      // set parent node position
      !/absolute|relative/i.test(wrap.css('position')) && wrap.css('position', 'relative');
      // off input autocomplete
      input.attr('autocomplete', 'off');

      var offset = input.offset();
      var wrapOffset = wrap.offset();

      tip = $('<ul class="mailtip" style="display: none; float: none; '
        + 'position:absolute; margin: 0; padding: 0; z-index: '
        + config.zIndex + '"></ul>');

      // insert tip after input
      input.after(tip);

      // set tip style
      tip.css({
        top: offset.top - wrapOffset.top + input.outerHeight() + config.offsetTop,
        left: offset.left - wrapOffset.left + config.offsetLeft,
        width: config.width === 'input' ? input.outerWidth() - tip.outerWidth() + tip.width() : config.width
      });

      // when width is auto, set min width equal input width
      if (config.width === 'auto') {
        tip.css('min-width', input.outerWidth() - tip.outerWidth() + tip.width());
      }

      // binding event
      tip.on('mouseenter mouseleave click', 'li', function (e){
        var selected = $(this);

        switch (e.type) {
          case 'mouseenter':
            selected.addClass('hover');
            break;
          case 'click':
            var mail = selected.attr('title');

            input.val(mail).focus();
            config.onselected.call(input[0], mail);
            break;
          case 'mouseleave':
            selected.removeClass('hover');
            break;
          default:
            break;
        }
      });

      // when on click if the target element not input, hide tip
      $(document).on('click', function (e){
        if (e.target === input[0]) return;

        tip.hide();
      });

      input.data('data-mailtip', tip);
    }

    return tip || input.data('data-mailtip');
  }

  /**
   * create mail list
   * @param value
   * @param mails
   * @returns {*}
   */
  function createLists(value, mails){
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
      lists += '<li title="' + value + mails[i]
        + '" style="margin: 0; padding: 0; float: none;"><p>'
        + value + '@' + mails[i] + '</p></li>';
    }

    return lists.replace(/^<li([^>]*)>/, '<li$1 class="active">');
  }

  /**
   * change list active state
   * @param panle
   * @param up
   */
  function changeActive(panle, up){
    // if tip is visible do nothing
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
  }

  /**
   * toggle tip
   * @param val
   * @param tip
   * @param mails
   */
  function toggleTip(val, tip, mails){
    // if input text is empty or has space char, chinese char, comma or begin with @ or more than two @, hide tip
    //如果输入为空，带空格，中文字符，英文逗号，@开头，或者两个以上@直接隐藏提示
    if (!val || /[,]|[\u4e00-\u9fa5]|\s|^@/.test(val) || val.split('@').length > 2) {
      tip.hide();
    } else {
      var lists = createLists(val, mails);

      // if has match mails show tip
      if (lists) {
        tip.html(lists).show();
      } else {
        tip.hide();
      }
    }
  }

  /**
   * exports
   * @param config
   * @returns {*}
   */
  $.fn.mailtip = function (config){
    var defaults = {
      mails: [
        'qq.com', '163.com', 'sina.com',
        'gmail.com', '126.com', '139.com',
        '189.com', 'sohu.com', 'msn.com',
        'hotmail.com', 'yahoo.com', 'yahoo.com.cn'
      ],
      onselected: $.noop,
      width: 'auto',
      offsetTop: -1,
      offsetLeft: 0,
      zIndex: 10
    };

    config = $.extend({}, defaults, config);
    config.zIndex = isNumber(config.zIndex) ? config.zIndex : defaults.zIndex;
    config.offsetTop = isNumber(config.offsetTop) ? config.offsetTop : defaults.offsetTop;
    config.offsetLeft = isNumber(config.offsetLeft) ? config.offsetLeft : defaults.offsetLeft;
    config.onselected = $.isFunction(config.onselected) ? config.onselected : defaults.onselected;
    config.width = config.width === 'input' || isNumber(config.width) ? config.width : defaults.width;

    return this.each(function (){
      // input
      var input = $(this);
      // tip
      var tip = createTip(input, config);

      // binding event
      input.on('keydown input propertychange', function (e){
        if (e.type === 'keydown') {
          switch (e.keyCode) {
            // backspace
            case 8:
              // shit! ie9 input event has a bug, backspace do not trigger input event
              ISIE9 && input.trigger('input');
              break;
            case 9:
              tip.hide();
              break;
            // up
            case 38:
              changeActive(tip, true);
              break;
            // down
            case 40:
              changeActive(tip);
              break;
            // enter
            case 13:
              if (tip.css('display') === 'none') return;

              e.preventDefault();

              var mail = tip.find('li.active').attr('title');

              tip.hide();
              input.val(mail).focus();
              config.onselected.call(input[0], mail);
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

      // shit! ie9 input event has a bug, backspace do not trigger input event
      ISIE9 && input.on('keyup', function (e){
        e.keyCode === 8 && toggleTip(input.val(), tip, config.mails);
      });
    });
  };
}(jQuery));
