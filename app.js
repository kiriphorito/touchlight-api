const http = require('http');
const express = require('express');
const sqlite3 = require('sqlite3');

const PORT = 3010;

const app = express();
app.set('port', PORT);
app.use(express.json());

const server = http.createServer(app);
server.listen(PORT);

const db = new sqlite3.Database('test.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS post (
    id int PRIMARY_KEY,
    text VARCHAR(255)
  );
  `);
  //INSERT INTO post(id, text) VALUES
  //  (1, "Hello"),
  //  (2, "World");
  //`);

db.all(`SELECT * FROM post`, (err, rows) => {
  rows.forEach(row => {
    console.log(row.id + " - " + row.text);
  });
});

const router = express.Router();
router.get('/', function(req, res, next) {
  res.json({'hello':'world'});
});
router.get('/post/:id', function(req, res, next) {
  console.log(req.params.id);
  db.get('SELECT * FROM post WHERE id = ?', [req.params.id], (err, row) => {
    res.json(row);
  })
})
app.post('/post', (req, res, next) => {
  console.log('Got body:', req.body);
  console.log('Got auth:', req.header('Authorization'));
  if (req.header('Authorization') != "sam") {
    res.sendStatus(403);
    return;
  }
  const sql = `INSERT INTO post (id, text) VALUES (?, ?)`;
  const params = [req.body.id, req.body.text];
  db.run(sql, params, function(err, result) {
    if (err) {
      res.status(500);
      return;
    } else {
      res.status(200);
    }
  })
  res.sendStatus(200);
});

app.use('/', router);



module.exports = app;
