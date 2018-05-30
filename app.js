const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080;
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));

app.get('/', (req, res) => {
  res.render('game');
});

function shuffle(cards) {
    let randomNumber, card;
    for (let i = cards.length - 1; i > 0; i--) {
        randomNumber = Math.floor(Math.random() * (i + 1));
        card = cards[i];
        cards[i] = cards[randomNumber];
        cards[randomNumber] = card;
    }
    return cards;
}

io.on('connection', function(socket){
  socket.on('join', function(room_title){
    room_title = io.sockets.adapter.rooms.title
    if(io.sockets.adapter.rooms[room_title] && io.sockets.adapter.rooms[room_title].active === 'active') {
      socket.join(room_title);
      io.sockets.adapter.rooms[room_title].active = 'done'
      io.in(room_title).emit('room_ready');
    } else {
      if(!room_title) {
        io.sockets.adapter.rooms.title = 1;
      } else {
        io.sockets.adapter.rooms.title += 1;
      }
      room_title = io.sockets.adapter.rooms.title;
      socket.join(room_title);
      io.sockets.adapter.rooms[room_title].active = 'active';
      io.sockets.adapter.rooms[room_title].spade = shuffle([1,2,3,4,5,6,7,8,9,10,11,12,13]);
    }

    socket.room = room_title;
    io.to(socket.id).emit('spade', io.sockets.adapter.rooms[room_title].spade);
  })

  socket.on('ready', function(ready) {
    socket.to(socket.room).emit('opponent_ready', ready);
  })

  socket.on('choice_mine', function(card){
    socket.to(socket.room).emit('get_opponent', card);
  })
});

http.listen(PORT, function(){
  console.log(`app listening on port ${PORT}!`);
});
