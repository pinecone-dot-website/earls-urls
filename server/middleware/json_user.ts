import passport, { AuthenticateOptions } from 'passport';
import express, { NextFunction } from 'express';

function jsonUser(
  req: express.Request,
  res: express.Response,
  next: NextFunction,
) {
  const options: AuthenticateOptions = {
    session: false,
  };
  
  if (res.locals.user.props.id) {
    // is using cookie
    return next();
  } else {
    // is using token
    const auth = passport.authenticate(
      'jwt',
      options,
      (err, user, info) => {
        res.locals.user = {
          error: err || info,
          props: user,
        };
  
        return next();
      },
    );
  
    return auth(req, res, next);
  }
}

export default jsonUser;
