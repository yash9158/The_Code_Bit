const express = require("express");
const router = express.Router();
const users = require("../models/users");
const md5 = require("md5");

router.use(express.urlencoded({ extended: true }));

router.get("/", async (req, res) => {
  res.render("../views/login.ejs", { error: "" });
});

router.post("/", async (req, res) => {
  let exists = await isExists(req.body);
  if (exists) {
    console.log("user exits");
    req.session.isAuth = true;
    req.session.username = req.body.username;
    console.log("session saved with session id : " + req.session.id);
    return res.redirect("/home");
  } else
    res.render("../views/login.ejs", { error: "Username or password invalid" });
});

async function isExists(body) {
  let uname = body.username;
  let hash_password = await md5(body.password);
  let c = await users.count({ username: uname, password: hash_password });
  return c > 0;
}

module.exports = router;
