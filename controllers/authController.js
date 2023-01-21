const User = require ('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { attachCookiesToResponse, createTokenUser } = require('../utils')

const register = async (req, res) => {
  const {email, name, password } = req.body
  // The controller is now handling the email check. By using unique in the model, mongoose
  // was throwing its standard error.
  const emailAlreadyExists = await User.findOne({email})
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists.')
  }
  // email check end
  // will return true if there are no accounts
  const isFirstAccount = await User.countDocuments({}) === 0;
  const role = isFirstAccount ? 'admin' : 'user';
  // by not passing role into the model, you can avoid having a user try to set themselves up as an admin.
  const user = await User.create({ name, email, password, role })

  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({res, user: tokenUser })
  
  res.status(StatusCodes.CREATED).json({ user: tokenUser }) 
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new CustomError.BadRequestError('Must provide both email and password.')
  }

  const user = await User.findOne({email})
  
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials')
  }

  // .comparePassword is a method that we created on the UserSchema
  const isPasswordCorrect = await user.comparePassword(password)
  if( !isPasswordCorrect ) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials')
  }

  const tokenUser = createTokenUser(user)
  
  attachCookiesToResponse({res, user: tokenUser })
  
  res.status(StatusCodes.OK).json({ user: tokenUser }) 
}

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  })
  // just during testing use the line below
  res.status(StatusCodes.OK).json({msg: 'user logged out.'})
}

module.exports = {
  register,
  login,
  logout
}