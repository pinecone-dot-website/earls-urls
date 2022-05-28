import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';

import git_tag from '../middleware/git_tag';
import http_user from '../middleware/http_user';
import Earl from '../models/earl';
import User from '../models/user';

const userRouter = express.Router();

// process login / register form
async function userAuth(req: Request, res: Response, next: NextFunction) {
  if (req.body.login) {
    const verified = (err: Error, user, info) => {
      if (!user) {
        req.flash('error', err?.message || info?.message);
        req.flash('username', req.body.username);
        req.flash('password', req.body.password);

        return res.redirect('/?login-error');
      }

      req.login(user, (err) => {
        return res.redirect('/?login-success');
      });
    };

    passport.authenticate('local', verified)(req, res);
  } else if (req.body.register) {
    await User.create(req.body.username, req.body.password)
      .then((user) => {
        req.login(user, (err) => {
          return res.redirect('/?register-create');
        });
      })
      .catch((err: Error) => {
        req.flash('error', err.message);
        req.flash('username', req.body.username);
        req.flash('password', req.body.password);

        return res.redirect('/?register-error');
      });
  } else {
    return res.redirect('/?auth-error');
  }
}
userRouter.post('/auth', userAuth);

// log user out
function userLogout(req: Request, res: Response) {
  req.logout();
  return res.redirect('/?logout');
}
userRouter.all('/logout', userLogout);

// user stats
function userStats(req: Request, res: Response) {
  if (!req.user) {
    return res.redirect('/');
  }

  User.get_urls_by_user(req.user.id)
    .then(async (rows) => {
      rows = await Promise.all(
        rows.map((row) => {
          return Earl.get_shortlink(row.id, req.get('Host'), req.secure)
            .then((earl) => {
              return {
                short: earl.short_url,
                long: row.url,
                timestamp: new Date(row.createdAt).toLocaleString(),
              };
            })
            .catch((err) => {
              // get_shortlink fails
              return err;
            });
        }),
      );

      res.render('user-stats', {
        earls: rows,
      });
    })
    .catch((err: Error) => {
      return res.status(500).render('error', {
        message: err.message,
      });
    });
}
userRouter.get('/stats', [git_tag, http_user], userStats);

export default userRouter;
