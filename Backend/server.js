const app=require("../Backend/src/app")
const connectDB=require("../Backend/src/db/db")
const {createServer}=require("http");

const httpserver=createServer(app)
const {initSocketServer}=require("../Backend/src/sockets/socket.server")

connectDB();

initSocketServer(httpserver)



const PORT = process.env.PORT || 5000;

httpserver.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
