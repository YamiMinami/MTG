import { Router, Request, Response } from "express";
import { createUser, loginUser, userExists } from "../database";

const router = Router();

router.get("/", (req, res) => {
  const error = req.session.errorMessage;
  delete req.session.errorMessage;
  res.render("index", { error });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    req.session.errorMessage = "Please provide both username and password.";
    return res.redirect("/");
  }

  const user = await loginUser(username, password);
  if (!user) {
    req.session.errorMessage = "Invalid username or password.";
    return res.redirect("/");
  }

  req.session.username = user.username;
  res.redirect("/home");
});

router.get("/index", (req, res) => {
  const error = req.session.errorMessage;
  delete req.session.errorMessage;
  res.render("index", { error });
});

router.post("/", async (req, res) => {
  const { username, password, confirmPassword } = req.body;
  if (!username || !password || !confirmPassword) {
    req.session.errorMessage = "All fields are required.";
    return res.redirect("/");
  }
  if (password !== confirmPassword) {
    req.session.errorMessage = "Passwords do not match.";
    return res.redirect("/");
  }
  if (await userExists(username)) {
    req.session.errorMessage = "Username already taken.";
    return res.redirect("/");
  }

  try {
    await createUser(username, password);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.session.errorMessage = "Registration failed. Please try again.";
    res.redirect("/");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

export default router;
