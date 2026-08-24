const bcrypt = require("bcrypt");

const check_password = async (password, password_hash) => {
    const check = await bcrypt.compare(password, password_hash);
    return check;
}

module.exports = {check_password};