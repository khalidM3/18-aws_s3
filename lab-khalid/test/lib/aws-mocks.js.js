'use strict';

const AWS = require('aws-sdk-mock');

module.exports = exports = {};

exports.uploadMock = {
  ETag:'example e tag',
  Location: 'https://example.com/example.png',
  Key: 'example.png',
  key: 'example.png',
  Bucket: 'testgram'
};

AWS.mock('S3', 'upload', function(params, callback){
  if(!params.ACL === 'public-read'){
    return callback(new Error('ACL must be a public read'));
  }
  
  if(!params.Bucket){
    return callback(new Error('Bucket must be testgram'));
  }

  if(!params.Key){
    return callback(new Error('Key required'));
  }

  if(!params.Body){
    return callback(new Error('Body required'));
  }

  callback(null, exports.uploadMock);
});

