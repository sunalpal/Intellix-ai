const express=require("express")
const AuthController=require("../controllers/auth.controllers")

const route=express.Router()

route.post("/register",AuthController.RegisterController)
route.post("/login",AuthController.LoginController)


module.exports=route