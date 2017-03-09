'use strict';

const
  Router = require('express').Router,

  fs = require('fs'),
  path = require('path'),
  del = require('del'),

  AWS = require('aws-sdk'),
  multer = require('multer'),

  debug = require('debug')('cfgram:pic-router'),
  createError = require('http-errors'),

  Pic = require('../model/pic.js'),
  Gallery = require('../model/gallery.js'),
  bearerAuth = require('../lib/bearer-auth-middleware.js');

AWS.config.setPromisesDependency(require('bluebird'));

const
  s3 = new AWS.S3(),
  dataDir = `${__dirname}/../data`,
  upload = multer({dest: dataDir}),

  picRouter = module.exports = Router();

function s3uploadProm(params) {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data)=> {
      resolve(s3data);
    });
  });
}

picRouter.post('/api/gallery/:galleryID/pic', bearerAuth, upload.single('image'), function(req, res, next){
  debug('POST /api/gallery/:galleryID/pic');

  if(!req.file){
    return next(createError(400, 'File not found'));
  }
  if(!req.file.path){
    return next(createError(500, 'file not saved'));
  }

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL : 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };

  Gallery.findById(req.params.galleryID)
  .then( () => s3uploadProm(params))
  .then(s3data => {
    del([`${dataDir}/*`]);
    let picData = {
      name : req.body.name,
      desc: req.body.desc,
      objectKey: s3data.Key,
      imageURI: s3data.Location,
      userID: req.user._id,
      galleryID: req.params.galleryID
    };
    return new Pic(picData).save();
  })
  .then( pic => res.json(pic))
  .catch(err => next(err));
});