const express=require("express")

const router=express.Router()
const AuthMiddleware=require("../middleware/auth.middleware")
const chatControllers=require("../controllers/chat.contoller")

router.post("/",AuthMiddleware.authUser,chatControllers.createChat)



// Get  /api/chat
router.get("/",AuthMiddleware.authUser,chatControllers.createChat)


// Get  /api/chat/messages/:id

router.get("/messages/:id",AuthMiddleware.authUser,chatControllers.getMessages)


module.exports=router