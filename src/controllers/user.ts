import HTTP_Error from "classes/http_error";
import express, { Request, Response } from "express";
import Earl from "../models/earl";

const user_router = express.Router(),
  User = require("../models/user");

// process login / register form
async function user_auth(req: Request, res: Response) {
  if (req.body.login) {
    await User.login(req.body.username, req.body.password)
      .then((user_id) => {
        req.login(user_id, (err) => {
          return res.redirect("/?login-success");
        });
      })
      .catch((err: HTTP_Error) => {
        req.flash("error", err.message);
        req.flash("username", req.body.username);
        req.flash("password", req.body.password);

        return res.redirect("/?login-error");
      });
  } else if (req.body.register) {
    await User.create(req.body.username, req.body.password)
      .then((user_id: number) => {
        req.login(user_id, (err) => {
          return res.redirect("/?register-create");
        });
      })
      .catch((err: Error) => {
        console.log("register err", err);
        req.flash("error", err.message);
        req.flash("username", req.body.username);
        req.flash("password", req.body.password);

        return res.redirect("/?register-error");
      });
  } else {
    return res.redirect("/?auth-error");
  }
}
user_router.post("/auth", user_auth);

// log user out
function user_logout(req: Request, res: Response) {
  req.logout();
  return res.redirect("/?logout");
}
user_router.all("/logout", user_logout);

// user stats
function user_stats(req: Request, res: Response) {
  if (!req.user) {
    return res.redirect("/");
  }

  User.get_urls_by_user(req.user)
    .then(async (rows) => {
      rows = await Promise.all(
        rows.map((row) => {
          return Earl.get_shortlink(row.id, req.get("Host"), req.secure).then(
            (short_url) => {
              return {
                short: short_url,
                long: row.url,
                timestamp: new Date(row.createdAt).toLocaleString(),
              };
            }
          );
        })
      );

      res.render("user-stats", {
        earls: rows,
      });
    })
    .catch((err: Error) => {
      return res.status(500).render("error", {
        message: err.message,
      });
    });
}
user_router.get("/stats", user_stats);

module.exports = {
  user_router,
  user_auth,
  user_logout,
  user_stats,
};
