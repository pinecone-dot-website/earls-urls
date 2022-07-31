import express, { NextFunction } from 'express';

async function httpUser(
  req: express.Request,
  res: express.Response,
  next: NextFunction,
) {
  res.locals.user = {
    props: req.user || { id: 0 },
  };
  
  next();
}

export default httpUser;
