import express from "express";
import bcrypt from "bcrypt";
import { login, userCollection } from "../database";
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
            res.redirect("/home");
        } catch (e: any) {
            req.session.message = { type: "error", message: e.message };
            res.redirect("/");
        }
    });

    router.post("/register", async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            req.session.message = { type: "error", message: "Email and password required." };
            return res.redirect("/");
        }

        const existingUser = await userCollection.findOne({ email });
        if (existingUser) {
            req.session.message = { type: "error", message: "User already exists." };
            return res.redirect("/");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser: User = {
            email,
            password: hashedPassword,
            role: "USER",
        };

        await userCollection.insertOne(newUser);
        delete newUser.password;
        req.session.user = newUser;
        req.session.message = { type: "success", message: "Registration successful!" };
        res.redirect("/home");
    });

    router.post("/logout", secureMiddleware, async (req, res) => {
        req.session.destroy((err) => {
            res.redirect("/");
        });
    });

    return router;
}
