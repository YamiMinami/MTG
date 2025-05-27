import { NextFunction, Request, Response } from "express";

export function requireLogin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.username) {
    return res.redirect("/login");
  }
  next();
}