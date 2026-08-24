const express = require("express");
const { auth } = require("../middleware/auth");

const {send_connection_request_validation, review_connection_request_validation} = require("../middleware/connection_request_validation");
const {send_connection_request, review_connection_request} = require("../controllers/connection");

const connection_router = express.Router();


connection_router.post("/send/:status/:to_userid", auth, send_connection_request_validation, send_connection_request);

connection_router.post("/review/:status/:from_userid", auth, review_connection_request_validation, review_connection_request);

module.exports = connection_router;