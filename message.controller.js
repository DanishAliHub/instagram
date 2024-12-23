import { json } from "express";
import { Conversation } from "../models/conversation_model.js";
import { Message } from "../models/message_model.js";

export const sendMessage = async(req,res)=>{
    try {
        const senderId = req.id;
        const receiverId=req.params.id;
        const {message}=req.body;

        let conversation= await Conversation.findOne({
            participant:{$all:[senderId,receiverId]}});
            if (!conversation) {
                conversation = await Conversation.create({
                    participant:{$all:[senderId,receiverId]}
                })
            };
            const newMessage= await Message.create({
                senderId,
                receiverId,
                message
            });
            if (newMessage) {
                conversation.message,push(newMessage._id);
            }
            await Promise.all([conversation.save(),newMessage.save()])
            return res.status(201).json({
             newMessage,
                success:true
            })    




    } catch (error) {
        console.log(error);
    }
}
export const getMessage = async (req,res)=>{
    try {
        const senderId=req.id;
        const receiverId=req.params.id;
        const conversation= await Conversation.find({
            participants:{$all:[senderId, receiverId]}
        })
        if (!conversation) {
            return res.satuts(200).json({success:true,messages:[]});

        }
        return res.status(200).json({success:true,messages:conversation?.messages})

    } catch (error) {
        console.log(error);
    }
}
