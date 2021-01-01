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

import optimizelyExpress from '@optimizely/express';

const optimizely = optimizelyExpress.initialize({
    sdkKey: 'UjThNxuk5yt5MgWiNYWQ7',
    datafileOptions: {
      autoUpdate: true,      // Indicates feature flags will be auto-updated based on UI changes 
      updateInterval: 1*1000 // 1 second in milliseconds
    },
    logLevel: 'info',        // Controls console logging. Can be 'debug', 'info', 'warn', or 'error'
  });
  
dotenv.config();

const app = express();
app.use(optimizely.middleware);

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
    const isEnabled = req.optimizely.client.isFeatureEnabled(
        'Assignment2',       // Feature key connecting feature to UI
        '',           // String ID used for random percentage-based rollout
        {
          customerId: 123,   // Attributes used for targeted audience-based rollout
          isVip: true,
        }
      );

    res.send({
        "hello": `${isEnabled ?"user" :"feature off"} `
    })

})

app.use("/.netlify/functions/api", router);


exports.handler = serverless(app);