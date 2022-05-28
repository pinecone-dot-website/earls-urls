import { Request, Response, NextFunction } from 'express';

async function httpUser(req: Request, res: Response, next: NextFunction) {
  res.locals.user = req.user || { id: 0, username: '' };

  next();
}

export default httpUser;
