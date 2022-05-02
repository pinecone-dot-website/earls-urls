import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
const exp_hbs = require("express-handlebars"),
  flash = require("@rackandpinecone/express-flash"),
  git = require("git-rev-sync"),
  passport = require("passport"),
  session = require("cookie-session"),
  app = express();

import { Strategy as LocalStrategy } from "passport-local";
import User from "./models/user";

require("dotenv").config();

// have POST data in req.body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

// use sessions and flash data
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
  })
);

// passport config
passport.use(new LocalStrategy(User.authenticateLocal));
app.use(passport.initialize());
app.use(passport.session());

// user info to sessions
passport.serializeUser((user: number, done) => {
  console.log("serializing user", user);
  done(null, user);
});

passport.deserializeUser(function (obj: number, done) {
  console.log("deserializing obj", obj);
  done(null, obj);
});

// called on all requests
app.use(async (req: Request, res: Response, next: NextFunction) => {
  // user data on all routes
  res.locals.user = await User.findByID(req.user)
    .then((user) => {
      return user?.toJSON();
    })
    .catch((e) => {
      return false;
    });

  console.log("locals", res.locals.user);
  // show git tag in footer
  res.locals.version = git.tag();

  next();
});

// templates
app.set("views", __dirname + "/../views/");
app.engine(
  "hbs",
  exp_hbs.engine({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: {
      json: function (context) {
        return JSON.stringify(context);
      },
    },
  })
);
app.set("view engine", "hbs");

// serve assets in /public
app.use("/static", express.static("public"));

// recognize ssl from proxy
app.set("trust proxy", true);

// routes
const { api_router } = require("./controllers/api");
const main_controller = require("./controllers/main");
const { user_router } = require("./controllers/user");

app.use("/", main_controller);
app.use("/u", user_router);
app.use("/api", api_router);

app.all("*", (req: Request, res: Response) => {
  res.status(404).render("404", {});
});

app.listen(process.env.PORT, function () {
  console.log("Listening on port " + process.env.PORT);
});
