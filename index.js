import dotenv from 'dotenv';
import express from 'express';
import moviesRouter from './api/movies';
import genreRouter from  './api/genres';
import ratingRouter from "./api/rating";
import reviewRouter from './api/reviews';
import bodyParser from 'body-parser';
import './db';
import {loadUsers, loadMovies,loadRatings,loadReviews} from './seedData';
import usersRouter from './api/users';
import session from 'express-session';
import passport from './authenticate';
import errorhandler  from 'errorhandler';
import notifier  from 'node-notifier';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

dotenv.config();

const errHandler = (err, req, res, next) => {
  /* if the error in development then send stack trace to display whole error,
  if it's in production then just send error message  */
  if(process.env.NODE_ENV === 'production') {
    app.use(errorhandler({ log: errorNotification }))

    return res.status(500).send(`Something went wrong!`);
  }
  res.status(500).send(`Hey!! You caught the error 👍👍, ${err.stack} `);
};

const errorNotification= (err, str, req)=> {
  var title = 'Error in ' + req.method + ' ' + req.url

  notifier.notify({
    title: title,
    message: str
  })
}



const app = express();
// initialise passport​
app.use(passport.initialize());;

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
app.use(morgan('short', {stream: accessLogStream}));

const port = process.env.PORT;
//configure body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(express.static('public'));
// app.use('/api/movies', moviesRouter);
//session middleware
app.use(session({
  secret: 'ilikecake',
  resave: true,
  saveUninitialized: true
}));



app.listen(port, () => {
  console.info(`Server running at ${port}`);
});
//Users router
app.use('/api/users', usersRouter);
app.use(errHandler);
app.use('/api/genres', genreRouter);

// Add passport.authenticate(..)  to middleware stack for protected routes​
app.use('/api/movies', passport.authenticate('jwt', {session: false}), moviesRouter);

app.use('/api/rating', ratingRouter);

app.use('/api/reviews', reviewRouter);

if (process.env.SEED_DB) {
  loadUsers();
  loadMovies();
  loadRatings();
  loadReviews();
}

module.exports = app
