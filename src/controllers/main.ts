import HTTP_Error from "../classes/http_error";
import express, { NextFunction, Request, Response } from "express";
import git_tag from "../middleware/git_tag";
import http_user from "../middleware/http_user";
import Earl from "../models/earl";
const main_router = express.Router();

// index
main_router.all("/", [git_tag, http_user], (req: Request, res: Response) => {
  console.log("req.rawHeaders", req.rawHeaders);
  const vars = {
    error: req.flash("error"),
    input_url: req.flash("input_url"),
    username: req.flash("username"),
    password: req.flash("password"),
    toggle: "",
  };

  if (vars.username.length || vars.password.length) {
    vars.toggle = "show";
  }

  return res.render("home", vars);
});

// post to shorten url from index
main_router.post("/shorten", [git_tag, http_user], (req: Request, res: Response) => {
  Earl.insert(req.body.url, res.locals.user.id)
    .then((row) => {
      Earl.get_shortlink(row.id, req.get("Host"), req.secure).then(
        (earl: ShortEarl) => {
          return res.render("shorten", {
            input_url: row.url,
            short_url: earl.short_url,
          });
        }
      );
    })
    .catch((err) => {
      req.flash("error", err.message);
      req.flash("input_url", req.body.url);

      return res.redirect("/?url-error");
    });
});

// lookup shortened url and redirect
main_router.get(
  "/:short",
  [git_tag, http_user],
  async (req: Request, res: Response, next: NextFunction) => {
    const short = req.params.short;
    console.log("short", short);
    Earl.get_by_shortid(short)
      .then((row) => {
        return res.redirect(row.url);
      })
      .catch((err: HTTP_Error | Error) => {
        // console.log("err", err instanceof HTTP_Error);
        if (err instanceof HTTP_Error) {
          return res.status(err.status).render("error", {
            message: err.message,
          });
        }

        // illegal charactr / passthru
        next();
      });
  }
);

// lookup shortened url and show info
main_router.get(
  "/:short/info",
  [git_tag, http_user],
  (req: Request, res: Response, next: NextFunction) => {
    const short = req.params.short;

    Earl.get_by_shortid(short)
      .then(async (row) => {
        return res.render("info", {
          short: short,
          earl: await Earl.get_shortlink(row.id, req.get("Host"), req.secure),
          row: row.dataValues,
        });
      })
      .catch((err: HTTP_Error | Error) => {
        if (err instanceof HTTP_Error) {
          return res.status(err.status).render("error", {
            message: err.message,
          });
        }

        // illegal charactr / passthru
        next();
      });
  }
);

export default main_router;
