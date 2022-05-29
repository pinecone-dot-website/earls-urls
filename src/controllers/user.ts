import express, { NextFunction } from 'express';
import passport from 'passport';

import git_tag from '../middleware/git_tag';
import http_user from '../middleware/http_user';
import Earl from '../models/earl';
import User from '../models/user';

const userRouter = express.Router();

// process login / register form
async function userAuth(req: express.Request, res: express.Response) {
  if (req.body.login) {
    const verified = (err: Error, user, info) => {
      if (!user) {
        req.flash('error', err?.message || info?.message);
        req.flash('username', req.body.username);
        req.flash('password', req.body.password);

        return res.redirect('/?login-error');
      }

      req.login(user, (loginErr) => {
        console.log('login loginErr', loginErr);
        return res.redirect('/?login-success');
      });
    };

    passport.authenticate('local', verified)(req, res);
  } else if (req.body.register) {
    await User.create(req.body.username, req.body.password)
      .then((user) => {
        req.login(user, (loginErr: Error) => {
          console.log('register loginErr', loginErr);
          return res.redirect('/?register-create');
        });
      })
      .catch((createErr: Error) => {
        req.flash('error', createErr.message);
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
function userLogout(req: express.Request, res: express.Response) {
  req.logout();
  return res.redirect('/?logout');
}
userRouter.all('/logout', userLogout);

// user stats
function userStats(req: express.Request, res: express.Response, next: NextFunction) {
  if (!req.user) {
    return res.redirect('/');
  }

  User.getUrlsByUser(req.user.id)
    .then(async (rows) => {
      const renderedRows = await Promise.all(
        rows.map((row: EarlRow) => {
          return Earl.get_shortlink(row.id, req.get('Host'), req.secure)
            .then((earl: ShortEarl) => {
              return {
                short: earl.short_url,
                long: row.url,
                timestamp: new Date(row.createdAt).toLocaleString(),
              };
            })
            .catch((earlErr: Error) => {
              // get_shortlink fails
              return earlErr;
            });
        }),
      );

      res.render('user-stats', {
        earls: renderedRows,
      });

      next();
    })
    .catch((err: Error) => {
      return res.status(500).render('error', {
        message: err.message,
      });
    });
}
userRouter.get('/stats', [git_tag, http_user], userStats);

export default userRouter;
