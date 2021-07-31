const WebSocketServer = require("ws").Server;
const os = require("os");
const pty = require("node-pty");

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
const wss = new WebSocketServer({ port: 8081 });
let terminals = {};
wss.on("connection", (ws) => {
    const term = pty.spawn(shell, [], {
        name: "xterm-color",
        cwd: process.env.HOME,
        env: process.env,
    });
    console.log("Created terminal with PID: " + term.pid);
    terminals[term.pid] = term;
    term.onData((data) => ws.send(data));
    ws.on("message", (msg) => {
        try {
            const data = JSON.parse(msg);
            if ("cols" in data && "rows" in data) {
                term.resize(parseInt(data.cols), parseInt(data.rows));
            }
        } catch (error) {
            term.write(msg);
        }
    });
    ws.on("close", () => {
        term.kill();
        console.log("Terminal close: " + term.pid);
        delete terminals[term.pid];
    });
});
