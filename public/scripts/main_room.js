const CARD_FLIP_DELAY = 200; // 1500
const CARD_SHOW_DELAY = 200; // 1500


//rendering base html for game container
function start() {
  //waiting room for opponent coming in
  const waiting = $('<div>').addClass('waiting');
  const words = $('<p>').addClass('waitingLetter').text('Waiting For Opponent');
  const waitingAni = $('<div>').addClass('waiting_ani_container');
  const list = $('<ul>').append('<li>').append('<li>').append('<li>').append('<li>').append('<li>');
  waitingAni.append(list);
  waiting.append(words).append(waitingAni);

  //ready room for gamae with opponent
  const ready_room = $('<div>').addClass('ready_room hidden');
  const opponent_container = $('<div>').addClass('opponent_container');
  const opponent_ready = $('<div>').addClass('opponent_ready');
  const ready_container = $('<div>').addClass('ready_container');
  const ready = $('<div>').addClass('ready').text('Ready');
  ready_room.append(opponent_ready).append(ready);

  //main game screen
  const main = $('<div>').addClass('main hidden');
  const label = $('<div>').addClass('label_both')
  const label_myside = $('<p>').addClass('label_myside').text('Home');
  const label_opponent = $('<p>').addClass('label_opponent').text('Opponent');
  label.append(label_myside).append(label_opponent);

  const point = $('<div>').addClass('point');
  const my_point = $('<p>').addClass('my_point').text('0');
  const opponent_point = $('<p>').addClass('opponent_point').text('0');
  point.append(my_point).append(opponent_point);

  const opponent = $('<div>').addClass('opponent');
  const spade = $('<div>').addClass('spade');
  const choice = $('<div>').addClass('choice');
  const selected_card_choice = $('<div>').addClass('selected_card');
  const side_choice = $('<div>').addClass('side front');
  const side_back_choice = $('<div>').addClass('side back');
  selected_card_choice.append(side_choice).append(side_back_choice);

  const selected_card_opponent = $('<div>').addClass('selected_card');
  const side_opponent = $('<div>').addClass('side front');
  const side_back_opponent = $('<div>').addClass('side back');
  selected_card_opponent.append(side_opponent).append(side_back_opponent);

  choice.append(selected_card_choice);
  opponent.append(selected_card_opponent);

  const mine = $('<div>').addClass('mine');
  for(let i = 1; i <= 13; i++){
    const card = $('<div>').attr('data-card', i);
    const img = $(`<img src='/img/heart_${i}.png'>`);
    card.append(img);
    mine.append(card);
  }

  main.append(label).append(point).append(opponent).append(spade).append(choice).append(mine);

  //when game ends, appear win or lose
  const end = $('<div>').addClass('end hidden');
  const result = $('<div>').addClass('result');
  const restart = $('<div>').addClass('restart').text('Restart');;
  end.append(result).append(restart);

  //button for side bar when collapse
  const side_button = $('<div>').addClass('side_button');
  const chat_button = $('<p>').addClass('chat_button').text('Chat');
  const prof_button = $('<p>').addClass('prof_button').text('Profile');
  side_button.append(chat_button).append(prof_button);

  $('.game_container').append(waiting).append(ready_room).append(main).append(end).append(side_button);
}

$(document).ready(function() {
  const socket = io();
  start();

  //current game state
  let spade;
  let currentSpade;
  let checkCard = {mine: 0, opponent: 0};
  let checkReady = [];
  let myPoint = 0;
  let opponentPoint = 0;
  let myProfile;
  let opponentProfile;

  const id = $('.game_container').attr('data-id');

  //if id, set private room, else, make random room
  if(id){
    socket.emit('join', id, $('.navbar-text').text());
  } else {
    socket.emit('join', 1, $('.navbar-text').text());
    $('.restart').text('');
    $('.restart').append('<a href="/">Restart</a>')
  }

  socket.on('wake up', function () {
    socket.emit('shuffle_spade');
    socket.emit('check_opponent_in');
  })

  //clear all the record
  function clear() {
    checkCard.mine = 0;
    checkCard.opponent = 0;
    checkReady = [];
    myPoint = 0;
    opponentPoint = 0;
    $('.game_container').empty();
  }

  //update database after the games ends
  function result() {
    if(myPoint > opponentPoint){
      $('.result').text("Winner!!");
      postScore('wins', myPoint);
    } else if(myPoint < opponentPoint) {
      $('.result').text("Lose....");
      postScore('losses', -myPoint);
    } else {
      $('.result').text('Draw!');
      postScore('draws', 0);
    }
  }

  //counting points each time
  function points() {
    if(checkCard.mine > checkCard.opponent) {
      myPoint += currentSpade;
      $('.my_point').text(myPoint);
    } else if(checkCard.mine < checkCard.opponent) {
      opponentPoint +=  currentSpade;
      $('.opponent_point').text(opponentPoint);
    }
  }

  //set random spade card deck
  function setSpade() {
    if(spade.length !== 0) {
      $('.spade img').remove()
      $('.spade').append(`<img src="/img/spade_${spade[0]}.png"/>`);
      currentSpade = spade.shift();
      onClicked();
    } else {
      $('.main').addClass('hidden');
      $('.end').removeClass('hidden');
      $('.finish').text('finish');
      result();
    }
  }

  //when you choose which card you wanna pull out
  function onClicked() {
    $('.mine div').on('click', function(){
      //each card tag has own number in data-card attribute
      const card = $(this).attr('data-card');
      //send to opponent your choice
      socket.emit('choice_mine', card);
      //can't click after choose
      $('.mine div').off('click');
      checkCard.mine = Number(card);
      $('.choice .front').append(`<img src="/img/cover.png"/>`);
      $('.choice .back').append(`<img src="/img/heart_${checkCard.mine}.png"/>`)
      $(this).remove();
      setTime()
    })
  }

  //check if all players turn ends
  function checkForNextRound() {
    if(checkCard.mine && checkCard.opponent) {
      points();
      checkCard.mine = 0;
      checkCard.opponent = 0;
      $('.choice img').remove();
      $('.opponent img').remove();
      setSpade();
    }
  }

  //check if all players are ready in ready room
  function checkIfReady(){
    if(checkReady.length === 2){
      $('.ready_room').addClass('hidden');
      $('.main').removeClass('hidden');
      setSpade();
    }
  }

  //give some little delay to see each card
  function setTime() {
    if(checkCard.mine && checkCard.opponent){
      setTimeout(function(){
        $('.selected_card').addClass('flip')
        setTimeout(function(){
          checkForNextRound();
          $('.selected_card').removeClass('flip')
        }, CARD_SHOW_DELAY)
      }, CARD_FLIP_DELAY);
    }
  }

  //updating data
  function postScore(status, score) {
    $.post("/score", {'status': status, 'score': score})
    .done(function(data){
      $.get("/myScore")
      .done(function(newData){
        myProfile = newData[0]
        makeProfile('.my_profile', newData[0])
        socket.emit('send_my_profile', myProfile);
      }).fail(function(error) {
        console.log(error);
      })
      console.log('success')
    })
    .fail(function(error) {
      console.log(error);
    })
  }

  //make profile for each players on right side
  function makeProfile(whos, variable){
    const username_label = $('<p>').text('Username').addClass('side-label');
    const username = $('<p>').text(variable.username);
    const totalScore_label = $('<p>').text('Total Score').addClass('side-label');
    const totalScore = $('<p>').text(variable.total_score);
    const wins_label = $('<p>').text('Wins').addClass('side-label');
    const wins = $('<p>').text(variable.wins);
    const losses_label = $('<p>').text('Losses').addClass('side-label');
    const losses = $('<p>').text(variable.losses);
    const draws_label = $('<p>').text('Draws').addClass('side-label');
    const draws = $('<p>').text(variable.draws);
    $(whos).empty();
    $(whos).append(username_label).append(username).append(totalScore_label).append(totalScore).append(wins_label).append(wins).append(losses_label).append(losses).append(draws_label).append(draws);
  }

  //set current my profile from database
  socket.on('my_profile', function(profile){
    myProfile = profile;
    makeProfile('.my_profile', myProfile);
  })

  //set current opponent profile from database
  socket.on('get_opponent_profile', function(profile){
    opponentProfile = profile;
    makeProfile('.opponent_profile', opponentProfile);
  })

  //set current random spade card deck
  socket.on('spade', function(begin_spade){
    spade = begin_spade;
  })

  //when opponent get in, get into ready_room
  socket.on('room_ready', function(){
    $('.waiting').addClass('hidden');
    $('.ready_room').removeClass('hidden');
    socket.emit('send_my_profile', myProfile);
  })

  //get opponent card
  socket.on('get_opponent', function(card){
    $('.opponent .front').append(`<img src="/img/cover.png"/>`);
    $('.opponent .back').append(`<img src="/img/diamond_${card}.png"/>`)
    checkCard.opponent = Number(card);
    setTime();
  })

  //when restart button click, change game room to ready_room
  $('.game_container').on('click', '.restart', function(){
    clear();
    start();
    socket.emit('shuffle_spade');
    socket.emit('check_opponent_in');
  })

  //when click ready, let opponent know that
  $('.game_container').on('click', '.ready', function() {
    checkReady.push(1);
    socket.emit('ready', 1);
    checkIfReady();
    $('.opponent_ready').text('Waiting for opponent ready');
    $('.ready').addClass('hidden');
  })

  //opponent send ready message to let me know that.
  socket.on('opponent_ready', function(ready){
    $('.opponent_ready').text('opponent ready');
    checkReady.push(ready);
    checkIfReady();
  })

  //send my message to opponent
  $('.chat_form').on('submit', function(e){
    e.preventDefault();
    socket.emit('send message', $(e.target.message).val());
    $('.message').val("");
    $(".message").focus();
  });

  //get message from opponent
  socket.on('message', function(msg){
    $('.chat_log').append("<p class=\"otherMessage\">"+msg+"</p>");
    $('.chat_log').scrollTop($('.chat_log')[0].scrollHeight);
  });

  //set my message to log
  socket.on('myMessage', function(msg){
    $('.chat_log').append("<p class=\"myMessage\">"+msg+"</p>");
    $('.chat_log').scrollTop($('.chat_log')[0].scrollHeight);
  });

  //notice opponent I am in the room
  socket.on('Userconnect', function(name){
    $('.chat_log').append("<p class=\"connect\">"+name+" connected"+"</p>");
  });

  //when disconnect opponent, it let me know
  socket.on('disconnect', function(name){
    if($( ".end" ).hasClass( "hidden" ) && !$( ".main" ).hasClass( "hidden" )){
      postScore('wins', myPoint)
    }
    clear();
    start();
    if(!id){
      $('.restart').text('');
      $('.restart').append('<a href="/">Restart</a>')
    }
    $('.waiting').addClass('hidden');
    $('.ready_room').addClass('hidden');
    $('.main').addClass('hidden');
    $('.end').removeClass('hidden');
    $('.chat_log').append("<p class=\"disconnect\">"+name+"</p>");
    $('.opponent_profile').empty();
    opponentProfile = '';
  })

  //when the private room is over 2, they are sent to unknown room
  socket.on('blank', function(){
    clear();
    $('.profile_container').remove();
  })
})


