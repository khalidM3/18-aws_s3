'use strict';

const
  express = require('express'),

  mongoose = require('mongoose'),
  Promise = require('bluebird'),

  morgan = require('morgan'),
  cors = require('cors'),
  debug = require('debug')('cfgram:server'),
  errors = require('./lib/error-middleware.js'),
  dotenv = require('dotenv'),

  picRouter = require('./route/pic-router.js'),
  authRouter = require('./route/auth-router.js'),
  galleryRouter = require('./route/gallery-router.js');

dotenv.load();

const
  PORT = process.env.PORT,
  app = express();

mongoose.connect(process.env.MONGODB_URI);
let morganFormat = process.env.PRODUCTION ? 'common' : 'dev';

app.use(cors());
app.use(morgan(morganFormat));

app.use(picRouter);
app.use(authRouter);
app.use(galleryRouter);


app.use(errors);
const server = module.exports = app.listen(PORT, () => debug('SERVER UP AT PORT ', PORT));
server.isRunning = true;