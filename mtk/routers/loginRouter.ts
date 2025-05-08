import express from "express";
import { login } from "../database";
import { secureMiddleware } from "../middleware/secureMiddleware";
import { User } from "../types";

export function loginRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        res.render("index");
    });

    router.post("/login", async (req, res) => {
        const email: string = req.body.email;
        const password: string = req.body.password;
        try {
            let user: User = await login(email, password);
            delete user.password; 
            req.session.user = user;
            req.session.message = { type: "success", message: "Login successful" };
            res.redirect("/home")
        } catch (e: any) {
            req.session.message = { type: "error", message: e.message };
            res.redirect("/");
        }
    });

    router.post("/logout", secureMiddleware, async (req, res) => {
        req.session.destroy((err) => {
            res.redirect("/");
        });
    });

    return router;
}