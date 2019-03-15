var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());
var PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//global variables
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

const users = { 
  "user1": {
    id: "user1", 
    email: "user@example.com", 
    password: "pass"
  },
  "user2": {
    id: "user2", 
    email: "banabatshon@hotmail.com", 
    password: "hhhhh"
  }
}

//global functios
function generateRandomString() {
  var string = "";
  var options = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    string += options.charAt(Math.floor(Math.random() * options.length));
  return string;
}

function findEmail(emailToFind) {
  for (let user in users) {
    if (users[user]["email"] === emailToFind) {
      return users[user];
    }
  }
}

//urls
app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`)
});

//create a new url
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

//create a new short url
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});
app.post("/urls/:shortURL", (req, res) => {
  const updatedURL =req.body.updatedURL
  urlDatabase[req.params.shortURL] = updatedURL;
  res.redirect("/urls");
});

//delete a url
app.get("/urls/:shortURL/delete", (req, res) => {
  res.redirect("/urls")
});
app.post("/urls/:shortURL/delete", (req, res) => {
  const toBeDeleted = req.params.shortURL;
  delete urlDatabase[toBeDeleted];
  res.redirect("/urls")
});

//redirect the user to the actual website of the short url
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//login the user
app.get("/login", (req,res) => {
  let templateVars = {user: ""}
  res.render("login", templateVars);
});
app.post("/login", (req,res) => {
  const user = findEmail(req.body.email);
  if (user === undefined || user.password !== req.body.password) {
    res.status(403).send();
  } else {
    res.cookie("user_id", user["id"])
    res.cookie("email",req.body.email);
    res.redirect("/urls");
  }
});

//logout the user
app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect("/urls/new");
});

//register a new user
app.get("/register", (req, res) => {
  let templateVars = {user: ""}
    res.render("urls_registration", templateVars)
});

app.post("/register", (req,res) => {
  //checks for errors in input
  if (req.body.email === "" || req.body.password === "" || findEmail(req.body.email)) {
    res.status(400).send();
  } else {
    // adds a new user to the users object
    const userRandomId = generateRandomString();
    users[userRandomId] = {id: userRandomId, email: req.body.email, password: req.body.password};
    res.cookie("user_id", userRandomId);
    res.cookie("user", users[userRandomId]);
    res.redirect("/urls")
  }
});

//listen to the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});