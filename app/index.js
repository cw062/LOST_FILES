if (process.env.NODE_ENV != 'production') {
    require('dotenv').config();
  }

const express = require('express');
const app = express();
const fileupload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
const public = path.join(__dirname, '../public');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const TWO_HOURS = 1000 * 60 * 60 * 2;
const IN_PROD = process.env.NODE_ENV === 'production';
const options = {
  connectionLimit: 10,
  host: process.env.RDS_HOSTNAME,
  port: process.env.RDS_PORT,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.MYSQL_DB,
  createDatabaseTable: true
};
const sessionStore = new MySQLStore(options);
const loginRoutes = require('../app/routes/login-routes');
const signupRoutes = require('../app/routes/signup-routes');
const homepageRoutes = require('../app/routes/homepage-routes');

app.set('view engine', 'ejs');

app.use('/', express.static(public));
app.use(express.static(path.join(__dirname, '../')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(fileupload());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: TWO_HOURS,
      sameSite: true,
      secure: IN_PROD
    }
  })
);
app.use('/Homepage', homepageRoutes);
app.use('/Signup', signupRoutes);
app.use('/', loginRoutes);

module.exports = app;



