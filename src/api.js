import express from 'express';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import loglevel from 'loglevel';
import passport from '../authenticate';
import fs from 'fs';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path';
import '../db';
import {loadUsers, loadMovies,loadRatings,loadReviews} from '../seedData';

import usersRouter from '../api/users';
import moviesRouter from '../api/movies';
import genreRouter from  '../api/genres';
import ratingRouter from "../api/rating";
import reviewRouter from '../api/reviews';

dotenv.config();

const app = express();
const router = express.Router();

if (process.env.NODE_ENV === 'test') {
    loglevel.setLevel('warn')
  } else {
    loglevel.setLevel('info')
  }

  app.use(passport.initialize());;

  if (process.env.SEED_DB && (process.env.NODE_ENV!='test')) {
    loadUsers();
    loadMovies();
    loadRatings();
    loadReviews();
  }

  var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
app.use(morgan('short', {stream: accessLogStream}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(session({
    secret: 'ilikecake',
    resave: true,
    saveUninitialized: true
  }));

app.use('/.netlify/functions/api/users', usersRouter);
app.use('/.netlify/functions/api/movies', passport.authenticate('jwt', {session: false}), moviesRouter);
app.use('/.netlify/functions/api/genres', genreRouter);
app.use('/.netlify/functions/api/rating', ratingRouter);
app.use('/.netlify/functions/api/reviews', reviewRouter);



router.get("/", (req, res) => {

    res.send({
        "hello": "hi"
    })

})

app.use("/.netlify/functions/api", router);

exports.handler = serverless(app);