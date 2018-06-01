const express       = require('express');
const routes  = express.Router();
const cookieSession = require('cookie-session');

module.exports = function(knex) {

  routes.get('/', (req, res) => {
    if(req.session.username){
      res.render('main_room', {username: req.session.username});
    } else {
      res.render('front-page');
    }
  });

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

  return routes;

};
