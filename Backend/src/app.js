require("dotenv").config();
const express=require("express")
const cookieparser=require("cookie-parser")
const cors=require("cors")
const path=require("path")

// Routes
const authRoutes=require("./routes/auth.routes")
const chatRoutes=require("./routes/chat.routes")


const app=express();


//1st middle ware to set security headers
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"


  );

  
  next();
});

app.set("view engine","ejs")
app.get("/",(req,res)=>{
    res.render("index")
})
//Using  middlewares
app.use(cors({
    origin:["http://localhost:5173"],
    credentials:true
}))
app.use(express.json())
app.use(cookieparser())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'./public/dist')))

// Using Routes
// app.get("/",HomePage)
app.use("/api/auth",authRoutes)
app.use("/api/chat",chatRoutes)

app.get("/*splat",(req,res)=>{
    res.sendFile(path.join(__dirname,'./public/dist/index.html'))
})

module.exports=app