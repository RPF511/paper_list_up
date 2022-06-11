import express from "express";
import { startGithubLogin, finishGithubLogin, logout, see,  getEdit, postEdit, remove, getChangePassword, postChangePassword } from "../controllers/userController";
import { protectorMiddleware, publicOnlyMiddleware, uploadFiles } from "../middlewares";
const userRouter = express.Router();


userRouter.get("/remove", remove);
//all applys on every methods
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);

//github/finish is authorization callback url. we can change it at github developer settings(website)
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/logout",protectorMiddleware, logout);

userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get("/:id",see);

export default userRouter;