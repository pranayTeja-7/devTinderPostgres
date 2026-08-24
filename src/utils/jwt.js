const jwt = require("jsonwebtoken");

const getJWT = (user) =>  {
    const token = jwt.sign({user_id : user.id}, "sfdfddkde", {expiresIn: "7d"});

    return token;
}

module.exports = {getJWT};