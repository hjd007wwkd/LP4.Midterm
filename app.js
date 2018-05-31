const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080;
var http = require('http').Server(app);
var io = require('socket.io')(http);
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
var knex = require('knex')({
  client: 'postgresql',
  connection: {
    user : 'labber',
    password : 'labber',
    database : 'midterm'
  },
  migrations: {
    tableName: 'knex_migrations'
  }
});

const mainRoomRoutes = require("./routes/main_room")(knex);
const userRoutes = require("./routes/user_login")(knex);

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["secret"]
}));

app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));

let currentUsername;

app.use(function(req, res, next){
  currentUsername = req.session.username;
  next();
})

app.use(mainRoomRoutes);
app.use(userRoutes);


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

    knex.select('users.username', 'scores.wins', 'scores.losses', 'scores.draws', 'scores.total_score').from('users').innerJoin('scores', 'users.id', '=', 'scores.user_id').where('users.username', currentUsername).then(function(data){
      io.to(socket.id).emit('my_profile', data[0]);
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
      io.in(socket.room).emit('Userconnect', currentUsername ? currentUsername : socket.id.substr(0, 4));
    }).finally(function(){
      console.log('finished!!')
    });
  })

  socket.on('send_my_profile', function(profile){
    socket.to(socket.room).emit('get_opponent_profile', profile);
  })

  socket.on('ready', function(ready) {
    socket.to(socket.room).emit('opponent_ready', ready);
  })

  socket.on('choice_mine', function(card){
    socket.to(socket.room).emit('get_opponent', card);
  })

  socket.on('disconnect', function(){
    io.in(socket.room).emit('disconnect', currentUsername ? currentUsername : socket.id.substr(0, 4));
  })

  socket.on('send message', function(text){
    socket.to(socket.room).emit('message', text);
    io.to(socket.id).emit('myMessage', text);
  });
});

http.listen(PORT, function(){
  console.log(`app listening on port ${PORT}!`);
});
