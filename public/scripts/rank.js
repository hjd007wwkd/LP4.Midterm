$(document).ready(function() {
  let toggle = 0;

  //show rank of all users
  $('.rank').on('click', function(){

    //update current rank and total score of all users
    if(!toggle){
      $.get("/score")
      .done(function(data){
        const rank_column = $('<div>').addClass('rank_column');
        const number_column = $('<p>').addClass('number_column').text('Rank');
        const username_column = $('<p>').addClass('username_column').text('Username');
        const total_score_column = $('<p>').addClass('total_score_column').text('Total Score');
        rank_column.append(number_column).append(username_column).append(total_score_column);
        $('.rank_page').append(rank_column);
        data.forEach(function(item, index){
          const ind_rank = $('<div>').addClass('ind_rank');
          const ind_number = $('<p>').addClass('ind_number').text(index+1);
          const ind_username = $('<p>').addClass('ind_username').text(item.username);
          const ind_total_score = $('<p>').addClass('ind_total_score').text(item.total_score);

          ind_rank.append(ind_number).append(ind_username).append(ind_total_score);
          $('.rank_page').append(ind_rank);
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