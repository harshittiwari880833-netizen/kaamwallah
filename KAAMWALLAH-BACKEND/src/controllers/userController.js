const UserModel = require('../models/User');
const R = require('../utils/response');

/**
 * GET /users/me
 * Get authenticated user's profile
 */
exports.getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return R.notFound(res, 'User not found');
    return R.success(res, { user });
  } catch (err) {
    return R.serverError(res, err);
  }
};

/**
 * PATCH /users/me
 * Update own profile (name, language)
 */
exports.updateMe = async (req, res) => {
  try {
    const updated = await UserModel.update(req.user.id, req.body);
    if (!updated) return R.error(res, 'Nothing to update', 400);
    return R.success(res, { user: updated }, 'Profile updated');
  } catch (err) {
    return R.serverError(res, err);
  }
};
