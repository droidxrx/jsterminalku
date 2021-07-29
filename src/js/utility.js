const listChart = "!@#$%^&*()_+~`|}{[]:;?><,./\\-='\"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const listmap = {
    chart: listChart,
    ckey: {
        Backspace: (term, cursorX, curline) => cursorX() > 2 && (term.write("\b \b"), (curline = curline.slice(0, -1))),
        F5: () => window.location.reload(),
    },
};

const ansiColor = (hexcolor, val) => {
    let rerunted;
    if (hexcolor.length === 6) {
        const aRgbHex = hexcolor.match(/.{1,2}/g);
        const aR = parseInt(aRgbHex[0], 16),
            aG = parseInt(aRgbHex[1], 16),
            aB = parseInt(aRgbHex[2], 16);
        rerunted = `\u001b[38;2;${aR};${aG};${aB}m${val}\u001b[0m`;
    } else rerunted = log("Only six-digit hex colors are allowed.");
    return rerunted;
};

const delthisline = () => "\u001b[2K";

const getID = (idElm) => document.getElementById(idElm);
const log = (val) => console.log(val);
const lastArr = (arr) => arr.slice(-1)[0];
const moveAnyArr = (arr, item) => arr.push(arr.splice(arr.indexOf(item), 1).pop());

export { listmap, getID, ansiColor, log, lastArr, moveAnyArr, delthisline };
