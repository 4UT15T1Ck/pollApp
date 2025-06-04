import express from "express";
import userController from "../../controllers/user.controller.js";
import { authenticateJWT } from "../../middlewares/authenticate.JWT.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateUserRegistration, validateUserLogin, validateUserUpdate } from "../../middlewares/validators/user.validator.js";

const router = express.Router();

router.post("/register", validateUserRegistration, userController.register);
router.post("/login", validateUserLogin, userController.login);

router.get("/me", authenticateJWT, userController.getMyProfile);
router.put("/me", authenticateJWT, validateUserUpdate, userController.updateMyProfile);

router.post("/", authenticateJWT, authorize('admin'), validateUserRegistration, userController.createUser);
router.get("/", authenticateJWT, authorize('admin'), userController.getAllUsers);
router.get("/:id", authenticateJWT, authorize('admin'), userController.getUserById);
router.put("/:id", authenticateJWT, authorize('admin'), validateUserUpdate, userController.updateUserById);
router.delete("/:id", authenticateJWT, authorize('admin'), userController.deleteUserById);

export default router;