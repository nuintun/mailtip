Mailtip
=======

A jquery email autocomplete plugin

###Introduction
```js
$(function (){
    var info = $('.info');
    $('#mailtip').mailtip({
        afterselect: function (mail){
            info.text('您选择了邮箱：' + mail)
        }
    });
});
```
