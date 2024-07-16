const { json } = require("express");
const express = require("express");
const router = express.Router();
const users = require("../models/users");
const fs = require('fs').promises;
const path = require('path');
const exec  = require('child_process').exec;

let max_time = 2000;
var lang_map = {
  c :{file_name : 'run.c',needBuild : true,build_cmd : 'gcc run.c -o run_c',run_cmd : './run_c'},
  cpp : {file_name : 'run.cpp',needBuild : true,build_cmd : 'g++ run.cpp -o run',run_cmd : './run'},
  py: {file_name : 'run.py',needBuild : false,run_cmd : 'python run.py'},
  js : {file_name : 'run.js',needBuild : false,run_cmd : 'node run.js'}};

const isAuth = (req, res, next) => {
  if (req.session.isAuth) next();
  else res.redirect("/login");
};

router.get("/", isAuth, async (req, res) => {
  let username = req.session.username;
  let user = await users.findOne({ username: username });
  res.render("../views/home.ejs", {
    username: username,
    name: user.name,
    codes: user.data.codes
  });
});


router.post("/delete",isAuth,async(req,res)=>{
    let filename = req.body.filename;
    let user = await users.findOne({username: req.session.username});
    let codes = user.data.codes;
    codes = codes.filter(function(c) {
      return c.filename !== filename
    });
    user.update({'data' : {'codes' : codes} },function (err, result) {
      if (err){
          console.log(err)
      }else{
          console.log("Result :", result) 
      }
  });
     res.redirect('/home');
});


router.post("/save",isAuth,async(req,res)=>{
  console.log(req.body);
  let user = await users.findOne({username: req.session.username});
  let codes = user.data.codes;
  let filename = req.body.name+'.'+req.body.lang;
  let done = false;
  for(let i=0;i<codes.length;i++)
  {
      if(codes[i].filename == filename)
        codes[i].code = req.body.code,done = true;
  }
  if(!done)
  {
    codes.push({filename : filename,name:req.body.name,lang:req.body.lang,code:req.body.code});
  }
  user.update({'data' : {'codes' : codes} },function (err, result) {
    if (err){
        console.log(err)
    }else{
        console.log("Result :", result) 
    }
});
   res.json({'done':true});
});
    
router.get("/code", isAuth, async (req, res) => {
    if(req.query.file)
    {
      let filename = req.query.file
      let user = await users.findOne({username : req.session.username});
      let obj = user.data.codes.find(o => o.filename === filename);
      res.render("../views/code.ejs", {
          code: obj.code,
          name: obj.name,
          lang: obj.lang,
        });
    }
    else
    {
      res.render("../views/code.ejs", { 
        code: '#include<iostream>\nusing namespace std;\nint main()\n{\n\treturn 0;\n}',
        name: 'new',
        lang: 'cpp'
      });
    }
});

router.get("/logout", isAuth, async (req, res) => {
  req.session.isAuth = false;
  res.redirect("/login");
});


router.post('/code/run',async(req,res)=>{
  console.log(req.body);
  await runFile(req.body.code,req.body.input,req.body.lang,res,showOutput);
})

async function saveFile(content,filename)
{
    await fs.writeFile(filename, content, err => {
        if (err) {
            console.error(err);
          return;
        }
      });
}

async function runFile(code,input,lang,res,cb)
{
  let file_name = lang_map[lang].file_name;
  let needBuild = lang_map[lang].needBuild;
  let run_cmd = lang_map[lang].run_cmd;
  await saveFile(code,file_name);
  if(needBuild)
  {
      exec(lang_map[lang].build_cmd,(err)=>{
        if(err) return cb(res,err.message);
        else
        {
          var run = exec(run_cmd,{timeout:max_time},(err)=>{if(err) return cb(res,err.message);});
          run.stdin.setEncoding('utf-8');
          run.stdin.write(input);
          run.stdout.on('data',data => {return cb(res,data)});
          run.stderr.on('data',data => {return cb(res,data)});
          run.stdin.end();
        }
      });
  }
  else
  {
      var run = exec(run_cmd,{timeout:max_time},(err)=>{if(err) return cb(res,err.message);});
      run.stdin.setEncoding('utf-8');
      run.stdin.write(input);
      run.stdout.on('data',data => {return cb(res,data)});
      run.stderr.on('data',data => {return cb(res,data)});
      run.stdin.end();
  }
}

async function showOutput(res,output)
{
  console.log(output);
  res.end(JSON.stringify({output : output}));
}


module.exports = router;
