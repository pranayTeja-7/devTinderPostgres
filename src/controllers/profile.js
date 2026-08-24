const { pool } = require("../config/database");
const {updateProfile_query_string} = require("../utils/query_string");
const bcrypt = require("bcrypt");
const {check_password} = require("../utils/password");

const get_profile = (req, res) => {
    try{
        const {password, ...user} = req.user;
        res.json({
            message: "user fetched successfully",
            user,
        })
    }
    catch(err){
        console.log(err);
        res.status(400).json({error : err.message});
    }
}


const update_profile = async (req, res) => {
    try{
        const user = req.user;
        const validated_data = req.value;
        
        const {query_string, validated_data_values} = updateProfile_query_string(validated_data);

        validated_data_values.push(user.id);

        const result = await pool.query(query_string, validated_data_values);

        // console.log(result);

        const {password, ...updated_profile} = result.rows[0];

        res.json({
            message: "profile updated successfully",
            updated_profile,
        })
    }
    catch(err){
        console.log(err);
        res.status(400).json({error : err.message});
    }

}


const change_password = async (req, res) => {
    try{
        const user = req.user;
        const validated_data = req.value;

        const {password, new_password} = validated_data;

        const check = await check_password(password, user.password);

        if(!check){
            return res.status(401).json({message : "current password did not match"});
        }

        if(password === new_password){
            return res.status(400).json({message : "new password must be different from the current password"});
        }

        const new_password_hash = await bcrypt.hash(new_password, 10);
        
        const result = await pool.query("update users set password = $1 where id = $2", [new_password_hash, user.id]);

        res.json({message : "password updated successfully"});
    }
    catch(err){
        console.log(err);
        res.status(400).json({error : err.message});
    }
}


module.exports = {get_profile, update_profile, change_password};