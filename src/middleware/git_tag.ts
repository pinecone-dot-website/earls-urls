import { Request, Response, NextFunction } from 'express';
import git from "git-rev-sync";

// show git tag in footer
function git_tag(req: Request, res: Response, next: NextFunction){
    res.locals.version = git.tag();
    next();
}

export default git_tag;