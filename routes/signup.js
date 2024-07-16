const express = require("express");
const router = express.Router();
const users = require("../models/users");
const md5 = require("md5");

router.use(express.urlencoded({ extended: true }));

router.get("/", async (req, res) => {
  res.render("../views/signup.ejs", { error: "" });
});

router.post("/", async (req, res) => {
  let exists = await isExists(req.body);
  if (exists) {
    res.render("../views/signup.ejs", {
      error: "Username or Email already taken ",
    });
  } else {
    await insertInDb(req.body);
    return res.redirect("/login");
  }
});

async function isExists(body) {
  let uname = body.username;
  let email = body.email;
  let c = await users.count({ $or: [{ username: uname }, { email: email }] });
  return c > 0;
}

async function insertInDb(body) {
  let hash_password = await md5(body.password);
  let user = new users({
    name: body.name,
    email: body.email,
    username: body.username,
    password: hash_password,
  });
  await user.save();
  console.log("Data inserted ");
  console.log(user);
}

module.exports = router;
