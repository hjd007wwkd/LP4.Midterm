function addOrRemoveClass(condition) {
  if(condition === "fail"){
    $(".alert").removeClass("success");
    $(".alert").addClass("fail");
  } else {
    $(".alert").removeClass("fail");
    $(".alert").addClass("success");
  }
};

function alert(message) {
  if(message.code === 'fail') {
    $(".alert").text(message.text);
    addOrRemoveClass("fail");
  } else {
    $(".alert").text(message.text);
    addOrRemoveClass("success");
  }
};

$(document).ready(function () {
  $('.background_login').removeClass('hidden');

  $('.message a').click(function(){
   $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
   $('input').val('');
  });

  $( ".login_form" ).submit(function(event) {
    event.preventDefault();

    const data = $(this).serialize();

    $.post("/login", data)
    .done(function(data){
      if(data.code === 'success'){
        window.location = "/";
      } else {
        alert(data)
        $('input').val('');
      }
    })
    .fail(function(error) {
      console.log(error);
    });
  })

  $( ".register_form" ).submit(function(event) {
    event.preventDefault();

    const data = $(this).serialize();
    $.post("/register", data)
    .done(function(data){
      if(data.code === 'success'){
        window.location = "/";
      } else {
        alert(data)
        $('input').val('');
      }
    })
    .fail(function(error) {
      console.log(error);
    });
  })
});