import express from "express";
import { ObjectId } from "mongodb";
import { userCollection } from "../database";
import { Request, Response } from "express";

export function homeRouter() {
    const router = express.Router();

    //Not used at the moment
    router.get("/", async (req, res) => {
        res.render("index");
    });

    //Route for saving avatar + username from the FTU popup
    router.post("/setup-profile", async (req: Request, res: Response) => {
        const { avatar, username } = req.body;
        const userId = req.session.user?._id;

        if (!userId) {
            return res.status(401).send("Not logged in");
        }

        try {
            // Update mongodb user
            await userCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $set: { avatar, username } }
            );

            //Update session so user sees new avatar & name immediately
            req.session.user!.avatar = avatar;
            req.session.user!.username = username;

            res.status(200).send("Profile updated");
        } catch (error) {
            console.error("Error updating profile:", error);
            res.status(500).send("Internal server error");
        }
    });

    return router;
}