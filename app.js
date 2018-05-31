const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080;
var http = require('http').Server(app);
var io = require('socket.io')(http);
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
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

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["secret"]
}));

app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));

let currentUsername;

app.get('/', (req, res) => {
  if(req.session.username){
    currentUsername = req.session.username;
    res.render('game');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.render('login_page');
})

app.post('/login', (req, res) => {
  const username = req.body.username;
  knex.select('username', 'password').from('users').where('username', username).then(function(data){
    if(data.length === 0 ){
      console.log('username is not existing');
      res.redirect('/login');
    } else {
      if(bcrypt.compareSync(req.body.password, data[0].password)){
        req.session.username = username;
        res.redirect('/');
      } else {
        console.log('Wrong password');
        res.redirect('/login')
      }
    }
  })

})

app.get('/register', (req, res) => {
  res.render('register_page');
})

app.post('/register', (req, res) => {
  const username = req.body.username;
  const password = bcrypt.hashSync(req.body.password, 10);
  knex.select('username').from('users').where('username', username).then(function(data){
    if(data.length === 0 ){
      knex.insert({username: username, password: password}).into('users').then(function(){
        knex.insert({total_score: 0, wins: 0, losses: 0, draws: 0, user_id: knex.select('id').from('users').where('username', username)}).into('scores').finally(function(){
          console.log('finished!');
          req.session.username = username;
          res.redirect('/');
        })
      })
    } else {
      console.log('There is existing username!');
      res.redirect('/register');
    }
  })
})

app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login')
})

app.post('/score', (req, res) => {
  const status = req.body.status;
  const score = Number(req.body.score);

  knex.select(`${status}`, 'total_score').from('scores').innerJoin('users', 'scores.user_id', '=', 'users.id').where('users.username', req.session.username).then(function(data){
    const count = Number(data[0][status]) + 1;
    let totalScore = Number(data[0].total_score) + score;
    if(status === 'wins'){
      knex('scores').update({wins: count, total_score: totalScore}).where('user_id', knex.select('id').from('users').where('username', req.session.username)).finally(function(){
        console.log('finished');
      })
    } else if(status === 'losses') {
      if(totalScore <= 0){
        totalScore = 0;
      }
      knex('scores').update({losses: count, total_score: totalScore}).where('user_id', knex.select('id').from('users').where('username', req.session.username)).finally(function(){
        console.log('finished');
      })
    }
  })
})

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
