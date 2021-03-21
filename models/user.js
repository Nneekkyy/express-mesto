const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxLength: 30,
    required: true,
  },
  about: {
    type: String,
    minlength: 2,
    maxLength: 30,
    required: true,
  },
  avatar: {
    type: String,
    minlength: 1,
    required: true,
  },
});

module.exports = mongoose.model('user', userSchema);
