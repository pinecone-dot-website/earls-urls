import { Request, Response, NextFunction } from "express";
import User from "../models/user";

async function http_user(req: Request, res: Response, next: NextFunction) {
  res.locals.user = await User.findByID(req.user)
    .then((user) => {
      return user?.toJSON();
    })
    .catch((e) => {
      return false;
    });

  next();
}

export default http_user;
