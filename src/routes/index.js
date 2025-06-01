import express from "express";
import userRoute from "./apis/user.route.js";
import pollRoute from "./apis/poll.route.js";

const router = express.Router();

router.use("/users", userRoute);
router.use("/polls", pollRoute);

export default router;
