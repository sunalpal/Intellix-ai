const userModel=require("../models/user.model")
const jwt=require("jsonwebtoken")


async function authUser(req,res,next){
    const {token}=req.cookies

    if(!token){
        return res.status(401).json({
            message:"Unauthorised"
        })
    }
  try {

      const decoded  = jwt.verify(token,process.env.JWT_SECRET)
   
      const user =await userModel.findById(decoded.id)
req.user=user;
      next();
  }catch(error){
    console.log(error);
    
  }


}

module.exports={
    authUser
}