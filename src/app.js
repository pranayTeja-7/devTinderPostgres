const express = require("express");
const cookie_parser = require("cookie-parser");
const {pool} = require("./config/database");
const auth_router = require("./routes/auth");
const profile_router = require("./routes/profile");
const connection_router = require("./routes/connection");
const user_router = require("./routes/user");

const app = express();

app.use(express.json());
app.use(cookie_parser());

app.use("/auth", auth_router);
app.use("/profile", profile_router);
app.use("/connection", connection_router);
app.use("/user", user_router);

app.listen(6000, () => {
    console.log("server listening on port 6000");
})
