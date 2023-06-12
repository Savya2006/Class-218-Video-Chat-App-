const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);

var nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    port: 465,
    host: "smpt.gmail.com",
    auth: {
        user: 'savyagattrey9@gmail.com',
        pass: 'ynhmwcgmvdunurjt',
    },
    secure: true,
});

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

app.post("/send-mail",(req, res) => {
    const to = req.body.to;
    const url = req.body.url;
    const mailData = {
        from: "savyagattrey9@gmail.com'",
        to: to,
        subject: "Join The Video Chat With Meee :)",
        html: `<p>Hey There, </p> Come and join me for a video chathere - ${url}</p>`
    };
    transporter.sendMail(mailData, (error, info) => {
        if (error) {
            return console.log(error);
        }
        red.status(200).send({ message: "INVITATION SENT!", message_id: info.messageId});
    });
})

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit("user-connected", userId);
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

server.listen(process.env.PORT || 3030);