import passport from "passport";
import { Request, Response, NextFunction } from "express";

function json_user(req: Request, res: Response, next: NextFunction) {
  const auth = passport.authenticate(
    "jwt",
    {
      session: false,
    },
    (err, user, info) => {
      res.locals.user = {
        error: err || info,
        props: user,
      };

      return next();
    }
  );

  return auth(req, res, next);
}

export default json_user;
