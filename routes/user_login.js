const express       = require('express');
const routes  = express.Router();
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

module.exports = function(knex) {

  routes.get('/login', (req, res) => {
    res.render('login_page');
  })

  routes.post('/login', (req, res) => {
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

  routes.get('/register', (req, res) => {
    res.render('register_page');
  })

  routes.post('/register', (req, res) => {
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

  routes.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/login')
  })

  return routes;

};