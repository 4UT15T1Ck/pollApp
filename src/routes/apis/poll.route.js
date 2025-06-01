import express from "express";
import pollController from "../../controllers/poll.controller.js";
import { authenticateJWT } from "../../middlewares/authenticate.JWT.js";
import { authorize } from "../../middlewares/authorize.js";
import { validatePollCreation, validateAddOption, validateVote } from "../../middlewares/validators/poll.validator.js";

const router = express.Router();

// All poll routes require authentication
router.use(authenticateJWT);

// CRUD by Admin
router.post("/", authorize('admin'), validatePollCreation, pollController.createPoll);
router.put("/:id", authorize('admin'), pollController.updatePoll); // Add specific validator if needed
router.delete("/:id", authorize('admin'), pollController.deletePoll);

// Get polls (all authenticated users)
router.get("/", pollController.getAllPolls);
router.get("/:id", pollController.getPollById);

// Poll management by Admin
router.patch("/:id/lock", authorize('admin'), pollController.lockPoll);
router.patch("/:id/unlock", authorize('admin'), pollController.unlockPoll);
router.post("/:id/options", authorize('admin'), validateAddOption, pollController.addOption);
router.delete("/:id/options/:optionId", authorize('admin'), pollController.removeOption);

// Vote/Unvote by authenticated users (not admin specific)
router.post("/:id/vote", validateVote, pollController.vote);
router.post("/:id/unvote", pollController.unvote);

export default router;
