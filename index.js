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
import loglevel from 'loglevel';

dotenv.config();
const app = express();

const errHandler = (err, req, res, next) => {

  if(process.env.NODE_ENV === 'production') {
    app.use(errorhandler({ log: errorNotification }))

    return res.status(500).send(`Something went wrong!`);
  }
  res.status(500).send(`Hey!! You caught the error 👍👍, ${err.stack} `);
}; 

  if (process.env.NODE_ENV === 'test') {
    loglevel.setLevel('warn')
  } else {
    loglevel.setLevel('info')
  }


const errorNotification= (err, str, req)=> {
  var title = 'Error in ' + req.method + ' ' + req.url

  notifier.notify({
    title: title,
    message: str
  })
}

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const options = {
  swaggerDefinition: {
    // 這邊會是你的api文件網頁描述
    info: {
      title: 'Assign2 API',
      version: '1.0.0',
      description: 'Generate API document with swagger'
    }
  },
  // 這邊會是你想要產生的api文件檔案，我是直接讓swagger去列出所有controllers
  apis: ['./api/**/index.js']
};
const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));



app.use(passport.initialize());;

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
app.use(morgan('short', {stream: accessLogStream}));

const port = process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(express.static('public'));

app.use(session({
  secret: 'ilikecake',
  resave: true,
  saveUninitialized: true
}));




app.use('/api/users', usersRouter);
app.use(errHandler);
app.use('/api/genres', genreRouter);

app.use('/api/movies', passport.authenticate('jwt', {session: false}), moviesRouter);

app.use('/api/rating', ratingRouter);

app.use('/api/reviews', reviewRouter);

if (process.env.SEED_DB && (process.env.NODE_ENV=='development')) {
  loadUsers();
  loadMovies();
  loadRatings();
  loadReviews();
}
//别忘了!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
let server = app.listen(port, () => {
  loglevel.info(`Server running at ${port}`);
});

module.exports = server