const app=require("../Backend/src/app")
const connectDB=require("../Backend/src/db/db")
const {createServer}=require("http");

const httpserver=createServer(app)
const {initSocketServer}=require("../Backend/src/sockets/socket.server")

connectDB();

initSocketServer(httpserver)

httpserver.listen(3000,()=>{
    console.log("Server running at port 3000");
    
})