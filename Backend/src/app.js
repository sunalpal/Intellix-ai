require("dotenv").config();
const express=require("express")
const cookieparser=require("cookie-parser")
const cors=require("cors")
const path=require("path")

// Routes
const authRoutes=require("./routes/auth.routes")
const chatRoutes=require("./routes/chat.routes")


const app=express();


//Using  middlewares
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(express.json())
app.use(cookieparser())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'./public')))

// Using Routes
app.use("/api/auth",authRoutes)
app.use("/api/chat",chatRoutes)

app.get("*name",(req,res)=>{
    res.sendFile(path.join(__dirname,'./public/index.html'))
})

module.exports=app