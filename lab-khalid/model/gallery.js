'use strict';

const mongoose = require('mongoose');


const gallerySchema = mongoose.Schema({
  name: {type : String, required: true},
  desc: {type: String, required : true},
  created: {type: Date, default: Date.now},
  userID: {type: mongoose.Schema.Types.ObjectId, required: true}
});

module.exports = mongoose.model('gallery', gallerySchema);