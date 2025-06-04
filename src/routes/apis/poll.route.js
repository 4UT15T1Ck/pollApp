import express from "express";
import pollController from "../../controllers/poll.controller.js";
import { authenticateJWT } from "../../middlewares/authenticate.JWT.js";
import { authorize } from "../../middlewares/authorize.js";
import { validatePollCreation, validateAddOption, validateVote } from "../../middlewares/validators/poll.validator.js";

const router = express.Router();

router.use(authenticateJWT);

router.post("/", authorize('admin'), validatePollCreation, pollController.createPoll);
router.put("/:id", authorize('admin'), pollController.updatePoll); 
router.delete("/:id", authorize('admin'), pollController.deletePoll);

router.get("/", pollController.getAllPolls);
router.get("/:id", pollController.getPollById);

router.patch("/:id/lock", authorize('admin'), pollController.lockPoll);
router.patch("/:id/unlock", authorize('admin'), pollController.unlockPoll);
router.post("/:id/options", authorize('admin'), validateAddOption, pollController.addOption);
router.delete("/:id/options/:optionId", authorize('admin'), pollController.removeOption);

router.post("/:id/vote", validateVote, pollController.vote);
router.post("/:id/unvote", pollController.unvote);

export default router;
