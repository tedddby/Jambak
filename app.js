const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const hbs = require("hbs");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const rootRouter = require("./router/root");
const apiRouter = require("./router/api");

const app = express();

app.set("trust proxy", true);
app.set("view engine", "hbs");

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use("/", rootRouter);
app.use("/api", apiRouter);


app.get("*", (req, res) => {
    return res.send("Not Found!");
})

app.listen(2000,(err) => {
    if(err) throw err;
    else{
        console.log("app running");
    }
})