import express, { NextFunction } from 'express';

async function httpUser(
  req: express.Request,
  res: express.Response,
  next: NextFunction,
) {
  res.locals.user = req.user || { id: 0, username: '' };

  next();
}

export default httpUser;
