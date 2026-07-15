const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

const dbUrl = process.env.DB_URL || 'jdbc:mysql://localhost:3306/restrobuild_test';
const username = process.env.DB_USERNAME || 'root';
const password = process.env.DB_PASSWORD || '';
const database = parseDatabaseName(dbUrl);
const mysqlBin = resolveMysqlBinary();

if (!mysqlBin) {
  throw new Error('mysql.exe was not found. Set MYSQL_BIN to the full mysql client path.');
}

execFileSync(mysqlBin, [
  '-u',
  username,
  '-e',
  `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
].filter(Boolean), {
  env: password ? { ...process.env, MYSQL_PWD: password } : process.env,
  stdio: 'inherit',
});

function parseDatabaseName(url) {
  const match = url.match(/^jdbc:mysql:\/\/[^/]+\/([^?]+)/);
  if (!match) {
    throw new Error(`Cannot parse MySQL database name from DB_URL: ${url}`);
  }
  return match[1];
}

function resolveMysqlBinary() {
  const candidates = [
    process.env.MYSQL_BIN,
    'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
    'C:\\Program Files\\MySQL\\MySQL Workbench 8.0\\mysql.exe',
    'mysql',
  ].filter(Boolean);

  return candidates.find((candidate) => candidate === 'mysql' || fs.existsSync(candidate));
}
