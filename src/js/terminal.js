import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "../../node_modules/xterm/css/xterm.css";
import { listmap, getID, ansiColor, log, lastArr, moveAnyArr, delthisline } from "./utility";

createTerm();
function createTerm() {
    const terminalBody = document.createElement("div");
    terminalBody.id = "terminal-body";
    getID("container").appendChild(terminalBody);
    let history_write = [];
    let curline = "";
    let currPos = 0;
    let prompt = ansiColor("4e9a06", "⮞ ");

    const term = new Terminal({
        fontFamily: "DroidSansMono",
        cursorBlink: true,
        cursorStyle: "underline",
    });
    const fitaddon = new FitAddon();
    term.open(getID("terminal-body"));
    term.loadAddon(fitaddon);
    term.focus();
    fitaddon.fit();
    term.write(prompt);

    const cursorX = () => term.buffer.normal.cursorX;
    let lastpost = true;

    term.onKey((e) => {
        const ev = e.domEvent;
        const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;
        const cekChart = listmap.chart.find((item) => item == ev.key);

        if (ev.key === "Enter") {
            if (cursorX() > 2 && curline.length > 0) {
                if (history_write.includes(curline)) {
                    lastArr(history_write) != curline && moveAnyArr(history_write, curline);
                } else history_write.push(curline);

                currPos = history_write.length - 1;
                if (["cls", "clear"].includes(curline)) {
                    term.write(`${delthisline()}\r${prompt}`);
                    term.clear();
                } else term.write(`\r\n${delthisline()}${curline}\r\n${delthisline()}${prompt}`);
                lastpost = true;
                log(curline);
                log(history_write);
            } else term.write(`\n${delthisline()}\r${prompt}`);
            curline = "";
        } else if (ev.key in listmap.ckey) listmap.ckey[ev.key](term, cursorX, curline);
        else if (ev.key === "ArrowUp") {
            if (history_write.length > 0) {
                currPos > 0 && (lastpost ? (lastpost = false) : (currPos -= 1));
                curline = history_write[currPos];
                term.write(`${delthisline()}\r${prompt}${curline}`);
            }
        } else if (ev.key === "ArrowDown") {
            currPos += 1;
            currPos === history_write.length && (lastpost = true);
            if (currPos === history_write.length || history_write.length === 0) {
                currPos -= 1;
                curline = "";
                term.write(`${delthisline()}\r${prompt}`);
            } else {
                curline = history_write[currPos];
                term.write(`${delthisline()}\r${prompt}${curline}`);
            }
        } else if (printable) {
            ev.key == "Tab" ? (term.write("    "), (curline += "    ")) : cekChart != undefined && (term.write(cekChart), (curline += cekChart));
        }
    });

    window.addEventListener("resize", () => fitaddon.fit());
    const addWindow = { listmap, term, getID, cursorX, ansiColor, log, lastArr, moveAnyArr };
    Object.assign(globalThis, addWindow);
}
