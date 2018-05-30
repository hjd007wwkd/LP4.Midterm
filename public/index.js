function start() {
  const waiting = $('<div>').addClass('waiting').text('waiting...');

  const ready_room = $('<div>').addClass('ready_room hidden');
  const ready = $('<div>').addClass('ready').text('ready');
  const opponent_ready = $('<div>').addClass('opponent_ready');
  ready_room.append(ready).append(opponent_ready);

  const main = $('<div>').addClass('main hidden');
  const my_point = $('<div>').addClass('my_point').text('0');
  const opponent_point = $('<div>').addClass('opponent_point').text('0');
  const opponent = $('<div>').addClass('opponent');
  const spade = $('<div>').addClass('spade');
  const choice = $('<div>').addClass('choice');
  const mine = $('<div>').addClass('mine');
  for(let i = 1; i <= 13; i++){
    const card = $('<div>').attr('data-card', i);
    const img = $(`<img src='img/heart_${i}.png'>`);
    card.append(img);
    mine.append(card);
  }
  main.append(my_point).append(opponent_point).append(opponent).append(spade).append(choice).append(mine);

  const end = $('<div>').addClass('end hidden');
  const finish = $('<div>').addClass('finish');
  const result = $('<div>').addClass('result');
  const restart = $('<div>').addClass('restart').text('Restart');
  end.append(finish).append(result).append(restart);

  $('.game_container').append(waiting).append(ready_room).append(main).append(end);
}

$(document).ready(function() {
  const socket = io();
  let spade;
  let currentSpade;
  let checkCard = {mine: 0, opponent: 0};
  let checkReady = [];
  let myPoint = 0;
  let opponentPoint = 0;

  socket.emit('join', 1);

  start();

  function clear() {
    checkCard.mine = 0;
    checkCard.opponent = 0;
    checkReady = [];
    myPoint = 0;
    opponentPoint = 0;
  }

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

  $('.game_container').on('click', '.restart', function() {
    clear();
    $('.game_container').empty();
    start();
    socket.emit('join', 1);
  })

  socket.on('spade', function(begin_spade){
    spade = begin_spade;
  })

  socket.on('room_ready', function(){
    $('.waiting').addClass('hidden');
    $('.ready_room').removeClass('hidden');
  })

  socket.on('get_opponent', function(card){
    $('.opponent').append(`<img src="img/diamond_${card}.png"/>`);
    checkCard.opponent = Number(card);
    checkForNextRound(card);
  })

  $('.game_container').on('click', '.ready', function() {
      checkReady.push(1);
      socket.emit('ready', 1);
      checkIfReady();
      $('.ready').off('click');
    })

  socket.on('opponent_ready', function(ready){
    $('.opponent_ready').text('opponent ready');
    checkReady.push(ready);
    checkIfReady();
  })
})


