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

let pid;
let protocol = location.protocol === "https:" ? "wss://" : "ws://";
let socketURL = protocol + location.hostname + (location.port ? ":" + location.port : "") + "/terminals/";
let socket;
let isSocketOpen = false;

fetch("/terminals?cols=" + term.cols + "&rows=" + term.rows, { method: "POST" }).then((res) => {
    res.text().then((processId) => {
        pid = processId;
        socketURL += processId;
        socket = new WebSocket(socketURL);
        socket.onopen = () => (isSocketOpen = true);
        socket.onclose = () => (isSocketOpen = false);
        socket.onerror = () => (isSocketOpen = false);
        socket.onmessage = (data) => term.write(data.data);
    });
});

term.onResize((size) => {
    if (!pid) return;
    const cols = size.cols;
    const rows = size.rows;
    const url = "/terminals/" + pid + "/size?cols=" + cols + "&rows=" + rows;

    fetch(url, { method: "POST" });
});

term.onKey((e) => {
    const ev = e.domEvent,
        printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey,
        cekChart = listmap.chart.find((item) => item == ev.key);

    if (listmap.ckey.includes(ev.key)) listmap.afterckey(ev.key, term, cursorX, prompt, socket, isSocketOpen);
    else listmap.typing(term, printable, ev, cekChart);
});

window.addEventListener("resize", () => fitaddon.fit());
