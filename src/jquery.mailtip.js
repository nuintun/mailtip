/**
 * Mail autocomplete
 * Author: nuintun
 * $(selector).mailtip({
 *   mails: [], // mails
 *   onselected： function(mail){}, // callback on selected
 *   width: 'auto', // popup tip's width
 *   offsetTop: -1, // offset top relative default position
 *   offsetLeft: 0, // offset left relative default position
 *   zIndex: 10 // popup tip's z-index
 * });
 */

'use strict';

(function ($){
  // invalid email char test regexp
  var INVALIDEMAILRE = /[^\u4e00-\u9fa5_a-zA-Z0-9]/;
  // is support oninput event
  var hasInputEvent = 'oninput' in document.createElement('input');
  // is ie 9
  var ISIE9 = /MSIE 9.0/i.test(window.navigator.appVersion || window.navigator.userAgent);

  /**
   * is a number
   * @param value
   * @returns {boolean}
   */
  function isNumber(value){
    return typeof value === 'number' && isFinite(value);
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

      tip = $('<ul class="ui-mailtip" style="display: none; float: none; '
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
   * create mail list item
   * @param value
   * @param mails
   * @returns {*}
   */
  function createItems(value, mails){
    var mail;
    var domain;
    var items = '';
    var atIndex = value.indexOf('@');
    var hasAt = atIndex !== -1;

    if (hasAt) {
      domain = value.substring(atIndex + 1);
      value = value.substring(0, atIndex);
    }

    for (var i = 0, len = mails.length; i < len; i++) {
      mail = mails[i];

      if (hasAt && mail.indexOf(domain) !== 0) continue;

      items += '<li title="' + value + '@' + mail + '"><p>' + value + '@' + mail + '</p></li>';
    }

    // active first item
    return items.replace('<li', '<li class="active"');
  }

  /**
   * change list active state
   * @param tip
   * @param up
   */
  function changeActive(tip, up){
    var itemActive = tip.find('li.active');

    if (up) {
      var itemPrev = itemActive.prev();

      itemPrev = itemPrev.length ? itemPrev : tip.find('li:last');
      itemActive.removeClass('active');
      itemPrev.addClass('active');
    } else {
      var itemNext = itemActive.next();

      itemNext = itemNext.length ? itemNext : tip.find('li:first');
      itemActive.removeClass('active');
      itemNext.addClass('active');
    }
  }

  /**
   * toggle tip
   * @param tip
   * @param value
   * @param mails
   */
  function toggleTip(tip, value, mails){
    var atIndex = value.indexOf('@');

    // if input text is empty or has invalid char or begin with @ or more than two @, hide tip
    if (!value
      || atIndex === 0
      || atIndex !== value.lastIndexOf('@')
      || INVALIDEMAILRE.test(atIndex === -1 ? value : value.substring(0, atIndex))) {
      tip.hide();
    } else {
      var items = createItems(value, mails);

      // if has match mails show tip
      if (items) {
        tip.html(items).show();
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

      // binding key down event
      input.on('keydown', function (e){
        // if tip is visible do nothing
        if (tip.css('display') === 'none') return;

        switch (e.keyCode) {
          // backspace
          case 8:
            // shit! ie9 input event has a bug, backspace do not trigger input event
            if (ISIE9) {
              input.trigger('input');
            }
            break;
          // tab
          case 9:
            tip.hide();
            break;
          // up
          case 38:
            e.preventDefault();
            changeActive(tip, true);
            break;
          // down
          case 40:
            e.preventDefault();
            changeActive(tip);
            break;
          // enter
          case 13:
            e.preventDefault();

            var mail = tip.find('li.active').attr('title');

            input.val(mail).focus();
            tip.hide();
            config.onselected.call(this, mail);
            break;
          default:
            break;
        }
      });

      // binding input or propertychange event
      if (hasInputEvent) {
        input.on('input', function (){
          toggleTip(tip, this.value, config.mails);
        });
      } else {
        input.on('propertychange', function (e){
          if (e.originalEvent.propertyName === 'value') {
            toggleTip(tip, this.value, config.mails);
          }
        });
      }

      // shit! ie9 input event has a bug, backspace do not trigger input event
      if (ISIE9) {
        input.on('keyup', function (e){
          if (e.keyCode === 8) {
            toggleTip(tip, this.value, config.mails);
          }
        });
      }
    });
  };
}(jQuery));
