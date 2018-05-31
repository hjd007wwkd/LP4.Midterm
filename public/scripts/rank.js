$(document).ready(function() {
  let toggle = 0;
  $('.rank').on('click', function(){
    if(!toggle){
      $.get("/score")
      .done(function(data){
        data.forEach(function(item, index){
          const username = item.username;
          const totalScore = item.total_score;
          const wins = item.wins;
          const losses = item.losses;
          const draws = item.draws;
          $('.rank_page').append($('<p>').text(`${index+1} ${username} ${wins} ${losses} ${draws} ${totalScore}`));
          $('.overlay').slideDown();
        })
      })
      .fail(function(error) {
        console.log(error);
      })
      toggle = 1;
    } else {
      $('.overlay').slideUp(function(){
        $('.rank_page').empty();
      });
      toggle = 0;
    }
  })
})