var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());
var PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//global variables
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "users1" }
};

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

//global functions
function generateRandomString() {
  var string = "";
  var options = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    string += options.charAt(Math.floor(Math.random() * options.length));
  return string;
}

//returns the user object
function findEmail(emailToFind) {
  for (let user in users) {
    if (users[user]["email"] === emailToFind) {
      return users[user];
    }
  }
}

function urlsForUser (id) {
  const userUrlDatabase = {};
  for (url in urlDatabase) {
    if (urlDatabase[url]["userID"] === id) {
      userUrlDatabase[url] = {"longURL": urlDatabase[url]["longURL"], "userID": id}
    }
  }
return userUrlDatabase;
}

// show MyUrls
app.get("/", (req, res) => {
  return res.redirect("/urls");
});
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  // returns userUrlDatabase
  if (user) {
    const userUrlDatabase = urlsForUser(user.id);
    let templateVars = { urls: userUrlDatabase, user: user };
    return res.render("urls_index", templateVars);
  }
  else {
    return res.redirect("/login");
  }
});

// create a new short url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const user = users[req.cookies["user_id"]];
  urlDatabase[shortURL]= {"longURL":req.body.longURL,"userID": user.id }
  // urlDatabase[shortURL]["useID"] = user
  console.log(urlDatabase[shortURL]);
  return res.redirect(`/urls/${shortURL}`)
});

//create a new url
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  if (templateVars["user"]) {
    res.render("urls_new", templateVars);
  } else {
    return res.redirect("/login")
  }
});

// update a short url
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL]["longURL"], user: users[req.cookies["user_id"]] };
  return res.render("urls_show", templateVars);
});
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const updatedURL =req.body.updatedURL;
  const userID = users[req.cookies["user_id"]]["id"];
  if (urlDatabase[shortURL]["userID"] === userID ) {
    urlDatabase[shortURL]["longURL"] = updatedURL;
  }
  console.log("updateUrl")
  console.log(urlDatabase);
  return res.redirect("/urls");
});

//delete a url
app.get("/urls/:shortURL/delete", (req, res) => {
  res.redirect("/urls")
});
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  const toBeDeleted = shortURL;
  const user = users[req.cookies["user_id"]];
  if (urlDatabase[shortURL]["userID"] === user.id ) {
    delete urlDatabase[toBeDeleted];
  }
  return res.redirect("/urls")
});

//redirect the user to the actual website of the short url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  if (urlDatabase[shortURL]) {
    let longURL = urlDatabase[shortURL]["longURL"];
    return res.redirect(longURL);
  } else {
    return res.status(404).send();
  }
    
});

//login the user
app.get("/login", (req,res) => {
  let templateVars = {user: ""}
  return res.render("login", templateVars);
});
app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findEmail(email);
  if (user === undefined || !bcrypt.compareSync(password, user["password"])) {
    return res.status(403).send();
  } else {
    res.cookie("user_id", user["id"])
    res.cookie("email",email);
    res.redirect("/urls");
  }
});

//logout the user
app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  return res.redirect("/urls/new");
});

//register a new user
app.get("/register", (req, res) => {
  let templateVars = {user: ""}
    return res.render("urls_registration", templateVars)
});

app.post("/register", (req,res) => {
  //checks for errors in input
  if (req.body.email === "" || req.body.password === "" || findEmail(req.body.email)) {
    return res.status(400).send();
  } else {
    // adds a new user to the users object
    const userRandomId = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[userRandomId] = {id: userRandomId, email: email, password: hashedPassword};
    res.cookie("user_id", userRandomId);
    res.cookie("user", users[userRandomId]);
    res.redirect("/urls")
  }
});

//listen to the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});