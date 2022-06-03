const { client } = require('./index');

async function dropTables() {
    try {
        await client.query(`
            DROP TABLE IF EXISTS users
        `);
    } catch (error) {
        throw error;
    }
}

async function createTables() {
    try {
        await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL
        );
      `);
    } catch (error) {
        throw error;
    }
}

async function rebuildDB() {
    try {
        client.connect();

        await dropTables();
        await createTables();
    } catch (error) {
        console.error(error);
    } finally {
        client.end();
    }
}

rebuildDB();