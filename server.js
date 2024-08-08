const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const env = require("dotenv");
const userRouter = require("./routes/userRouter");
const AdminRouter = require("./routes/adminRouter");
const swap = require("./routes/swap");
const friend =require("./routes/friend");
const post=require("./routes/postRouter");

env.config();

const Port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

app.use("/api", userRouter);
app.use("/admin", AdminRouter);
app.use("/swap", swap);
app.use("/api", friend);
app.use("/api",post);


require("./db/connection");
app.listen(Port, () => console.log(`server started at PORT:${Port}`));