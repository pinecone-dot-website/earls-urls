import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
const exp_hbs = require("express-handlebars"),
  flash = require("@rackandpinecone/express-flash"),
  passport = require("passport"),
  session = require("cookie-session"),
  app = express(),
  swaggerJsdoc = require("swagger-jsdoc"),
  swaggerUi = require("swagger-ui-express");
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";

import User from "./models/user";

require("dotenv").config();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
//
app.use(flash());

// swagger docs
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Earls Urls",
      version: "0.6.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
  },
  apis: [`${__dirname}/controllers/api.js`],
};
const specs = swaggerJsdoc(options);

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

// use sessions and flash data
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
  })
);

// passport config
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    User.authenticateJWT
  )
);
passport.use(new LocalStrategy(User.authenticateLocal));
app.use(passport.initialize());
app.use(passport.session());

// user info to sessions
passport.serializeUser((user: Express.User, done) => {
  // console.log("serializing user", user);
  done(null, user.id);
});

passport.deserializeUser(function (user_id: number, done) {
  // console.log("deserializing user_id", user_id);
  User.findByID(user_id)
    .then((user) => {
      done(null, user.toJSON());
    })
    .catch((err) => {
      done(null, { id: 0, username: "" });
    });
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

// handle undefined values in response json
app.set("json replacer", (key, value) => {
  // undefined values are set to `null`
  if (typeof value === "undefined") {
    return null;
  }
  return value;
});

// routes
import api_router from "./controllers/api";
const main_controller = require("./controllers/main");
const user_router = require("./controllers/user");

app.use("/", main_controller);
app.use("/u", user_router);
app.use("/api", api_router);

app.all("*", (req: Request, res: Response) => {
  res.status(404).render("404", {});
});

export default app;
