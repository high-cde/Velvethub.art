const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname)));

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

let onlineUsers = 0;

io.on('connection', (socket) => {
    onlineUsers++;
    console.log(`Utente connesso: ${socket.id} (Online: ${onlineUsers})`);
    io.emit('statsUpdate', { online: onlineUsers + 33, offline: 26 });

    socket.on('joinSyndicate', (userData) => {
        socket.data.user = userData;
        io.emit('broadcastMessage', {
            sender: 'System',
            text: `L'adepto ${userData.alias} (${userData.role}) è entrato nel network di Velvethub.art.`
        });
    });

    socket.on('openclawMessage', (data) => {
        io.emit('openclawMessage', data);
    });

    socket.on('gpsPing', (data) => {
        io.emit('gpsAlert', data);
    });

    socket.on('disconnect', () => {
        onlineUsers = Math.max(0, onlineUsers - 1);
        io.emit('statsUpdate', { online: onlineUsers + 33, offline: 26 });
        console.log(`Utente disconnesso: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`The Sin Syndicate WebSocket Server attivo sulla porta ${PORT}`);
});
