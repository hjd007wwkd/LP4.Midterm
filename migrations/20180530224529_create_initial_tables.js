
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
         table.increments('id');
         table.string('username');
         table.string('password');
       }).then(function() {
    return knex.schema.createTable('scores', function(table) {
        table.increments('id');
        table.integer('total_score');
        table.integer('wins');
        table.integer('losses');
        table.integer('draws');
        table.integer('user_id').notNullable();
        table.foreign('user_id').references('id').inTable('users');
      })
    })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('scores').then(function (message) {
    return knex.schema.dropTable('users');
  });
};