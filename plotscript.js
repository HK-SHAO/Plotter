function download(name, url) {
    let a = document.createElement('a');
    a.download = name;
    a.href = url;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function exportCanvas() {
    download("Plotter_Image.png", canv.toDataURL("image/png"));
}

mediaRecord = undefined;
function createRecord() {
    let chunks = new Set();
    mediaRecord = new MediaRecorder(canv.captureStream(fps), {
        videoBitsPerSecond: 8500000
    });
    mediaRecord.ondataavailable = function (e) {
        chunks.add(e.data);
    }
    mediaRecord.onstop = function () {
        download("Plotter_Record.webm", window.URL.createObjectURL(new Blob(chunks, { 'type': 'video/webm' })));
        delete chunks;
        chunks = new Set();
    }
}

function recordCanvas(bu) {
    if (bu.innerText === "录制") {
        if (mediaRecord === undefined) {
            createRecord();
        }
        mediaRecord.start();
        bu.innerText = "结束";
    } else {
        mediaRecord.stop();
        bu.innerText = "录制";
    }
}

function audiocontrol(bu) {
    if (bu.innerText === "play") {
        audioCtx = new AudioContext();
        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start(audioCtx.currentTime);
        gainNode.gain.value = 0;
        bu.innerText = "stop";
    } else {
        audioCtx.close();
        delete audioCtx;
        bu.innerText = "play";
    }
    refresh(true);
}

function insertText(str) {
    if (document.selection) {
        let sel = document.selection.createRange();
        sel.text = str;
    } else if (typeof ined.selectionStart === 'number' && typeof ined.selectionEnd === 'number') {
        let startPos = ined.selectionStart,
            endPos = ined.selectionEnd,
            cursorPos = startPos,
            tmpStr = ined.value;
        ined.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
        cursorPos += str.length;
        ined.selectionStart = ined.selectionEnd = cursorPos + ((str[str.length - 1] === ')') ? -1 : 0);
    } else {
        ined.value += str;
    }
    ined.focus();
    inChange();
}

function csqr(z) {
    return [z[0] * z[0] - z[1] * z[1], 2 * z[0] * z[1]];
}

function cadd(z1, z2) {
    return [z1[0] + z2[0], z1[1] + z2[1]];
}

function Mandelbrot(x, y, n = 100) {
    let c = [x, y];
    let z = [0, 0];
    for (let i = 0; i < n; i++) {
        z = cadd(csqr(z), c);
        if (Math.abs(z[0]) > 1 && Math.abs(z[1]) > 1) {
            return math.matrix([NaN, NaN, NaN]);
        }
    }
    return math.matrix([z[0], z[1], Math.sqrt(z[0] * z[0] + z[1] * z[1])]);
}

function Julia(x, y, a, b, n = 100) {
    let z = [x, y];
    let c = [a, b];
    for (let i = 0; i < n; i++) {
        z = cadd(csqr(z), c);
        if (Math.abs(z[0]) > 1 && Math.abs(z[1]) > 1) {
            return math.matrix([NaN, NaN, NaN]);
        }
    }
    return math.matrix([z[0], z[1], Math.sqrt(z[0] * z[0] + z[1] * z[1])]);
}

function Logistic(u, x0, n = 100) {
    let x = x0;
    for (let i = 0; i < n; i++) {
        x *= u * (1 - x);
    }
    return x;
}

function ctransX(px) {
    return (px + 1) / 2 * size - 1;
}

function ctransY(py) {
    return (1 - py) * size / 2 - 1;
}

math.import({
    hkshao: function () {
        return "你发现了这个彩蛋！";
    },
    pb: function (n) {
        p_b = n;
        return 0;
    },
    ps: function (n) {
        ps = n;
        return 0;
    },
    pn: function (n) {
        p_n = n;
        return 0;
    },
    ls: function (n) {
        ls = n;
        return 0;
    },
    Scale: function (sc = 1) {
        scale = sc;
        return "zoomed to " + sc;
    },
    Color: function (co) {
        if (typeof co === "string") {
            color = [co];
        } else if (arguments.length === 3) {
            color = ["rgb(" + arguments[0] * 255 + "," + arguments[1] * 255 + "," + arguments[2] * 255 + ")"];
        } else {
            color = ["rgb(" + arguments._data[0] * 255 + "," + arguments._data[1] * 255 + "," + arguments._data[2] * 255 + ")"];
        }
        return "colored to " + color[0];
    },
    color: function (r = 1, g, b) {
        if (arguments.length === 3) {
            ctx.fillStyle = "rgb(" + r * 255 + "," + g * 255 + "," + b * 255 + ")";
        } else {
            ctx.fillStyle = "rgb(" + arguments[0]._data[0] * 255 + "," + arguments[0]._data[1] * 255 + "," + arguments[0]._data[2] * 255 + ")";
        }
        return 0;
    },
    π: this.Math.PI,
    τ: math.tau,
    xy: function (x, y) {
        return math.matrix([x, y]);
    },
    ρθ: function (ρ, θ) {
        return math.matrix([ρ * Math.cos(θ), ρ * Math.sin(θ)]);
    },
    rgb: function (r, g, b) {
        return math.matrix([r / 255, g / 255, b / 255]);
    },
    Line: function (k, p1, p2) {
        let a = p1._data;
        let b = p2._data;
        return math.matrix([a[0] + k * (b[0] - a[0]), a[1] + k * (b[1] - a[1])]);
    },
    B2: function (k, p0, p1, p2) {
        let a = p0._data;
        let b = p1._data;
        let c = p2._data;
        return math.matrix([(1 - k) ** 2 * a[0] + 2 * k * (1 - k) * b[0] + k ** 2 * c[0], (1 - k) ** 2 * a[1] + 2 * k * (1 - k) * b[1] + k ** 2 * c[1]]);
    },
    Circle: function (k, p, r) {
        let x0 = p._data[0];
        let y0 = p._data[1];
        return math.matrix([x0 + r * Math.cos(2 * Math.PI * k), y0 + r * Math.sin(2 * Math.PI * k)]);
    },
    Polygon: function (k) {
        let n = arguments.length - 1;
        let m = k * n;
        let a = arguments[Math.floor(m) % n + 1]._data;
        let b = arguments[(Math.floor(m) + 1) % n + 1]._data;
        return math.matrix([a[0] + m % 1 * (b[0] - a[0]), a[1] + m % 1 * (b[1] - a[1])]);
    },
    C2M: function (z) {
        return math.matrix([z.re, z.im]);
    },
    Play: function (f, v, m = 0) {
        if (typeof audioCtx !== "undefined") {
            oscillator.frequency.value = f;
            gainNode.gain.value = v;
            switch (m) {
                case 0:
                    oscillator.type = 'sine';
                    break;
                case 1:
                    oscillator.type = 'square';
                    break;
                case 2:
                    oscillator.type = 'triangle';
                    break;
                case 3:
                    oscillator.type = 'sawtooth';
                    break;
                default:
                    oscillator.type = 'sine';
                    break;
            }
            return oscillator.type + " wave";
        } else {
            return "undefined";
        }
    },
    PlayS: function (f, v, m = 0, t, x) {
        switch (m) {
            case 0:
                return v * Math.sin(f * x / 20 + t / 1000);
            case 1:
                return v * Math.sign(Math.sin(f * x / 20 + t / 1000));
            case 2:
                return 2 * Math.abs(v * (f * x / 50 + t / 2000) % (2 * v) - v) - v;
            case 3:
                return 2 * v * (f * x / 100 + t / 2000) % (2 * v) - v;
            default:
                return v * Math.sin(f * x / 20 + t / 1000);
        }
    },
    Write: function (text, p, color = "black", sc = 1) {
        ctx.font = 18 * sc / scale + "px MathFont, Georgia, serif";
        ctx.fillStyle = color;
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(text, ctransX(p._data[0] / scale), ctransY(p._data[1] / scale));
        return "文本绘制完成";
    },
    write: function (text, p, color = "black", sc = 1) {
        ctx.font = 18 * sc / scale + "px MathFont, Georgia, serif";
        ctx.fillStyle = color;
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(text, ctransX(p._data[0] / scale), ctransY(p._data[1] / scale));
        return 0;
    },
    Tex: function (tex, p, sc = 1) {
        let cimg = new Image();
        cimg.src = "https://www.zhihu.com/equation?tex=" + encodeURIComponent(tex);
        cimg.onload = function () {
            ctx.drawImage(this, ctransX(p._data[0] / scale), ctransY(p._data[1] / scale), this.width * sc / scale, this.height * sc / scale);
        }
        return "TeX绘制完成";
    },
    Julia,
    Mandelbrot,
    Logistic,
    Γ: math.gamma,
    φ: math.phi,
    ln: function (mx) {
        return math.log(mx);
    },
    Σ: function (k, n, f) {
        let s = 0;
        for (let i = k; i <= n; i++) {
            s += f(i);
        }
        return s;
    },
    Π: function (k, n, f) {
        let s = 1;
        for (let i = k; i <= n; i++) {
            s *= f(i);
        }
        return s;
    },
    Diff: function (f, mx, n = 0.00000001) {
        return (f(mx + n) - f(mx)) / n;
    },
    Integ: function (s, e, f, n = 100000) {
        let inc = (e - s) / n;
        let totalHeight = 0;
        for (let i = s; i < e; i += inc) {
            totalHeight += f(i);
        }
        return totalHeight * inc;
    },
    Limit: function (f, mx) {
        return f(mx);
    }
});

const cfa = document.getElementById("father");
const canv = document.getElementById("gc");
const ctx = canv.getContext("2d");
const canv2 = document.getElementById("gc2");
const ctx2 = canv2.getContext("2d");
const ined = document.getElementById("ed");
const ined2 = document.getElementById("ed2");
const outm = document.getElementById("outm");
const fpsm = document.getElementById("fpsm");
const img = document.getElementById("img");
const lft = document.getElementById("lft");

const customLaTeX = {
    'mod': function (node, options) {
        return "\\mathrm{mod}\\left(" + node.args[0].toTex(options) + "," + node.args[1].toTex(options) + "\\right)";
    },
    'Σ': function (node, options) {
        let n2tex = node.args[2].toTex(options);
        let index = n2tex.indexOf(":=");
        if (index === -1) {
            return "\\sum_{k=" + node.args[0].toTex(options) + "}^{" + node.args[1].toTex(options) + "}{" + n2tex + "(k)}";
        } else {
            return "\\sum_{" + node.args[2].params[0] + "=" + node.args[0].toTex(options) + "}^{" + node.args[1].toTex(options) + "}{" + n2tex.substring(index + 2) + "}";
        }
    },
    'Π': function (node, options) {
        let n2tex = node.args[2].toTex(options);
        let index = n2tex.indexOf(":=");
        if (index === -1) {
            return "\\prod_{k=" + node.args[0].toTex(options) + "}^{" + node.args[1].toTex(options) + "}{" + n2tex + "(k)}";
        } else {
            return "\\prod_{" + node.args[2].params[0] + "=" + node.args[0].toTex(options) + "}^{" + node.args[1].toTex(options) + "}{" + n2tex.substring(index + 2) + "}";
        }
    },
    'Diff': function (node, options) {
        let n2tex = node.args[0].toTex(options);
        let index = n2tex.indexOf(":=");
        if (index === -1) {
            return "\\left.\\dfrac{\\mathrm{d}" + n2tex + "(x)}{\\mathrm{d}x}\\right|_{x=" + node.args[1].toTex(options) + "}";
        }
        else {
            return "\\left.\\dfrac{\\mathrm{d}" + n2tex.substring(index + 2) + "}{\\mathrm{d}" + node.args[0].params[0] + "}\\right|_{" + node.args[0].params[0] + "=" + node.args[1].toTex(options) + "}";
        }
    },
    'Integ': function (node, options) {
        let n2tex = node.args[2].toTex(options);
        let index = n2tex.indexOf(":=");
        if (index === -1) {
            return "\\int_{" + node.args[0].toTex(options) + "}^{" + node.args[1].toTex(options) + "}{" + n2tex + "(x)}\\mathrm{d}x";
        }
        else {
            return "\\int_{" + node.args[0].toTex(options) + "}^{" + node.args[1].toTex(options) + "}{" + n2tex.substring(index + 2) + "}\\mathrm{d}" + node.args[2].params[0];
        }
    },
    'Limit': function (node, options) {
        let n2tex = node.args[0].toTex(options);
        let index = n2tex.indexOf(":=");
        if (index === -1) {
            return "\\lim_{x\\to " + node.args[1].toTex(options) + "}{" + n2tex + "(x)}";
        }
        else {
            return "\\lim_{" + node.args[0].params[0] + " \\to " + node.args[1].toTex(options) + "}{" + n2tex.substring(index + 2) + "}";
        }
    }
};
window.onload = function () {
    mxf = 0;
    myf = 0;
    interval = 0;
    scale = 1;
    this.inChange2();
    this.reData();
    window.onresize();
    reLaTeX();
    cfa.addEventListener("mousemove", mouseMove);
    cfa.addEventListener("mousewheel", mouseWheel);
}

window.onresize = function () {
    if (window.innerWidth >= 700) {
        size = Math.min(window.innerWidth / 2, window.innerHeight * 0.95);
    } else {
        size = Math.min(window.innerWidth - 20, window.innerHeight * 0.95);
    }
    lft.style.width = size + 16 + "px";
    cfa.style.width = size + "px";
    cfa.style.height = size + "px";
    canv.width = size;
    canv.height = size;
    canv2.width = size;
    canv2.height = size;
    ined.style.height = 0;
    ined.style.height = ined.scrollHeight - 2 + "px";
    ined2.style.height = 0;
    ined2.style.height = ined2.scrollHeight - 2 + "px";
    this.reCanvas2();
    this.refresh(true);
}

function zoom(b) {
    if (b) {
        scale /= 1.05;
    } else {
        scale *= 1.05;
    }
    refresh(true);
}

function mouseWheel(e) {
    e.preventDefault();
    zoom(e.wheelDelta > 0);
    mouseMove(e, false);
}

function mouseMove(e, isR = true) {
    e.preventDefault();
    let cRect = canv2.getBoundingClientRect();
    let mx = Math.round(e.clientX - cRect.left);
    let my = Math.round(e.clientY - cRect.top);
    canv2.width = canv2.height;

    ctx2.beginPath();
    ctx2.lineWidth = 0.3;
    for (let i = 1; i < 10; i++) {
        let sid10 = size * i / 10;
        ctx2.moveTo(sid10, 0);
        ctx2.lineTo(sid10, size);
        ctx2.moveTo(0, sid10);
        ctx2.lineTo(size, sid10);
        if (i !== 5) {
            ctx2.fillText((scale * (1 - i / 5)).toPrecision(2), size / 2 + 2, sid10 - 3);
        }
        ctx2.fillText((scale * (i / 5 - 1)).toPrecision(2), sid10 + 3, size / 2 + 12);
    }
    ctx2.strokeStyle = 'gray';
    ctx2.stroke();

    ctx2.strokeStyle = 'black';
    ctx2.beginPath();
    ctx2.lineWidth = 2;
    ctx2.setLineDash([size / 101, size / 101]);
    ctx2.moveTo(size / 2, 0);
    ctx2.lineTo(size / 2, size);
    ctx2.moveTo(0, size / 2);
    ctx2.lineTo(size, size / 2);
    ctx2.stroke();

    ctx2.beginPath();
    ctx2.lineWidth = 1;
    ctx2.setLineDash([size / 201, size / 201]);
    ctx2.moveTo(size / 2, my);
    ctx2.lineTo(mx, my);
    ctx2.moveTo(mx, size / 2);
    ctx2.lineTo(mx, my);
    ctx2.stroke();

    mxf = ((2 * mx / size) - 1) * scale;
    myf = ((-2 * my / size) + 1) * scale;
    ctx2.fillText("( " + mxf.toFixed(8) + " , " + myf.toFixed(8) + " )", 4, 14);
    if (ined.value.search(/(\b|\d)mp\b/g) !== -1 && isR) {
        refresh(true);
    }
}

function reData() {
    excs = [];
    frame = 0;
    x = 0;
    y = 0;
    mg = {};
    ltime = new Date().getTime();
}

function reCanvas() {
    ctx.clearRect(0, 0, size, size);
}

function reCanvas2() {
    canv2.width = canv2.height;
    ctx2.beginPath();
    ctx2.setLineDash([size / 101, size / 101]);
    ctx2.moveTo(size / 2, 0);
    ctx2.lineTo(size / 2, size);
    ctx2.moveTo(0, size / 2);
    ctx2.lineTo(size, size / 2);
    ctx2.strokeStyle = 'gray';
    ctx2.stroke();
}

function plot(ex, exc, outeval, type, sc) {
    ctx.fillStyle = col;
    let ins2 = ex.substring(0, 2);
    if (ins2 === "x=") {
        let pmp = p_n * size;
        for (let i = -pmp; i < pmp; i++) {
            let ty = i / pmp;
            y = sc * ty;
            Object.assign(mg, {
                x,
                y,
                ρ: Math.sqrt(x * x + y * y),
                θ: Math.atan2(y, x)
            });
            x = exc.evaluate(mg);
            let tx = x / sc;
            if (tx > 1 || tx < -1 || isNaN(tx)) {
                continue;
            }
            let py = 0.004 * size * ls;
            ctx.fillRect(ctransX(tx), ctransY(ty), py, py);
        }
    } else if (ins2 === "ρ=") {
        let pmp = 2 * p_n * size;
        for (let i = 0; i < pmp; i++) {
            let θ = 2 * Math.PI * i / pmp;
            Object.assign(mg, {
                x,
                y,
                ρ: Math.sqrt(x * x + y * y),
                θ
            });
            let ρ = exc.evaluate(mg);
            x = ρ * Math.cos(θ);
            y = ρ * Math.sin(θ);
            let tx = x / sc;
            let ty = y / sc;
            if (ty > 1 || ty < -1 || tx > 1 || tx < -1 || isNaN(tx) || isNaN(ty)) {
                continue;
            }
            let py = 0.004 * size * ls;
            ctx.fillRect(ctransX(tx), ctransY(ty), py, py);
        }
    } else if (ins2 === "θ=") {
        let pmp = 2 * p_n * size;
        for (let i = 0; i < pmp; i++) {
            let ρ = sc * Math.SQRT2 * i / pmp;
            Object.assign(mg, {
                x,
                y,
                ρ: ρ,
                θ: Math.atan2(y, x)
            });
            let θ = exc.evaluate(mg);
            x = ρ * Math.cos(θ);
            y = ρ * Math.sin(θ);
            let tx = x / sc;
            let ty = y / sc;
            if (ty > 1 || ty < -1 || tx > 1 || tx < -1 || isNaN(tx) || isNaN(ty)) {
                continue;
            }
            let py = 0.004 * size * ls;
            ctx.fillRect(ctransX(tx), ctransY(ty), py, py);
        }
    } else if (ins2 === "y=" || type === "number") {
        let pmp = p_n * size;
        for (let i = -pmp; i < pmp; i++) {
            let tx = i / pmp;
            x = sc * tx;
            Object.assign(mg, {
                x,
                y,
                ρ: Math.sqrt(x * x + y * y),
                θ: Math.atan2(y, x)
            });
            y = exc.evaluate(mg);
            let ty = y / sc;
            if (ty > 1 || ty < -1 || isNaN(ty)) {
                continue;
            }
            let py = 0.004 * size * ls;
            ctx.fillRect(ctransX(tx), ctransY(ty), py, py);
        }
    } else if (type === "boolean") {
        let jd = size / p_b;
        for (let i = 0; i < size; i += jd) {
            for (let j = 0; j < size; j += jd) {
                x = sc * (2 * i - size) / size;
                y = sc * -(2 * j - size) / size;
                Object.assign(mg, {
                    x,
                    y,
                    ρ: Math.sqrt(x * x + y * y),
                    θ: Math.atan2(y, x)
                });
                let ans = exc.evaluate(mg);
                if (ans === true) {
                    let py = jd * ps;
                    ctx.fillRect(i, j, py + 1, py + 1);
                }
            }
        }
    } else if (type === "object") {
        if (outeval.im !== undefined) {
            let pmp = 2 * p_n * size;
            for (let i = 0; i < pmp; i++) {
                let t = i / pmp;
                Object.assign(mg, {
                    x,
                    y,
                    ρ: Math.sqrt(x * x + y * y),
                    θ: Math.atan2(y, x),
                    k: t
                });
                let ob = exc.evaluate(mg);
                x = ob.re;
                y = ob.im;
                let tx = x / sc;
                let ty = y / sc;
                if (ty > 1 || ty < -1 || tx > 1 || tx < -1 || isNaN(tx) || isNaN(ty)) {
                    continue;
                }
                let py = 0.004 * size * ls;
                ctx.fillRect(ctransX(tx), ctransY(ty), py, py);
            }
        } else if (outeval._data !== undefined) {
            if ((outeval._data.length === 1 || outeval._data.length > 3) && outeval._data[0].length === undefined) {
                for (let i = outeval._data.length - 1; i > -1; i--) {
                    let px = size / outeval._data.length;
                    let py = outeval._data[i] * size / (2 * sc);
                    let m = i * px;
                    let n = size / 2 - py;
                    ctx.fillRect(m, n, px + 1, py + 1);
                }
            } else if (outeval._data[0].length !== undefined && outeval._data[0][0].length === 3) {
                for (let i = outeval._data.length - 1; i > -1; i--) {
                    for (let j = outeval._data[0].length - 1; j > -1; j--) {
                        let px = size / outeval._data[0].length;
                        let py = size / outeval._data.length;
                        let m = px * j;
                        let n = py * i;
                        let r = outeval._data[i][j][0] * 255;
                        let g = outeval._data[i][j][1] * 255;
                        let b = outeval._data[i][j][2] * 255;
                        if (isNaN(r) || isNaN(g) || isNaN(b)) {
                            continue;
                        }
                        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                        ctx.fillRect(m, n, px + 1, py + 1);
                    }
                }
            } else if (outeval._data[0].length !== undefined && outeval._data[0][0].length === undefined) {
                for (let i = outeval._data.length - 1; i > -1; i--) {
                    for (let j = outeval._data[0].length - 1; j > -1; j--) {
                        let px = size / outeval._data[0].length;
                        let py = size / outeval._data.length;
                        let m = px * j;
                        let n = py * i;
                        let c = outeval._data[i][j] * 255;
                        if (isNaN(c)) {
                            continue;
                        }
                        ctx.fillStyle = "rgb(" + c + "," + c + "," + c + ")";
                        ctx.fillRect(m, n, px + 1, py + 1);
                    }
                }
            } else if (outeval._data.length === 2 && outeval._data[0].length === undefined) {
                let pmp = 2 * p_n * size;
                for (let i = 0; i < pmp; i++) {
                    let t = i / pmp;
                    Object.assign(mg, {
                        x,
                        y,
                        ρ: Math.sqrt(x * x + y * y),
                        θ: Math.atan2(y, x),
                        k: t
                    });
                    let ob = exc.evaluate(mg);
                    x = ob._data[0];
                    y = ob._data[1];
                    let tx = x / sc;
                    let ty = y / sc;
                    if (ty > 1 || ty < -1 || tx > 1 || tx < -1 || isNaN(tx) || isNaN(ty)) {
                        continue;
                    }
                    let py = 0.004 * size * ls;
                    ctx.fillRect(ctransX(tx), ctransY(ty), py, py);
                }
            } else if (outeval._data.length === 3 && outeval._data[0].length === undefined) {
                let jd = size / p_b;
                for (let i = 0; i < size; i += jd) {
                    for (let j = 0; j < size; j += jd) {
                        x = sc * (2 * i - size) / size;
                        y = sc * -(2 * j - size) / size;
                        Object.assign(mg, {
                            x,
                            y,
                            ρ: Math.sqrt(x * x + y * y),
                            θ: Math.atan2(y, x)
                        });
                        let ob = exc.evaluate(mg);
                        let r = ob._data[0] * 255;
                        let g = ob._data[1] * 255;
                        let b = ob._data[2] * 255;
                        if (isNaN(r) || isNaN(g) || isNaN(b)) {
                            continue;
                        }
                        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                        let py = jd * ps;
                        ctx.fillRect(i, j, py + 1, py + 1);
                    }
                }
            }
        }
    }
}

function changeOm(str) {
    if (str !== outm.innerText) {
        outm.innerText = str;
    }
}

function splot(exs) {
    let omes = "";
    let exsl = exs.length;
    let excsl = excs.length;
    if (excsl === 0) {
        for (let i = 0; i < exsl; i++) {
            try {
                let ins2 = exs[i].substring(0, 2);
                if (exs[i][0] === '>') {
                    excs.push(math.compile(exs[i].substring(1)));
                } else if (ins2 === "y=" || ins2 === "x=" || ins2 === "ρ=" || ins2 === "θ=") {
                    excs.push(math.compile(exs[i].substring(2)));
                } else {
                    excs.push(math.compile(exs[i]));
                }
                ined.style.border = "dashed green";
            } catch (err) {
                omes += "CompileError: Line " + (i + 1) + "\n";
                ined.style.border = "dashed red";
            }
        }
    }
    let ci = 0;
    frame += 1;
    mg = Object.assign({
        time,
        frame,
        mp: math.matrix([mxf, myf])
    }, def);
    excsl = excs.length;
    for (let i = 0; i < excsl; i++) {
        let exc = excs[i];
        Object.assign(mg, {
            x: 0,
            y: 0,
            ρ: 0,
            θ: 0,
            k: 0
        });
        try {
            let outeval = exc.evaluate(mg);
            let type = typeof outeval;
            if (type !== "function") {
                omes += outeval + "\n";
                if (exs[i][0] !== '>' && type !== "string") {
                    col = color[ci++ % color.length];
                    plot(exs[i], exc, outeval, type, scale);
                }
            } else {
                omes += "function" + "\n";
            }
        } catch (err) {
            omes += "PlotError: Line " + (i + 1) + "\n";
            ined.style.border = "dashed red";
        }
    }
    return omes;
}

function showLaTeX(str) {
    img.alt = str.replace(/\\;\\;/g, "\\\\").replace(/\\frac\{\\left\((.*)\\right\)\}\{(.*)\}/g, '\\frac{$1}{$2}')
        .replace(/\\frac\{(.*)\}\{\\left\((.*)\\right\)\}/g, '\\frac{$1}{$2}')
        .replace(/\^\{\\left\((.*)\\right\)\}/g, '^{$1}').replace(/Infinity/g, '\\infty')
        .replace(/\\cdot\\left\(/g, '\\left(').replace(/\\cdot/g, '\\times').replace(/\\mathrm\{Tex\}\\left\(.*\\right\)/g, '\\mathrm{Tex}()');
    img.src = "https://www.zhihu.com/equation?tex=" + encodeURIComponent(img.alt);
}

function changefm(str) {
    if (str !== fpsm.innerText) {
        fpsm.innerText = str;
    }
}

function refresh(isD = false) {
    time = new Date().getTime();
    if (ined.value.search(/(\b|\d)time\b/g) !== -1 || ined.value.search(/(\b|\d)frame\b/g) !=
        -1 || isD || excs.length === 0) {
        if (ined.value.length !== 0) {
            reCanvas();
            let exs = ined.value.split('\n');
            changeOm(splot(exs));
        }
    }
    changefm(Math.round(1000 / (time - ltime)) + " fps");
    ltime = time;
}

function reLaTeX() {
    let str = ined.value.replace(/\n>/g, '\n');
    if (str[0] === '>') {
        str = str.substring(1);
    }
    try {
        showLaTeX(math.parse(str).toTex({ handler: customLaTeX }));
    } catch (err) {
        showLaTeX("");
    }
}

function refreshEd(o) {
    o.style.height = o.scrollHeight - 4 + "px";
}

function inChange() {
    ined.style.height = 0;
    ined.style.height = ined.scrollHeight - 4 + "px";
    ined.value = ined.value.replace(/³/g, "^3").replace(/²/g, "^2").replace(/×/g, "*");
    reData();
    refresh(true);
    if (ined.value.length === 0) {
        {
            ined.style.border = "dashed red";
            showLaTeX("");
            changeOm("undefined");
            reCanvas();
        }
    } else {
        reLaTeX();
    }
}

function inChange2() {
    ined2.style.height = 0;
    ined2.style.height = ined2.scrollHeight - 4 + "px";
    try {
        eval(ined2.value);
        excs = [];
        ined2.style.border = "dashed green";
    } catch (err) {
        ined2.style.border = "dashed red";
    }
    window.clearInterval(interval);
    if (fps !== 0) {
        interval = window.setInterval(refresh, 1000 / fps);
    } else {
        fpsm.innerText = "0 fps";
    }
}