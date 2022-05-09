import { Request, Response, NextFunction } from "express";

async function http_user(req: Request, res: Response, next: NextFunction) {
  res.locals.user = req.user || { id: 0, username: "" };

  next();
}

export default http_user;
