const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Admin credentials (change to secure values in production)
const ADMIN_CREDENTIALS = {
  username: 'haolivier2019@gmail.com',
  password: '0852369147@Viran'
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session setup
app.use(session({
  secret: 'yourVerySecretSessionKey',
  resave: false,
  saveUninitialized: true,
}));

const dataFile = path.join(__dirname, 'data', 'responses.json');

// Homepage
app.get('/', (req, res) => {
  res.render('homepage');
});

// Form page
app.get('/form', (req, res) => {
  res.render('form');
});

// Handle form submit
app.post('/submit', (req, res) => {
  const responses = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  responses.push(req.body);
  fs.writeFileSync(dataFile, JSON.stringify(responses, null, 2));
  res.render('thankyou');
});

// Admin login page
app.get('/admin-login', (req, res) => {
  res.render('admin-login', { error: null });
});

// Handle login submission
app.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    req.session.authenticated = true;
    res.redirect('/admin');
  } else {
    res.render('admin-login', { error: 'Invalid username or password' });
  }
});

// Protected admin page
app.get('/admin', (req, res) => {
  if (req.session.authenticated) {
    const responses = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    res.render('admin', { responses });
  } else {
    res.redirect('/admin-login');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin-login');
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
