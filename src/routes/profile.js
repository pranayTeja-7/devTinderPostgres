const express = require('express');

const profile_router = express.Router();

const {auth} = require("../middleware/auth");

const {get_profile, update_profile, change_password} = require("../controllers/profile");
const { update_profile_validation, change_password_validation } = require('../middleware/validation');


profile_router.get("/", auth, get_profile);

profile_router.patch("/", auth, update_profile_validation, update_profile);

profile_router.patch("/change-password", auth, change_password_validation, change_password)

module.exports = profile_router;