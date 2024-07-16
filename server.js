const express = require('express');
const app = express();
const mongoose = require("mongoose");

const loginRouter = require("./routes/login");
const signupRouter = require("./routes/signup");
const homeRouter = require("./routes/home");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const bodyParser = require('body-parser');
const users = require("./models/users");

const url = "mongodb+srv://ashok:ashok20032001@cluster0.zmvrzcr.mongodb.net/code_editor?retryWrites=true";
const dbName = "code_editor";
// const dbUrl = url + dbName;
const port = process.env.PORT || 8080;
const expire_duration = 7 * 60 * 60 * 1000;

main().catch((err) => console.log(err));

async function main()
{
  app.listen(port, (err) => {
    if (err) throw err;
    console.log("Listening on " + port);
  });

  var store = new MongoDBStore({
    uri: url,
    collection: "mySessions",
  });

  store.on("error", function (error) {
    console.log(error);
  });

  app.use(
    session({
      secret: "secert/key for signing cookie",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: expire_duration },
      store: store,
    })
  );

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

  app.use(express.static(__dirname + "/public"));
  app.set("view engine", "ejs");
  app.use("/login", loginRouter);
  app.use("/signup", signupRouter);
  app.use("/home", homeRouter);
  //root
  app.get("/", (req, res) => {
    res.redirect('/home');
  });

  mongoose.connect(url);
  const con = mongoose.connection;
  con.on("error", (err) => {
    throw err;
  });
  con.once("open", () => console.log("Connected to " + dbName));
}