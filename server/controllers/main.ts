import ExternalURL from '../classes/externalUrl';
import HTTPError from '../classes/httpError';
import express, { NextFunction } from 'express';
import git_tag from '../middleware/git_tag';
import http_user from '../middleware/http_user';
import Earl from '../models/earl';

const mainRouter = express.Router();

/**
 * GET /
 * @param req 
 * @param res 
 */
function index(req: express.Request, res: express.Response) {
  // console.log('req.rawHeaders', req.rawHeaders);
  const vars = {
    error: req.flash('error'),
    input_url: req.flash('input_url'),
    password: req.flash('password'),
    tab: null, //'url', // req.query.tab,
    toggle: '',
    username: req.flash('username'),
  };

  if (vars.username.length || vars.password.length) {
    vars.toggle = 'show';
  }

  if (req.query.tab) {
    vars.tab = req.query.tab;
  } else {
    vars.tab = 'url';
  }

  res.render('home', vars);
}

mainRouter.all(
  '/',
  [git_tag, http_user],
  index,
);

/**
 * POST /shorten
 * receive long url from index and create short link
 * @param req 
 * @param res 
 */
function shorten(req: express.Request, res: express.Response) {
  if (req.body.url?.length) {
    Earl.insertURL(req.body.url, res.locals.user.id)
      .then((row: EarlRow) => {
        Earl.getShortlink(row.id, req.get('Host'), req.secure).then(
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

        return res.redirect('/?tab=url&error=' + err.message);
      });
  } else {
    Earl.insertText(req.body.text, res.locals.user.id)
      .then((row: EarlRow) => {
        Earl.getShortlink(row.id, req.get('Host'), req.secure).then(
          (earl: ShortEarl) => {
            res.render('shorten', {
              input_url: row.url,
              short_url: earl.short_url,
            });
          },
        );
      })
      .catch((err: Error) => {
        req.flash('error', err.message);
        req.flash('input_text', req.body.text);

        return res.redirect('/?tab=text&error=' + err.message);
      });
  }
}

mainRouter.post(
  '/shorten',
  [git_tag, http_user],
  shorten,
);

/**
 * GET /:short
 * lookup shortened url and redirect
 * @param req 
 * @param res 
 * @param next 
 */
async function shortURL(req: express.Request, res: express.Response, next: NextFunction) {
  const short = req.params.short;

  Earl.getByShortID(short)
    .then((row) => {
      if (row.url?.length > 0) {
        return res.redirect(row.url);
      }

      res.send(row.toJSON());
    })
    .catch((err: HTTPError | Error) => {
      if (err instanceof HTTPError) {
        return res.status(err.status).render('error', {
          message: err.message,
        });
      }

      // illegal character / pass thru
      next();
    });
}

mainRouter.get(
  '/:short',
  [git_tag, http_user],
  shortURL,
);

/**
 * GET /:short/info
 * lookup shortened url and show info
 * @param req 
 * @param res 
 * @param next 
 */
async function shortURLInfo(req: express.Request, res: express.Response) {
  const short = req.params.short;

  Earl.getByShortID(short)
    .then(async (row) => {
      
      console.log('row', row);

      const vars = {
        display: {
          redirects: null,
        },
        earl: await Earl.getShortlink(row.id, req.get('Host'), req.secure),
        row: row.get(),
        siteData: null,
      };

      if (row.url) {
        const siteData = await new ExternalURL(row.url).getSiteData();
        vars.display.redirects = siteData.request.redirects.length > 1;
        vars.siteData = siteData;
      }

      res.render('info', vars);
    })
    .catch((err: HTTPError | Error) => {
      if (err instanceof HTTPError) {
        return res.status(err.status).render('error', {
          message: err.message,
        });
      }

      // illegal character / passthru
      // next();
      // console.log('err', err);
    });
}

mainRouter.get(
  '/:short/info',
  [git_tag, http_user],
  shortURLInfo,
);

/**
 * 
 * @param req 
 * @param res 
 */
function notFound(req: express.Request, res: express.Response) {
  res.status(404).render('404', {});
}
mainRouter.all('*', [git_tag, http_user], notFound);

export default mainRouter;
