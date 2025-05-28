import { NextFunction, Request, Response } from "express";

export function flashMiddleware(req: Request, res: Response, next: NextFunction) {
  const msg = req.session.errorMessage;
  if (msg) {
    res.locals.message = msg;
    delete req.session.errorMessage;
  } else {
    res.locals.message = undefined;
  }
  next();
}