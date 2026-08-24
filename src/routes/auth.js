const express = require("express");

const auth_router = express.Router();

const {signup_validation, login_validation} = require("../middleware/validation");

const {signup, login, logout} = require("../controllers/auth");

const {auth} = require("../middleware/auth");

auth_router.post("/signup",signup_validation, signup);

auth_router.post("/login", login_validation, login);

auth_router.post("/logout", logout);



module.exports = auth_router;