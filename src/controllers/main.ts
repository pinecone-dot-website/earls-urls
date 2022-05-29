import HTTPError from '../classes/http_error';
import express, { NextFunction } from 'express';
import git_tag from '../middleware/git_tag';
import http_user from '../middleware/http_user';
import Earl from '../models/earl';
const mainRouter = express.Router();

// index
function index(req: express.Request, res: express.Response) {
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
}

mainRouter.all(
  '/',
  [git_tag, http_user],
  index,
);

// post to shorten url from index
function shorten(req: express.Request, res: express.Response) {
  Earl.insert(req.body.url, res.locals.user.id)
    .then((row: EarlRow) => {
      Earl.get_shortlink(row.id, req.get('Host'), req.secure).then(
        (earl: ShortEarl) => {
          res.render('shorten', {
            input_url: row.url,
            short_url: earl.short_url,
          });
        },
      );
    })
    .catch((err) => {
      req.flash('error', err.message);
      req.flash('input_url', req.body.url);

      return res.redirect('/?url-error');
    });
}

mainRouter.post(
  '/shorten',
  [git_tag, http_user],
  shorten,
);

// lookup shortened url and redirect
async function shortURL(req: express.Request, res: express.Response, next: NextFunction) {
  const short = req.params.short;
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
}

mainRouter.get(
  '/:short',
  [git_tag, http_user],
  shortURL,
);

// lookup shortened url and show info
function shortURLInfo(req: express.Request, res: express.Response, next: NextFunction) {
  const short = req.params.short;

  Earl.getByShortID(short)
    .then(async (row) => {
      res.render('info', {
        short: short,
        earl: await Earl.get_shortlink(row.id, req.get('Host'), req.secure),
        row: row.toJSON(),
      });
    })
    .catch((err: HTTPError | Error) => {
      if (err instanceof HTTPError) {
        return res.status(err.status).render('error', {
          message: err.message,
        });
      }

      // illegal character / passthru
      next();
    });
}

mainRouter.get(
  '/:short/info',
  [git_tag, http_user],
  shortURLInfo,
);

function notFound(req: express.Request, res: express.Response) {
  res.status(404).render('404', {});
}
mainRouter.all('*', [git_tag, http_user], notFound);

export default mainRouter;
