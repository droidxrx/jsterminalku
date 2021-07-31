const express = require("express"),
    expressws = require("express-ws"),
    Bundler = require("parcel-bundler"),
    Path = require("path"),
    pty = require("node-pty");

const options = {
    outDir: "./dist",
    outFile: "index.html",
    contentHash: false,
    hmr: false,
    watch: false,
};
const entryFiles = Path.resolve(__dirname, "src/index.html");
const bundler = new Bundler(entryFiles, options);
bundler.bundle();

const app = express();
let terminals = {};
let logs = {};

expressws(app);
app.use(express.static(Path.resolve(__dirname, "dist")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/terminals", (req, res) => {
    const env = Object.assign({}, process.env);
    env["COLORTERM"] = "truecolor";
    var cols = parseInt(req.query.cols),
        rows = parseInt(req.query.rows),
        term = pty.spawn("powershell.exe", [], {
            name: "xterm-color",
            cols: cols || 80,
            rows: rows || 24,
            cwd: process.env.HOME,
            env: process.env,
        });
    console.log("Created terminal with PID: " + term.pid);
    terminals[term.pid] = term;
    logs[term.pid] = "";
    term.onData((data) => (logs[term.pid] += data));
    res.send(term.pid.toString());
    res.end();
});

app.post("/terminals/:pid/size", (req, res) => {
    var pid = parseInt(req.params.pid),
        cols = parseInt(req.query.cols),
        rows = parseInt(req.query.rows),
        term = terminals[pid];

    term.resize(cols, rows);
    console.log("Resized terminal " + pid + " to " + cols + " cols and " + rows + " rows.");
    res.end();
});

app.ws("/terminals/:pid", (ws, req) => {
    var term = terminals[parseInt(req.params.pid)];
    console.log("Connected to terminal " + term.pid);
    ws.send(logs[term.pid]);

    term.onData((data) => {
        try {
            ws.send(data.toString());
            // eslint-disable-next-line no-empty
        } catch (error) {}
    });

    ws.on("message", (data) => term.write(data));
    ws.on("close", () => {
        term.kill();
        console.log("Closed terminal " + term.pid);
        delete terminals[term.pid];
        delete logs[term.pid];
    });
});
app.listen(8080);
