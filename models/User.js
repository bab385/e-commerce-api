const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    validate: { validator: validator.isEmail,
      message: 'Please provide valid email',
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
})

// this is how you hash the password prior to saving the user in the DB
UserSchema.pre('save', async function () {
  // console.log(this.modifiedPaths())
  // console.log(this.isModified('name'))
  // added the if statement below so that the password is not hashed again if
  // the user has not changed their password.
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
})

// this is how you check the password the user enters to login with the hashed password
// that is saved in the DB. This is a method that acts on an instance of the schema
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
}
module.exports = mongoose.model('User', UserSchema)