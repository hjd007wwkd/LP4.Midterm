// Update with your config settings.

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
    	database: 'midterm',
    	user: 'labber',
    	password: 'labber'
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
