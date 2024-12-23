import express from "express"
import isAuthenticated from "../middlewares/isAutheticated.js";
import upload from "../middlewares/multer.js";
import { addComment, addNewPost, bookMarkPost, deletePost, dislikePost, getAllPost, getCommentOfPost, getUserPost } from "../controllers/post.controller.js";

const router = express.Router();

router.route('/addPost').post(isAuthenticated, upload.single('image'),addNewPost);
router.route('/all').get(isAuthenticated, getAllPost);
router.route('/userPost/all').get(isAuthenticated, getUserPost);
router.route('/:id/dislike').get(isAuthenticated, dislikePost);
router.route('/:id/comment').post(isAuthenticated, addComment);
router.route('/:id/comment/all').post(isAuthenticated, getCommentOfPost);
router.route('/delete/:id').post(isAuthenticated, deletePost);
router.route('/:id/bookMark').get(isAuthenticated, bookMarkPost);


export default router;

