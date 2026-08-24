const jwt = require("jsonwebtoken");
const {pool} = require("../config/database");

const auth = async (req, res, next) => {
    const {token} = req.cookies;

    if(!token){
        return res.status(401).json({message: "Invalid token. Please login"});
    }
    const decoded_obj = jwt.verify(token, "sfdfddkde");

    const {user_id} = decoded_obj;

    const result = await pool.query("select * from users where id = $1", [user_id]);

    const user = result.rows[0];

    if(!user){
        return res.status(404).json({message: "user not found"});
    }

    req.user = user;

    next();
}


module.exports = {auth};
