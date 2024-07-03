const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const mongoUris = [
  "mongodb+srv://saifm:saifm@cluster0.hu1jgql.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  "mongodb+srv://saif:saifm@cluster1.qv0hta3.mongodb.net/?retryWrites=true&w=majority&appName=CLUSTER1",
  "mongodb+srv://saifm:saifm@demonslayerinfodatabase.sivjndj.mongodb.net/?retryWrites=true&w=majority&appName=DemonSlayerInfoDatabase",
  "mongodb+srv://admin:saifm@cluster0.g3ojipl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
];

let currentDbIndex = 0;

function connectToMongo() {
  mongoose
    .connect(mongoUris[currentDbIndex], {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log(`Connected to MongoDB ${currentDbIndex + 1}`))
    .catch((err) => {
      console.error(`Failed to connect to MongoDB ${currentDbIndex + 1}:`, err);
      currentDbIndex = (currentDbIndex + 1) % mongoUris.length;
      connectToMongo();
    });
}

connectToMongo();

const messageSchema = new mongoose.Schema({
  user: String,
  message: String,
  color: String,
  timestamp: { type: Date, default: Date.now, expires: "10m" },
});

const Message = mongoose.model("Message", messageSchema);

app.use(express.static("public"));

io.on("connection", (socket) => {
  Message.find().then((messages) => {
    socket.emit("load messages", messages);
  });

  socket.on("send message", (data) => {
    const message = new Message(data);
    message
      .save()
      .then(() => {
        io.emit("receive message", data);
      })
      .catch((err) => {
        console.error("Failed to save message:", err);
        currentDbIndex = (currentDbIndex + 1) % mongoUris.length;
        connectToMongo();
      });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
