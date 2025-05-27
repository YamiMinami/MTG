import { NextFunction, Request, Response } from "express";

export function secureMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log("secureMiddleware triggered");
  if (!req.session.user) {
    console.log("Geen sessie → redirect naar /login");
    return res.redirect("/login");
  }
  next();
}
