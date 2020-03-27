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
        ined.selectionStart = ined.selectionEnd = cursorPos;
    } else {
        ined.value += str;
    }
    ined.focus();
}

function csqr(z) {
    return [z[0] * z[0] - z[1] * z[1], 2 * z[0] * z[1]];
}

function cadd(z1, z2) {
    return [z1[0] + z2[0], z1[1] + z2[1]];
}

function Mandelbrot(x, y, n) {
    let c = [x, y];
    let z = [0, 0];
    for (let i = 0; i < n; i++) {
        z = cadd(csqr(z), c);
    }
    let abs = Math.sqrt(z[0] * z[0] + z[1] * z[1]);
    return abs < 2;
}

function MandelbrotC(x, y, n) {
    let c = [x, y];
    let z = [0, 0];
    for (let i = 0; i < n; i++) {
        z = cadd(csqr(z), c);
    }
    let abs = Math.sqrt(z[0] * z[0] + z[1] * z[1]);
    return math.matrix([z[0], z[1], abs]);
}

function Julia(x, y, a, b, n) {
    let z = [x, y];
    let c = [a, b];
    for (let i = 0; i < n; i++) {
        z = cadd(csqr(z), c);
    }
    let abs = Math.sqrt(z[0] * z[0] + z[1] * z[1]);
    return abs < 2;
}

function JuliaC(x, y, a, b, n) {
    let z = [x, y];
    let c = [a, b];
    for (let i = 0; i < n; i++) {
        z = cadd(csqr(z), c);
    }
    let abs = Math.sqrt(z[0] * z[0] + z[1] * z[1]);
    return math.matrix([z[0], z[1], abs]);
}

function Logistic(u, x0, n) {
    let x = x0;
    for (let i = 0; i < n; i++) {
        x *= u * (1 - x);
    }
    return x;
}

math.import({
    hkshao: function () {
        return "恭喜你发现这个彩蛋！";
    },
    π: this.Math.PI,
    τ: math.tau,
    xy: function (x, y) {
        return math.matrix([x, y]);
    },
    ρθ: function (ρ, θ) {
        return math.matrix([ρ * Math.cos(θ), ρ * Math.sin(θ)]);
    },
    line: function (k, m1, m2) {
        let a = m1._data;
        let b = m2._data;
        return math.matrix([a[0] + k * (b[0] - a[0]), a[1] + k * (b[1] - a[1])]);
    },
    Julia,
    Mandelbrot,
    JuliaC,
    MandelbrotC,
    Logistic,
    Γ: math.gamma,
    φ: math.phi,
    Σ: function (ex, m) {
        let s = 0;
        let md = m._data;
        let exc = math.compile(ex);
        for (let i = 0; i < md.length; i++) {
            Object.assign(mg, {
                n: md[i],
            });
            let ans = exc.evaluate(mg);
            s += ans;
        }
        return s;
    },
    Π: function (ex, m) {
        let s = 1;
        let md = m._data;
        let exc = math.compile(ex);
        for (let i = 0; i < md.length; i++) {
            Object.assign(mg, {
                n: md[i],
            });
            let ans = exc.evaluate(mg);
            s *= ans;
        }
        return s;
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

window.onload = function () {
    mxf = 0;
    myf = 0;
    interval = 0;
    inChange2();
    reData();
    intmp = ""
    col = color[0];
    window.onresize();
    canv.addEventListener("mousemove", mouseMove);
}

window.onresize = function () {
    size = Math.min(window.innerWidth / 2, window.innerHeight * 0.95);
    lft.style.width = size + 16 + "px";
    cfa.style.width = size + "px";
    cfa.style.height = size + "px";
    canv.width = size;
    canv.height = size;
    canv2.width = size;
    canv2.height = size;
    reCanvas2();
    inChange(true);
}

function mouseMove(e) {
    let cRect = canv2.getBoundingClientRect();
    let mx = Math.round(e.clientX - cRect.left);
    let my = Math.round(e.clientY - cRect.top);
    canv2.width = canv2.height;
    ctx2.strokeStyle = 'gray';
    ctx2.setLineDash([size / 201, size / 201]);
    ctx2.moveTo(size / 2, 0);
    ctx2.lineTo(size / 2, size);
    ctx2.moveTo(0, size / 2);
    ctx2.lineTo(size, size / 2);
    ctx2.moveTo(size / 2, my);
    ctx2.lineTo(mx, my);
    ctx2.moveTo(mx, size / 2);
    ctx2.lineTo(mx, my);
    mxf = (2 * mx / size) - 1;
    myf = (-2 * my / size) + 1;
    ctx2.stroke();
    ctx2.fillText("(" + mxf.toFixed(8) + ", " + myf.toFixed(8) + ")", 4, 14);
    if (ined.value.search(/(\b|\d)mp\b/g) != -1) {
        inChange(true);
    }
}

function reData() {
    excs = [];
    frame = 0;
    x = 0;
    y = 0;
    mg = {};
}

function reCanvas() {
    ctx.clearRect(0, 0, size, size);
}

function reCanvas2() {
    canv2.width = canv2.height;
    ctx2.strokeStyle = 'gray';
    ctx2.setLineDash([size / 101, size / 101]);
    ctx2.moveTo(size / 2, 0);
    ctx2.lineTo(size / 2, size);
    ctx2.moveTo(0, size / 2);
    ctx2.lineTo(size, size / 2);
    ctx2.stroke();
}

function plot(ex, exc, outeval) {
    ctx.fillStyle = col;
    let ins2 = ex.substring(0, 2);
    if (ins2 == "x=") {
        for (let i = -p_n * size; i <= p_n * size; i++) {
            y = i / (p_n * size);
            Object.assign(mg, {
                x,
                y,
                ρ: Math.sqrt(x * x + y * y),
                θ: Math.atan2(y, x)
            });
            x = exc.evaluate(mg);
            if (x > 1 || x < -1 || isNaN(x)) {
                continue;
            }
            let py = 0.004 * size * ls;
            ctx.fillRect((x + 1) / 2 * size - 1, (1 - y) * size / 2 - 1, py, py);
        }
    } else if (ins2 == "ρ=") {
        for (let i = 0; i <= 2 * p_n * size; i++) {
            let θ = Math.PI * i / (p_n * size);
            Object.assign(mg, {
                x,
                y,
                ρ: Math.sqrt(x * x + y * y),
                θ
            });
            let ρ = exc.evaluate(mg);
            x = ρ * Math.cos(θ);
            y = ρ * Math.sin(θ);
            if (y > 1 || y < -1 || x > 1 || x < -1 || isNaN(x) || isNaN(y)) {
                continue;
            }
            let py = 0.004 * size * ls;
            ctx.fillRect((x + 1) / 2 * size - 1, (1 - y) * size / 2 - 1, py, py);
        }
    } else if (ins2 == "θ=") {
        for (let i = 0; i <= 2 * p_n * size; i++) {
            let ρ = Math.SQRT2 * i / (2 * p_n * size);
            Object.assign(mg, {
                x,
                y,
                ρ,
                θ: Math.atan2(y, x)
            });
            let θ = exc.evaluate(mg);
            x = ρ * Math.cos(θ);
            y = ρ * Math.sin(θ);
            if (y > 1 || y < -1 || x > 1 || x < -1 || isNaN(x) || isNaN(y)) {
                continue;
            }
            let py = 0.004 * size * ls;
            ctx.fillRect((x + 1) / 2 * size - 1, (1 - y) * size / 2 - 1, py, py);
        }
    } else if (ins2 == "y=" || typeof outeval == "number") {
        for (let i = -p_n * size; i <= p_n * size; i++) {
            x = i / (p_n * size);
            Object.assign(mg, {
                x,
                y,
                ρ: Math.sqrt(x * x + y * y),
                θ: Math.atan2(y, x)
            });
            y = exc.evaluate(mg);
            if (y > 1 || y < -1 || isNaN(y)) {
                continue;
            }
            let py = 0.004 * size * ls;
            ctx.fillRect((x + 1) / 2 * size - 1, (1 - y) * size / 2 - 1, py, py);
        }
    } else if (typeof outeval == "boolean") {
        let jd = size / p_b;
        for (let i = 0; i <= size; i += jd) {
            for (let j = 0; j <= size; j += jd) {
                x = (2 * i - size) / size;
                y = -(2 * j - size) / size;
                Object.assign(mg, {
                    x,
                    y,
                    ρ: Math.sqrt(x * x + y * y),
                    θ: Math.atan2(y, x)
                });
                let ans = exc.evaluate(mg);
                if (ans == true) {
                    let py = jd * ps;
                    ctx.fillRect(i, j, py + 1, py + 1);
                }
            }
        }
    } else if (typeof outeval == "object") {
        if (outeval.im != undefined) {
            for (let i = 0; i <= 2 * p_n * size; i++) {
                let t = i / (2 * p_n * size);
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
                if (y > 1 || y < -1 || x > 1 || x < -1 || isNaN(x) || isNaN(y)) {
                    continue;
                }
                let py = 0.004 * size * ls;
                ctx.fillRect((x + 1) / 2 * size - 1, (1 - y) * size / 2 - 1, py, py);
            }
        } else if ((outeval._data.length == 1 || outeval._data.length > 3) && outeval._data[0].length == undefined) {
            for (let i = 0; i < outeval._data.length; i++) {
                let px = size / outeval._data.length;
                let py = outeval._data[i] * size / 2;
                let m = i * px;
                let n = 0.5 * size - py;
                ctx.fillRect(m, n, px + 1, py + 1);
            }
        } else if (outeval._data[0].length != undefined && outeval._data[0][0].length == 3) {
            for (let i = 0; i < outeval._data.length; i++) {
                for (let j = 0; j < outeval._data[0].length; j++) {
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
        } else if (outeval._data[0].length != undefined && outeval._data[0][0].length == undefined) {
            for (let i = 0; i < outeval._data.length; i++) {
                for (let j = 0; j < outeval._data[0].length; j++) {
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
        } else if (outeval._data.length == 2 && outeval._data[0].length == undefined) {
            for (let i = 0; i <= 2 * p_n * size; i++) {
                let t = i / (2 * p_n * size);
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
                if (y > 1 || y < -1 || x > 1 || x < -1 || isNaN(x) || isNaN(y)) {
                    continue;
                }
                let py = 0.004 * size * ls;
                ctx.fillRect((x + 1) / 2 * size - 1, (1 - y) * size / 2 - 1, py, py);
            }
        } else if (outeval._data.length == 3 && outeval._data[0].length == undefined) {
            let jd = size / p_b;
            for (let i = 0; i <= size; i += jd) {
                for (let j = 0; j <= size; j += jd) {
                    x = (2 * i - size) / size;
                    y = -(2 * j - size) / size;
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

function changeOm(str) {
    if (str != outm.innerHTML) {
        outm.innerHTML = str;
    }
}

function splot(exs) {
    let omes = "";
    if (excs.length == 0) {
        for (let i = 0; i < exs.length; i++) {
            try {
                if (exs[i][0] == '>') {
                    excs.push(math.compile(exs[i].substring(1)));
                } else {
                    excs.push(math.compile(exs[i]));
                }
            } catch (err) {
                omes += "CompileError: Line " + (i + 1) + "<br>";
                ined.style.border = "dashed red";
                //console.log(err);
                continue;
            }
        }
    }
    let ci = 0;
    frame += 1;
    time = new Date().getTime();
    mg = Object.assign({
        time,
        frame,
        mp: math.matrix([mxf, myf])
    }, def);
    for (let i = 0; i < excs.length; i++) {
        let exc = excs[i];
        ined.style.border = "dashed green";
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
            if (type != "function") {
                omes += outeval + "<br>";
                if (exs[i][0] != '>') {
                    col = color[ci++];
                    plot(exs[i], exc, outeval);
                }
            } else {
                omes += "function" + "<br>";
            }
        } catch (err) {
            omes += "PlotError: Line " + (i + 1) + "<br>";
            ined.style.border = "dashed red";
            //console.log(err);
        }
    }
    return omes;
}

function showLaTex(str) {
    if (img.alt != str) {
        img.alt = str;
        let s = str.replace(/\\;\\;/g, "\\\\")
            .replace(/\\textasciicircum{}/g, "^");
        img.src = "https://www.zhihu.com/equation?tex=" + encodeURIComponent(s);
    }
}

function inChange(isD = false) {
    if (ined.value != intmp || ined.value.search(/(\b|\d)time\b/g) != -1 || ined.value.search(/(\b|\d)frame\b/g) !=
        -1 || isD || excs.length == 0) {
        if (ined.value != intmp) {
            let t1 = new Date().getTime();
            reData();
        }
        intmp = ined.value;
        reCanvas();
        if (ined.value != "") {
            try {
                let str = ined.value.replace(/\('/g, "(").replace(/\("/g, "(")
                    .replace(/'\)/g, "(").replace(/"\)/g, "(")
                    .replace(/',/g, ",").replace(/",/g, ",")
                    .replace(/\n>/g, '\n');
                if (str[0] == '>') {
                    str = str.substring(1);
                }
                showLaTex(math.parse(str).toTex());
            } catch (err) {
                showLaTex("");
                //console.log(err);
            }
            if (ined.value == "0/0" || ined.value == "NaN") {
                changeOm("NaN");
                return;
            }
            let exs = ined.value.split("\n");
            ined.rows = exs.length;
            let omes = splot(exs);
            changeOm(omes);
        } else {
            ined.style.border = "dashed red";
            showLaTex("");
            changeOm("Undefined");
        }
    }
    let t2 = new Date().getTime();
    if (t2 % 500 < 10) {
        fpsm.innerHTML = Math.round(1000 / (t2 - t1)) + " fps";
    }
    t1 = t2;
}

function inChange2() {
    ined2.style.border = "dashed green";
    ined2.rows = ined2.value.split("\n").length;
    try {
        eval(ined2.value);
        excs = [];
    } catch (err) {
        ined2.style.border = "dashed red";
        //console.log(err);
    }
    window.clearInterval(interval);
    if (fps != 0) {
        interval = setInterval("inChange()", Math.ceil(1000 / fps));
    } else {
        fpsm.innerHTML = "0 fps";
    }
}