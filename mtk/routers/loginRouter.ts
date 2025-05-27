import { Router, Request, Response } from "express";
import { createUser, loginUser, userExists } from "../database";

const router = Router();

router.get("/index", (req, res) => {
  const error = req.session.errorMessage;
  delete req.session.errorMessage;
  res.render("login", { error });
});

router.post("/index", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    req.session.errorMessage = "Please provide both username and password.";
    return res.redirect("/index");
  }

  const user = await loginUser(username, password);
  if (!user) {
    req.session.errorMessage = "Invalid username or password.";
    return res.redirect("/index");
  }

  req.session.username = user.username;
  res.redirect("/home");
});

router.get("/index", (req, res) => {
  const error = req.session.errorMessage;
  delete req.session.errorMessage;
  res.render("index", { error });
});

router.post("/index", async (req, res) => {
  const { username, password, confirmPassword } = req.body;
  if (!username || !password || !confirmPassword) {
    req.session.errorMessage = "All fields are required.";
    return res.redirect("/index");
  }
  if (password !== confirmPassword) {
    req.session.errorMessage = "Passwords do not match.";
    return res.redirect("/index");
  }
  if (await userExists(username)) {
    req.session.errorMessage = "Username already taken.";
    return res.redirect("/index");
  }

  try {
    await createUser(username, password);
    res.redirect("/index");
  } catch (err) {
    console.error(err);
    req.session.errorMessage = "Registration failed. Please try again.";
    res.redirect("/index");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("login");
  });
});

export default router;
