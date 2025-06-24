const { executeMigrations } = require('./src/database/setup');
const db = require('./src/config/database');

beforeAll(async () => {
  await executeMigrations();
});

afterAll(async () => {
  await db.closeConnection();
}); 