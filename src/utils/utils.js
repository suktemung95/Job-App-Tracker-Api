const bcrypt = require("bcrypt");

async function hashPassword(password) {
  const passwordHash = await bcrypt.hash(password, 10);
  return passwordHash;
}
async function comparePassword(user, testPassword) {
  const isValid = await bcrypt.compare(testPassword, user.password_hash);
  return isValid;
}

module.exports = {
  hashPassword,
  comparePassword,
};
