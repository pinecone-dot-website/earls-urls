import HTTPError from '../classes/http_error';
import express, { NextFunction } from 'express';
import git_tag from '../middleware/git_tag';
import http_user from '../middleware/http_user';
import Earl from '../models/earl';
const mainRouter = express.Router();

// index
mainRouter.all(
  '/',
  [git_tag, http_user],
  (req: express.Request, res: express.Response, next: NextFunction) => {
    console.log('req.rawHeaders', req.rawHeaders);
    const vars = {
      error: req.flash('error'),
      input_url: req.flash('input_url'),
      username: req.flash('username'),
      password: req.flash('password'),
      toggle: '',
    };

    if (vars.username.length || vars.password.length) {
      vars.toggle = 'show';
    }

    res.render('home', vars);
    next();
  },
);

// post to shorten url from index
mainRouter.post(
  '/shorten',
  [git_tag, http_user],
  (req: express.Request, res: express.Response, next:NextFunction) => {
    Earl.insert(req.body.url, res.locals.user.id)
      .then((row: EarlRow) => {
        Earl.get_shortlink(row.id, req.get('Host'), req.secure).then(
          (earl: ShortEarl) => {
            res.render('shorten', {
              input_url: row.url,
              short_url: earl.short_url,
            });

            next();
          },
        );
      })
      .catch((err) => {
        req.flash('error', err.message);
        req.flash('input_url', req.body.url);

        return res.redirect('/?url-error');
      });
  },
);

// lookup shortened url and redirect
mainRouter.get(
  '/:short',
  [git_tag, http_user],
  async (req: express.Request, res: express.Response, next: NextFunction) => {
    const short = req.params.short;
    console.log('short', short);
    Earl.getByShortID(short)
      .then((row) => {
        return res.redirect(row.url);
      })
      .catch((err: HTTPError | Error) => {
        // console.log("err", err instanceof HTTPError);
        if (err instanceof HTTPError) {
          return res.status(err.status).render('error', {
            message: err.message,
          });
        }

        // illegal charactr / passthru
        next();
      });
  },
);

// lookup shortened url and show info
mainRouter.get(
  '/:short/info',
  [git_tag, http_user],
  (req: express.Request, res: express.Response, next: NextFunction) => {
    const short = req.params.short;

    Earl.getByShortID(short)
      .then(async (row) => {
        res.render('info', {
          short: short,
          earl: await Earl.get_shortlink(row.id, req.get('Host'), req.secure),
          row: row.toJSON(),
        });

        next();
      })
      .catch((err: HTTPError | Error) => {
        if (err instanceof HTTPError) {
          return res.status(err.status).render('error', {
            message: err.message,
          });
        }

        // illegal charactr / passthru
        next();
      });
  },
);

export default mainRouter;
