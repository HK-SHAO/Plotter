import * as math from 'mathjs';
import MainPlotter from './Main';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TexMain extends cc.Component {

    @property(cc.EditBox)
    edit: cc.EditBox = null;

    @property(cc.WebView)
    webview: cc.WebView = null;

    @property(cc.Label)
    exp_label: cc.Label = null;

    @property(MainPlotter)
    main: MainPlotter = null;

    @property(cc.Widget)
    webview_widget: cc.Widget = null;

    @property(cc.Node)
    load_icon: cc.Node = null;


    type = true;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (cc.sys.isBrowser) {
            this.webview_widget.top = 0;
            this.webview_widget.bottom = 0;
        }
    }

    start() {
        this.init_show();

        let tween: cc.Tween;
        this.webview.node.on('loading', () => {
            if (tween !== undefined) {
                tween.stop();
            }
            tween = cc.tween(this.load_icon).to(0.6, { angle: 360 }, { easing: "smooth" }).call(() => this.load_icon.angle = 0);
            tween = cc.tween(this.load_icon).repeatForever(tween);
            tween.start();
        }, this);

        this.webview.node.on('loaded', () => {
            if (tween !== undefined) {
                tween.stop();
            }
            cc.tween(this.load_icon).to(0.6, { angle: 360 }, { easing: "smooth" }).call(() => this.load_icon.angle = 0).start();
        }, this);

        this.webview.node.on('error', () => {
            if (tween !== undefined) {
                tween.stop();
            }
            cc.tween(this.load_icon).to(0.6, { angle: 360 }, { easing: "smooth" }).call(() => this.load_icon.angle = 0).start();
        }, this);
    }

    on_edit_changed() {
        let exp = this.edit.string;
        if (exp.length !== 0) {
            if (this.type) {
                try {
                    let node = math.parse(exp);
                    let tex = node.toTex({
                        parenthesis: 'auto',
                        implicit: 'hide'
                    });
                    this.webview.url = "https://www.zhihu.com/equation?tex=" + encodeURIComponent(`{\\color{white}{${tex}}}`);
                } catch {
                    this.webview.url = '';
                }
            } else {
                this.webview.url = "https://www.zhihu.com/equation?tex=" + encodeURIComponent(`{\\color{white}{${exp}}}`);
            }
        } else {
            this.webview.url = '';
        }
    }

    init_show() {
        let tex = `{\\ce{Zn^2+  <=>[+ 2OH-][+ 2H+]  $\\underset{\\text{amphoteres Hydroxid}}{\\ce{Zn(OH)2 v}}$  <=>[+ 2OH-][+ 2H+]  $\\underset{\\text{Hydroxozikat}}{\\ce{[Zn(OH)4]^2-}}$}}
        \\\\
        f(x) = \\int_{-\\infty}^\\infty  \\hat f(x)\\xi\\,e^{2 \\pi i \\xi x}  \\,\\mathrm{d}\\xi 
        \\\\
        \\mathop \\Phi \\nolimits_e = \\oint { \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}} \\over E} \\cdot {d \\mathord{ \\buildrel{ \\lower3pt \\hbox{$ \\scriptscriptstyle \\rightharpoonup$}} \\over S}}  = {1 \\over {{\\varepsilon _0}}}\\sum {q} } `;
        this.webview.url = "https://www.zhihu.com/equation?tex=" + encodeURIComponent(`{\\color{white}{${tex}}}`);
    }

    exp_btn_click() {
        if (this.type) {
            this.exp_label.string = 'LaTeX';
        } else {
            this.exp_label.string = 'Expression';
        }
        this.type = !this.type;
        this.on_edit_changed();
    }

    show(tex: string) {
        this.edit.string = tex;
        this.on_edit_changed();
    }

    exit() {
        this.main.btn_tex_click();
    }

    // update (dt) {}
}
