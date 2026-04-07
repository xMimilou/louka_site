import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host:     process.env.DB_HOST     ?? '127.0.0.1',
  port:     Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME     ?? 'louka_site',
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'Z',
})

export default pool
