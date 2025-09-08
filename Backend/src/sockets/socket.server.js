const { Server, Socket } = require("socket.io");
const cookie = require("cookie");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const aiService = require("../service/ai.service");
const messageModel = require("../models/message.model");
const chatModel = require("../models/chat.models");
const { createMemory, queryMemory } = require("../service/vector.service");

function initSocketServer(httpserver) {
  const io = new Server(httpserver, {

    cors: {
      origin: "http://localhost:5173",
      allowedHeaders: ["Content-Type","Authorization"],
credentials:true
    },

  });

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!cookies.token) {
      next(new Error("Authentication Error:no token provided "));
    }

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      if (!user) {
        return next(new Error("Authentication Error: user not found"));
      }
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication Error:no token provided "));
    }
  });
  io.on("connection", async (socket) => {
    console.log("A user conected", socket.id);

    socket.on("ai-message", async (messagePayload) => {
      // console.log(messagePayload);

   

      const[message,vector]=await Promise.all([
 messageModel.create({
        user: socket.user._id,
        chat: messagePayload.chat,
        content: messagePayload.content,
        role: "user",
      }),
      aiService.generateVectors(messagePayload.content),
    ])  

     await createMemory({
        vector,
        messageId: message._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: messagePayload.content,
        },
      });

/*
      const memory=await queryMemory({
        queryvector:vector,
        limit:3,
        metadata:{
          user:socket.user._id,

        },

      })

  const chatHistory = (
        await messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
      ).reverse();
*/
const [memory,chatHistory]= await Promise.all([
queryMemory({
        queryvector:vector,
        limit:3,
        metadata:{
          user:socket.user._id,

        }}) ,

       (
         messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
      ).then(item=> item.reverse())
])

      
      const stm=chatHistory.map((item) => {
          return {
            role: item.role,
            parts: [
              {
                text: item.content,
              },
            ],
          };
        })



        const ltm= [
          {
            role:"user",
            parts:[{text:`
              
              these are some previous messages from the chat ,use them to generate a response 

              ${memory.map(item=> item.metadata.text).join("\n") }
              
              `}]
          }
        ]


        console.log(ltm[0]);
        console.log(stm);
        

      const response = await aiService.generateResponse([...ltm,...stm]);

       socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });
/*
      const resMessage = await messageModel.create({
        user: socket.user._id,
        chat: messagePayload.chat,
        content: response,
        role: "model",
      });
      const responseVectors = await aiService.generateVectors(response);
*/


const [resMessage,responseVectors]=await Promise.all([
  messageModel.create({
        user: socket.user._id,
        chat: messagePayload.chat,
        content: response,
        role: "model",
      }),

       aiService.generateVectors(response)
])
      await createMemory({
        vector: responseVectors,
        messageId: resMessage._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: response,
        },
      });

     
    });
  });
}

module.exports = {
  initSocketServer,
};
