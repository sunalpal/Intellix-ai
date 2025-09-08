const userModel=require("../models/user.model")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcryptjs")

async function RegisterController(req,res){
    const {email,password,fullname:{firstname,lastname}}=req.body;

    console.log(email,password,{firstname,lastname});
    
   const existuser= await userModel.findOne({
        email
    })
    if(existuser){
        return res.status(400).json({
            messsage:"User already exists"
        })
    }

    const hashedPassword=await bcrypt.hash(password,10)
   const user =await userModel.create({
    email,password:hashedPassword
    ,fullname:{firstname,lastname}
   })
 const token=jwt.sign({
    id:user._id
 },process.env.JWT_SECRET)


 res.cookie("token",token)
 res.status(201).json({
    message:"user sucessfuly created",
    user
 })
}
 async function LoginController(req,res){
const {email,password}=req.body;

const existsEmail= await userModel.findOne({
  email
})
if(!existsEmail){
    return res.status(401).json({
        message:"Invalid email"
    })
}


// const d_password= await bcrypt.compare(password,existsEmail.password)

// if(!d_password){
//      return res.status(401).json({
//         message:"Invalid passsword"
//     })
// }

const token=  jwt.sign(existsEmail.id,process.env.JWT_SECRET)
res.cookie("token",token)
res.status(201).json({
    message:"Loggedin sucessfully",
    existsEmail
})
}



module.exports={
    RegisterController,
    LoginController
}