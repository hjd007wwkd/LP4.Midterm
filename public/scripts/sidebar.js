$(document).ready(function() {
  $("body").on('click', '.chat_button', function (){
    $(".chat_side_bar").animate({width: 'toggle'});
  });

  $("body").on('click', '.prof_button', function (){
    $('.prof_side_bar').animate({direction: 'right', width: 'toggle'});
  });
});