let history_write = [],
    curline = "",
    currPos = 0,
    lastpost = true;

const listmap = {
    chart: " !@#$%^&*()_+~`|}{[]:;?><,./\\-='\"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    ckey: ["Enter", "Backspace", "F5", "ArrowUp", "ArrowDown"],
    afterckey: (keyCode, term, cursorX, prompt, socket) => {
        const runKey = {
            Backspace: () => cursorX() > 2 && (term.write("\b \b"), (curline = curline.slice(0, -1))),
            F5: () => window.location.reload(),
            Enter: () => {
                if (cursorX() > 2 && curline.length > 0) {
                    if (history_write.includes(curline)) lastArr(history_write) != curline && moveAnyArr(history_write, curline);
                    else history_write.push(curline);

                    currPos = history_write.length - 1;

                    if (["cls", "clear"].includes(curline)) term.write(`${delthisline()}\r${prompt}`), term.clear();
                    else socket.send("\r" + curline + "\r");
                    //else term.write(`\r\n${delthisline()}${curline}\r\n${delthisline()}${prompt}`);

                    lastpost = true;
                } else term.write(`\n${delthisline()}\r${prompt}`);
                curline = "";
            },
            ArrowUp: () => {
                if (history_write.length > 0) {
                    currPos > 0 && (lastpost ? (lastpost = false) : (currPos -= 1));
                    curline = history_write[currPos];
                    term.write(`${delthisline()}\r${prompt}${curline}`);
                }
            },
            ArrowDown: () => {
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
            },
        };
        runKey[keyCode]();
    },
    typing: (term, printable, ev, cekChart) => (printable && ev.key == "Tab" ? (term.write("    "), (curline += "    ")) : cekChart != undefined && (term.write(cekChart), (curline += cekChart))),
};

const ansiColor = (hexcolor, val) => {
    if (hexcolor.length === 6) {
        const aRgbHex = hexcolor.match(/.{1,2}/g);
        const aR = {
            R: parseInt(aRgbHex[0], 16),
            G: parseInt(aRgbHex[1], 16),
            B: parseInt(aRgbHex[2], 16),
        };
        return `\u001b[38;2;${aR.R};${aR.G};${aR.B}m${val}\u001b[0m`;
    } else log("Only six-digit hex colors are allowed.");
};

const delthisline = () => "\u001b[2K";
const getID = (idElm) => document.getElementById(idElm);
const log = (val) => console.log(val);
const lastArr = (arr) => arr.slice(-1)[0];
const moveAnyArr = (arr, item) => arr.push(arr.splice(arr.indexOf(item), 1).pop());

export { listmap, getID, ansiColor, log, lastArr, moveAnyArr, delthisline };
