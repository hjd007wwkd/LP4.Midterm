$(document).ready(function () {
    $(".no").on("click", function () {
        $('#message').removeClass("hidden");
    })

    $(".yes").on("click", function () {
        $('#front_page').addClass("hidden");
        setTimeout(function () {
            window.location.pathname = '/login';
        }, 500)
    })
})