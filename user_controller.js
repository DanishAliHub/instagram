import { User } from "../models/user_model.js"
import bcrypt from "bcryptjs"
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "something is missing",
                success: false,
            })
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "try different email",
                success: false,
            })
        }
        const hashedpassword = await bcrypt.hash(password, 10)
        await User.create({
            username,
            email,
            password: hashedpassword

        });
        return res.status(201).json({
            message: "Account created successfully",
            success: true,
        });
    } catch (error) {
        console.log(error)
    }
}
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "something is missing",
                success: false,
            })
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "incorect email or password",
                success: false,
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "incorect email or password",
                success: false,
            });
        }
        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: 'Id' })
        const populatedPost = await Promise.all(
            user.posts.map(async (postId)=>{
                const post = awaitPost.findById(postId);
                if (post.author.equals(user._id)) {
                    return post;
                }
                return null;
            })
        )
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: user.posts
        }

        
        return res.cookie('token', token, { httpOnly: true, samesite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `welcome back ${user.username}`,
            success: true,
            user
        });
    } catch (error) {
        console.log(error)
    }

};
export const logout = async (_, res) => {
    try {
        return res.cookie('token', "", { maxAge: 0 }).json({
            message: 'logged out successfully',
            success: true,

        });
    } catch (error) {
        console.log(error);
    }
};
export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).select("-password");
        return res.status(200).json({
            user,
            success: true,

        });
    } catch (error) {
        console.log(error);
    }
};
export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const silter = getDataUri(profilePicture)
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({
                message: "user not found",
                success: false,
            });
        }
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if(profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: "profile updated",
            success: true,
            user
        });
    } catch (error) {
        console.log(error);
    }
};
export const getSuggestedUser = async(req,res)=>{
    try {
        const SuggestedUsers=await User.find({_id:{$ne:req.id}}).select("-password");
        if (!SuggestedUsers) {
            return res.status(400).json({
                message: "currently do not have any user",
            });
        }
        return res.status(200).json({
           
            success: true,
            user:SuggestedUsers
        });
        
    } catch (error) {
        console.log(error)
    }
};
export const followOrUnfollow = async(req, res)=>{
    try {
         const followKernyVala= req.id;
         const jisKoFollowKrunga= req.id;
         if (followKernyVala===jisKoFollowKrunga) {
            return res.status(400).json({
                message:"you can not follow/unfollow yourself",
                success: false
            });
         } 
         const user = await User.findById(followKernyVala);
         const targetUser = await User.findById(jisKoFollowKrunga);
         
         if (!user||!targetUser) {
            return res.status(400).json({
                message:"User not found",
                success: false
            });
         }
         const isFollowing = user.following.includes(jisKoFollowKrunga)
         if (isFollowing) {
            await Promise.all([
                User.updateOne({_id:followKernyVala},{$pull:{following:jisKoFollowKrunga}}),
                User.updateOne({_id:jisKoFollowKrunga},{$pull:{following:followKernyVala}})
            ])
            return res.status(200).json({message:'unfollow successfully',success:true})
         } else {
            await Promise.all([
                User.updateOne({_id:followKernyVala},{$push:{following:jisKoFollowKrunga}}),
                User.updateOne({_id:jisKoFollowKrunga},{$push:{following:followKernyVala}})
            ])
            return res.status(200).json({message:'follow successfully',success:true})
         }
    } catch (error) {
        
    }
}