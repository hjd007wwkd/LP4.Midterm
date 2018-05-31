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


knex.select('*').from('users').then(function(err, message) {
  if (err) {
    console.error(err);
  } else {
    console.log(message);
  }
}).finally(function() {
  knex.destroy()
});