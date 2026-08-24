const express = require("express");
const { auth } = require("../middleware/auth");
const {get_connections, get_connection_requests, user_feed} = require("../controllers/user");

const user_router = express.Router();


user_router.get("/connections", auth, get_connections);

user_router.get("/requests", auth, get_connection_requests);

user_router.get("/feed", auth, user_feed);

module.exports = user_router;