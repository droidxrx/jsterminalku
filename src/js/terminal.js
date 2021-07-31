import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "../../node_modules/xterm/css/xterm.css";
import { listmap, getID, ansiColor } from "./utility";

let prompt = ansiColor("4e9a06", "⮞ ");
const terminalBody = document.createElement("div");
terminalBody.id = "terminal-body";
getID("container").appendChild(terminalBody);

const term = new Terminal({
    rendererType: "dom",
    fontFamily: "Fire Code Nerd, courier, monospace",
    cursorBlink: true,
    cursorStyle: "underline",
});
const cursorX = () => term.buffer.normal.cursorX;
const fitaddon = new FitAddon();

term.open(getID("terminal-body"));
term.loadAddon(fitaddon);
fitaddon.fit();
term.focus();
term.write(prompt);

const socket = new WebSocket("ws://localhost:8081");
socket.onopen = () => {
    term.onKey((e) => {
        const ev = e.domEvent,
            printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey,
            cekChart = listmap.chart.find((item) => item == ev.key);

        if (listmap.ckey.includes(ev.key)) listmap.afterckey(ev.key, term, cursorX, prompt, socket);
        else listmap.typing(term, printable, ev, cekChart);
    });
    socket.send(JSON.stringify({ cols: term.cols, rows: term.rows }));
};
socket.onmessage = (data) => term.write(data.data);

window.addEventListener("resize", () => fitaddon.fit());
