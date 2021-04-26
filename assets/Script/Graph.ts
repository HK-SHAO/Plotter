import MainPlotter from "./Main";
import Utils from "./Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Graph extends cc.Component {

    @property(cc.Label)
    coord_label: cc.Label = null;

    @property(cc.Graphics)
    ctx_bg: cc.Graphics = null;

    @property(cc.Graphics)
    ctx_01: cc.Graphics = null;

    @property(MainPlotter)
    main_script: MainPlotter = null;

    win_width = 0;
    win_height = 0;
    width = 0;
    height = 0;

    scale = 1;

    szoom = 0;
    to_szoom = 0;

    current = -1;
    fn = (x: number) => Math.sin(4 * x);

    fn_cache = new Map<any, any>();

    to_bias_point = cc.v2(0, 0);
    bias_point = cc.v2(0, 0);

    coord_point = cc.v2(0, 0);

    onLoad() {
        this.win_width = cc.winSize.width / 2;
        this.win_height = cc.winSize.height / 2 + 150;
        this.width = this.node.width / 2 - 40;
        this.height = this.node.height / 2 - 40;
    }

    start() {
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);

        this.update_axis();
    }

    update(dt: number) {
        let refresh = false;

        if (Math.abs(this.to_bias_point.x - this.bias_point.x) > 1e-1) {
            this.bias_point.x += (this.to_bias_point.x - this.bias_point.x) * dt * 10;
            refresh = true;
        }
        if (Math.abs(this.to_bias_point.y - this.bias_point.y) > 1e-1) {
            this.bias_point.y += (this.to_bias_point.y - this.bias_point.y) * dt * 10;
            refresh = true;
        }
        if (Math.abs(this.to_szoom - this.szoom) > 1e-1) {
            this.szoom += (this.to_szoom - this.szoom) * dt * 10;
            let old_scale = this.scale;
            this.scale = 1.1 ** this.szoom;

            this.bias_point.x += this.bias_point.x * (this.scale / old_scale - 1);
            this.bias_point.y += this.bias_point.y * (this.scale / old_scale - 1);

            this.to_bias_point.x = this.bias_point.x;
            this.to_bias_point.y = this.bias_point.y;


            refresh = true;
        }

        if (refresh) this.update_coord();
        else this.update_curve_once();
    }

    calfn(x: number): number {
        let fn = this.fn_cache.get(x);
        if (fn === undefined) {
            fn = this.fn(x);
            this.fn_cache.set(x, fn);
        }
        return fn;
    }

    w2cx(p: number) {
        return (p - this.bias_point.x) / this.width / this.scale;
    }

    w2cy(p: number) {
        return (p - this.bias_point.y) / this.width / this.scale;
    }

    c2wx(p: number) {
        return p * this.width * this.scale + this.bias_point.x;
    }

    c2wy(p: number) {
        return p * this.width * this.scale + this.bias_point.y;
    }

    update_axis() {
        // START绘制坐标轴
        let w = this.width - 60;
        let h = this.height - 60;

        let bx = this.bias_point.x;
        let by = this.bias_point.y;

        this.ctx_bg.clear();
        // this.ctx_bg.lineWidth = 8 / this.scale;
        if (by < 0) {
            this.ctx_bg.moveTo(bx, -h + by);
            this.ctx_bg.lineTo(bx, h);
        } else {
            this.ctx_bg.moveTo(bx, -h);
            this.ctx_bg.lineTo(bx, h + by);
        }
        if (bx < 0) {
            this.ctx_bg.moveTo(-w + bx, by);
            this.ctx_bg.lineTo(w, by);
        } else {
            this.ctx_bg.moveTo(-w, by);
            this.ctx_bg.lineTo(w + bx, by);
        }

        let dx = 2 ** ((Math.log2(this.scale) % 1)) * w / 4;

        let win_w = this.win_width;
        let win_h = this.win_height;

        let o = w + Math.abs(bx);
        if (Math.abs(by) < win_h) {
            for (let i = dx; i <= o; i += dx) {
                let ii = i + bx;
                let tmp1 = i <= w;
                let tmp2 = bx < 0;

                if ((tmp2 || tmp1) && Math.abs(ii) < win_w) {
                    this.ctx_bg.moveTo(ii, 10 + by);
                    this.ctx_bg.lineTo(ii, -10 + by);
                }

                ii = -i + bx;
                if ((!tmp2 || tmp1) && Math.abs(ii) < win_w) {
                    this.ctx_bg.moveTo(ii, 10 + by);
                    this.ctx_bg.lineTo(ii, -10 + by);
                }
            }
        }

        o = h + Math.abs(by);
        if (Math.abs(bx) < win_w) {
            for (let i = dx; i <= o; i += dx) {
                let ii = i + by;
                let tmp1 = i <= h;
                let tmp2 = by < 0;

                if ((tmp2 || tmp1) && Math.abs(ii) < win_h) {
                    this.ctx_bg.moveTo(10 + bx, ii);
                    this.ctx_bg.lineTo(-10 + bx, ii);
                }

                ii = -i + by;
                if ((!tmp2 || tmp1) && Math.abs(ii) < win_h) {
                    this.ctx_bg.moveTo(10 + bx, ii);
                    this.ctx_bg.lineTo(-10 + bx, ii);
                }
            }
        }

        // let o = w + Math.abs(bx) + 0.1;
        // for (let i = -w; i < o; i += dx) {
        //     let ii = (bx < 0 ? i : -i) + bx;
        //     this.ctx_bg.moveTo(ii, 10 + by);
        //     this.ctx_bg.lineTo(ii, -10 + by);
        // }

        // let o2 = h + Math.abs(by) + 0.1;
        // for (let i = -h; i < o2; i += dx) {
        //     let ii = (by < 0 ? i : -i) + by;
        //     this.ctx_bg.moveTo(10 + bx, ii);
        //     this.ctx_bg.lineTo(-10 + bx, ii);
        // }

        this.ctx_bg.stroke();
        // END绘制坐标轴
    }

    update_curve_once(im = false) {
        if (this.current !== Infinity) {
            let t = this.current;
            // t 从 -1 到 1

            let tmp = 100 * this.scale;
            let x = t / this.scale + Math.floor(this.coord_point.x * tmp) / tmp;
            let y = this.calfn(x);

            let _x = this.c2wx(x);
            let _y = this.c2wy(y);

            if (t <= -1 || Math.abs(_y) > this.win_height) {
                this.ctx_01.moveTo(_x, _y);
            } else {
                this.ctx_01.lineTo(_x, _y);
                if (!im) {
                    this.ctx_01.stroke();
                }
            }

            if (this.current > 1) {
                this.current = Infinity;
            } else {
                this.current += 0.02;
            }
            // cc.log(this.c2wx(x));
            return true;
        }
        return false;
    }

    update_curve(im = true) {
        this.ctx_01.clear();
        this.current = -1;
        if (im) {
            // 立刻画完
            while (this.update_curve_once(true));
            this.ctx_01.stroke();
        }
        // 更新图像
    }

    update_coord() {
        let coord_x = this.w2cx(0);
        let coord_y = this.w2cy(0);
        this.coord_point.x = coord_x;
        this.coord_point.y = coord_y;

        let prec = 2 + Math.log10(this.scale);
        if (prec < 2) prec = 2;
        if (prec > 13) prec = 13;
        this.coord_label.string = `(${coord_x.toFixed(prec)}, ${coord_y.toFixed(prec)}, ${this.scale.toPrecision(2)})`;

        this.update_axis();
        this.update_curve();
    }

    plotxy(fn: (n?: number) => number, im = true) {
        this.fn_cache.clear();
        switch (fn['num']) {
            case 0:
                let ans = fn();
                this.fn = (_x) => ans;
                break;
            case 1:
                this.fn = fn;
                break;
        }
        this.update_curve(im);
    }

    to_center() {
        this.to_bias_point.x = 0;
        this.to_bias_point.y = 0;

        if (this.main_script.vibrate_switch) {
            Utils.vibrate();
        }
    }

    zoom(delta: number) {
        this.to_szoom = this.to_szoom + delta;
    }

    zoomIn() {
        this.zoom(4);

        if (this.main_script.vibrate_switch) {
            Utils.vibrate();
        }
    }

    zoomOut() {
        this.zoom(-4);

        if (this.main_script.vibrate_switch) {
            Utils.vibrate();
        }
    }

    zoomRec() {
        this.to_szoom = 0;

        if (this.main_script.vibrate_switch) {
            Utils.vibrate();
        }
    }

    recover() {
        this.plotxy((x: number) => Math.sin(4 * x), false);
        this.zoomRec();
        this.to_center();
    }

    onMouseWheel(e: cc.Event.EventMouse) {
        this.zoom(e.getScrollY() / 120);
    }

    onTouchMove(e: cc.Event.EventTouch) {
        let touches: cc.Touch[] = e.getTouches();
        if (touches.length === 1) {
            this.to_bias_point.addSelf(touches[0].getDelta());
        }
        else if (touches.length === 2) {
            let d1 = touches[0].getDelta();
            let d2 = touches[1].getDelta();

            let p1 = touches[0].getLocation();
            let p2 = touches[1].getLocation();

            let delta_p = p2.sub(p1);
            let delta_d = d2.sub(d1);
            let delta_scale = (delta_p.add(delta_d).len() - delta_p.len()) / this.height * 2;

            this.zoom(delta_scale);
        }

        this.update_coord();
    }

}
