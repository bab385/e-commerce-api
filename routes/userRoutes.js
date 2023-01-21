const express = require('express')
const router = express.Router();
const { authenticateUser, authorizePermissions } = require('../middleware/authentication');

const { getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword } = require('../controllers/userController')

router.route('/').get(authenticateUser, authorizePermissions('admin', 'owner'), getAllUsers)
router.route('/showMe').get(authenticateUser, showCurrentUser)
router.route('/updateUser').patch(authenticateUser, updateUser)
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword)
// :id must be at the bottom for the way routes are set up. for instance, '/updateUser' will
// check for updateUser as an id if the '/:id' route is before it
router.route('/:id').get(authenticateUser, getSingleUser)

module.exports = router