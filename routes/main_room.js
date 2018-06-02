const express       = require('express');
const routes  = express.Router();
const cookieSession = require('cookie-session');

module.exports = function(knex) {

  routes.get('/', (req, res) => {
    if(req.session.username){
      res.render('main_room', {username: req.session.username, room_id: ''});
    } else {
      res.render('front-page');
    }
  });

  routes.post('/', (req, res) => {
    const search = req.body.search.trim();
    res.redirect('/rooms/'+search);
  })

  routes.get('/rooms/:id', (req, res) => {
    if(req.session.username){
      res.render('main_room', {username: req.session.username, room_id: req.params.id});
    } else {
      res.render('front-page');
    }
  })

  routes.post('/score', (req, res) => {
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

  routes.get('/score', (req, res) => {
    knex.select('users.username', 'scores.total_score', 'scores.wins', 'scores.losses', 'scores.draws').from('users').innerJoin('scores', 'scores.user_id', '=', 'users.id').orderBy('scores.total_score', 'desc').then(function(data){
      res.send(data);
    }).catch(function(err){
      console.log(err);
    })
  })

  return routes;

};
