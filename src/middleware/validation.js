const Joi = require("joi");
const { sign } = require("jsonwebtoken");
const { signup } = require("../controllers/auth");



const user_schema = Joi.object({

    first_name : Joi.string().min(3).max(30).trim().alter({
        signup : schema => schema.required(),
        login: schema => schema.forbidden(),
        update_profile: schema => schema.optional(),  
        change_password: schema => schema.forbidden(),
    }),

    last_name : Joi.string().min(3).max(30).trim().alter({
        signup: schema => schema.optional(),
        login: schema => schema.forbidden(),
        update_profile: schema => schema.optional(),  
        change_password: schema => schema.forbidden(),
    }),

    age : Joi.number().integer().min(18).alter({
        signup : schema => schema.required(),
        login : schema => schema.forbidden(),
        update_profile: schema => schema.optional(),  
        change_password: schema => schema.forbidden(),
    }),

    gender : Joi.string().valid("male", "female", "other").trim().alter({
        signup : schema => schema.required(),
        login : schema => schema.forbidden(),
        update_profile: schema => schema.optional(),  
        change_password: schema => schema.forbidden(),
    }),

    emailId : Joi.string().email().required().trim().alter({
        update_profile: schema => schema.forbidden(), 
        change_password: schema => schema.forbidden(),
    }),


    password : Joi.string().required().alter({
        signup : schema => schema.min(8).pattern(/[a-z]/).pattern(/[A-Z]/).pattern(/[0-9]/).pattern(/[^a-zA-Z0-9]/),
        update_profile: schema => schema.forbidden(), 
    }),

    about : Joi.string().max(300).trim().alter({
        signup: schema => schema.optional(),
        login: schema => schema.forbidden(),
        update_profile: schema => schema.optional(),  
        change_password: schema => schema.forbidden(),
    }),

    new_password : Joi.string().required().alter({
        change_password : schema => schema.min(8).pattern(/[a-z]/).pattern(/[A-Z]/).pattern(/[0-9]/).pattern(/[^a-zA-Z0-9]/),
        update_profile: schema => schema.forbidden(), 
        signup : schema => schema.forbidden(),
        login : schema => schema.forbidden(),
    }),

})

const signup_schema = user_schema.tailor("signup");

const login_schema = user_schema.tailor("login");

const update_profile_schema = user_schema.tailor("update_profile").min(1);

const change_password_schema = user_schema.tailor("change_password").min(2).max(2);

const signup_validation = (req, res, next) => {
    const {error, value} = signup_schema.validate(req.body);

    if(error){
        return res.status(400).json({message : error.message});;
    }

    req.value = value;
    
    next();
}


const login_validation = (req, res, next) => {
    const {error, value} = login_schema.validate(req.body);

    if(error){
        return res.status(400).json({message : error.message});;
    }

    req.value = value;

    next();
}

const update_profile_validation = (req, res, next) => {
    const {error, value} = update_profile_schema.validate(req.body);

    if(error){
        return res.status(400).json({message : error.message});;
    }

    req.value = value;

    next();
}

const change_password_validation = (req, res, next) => {
    const {error, value} = change_password_schema.validate(req.body);

    if(error){
        return res.status(400).json({message : error.message});;
    }

    req.value = value;

    next();
}



module.exports = {signup_validation, login_validation, update_profile_validation, change_password_validation};