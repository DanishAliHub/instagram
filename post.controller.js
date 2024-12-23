import sharp from "sharp"
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post_model.js";
import { User } from "../models/user_model.js";
import { Comment } from "../models/comment_model.js";
export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) {
            return res.status(200).json({
                message: 'image required',
            })
        }

        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        })
        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id)
            await user.save();
        }
        await res.populate({
            path: 'author',
            select: '-password'
        })
        return res.status(201).json({
            message: 'new post added',
            post,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username, profilePicture' })
            .populate({
                path: 'comments', sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username, profilePicture' 
                }
            });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 })
            .populate({
                path: 'author',
                select: 'username, profilePicture'
            })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                     select: 'username, profilePicture'
                }
            });
            return res.status(200).json({
                posts,
                success: true
            })
        
    } catch (error) {
        console.log(error);
    }
};
export const likePost = async (req, res) => {
    try {
        const likeKernyValyKiId= req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
            message:'post not find',
            success:false
        })
            
        }
        await post.updateOne({$addToSet:{likes:likeKernyValyKiId}});
        await post.save();
        //real time notification
        return res.status(200).json({
            message:'post liked',
            success:true
        })

    } catch (error) {
        console.log(error);
    }
}

export const dislikePost = async (req, res) => {
    try {
        const likeKernyValyKiId= req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(401).json({
            message:'post not find',
            success:false
        })
            
        }
        await post.updateOne({$pull:{likes:likeKernyValyKiId}});
        await post.save();
        //real time notification
        return res.status(200).json({
            message:'post dislikeed',
            success:true
        })

    } catch (error) {
        console.log(error);
    }
}
export const addComment = async (req,res)=>{
    try {
        const postId = req.params.id;
        const commentKernyValyKiId = req.id;

        const {text}=req.body;

        const post = await Post.findById(postId);
        if (!text) {
            return res.status(400).json({
            message:'text is required',
            success:false
        })
            
        }
        const comment= await Comment.create({
            text,
            author:commentKernyValyKiId,
            post:postId
        }).populate({
            path:'author',
            select: 'username, profilePicture'
        })
        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message:'comment added',
            success:true,
            comment
        })
    } catch (error) {
        console.log(error);
    }
};
export const getCommentOfPost = async(req,res)=>{
    try {
        const postId = req.params.id;

        const comments = await Comment.find({post:postId}).populate('author','username','profilePicture');
        if (!comments) {
            return res.status(404).json({
            message:'no comment found for this post',
            success:false
        })
            
        }
        return res.status(200).json({
           
            success:true,
            comments
        })
    } catch (error) {
        console.log(error);
    }
}
export const deletePost = async (req,res)=>{
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post =await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
            message:'post not found',
            success:false
        })   
        }
        if (post.author.toString()!==authorId) {
            return res.status(403).json({
            message:'unauthorized'
        })   
        }
        await Post.findByIdAndDelete(postId);
        //remove the post from user post
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id=>id.toString()!==postId);
        await user.save();

        await Comment.deleteMany({post:postId});
        return res.status(200).json({
            message:'post deleted',
            success:true
        })   
    } catch (error) {
        console.log(error);
    }
}
export const bookMarkPost = async(req,res)=>{
    try {
        const postId=req.params.id;
        const authorId =req.id;
        const post =await Post.findById(postId);
       
        if (!post) {
            return res.status(404).json({
            message:'post not found',
            success:false
        })   
        }
        const user= await  User.findById(authorId);
        if (user.bookmarks.includes(post._id)) {
            await user.updateOne({$pull:{bookmarks:post._id}})
            await user.save();
            return res.status(200).json({
            message:'post removed from bookmark',
            type:'unsaved',
            success:true
        })   
        }else{
            await user.updateOne({$addToSet:{bookmarks:post._id}})
            await user.save();
            return res.status(200).json({
            message:'post bookmarked ',
            type:'saved',
            success:true
        })    
        }
    } catch (error) {
        console.log(error);
    }
}