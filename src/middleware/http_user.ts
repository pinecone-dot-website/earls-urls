import { Request, Response, NextFunction } from "express";

async function http_user(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    res.locals.user = {
      id: req.user.id,
      username: req.user.username,
    };
  }

  next();
}

export default http_user;
