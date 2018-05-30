$(document).ready(function() {
  const socket = io();
  let spade;
  let currentSpade;
  let checkCard = {mine: 0, opponent: 0};
  let checkReady = [];
  let myPoint = 0;
  let opponentPoint = 0;

  socket.emit('join', 1);

  function result() {
    if(myPoint > opponentPoint){
      $('.result').text("Winner!!");
    } else if(myPoint < opponentPoint) {
      $('.result').text("Loser!!");
    } else {
      $('.result').text('Draw!!');
    }
  }

  function points() {
    if(checkCard.mine > checkCard.opponent) {
      myPoint += currentSpade;
      $('.my_point').text(myPoint);
    } else if(checkCard.mine < checkCard.opponent) {
      opponentPoint +=  currentSpade;
      $('.opponent_point').text(opponentPoint);
    }
  }
  function setSpade() {
    if(spade.length !== 0) {
      $('.spade img').remove()
      $('.spade').append(`<img src="img/spade_${spade[0]}.png"/>`);
      currentSpade = spade.shift();
      onClicked();
    } else {
      $('.main').addClass('hidden');
      $('.end').removeClass('hidden');
      $('.finish').text('finish');
      result();
    }
  }

  function onClicked() {
    $('.mine div').on('click', function(){
      const card = $(this).attr('data-card');
      socket.emit('choice_mine', card);
      $('.choice img').remove()
      $('.choice').append(`<img src="img/heart_${card}.png"/>`);
      $('.mine div').off('click');
      checkCard.mine = Number(card);
      $(this).remove();
      checkForNextRound(card);
    })
  }

  function checkForNextRound(card) {
    if(checkCard.mine && checkCard.opponent) {
      points();
      checkCard.mine = 0;
      checkCard.opponent = 0;
      $('.choice img').remove();
      $('.opponent img').remove();
      setSpade();
    }
  }

  function checkIfReady(){
    if(checkReady.length === 2){
      $('.ready_room').addClass('hidden');
      $('.main').removeClass('hidden');
      setSpade();
    }
  }

  socket.on('spade', function(begin_spade){
    spade = begin_spade;
  })

  socket.on('room_ready', function(){
    console.log('asds')
    $('.waiting').addClass('hidden');
    $('.ready_room').removeClass('hidden');
  })

  $('.ready').on('click', function() {
    checkReady.push('1');
    socket.emit('ready', 1);
    checkIfReady();
    $('.ready').off('click');
  })

  socket.on('get_opponent', function(card){
    $('.opponent').append(`<img src="img/diamond_${card}.png"/>`);
    checkCard.opponent = Number(card);
    checkForNextRound(card);
  })

  socket.on('opponent_ready', function(ready){
    $('.opponent_ready').text('opponent ready');
    checkReady.push(ready);
    checkIfReady();
  })
})


