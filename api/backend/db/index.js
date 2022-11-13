const { Pool } = require('pg');

var config = {
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  ssl: { rejectUnauthorized: false }
};

const pool = new Pool(config);

module.exports = {
  async query(text, params) {
    const res = await pool.query(text, params)
    if (process.env.NODE_ENV !== 'production') {
      console.log('executed query', { text })
    }
    
    return res
  },

  async query(text, params, callback) {
    const res = await pool.query(text, params, callback)
    if (process.env.NODE_ENV !== 'production') {
      console.log('executed query', { text })
    }

    return res
  }
}

