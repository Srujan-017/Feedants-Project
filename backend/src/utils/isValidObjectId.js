const mongoose = require('mongoose');

/**
 * mongoose.Types.ObjectId.isValid() alone accepts any 12-character
 * string (it can be built from raw bytes), which would let a malformed
 * ID sneak past validation and cause a confusing CastError deeper in
 * the stack. Requiring the standard 24-character hex form as well
 * closes that gap.
 */
function isValidObjectId(id) {
  return (
    typeof id === 'string' &&
    /^[a-fA-F0-9]{24}$/.test(id) &&
    mongoose.Types.ObjectId.isValid(id)
  );
}

module.exports = isValidObjectId;
