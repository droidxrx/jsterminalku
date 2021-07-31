const WebSocketServer = require("ws").Server;

const wss = new WebSocketServer({ port: 8081 });
wss.on("connection", (ws) => {
    ws.on("message", (data) => {
        if (typeof data == "object" && "cols" in data && "rows" in data) {
            ws.send(data);
        } else {
            ws.send(data);
        }
    });
});
