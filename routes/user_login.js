const express       = require('express');
const routes  = express.Router();
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

module.exports = function(knex) {

  routes.get('/login', (req, res) => {
    if(!req.session.username){
      res.render('login_page');
    } else {
      res.redirect('/');
    }
  })

  routes.post('/login', (req, res) => {
    const username = req.body.username.trim();
    const password = req.body.password.trim();
    if(username && password) {
      knex.select('username', 'password').from('users').where('username', username).then(function(data){
        if(data.length === 0 ){
          res.send({code: 'fail', text: 'Username is not existed'});
        } else {
          if(bcrypt.compareSync(password, data[0].password)){
            req.session.username = username;
            res.send({code: 'success', text: '/'});
          } else {
            res.send({code: 'fail', text: 'Wrong password'});
          }
        }
      })
    } else {
      res.send({code: 'fail', text: 'Username or password cannot be empty'});
    }


  })

  routes.post('/register', (req, res) => {
    const username = req.body.username.trim();
    const originalPassword = req.body.password.trim()

    if(username && originalPassword) {
      const password = bcrypt.hashSync(originalPassword, 10);
      knex.select('username').from('users').where('username', username).then(function(data){
        if(data.length === 0 ){
          knex.insert({username: username, password: password}).into('users').then(function(){
            knex.insert({total_score: 0, wins: 0, losses: 0, draws: 0, user_id: knex.select('id').from('users').where('username', username)}).into('scores').finally(function(){
              req.session.username = username;
              res.send({code: 'success', text: '/'});
            })
          })
        } else {
          res.send({code: 'fail', text: 'There is existing username!'});
        }
      })
    } else {
      res.send({code: 'fail', text: 'Username or password cannot be empty'});
    }
  })

  routes.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/')
  })

  return routes;

};