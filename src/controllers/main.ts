import HTTP_Error from "../classes/http_error";
import express, { Request, Response } from "express";
import Earl from "../models/earl";
const router = express.Router();

// index
router.all("/", (req: Request, res: Response) => {
  return res.render("home", {
    error: req.flash("error"),
    username: req.flash("username"),
    password: req.flash("password"),
  });
});

// post to shorten url from index
router.post("/shorten", (req: Request, res: Response) => {
  Earl.insert(req.body.url, req.user)
    .then(async (row) => {
      await Earl.get_shortlink(row.id, req.get("Host"), req.secure).then(
        (short_url) => {
          return res.render("shorten", {
            input_url: row.url,
            short_url: short_url,
          });
        }
      );
    })
    .catch((err) => {
      return res.status(err.status).render("error", {
        message: err.message,
      });
    });
});

// lookup shortened url and redirect
router.get("/:short", async (req: Request, res: Response) => {
  const short = req.params.short;

  await Earl.get_by_shortid(short)
    .then((row) => {
      return res.redirect(row.url);
    })
    .catch((err: HTTP_Error) => {
      return res.status(err.status).render("error", {
        message: err.message,
      });
    });
});

// lookup shortened url and show info
router.get("/:short/info", (req: Request, res: Response) => {
  const short = req.params.short;

  Earl.get_by_shortid(short)
    .then((row) => {
      return res.render("info", {
        short: short,
        row: row.dataValues,
      });
    })
    .catch((err: HTTP_Error) => {
      return res.status(err.status).render("error", {
        message: err,
      });
    });
});

module.exports = router;
