import express from "express"
import { register, login, logout, getProfile, editProfile, getSuggestedUser, followOrUnfollow } from "../controllers/user_controller.js"
import isAuthenticated from "../middlewares/isAutheticated.js";
import upload from "../middlewares/multer.js";
const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuthenticated, getProfile);
router.route('/profile/edit').post(isAuthenticated, upload.single("profilePicture"),editProfile);
router.route('/suggested').get(isAuthenticated, getSuggestedUser);
router.route('/followOrUnfollow/:id').post(isAuthenticated, followOrUnfollow);


export default router;

