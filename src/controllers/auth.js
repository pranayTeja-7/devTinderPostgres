const bcrypt = require("bcrypt");

const {pool} = require("../config/database");

const {getJWT} = require("../utils/jwt");

const {check_password} = require("../utils/password");

const {signup_query_string} = require("../utils/query_string");
const { date } = require("joi");

const signup = async (req, res) => {
    try{
        const validated_data = req.value;
        
        const password_hash = await bcrypt.hash(validated_data.password, 10);
        
        validated_data.password = password_hash;
        
        const {query_string, validated_data_values} = signup_query_string(validated_data)
       
        const result = await pool.query(query_string, validated_data_values);
        
        const {password, ...user} = result.rows[0];
       
        res.json({
            message: "signup successfull",
            user,
        })
    }
    catch(err){
        console.log(err);
        if(err.code === "23505" && err.constraint === "users_emailid_key"){
            return res.status(409).json({message: "An account with this email-id aldready exists"});
        }
        res.status(400).json({error : err.message});
    }

}

const login = async(req, res) => {
    try{
        const validated_data = req.value;

        const {emailId, password} = validated_data;

        const result = await pool.query("select * from users where emailId = $1", [emailId]);

        if(result.rows.length === 0){
            return res.status(401).json({message: "invalid credentials"});
        }

        const user = result.rows[0];

        const check = await check_password(password, user.password);

        if(!check){
            return res.status(401).json({message: "invalid credentials"});
        }

        const token = getJWT(user);

        res.cookie("token", token, {expires: new Date((Date.now() + 7*24*60*60*1000))});

        res.json({
            message: "login successfull",
        })
        
    }
    catch(err){
        console.log(err);
        res.status(400).json({error : err.message});
    }
}


const logout = async (req, res) => {

    res.cookie("token", null, {expires : new Date(Date.now())});
    res.json({message: "logout successful"});

}


module.exports = {signup, login, logout}