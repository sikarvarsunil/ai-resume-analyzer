const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")
const authRouter = require("./routes/auth.routes.js")
const interviewRouter = require("./routes/interview.routes.js")

const app = express();
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app