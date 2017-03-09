'use strict';

const
  expect = require('chai').expect,
  request = require('superagent'),

  debug = require('debug')('cfgram-pic-router-test'),

  Pic = require('../model/pic.js'),
  User = require('../model/user.js'),
  Gallery = require('../model/gallery.js'),

  serverToggle = require('./lib/server-toggle.js'),
  server = require('../server.js'),

  url = `http://localhost:${process.env.PORT}`;


const
  exampleUser = {
    username: 'exampleUser',
    password: 'testpass',
    email: 'exampleUser@test.com'
  },

  exampleGallery = {
    name: 'example gallery',
    desc: 'example gallery description'
  },

  examplePic = {
    name: 'examplePic',
    desc: 'example pic description',
    image: `${__dirname}/data/tester.png`
  };

describe('pic routes ', function(){
  before( done => {
    serverToggle.serverOn(server, done);
    done();
  });

  after( done => {
    serverToggle.serverOff(server, done);
  });

  afterEach( done => {
    Promise.all([
      Pic.remove({}),
      Gallery.remove({}),
      User.remove({})
    ])
    .then (() => done())
    .catch(done);
  });
  describe('POST /api/gallery/:galleryID/pic', function(){
    describe('with a valid token and valid data', function(){
      before(done => {
        new User(exampleUser)
        .genPasswordHash(exampleUser.password)
        .then(user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.genToken();
        })
        .then(token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      before(done => {
        exampleGallery.userID = this.tempUser._id.toString();
        new Gallery(exampleGallery).save()
        .then( gallery => {
          this.tempGallery = gallery;
          done();
        })
        .catch(done);
      });
      after( done => {
        delete exampleGallery.userID;
        done();
      });

      it('should return a pic', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}/pic`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('name', examplePic.name)
        .field('desc', examplePic.desc)
        .field('image', examplePic.image)
        .end((err,res) => {
          if(err) return done(err);
          expect(res.body.name).to.equal(examplePic.name);
          expect(res.body.desc).to.equal(examplePic.desc);
          expect(res.body.galleryID).to.equal(this.tempGallery._id.toString());
          done();
        });
      });
    });
  });
});



