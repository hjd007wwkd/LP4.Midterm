$(document).ready(function () {
    function change() {
      $('section').css('background-color', "black")
    }

    function header() {
      $('h2').css('color', 'white');
    }

    setTimeout(() => {
      change();
      header();
    }, 200);
  })