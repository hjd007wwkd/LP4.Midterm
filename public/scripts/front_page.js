$(document).ready(function () {
    $(".no").on("click", function () {
        $('.message').removeClass("hided");
    })

    $(".yes").on("click", function () {
        $('.front_page').addClass("hided");
        setTimeout(function () {
            window.location.pathname = '/login';
        }, 500)
    })
})