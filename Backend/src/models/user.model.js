const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
  email:{
required:true,
type:String,
unique:true
  },
  fullname:{
    firstname:{
required:true,
type:String
    },
    lastname:{
required:true,
type:String
    }
  },
  password:{
type:String
  }
},{timestamps:true})


const userModel=mongoose.model("user",userSchema)

module.exports=userModel