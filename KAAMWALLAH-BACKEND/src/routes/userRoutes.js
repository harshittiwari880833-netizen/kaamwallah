const router = require('express').Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validators');

/**
 * @route  GET /api/users/me
 * @desc   Get own profile
 * @access Private
 */
router.get('/me', authenticate, userController.getMe);

/**
 * @route  PATCH /api/users/me
 * @desc   Update own profile
 * @access Private
 */
router.patch(
  '/me',
  authenticate,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('language').optional().isIn(['en', 'hi']),
  ],
  validate,
  userController.updateMe
);

module.exports = router;
