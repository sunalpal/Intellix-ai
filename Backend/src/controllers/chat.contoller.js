const chatModel=require("../models/chat.models")



async function createChat(req,res){
   
    
    const{title}=req.body

    const user=req.user;
    const chat =await chatModel.create({
        user:user._id,
        title
    })
    res.status(201).json({
        "message":"chat created successfully",
        chat:{

            _id:chat._id,
            title:chat.title,
            lastActivity:chat.lastActivity,
            user:chat.user
        }
    })
}


async function getCharts(req,res){
    const user=req.user;
    const chats=await chatModel.find({user:user._id});
    res.status(200).json({
        "message":"chats fetched successfully",
        chats:chats.map(chat=>({
            _id:chat._id,
            title:chat.title,
            lastActivity:chat.lastActivity,
            user:chat.user
        }))
    })
}

async function getMessages(req,res){

    const chatId=req.params.id;
    const messages=await chatModel.findById({chat:chatId}).sort({createdAt:1});

    res.status(200).json({
        message:"messages fetched successfully",
        messages:messages
    })

}
module.exports={
    createChat,
    getCharts,
    getMessages
}