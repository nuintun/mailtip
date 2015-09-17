Mailtip
=======

>A jquery email autocomplete plugin

###Required
>jQuery >= 1.7

###Introduction
```js
$(function (){
  var info = $('.info');
  
  $('#mailtip').mailtip({
    onselected: function (mail){
      info.text('you choose email: ' + mail)
    }
  });
});
```

### API
###### options
- *mails*
> The mail list

- *width*
> The pupup tip's width, if set ```input``` the tip's width will equal input width else the width will equal set or auto

- *onselected*
> The callbacl on selected a mail

- *offsetTop*
> The offset top relative default position

- *offsetLeft*
> The offset left relative default position

- *zIndex*
> z-index of tip


###Live Demo
[Click here see the live demo](http://nuintun.github.io/mailtip/mailtip.html)
