import ItemDef from './ItemDef';
import { PlotterKernel } from './Interpreter/PlotterKernel';
import Setting from './Setting';
import { Tip } from './Interpreter/Tip';
import Utils from './Utils';
import Graph from './Graph';
import { typed } from 'mathjs';
import TexMain from './TeXmain';

const pt = new PlotterKernel();

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainPlotter extends cc.Component {

    @property(cc.RichText)
    label_ans: cc.RichText = null;

    @property(cc.EditBox)
    edit_expr: cc.EditBox = null;

    @property(cc.ScrollView)
    ans_scroll: cc.ScrollView = null;

    @property(cc.Button)
    ans_btn: cc.Button = null;

    @property(cc.Button)
    cal_btn: cc.Button = null;

    @property(cc.Node)
    ans_mask: cc.Node = null;

    @property(cc.Node)
    ans_scroll_bar: cc.Node = null;

    @property(cc.ScrollView)
    def_scroll: cc.ScrollView = null;

    @property(cc.Button)
    def_btn: cc.Button = null;

    @property(cc.Node)
    def_mask: cc.Node = null;

    @property(cc.Node)
    def_scroll_bar: cc.Node = null;

    @property(cc.Node)
    def_first_item: cc.Node = null;

    @property(cc.Prefab)
    prefab_item_def: cc.Prefab = null;

    @property(cc.Node)
    def_content: cc.Node = null;

    @property(cc.ScrollView)
    key_scroll: cc.ScrollView = null;

    @property(cc.Node)
    key_mask: cc.Node = null;

    @property(cc.Node)
    cal_node: cc.Node = null;

    @property(cc.Node)
    ans_node: cc.Node = null;

    @property(cc.Sprite)
    up_icon: cc.Sprite = null;

    @property(cc.Node)
    up_btn: cc.Node = null;

    @property(cc.Node)
    setting_node: cc.Node = null;

    @property(cc.ScrollView)
    setting_scroll: cc.ScrollView = null;

    @property(cc.Node)
    help_node: cc.Node = null;

    @property(cc.ScrollView)
    help_scroll: cc.ScrollView = null;

    @property(cc.Sprite)
    vibrate_btn_sprite: cc.Sprite = null;

    @property(cc.SpriteFrame)
    vibrate_on_frame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    vibrate_off_frame: cc.SpriteFrame = null;

    @property(cc.Sprite)
    restart_icon: cc.Sprite = null;

    @property(cc.Node)
    alpha_node: cc.Node = null;

    @property(cc.Sprite)
    case_switch_sprite: cc.Sprite = null;

    @property(cc.SpriteFrame)
    upper_frame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    lower_frame: cc.SpriteFrame = null;

    @property(cc.Widget)
    topLayout: cc.Widget = null;

    @property(cc.Widget)
    coord_widget: cc.Widget = null;

    @property(Graph)
    graph_script: Graph = null;

    @property(cc.Sprite)
    auto_btn_sprite: cc.Sprite = null;

    @property(cc.SpriteFrame)
    auto_frame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    manual_frame: cc.SpriteFrame = null;

    @property(cc.Node)
    doc_node: cc.Node = null;

    @property(cc.Node)
    tex_node: cc.Node = null;

    @property(TexMain)
    tex_main_script: TexMain = null;

    scope_node: Map<string, cc.Node> = new Map();

    ans_opened = false;
    def_opened = false;
    key_opened = false;
    key_scrolling_anim = true;

    setting_opened = false;
    tex_opened = false;
    help_opened = false;
    doc_opened = false;
    vibrate_switch = true;

    auto_cal = true;

    upper_key = false;

    onLoad() {
        pt.scope = JSON.parse(cc.sys.localStorage.getItem('cal_scope'));
        pt.cnt_ans = JSON.parse(cc.sys.localStorage.getItem('cal_scope_cnt'));
        if (pt.scope === null) {
            pt.scope = {};
        } else {
            this.refresh_scope_node();
        }

        const that = this;
        pt.math.import({
            restart: function () {
                pt.math['clear']();
                pt.math['clear_cache']();
                that.edit_expr.string = "";
                that.button_cal_on_click();
                that.graph_script.recover();
                return new Tip("Restart", `Plotter has been restarted`);
            },
            help: typed('help', {
                'number': function () {
                    that.btn_doc_click();
                    that.edit_expr.blur();
                    return new Tip("Help", `The document page has been opened`);
                }
            })
        }, { override: true });
        let setting_script = this.setting_node.getComponent(Setting);
        setting_script.pt = pt;
        this.setting_node.height = this.help_node.height = this.doc_node.height = cc.winSize.height;

        // 适应不同尺寸屏幕
        if (this.topLayout.node.y > cc.winSize.height / 2 - 100) {
            this.topLayout.isAlignVerticalCenter = true;
            this.topLayout.verticalCenter = -360;
        }

        if (this.coord_widget.node.y < -cc.winSize.height / 2 + 60) {
            this.coord_widget.isAlignVerticalCenter = true;
            this.coord_widget.verticalCenter = 560;
            this.coord_widget.node.getComponent(cc.Label).horizontalAlign = cc.Label.HorizontalAlign.RIGHT;
        }
    }


    start() {
        // init logic
        this.scheduleOnce(() => {
            this.ans_scroll.scrollToTop(1);
            this.key_scroll.scrollToBottom(1);
        }, 0.3);

        this.key_scroll.node.on('scrolling', (e: cc.ScrollView) => {
            if (this.key_scrolling_anim) {
                let delta = (e.content.height - this.key_mask.height) / 2;
                if (this.key_opened) {
                    if (e.content.y + delta < -400) {
                        this.key_scrolling_anim = false;
                        cc.tween(e.content).to(0.2, { y: -delta }, { easing: "smooth" }).call(() => {
                            this.button_key_on_click();
                            this.key_scrolling_anim = true;
                        }).start();
                    };
                } else {
                    if (e.content.y - delta > 150) {
                        this.key_scrolling_anim = false;
                        cc.tween(e.content).to(0.2, { y: delta }, { easing: "smooth" }).call(() => {
                            this.button_key_on_click();
                            this.key_scrolling_anim = true;
                        }).start();
                    }
                }
            }
        }, this);

        let dc = 0;
        this.edit_expr.node.on('touchmove', (e: cc.Event.EventTouch) => {
            if (this.key_opened) {
                if (Math.abs(dc) > 24) {
                    this.edit_cursor_move(Math.sign(dc));
                    dc = 0;
                }
                dc += e.getDeltaX();
            }
        }, this);

        this.edit_expr.node.on('touchstart', (e: cc.Event.EventTouch) => {
            if (this.key_opened && this.edit_expr.string.indexOf('¦') === -1) {
                this.edit_expr.string += '¦';
            }
        }, this);

        cc.systemEvent.on('keydown', (e: cc.Event.EventKeyboard) => {
            switch (e.keyCode) {
                case cc.macro.KEY.up:
                    this.graph_script.to_bias_point.addSelf(cc.v2(0, -200));
                    break;
                case cc.macro.KEY.down:
                    this.graph_script.to_bias_point.addSelf(cc.v2(0, 200));
                    break;
                case cc.macro.KEY.left:
                    this.graph_script.to_bias_point.addSelf(cc.v2(200, 0));
                    break;
                case cc.macro.KEY.right:
                    this.graph_script.to_bias_point.addSelf(cc.v2(-200, 0));
                    break;
                case cc.macro.KEY.pageup:
                    this.graph_script.zoomIn();
                    break;
                case cc.macro.KEY.pagedown:
                    this.graph_script.zoomOut();
                    break;
                case cc.macro.KEY.back:
                case cc.macro.KEY.backspace:
                    if (this.doc_opened) {
                        this.btn_doc_click();
                        break;
                    }
                    if (this.help_opened) {
                        this.btn_help_click();
                        break;
                    }
                    if (this.setting_opened) {
                        this.btn_setting_click();
                        break;
                    }
                    if (this.tex_opened) {
                        this.btn_tex_click();
                        break;
                    }
                    if (this.key_opened) {
                        this.button_key_on_click();
                        break;
                    }
                    if (this.ans_opened) {
                        this.button_ans_on_click();
                        break;
                    }
                    if (this.def_opened) {
                        this.button_define_on_click();
                        break;
                    }
                    break;
            }
        }, this);
    }

    // update(dt: number) {}

    cal_expr(expr: string, scope?: object, callback?: (value: any) => void): string {
        expr = pt.expr_fomat(expr);
        let ans = pt.evaluate(expr, scope);
        let out = <string[]>[];

        if (ans.err === undefined) {
            let fmt = pt.ans_format(ans.value);
            out.push(`<size=50><color=#00c853>${fmt.type}</color>:</size> ${fmt.str}`);

            if (fmt.type === 'Function') {
                ans.value.num = pt.cal_fn_num(ans.value);
                let test_value;
                try {
                    switch (ans.value.num) {
                        case 0:
                            test_value = ans.value();
                            break;
                        case 1:
                            test_value = ans.value(0);
                            break;
                    }
                } catch { }

                if (pt.type(test_value) === 'Number') {
                    this.graph_script.plotxy(ans.value);
                }
            }

        }

        if (ans.sim !== undefined) {
            out.push(`<size=50><color=#f57c00>Simplify</color>:</size> ${ans.sim}`);
        }

        if (callback !== undefined) {
            if (ans.value !== undefined) {
                callback(ans.value);
            } else if (ans.sim !== undefined) {
                callback(ans.sim);
            }
        }

        if (ans.err !== undefined) {
            out.push(ans.err.replace(/^(.+?):/, "<size=50><color=#d84315>$1</color>:</size>"));
        }

        if (ans.tip !== undefined) {
            out.push(`<size=50><color=#eeff41>${ans.tip.type}</color>:</size> ${ans.tip.content}`);
        }

        out.push(`${ans.time} ms`);

        return "\n" + out.join("\n\n");
    }

    cal_edit_expr(callback?: (value: any) => any) {
        if (this.edit_expr.string.length === 0 || this.edit_expr.string === '¦') {
            this.label_ans.string = `\n<color=#00bfa5>Hello, </color><color=#f57c00>Plotter!</color>\n`;
        } else {
            this.label_ans.string = this.cal_expr(this.edit_expr.string, pt.scope, callback);

            this.ans_scroll.scrollToTop(1);
            this.refresh_scope_node();
        }

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    refresh_scope_node() {
        for (let symbol in pt.scope) {
            if (this.scope_node.get(symbol) !== undefined) {
                continue;
            }
            this.scope_node.set(symbol, pt.scope[symbol]);
            let new_item = cc.instantiate(this.prefab_item_def);
            let item_script = new_item.getComponent(ItemDef);
            item_script.symbol_name = symbol;
            item_script.pt = pt;
            item_script.main = this;
            this.def_content.addChild(new_item);
        }
        this.def_scroll.scrollToBottom(1);
    }

    edit_change() {
        if (this.auto_cal) {
            this.scheduleOnce(() => {
                this.cal_edit_expr();
            });
        }
    }

    edit_begin() {
        cc.tween(this.edit_expr.node).to(0.4, { x: 0, width: 900 }, { easing: "smooth" }).start();
        cc.tween(this.cal_btn.node).to(0.4, { x: 760 }, { easing: "smooth" }).start();

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    edit_end() {
        cc.tween(this.edit_expr.node).to(0.4, { x: -125, width: 600 }, { easing: "smooth" }).start();
        cc.tween(this.cal_btn.node).to(0.4, { x: 350 }, { easing: "smooth" }).start();

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    edit_return() {
        this.button_cal_on_click();
    }

    button_cal_on_click() {
        this.cal_edit_expr((value) => {
            pt.scope[`_${pt.cnt_ans}`] = value;
            pt.cnt_ans++;
        });

        this.save_scope();
    }

    save_scope() {
        cc.sys.localStorage.setItem('cal_scope', JSON.stringify(pt.scope));
        cc.sys.localStorage.setItem('cal_scope_cnt', pt.cnt_ans);
    }

    btn_save_click() {
        this.save_scope();

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    button_ans_on_click() {
        if (this.key_opened) {
            this.button_key_on_click();
        }

        if (this.ans_opened) {
            cc.tween(this.ans_scroll.node).to(0.4, { y: -460 }, { easing: "smooth" }).start();
            cc.tween(this.ans_mask).to(0.4, { height: 202 }, { easing: "smooth" }).start();
            cc.tween(this.ans_btn.node).to(0.4, { height: 202 }, { easing: "smooth" }).start();
            cc.tween(this.ans_scroll_bar).to(0.4, { height: 202 }, { easing: "smooth" })
                .call(() => {
                    this.ans_scroll.scrollToTop(1);
                })
                .start();
        } else {
            cc.tween(this.ans_scroll.node).to(0.4, { y: 100 }, { easing: "smooth" }).start();
            cc.tween(this.ans_mask).to(0.4, { height: 1200 }, { easing: "smooth" }).start();
            cc.tween(this.ans_btn.node).to(0.4, { height: 1200 }, { easing: "smooth" }).start();
            cc.tween(this.ans_scroll_bar).to(0.4, { height: 1200 }, { easing: "smooth" })
                .call(() => {
                    this.ans_scroll.scrollToTop(1);
                })
                .start();
        }
        this.ans_opened = !this.ans_opened;

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    button_define_on_click() {
        if (this.key_opened) {
            this.button_key_on_click();
        }

        if (this.def_opened) {
            cc.tween(this.def_scroll.node).to(0.4, { y: 800 }, { easing: "smooth" }).start();
            cc.tween(this.def_mask).to(0.4, { height: 200 }, { easing: "smooth" }).start();
            cc.tween(this.def_btn.node).to(0.4, { height: 200 }, { easing: "smooth" }).start();
            cc.tween(this.def_scroll_bar).to(0.4, { height: 200 }, { easing: "smooth" })
                .call(() => {
                    this.def_scroll.scrollToBottom(1);
                })
                .start();
        } else {
            cc.tween(this.def_scroll.node).to(0.4, { y: 70 }, { easing: "smooth" }).start();
            cc.tween(this.def_mask).to(0.4, { height: 1200 }, { easing: "smooth" }).start();
            cc.tween(this.def_btn.node).to(0.4, { height: 1200 }, { easing: "smooth" }).start();
            cc.tween(this.def_scroll_bar).to(0.4, { height: 1200 }, { easing: "smooth" }).start();
        }
        this.def_opened = !this.def_opened;

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    button_key_on_click() {
        if (this.ans_opened) {
            this.button_ans_on_click();
        }
        if (this.def_opened) {
            this.button_define_on_click();
        }

        if (this.key_opened) {
            this.edit_expr.enabled = true;
            this.edit_expr.string = this.edit_expr.string.replace('¦', '');
            this.edit_end();
            cc.tween(this.ans_node).to(0.4, { y: -460 }, { easing: "smooth" }).start();
            cc.tween(this.cal_node).to(0.4, { y: -700 }, { easing: "smooth" }).start();

            cc.tween(this.up_icon.node).to(0.4, { angle: 0 }, { easing: "smooth" }).start();
            cc.tween(this.key_scroll.node).to(0.4, { y: -870 }, { easing: "smooth" }).start();
            cc.tween(this.key_mask).to(0.4, { height: 100 }, { easing: "smooth" })
                .call(() => {
                    this.key_scroll.scrollToBottom(0.4);
                })
                .start();

        } else {
            this.edit_expr.enabled = false;
            if (this.edit_expr.string.indexOf('¦') <= -1) {
                this.edit_expr.string += '¦';
            }
            this.edit_begin();
            cc.tween(this.ans_node).to(0.4, { y: 600 }, { easing: "smooth" }).start();
            cc.tween(this.cal_node).to(0.4, { y: 360 }, { easing: "smooth" }).start();

            cc.tween(this.up_icon.node).to(0.4, { angle: 180 }, { easing: "smooth" }).start();
            cc.tween(this.key_scroll.node).to(0.4, { y: -340 }, { easing: "smooth" }).start();
            cc.tween(this.key_mask).to(0.4, { height: 1170 }, { easing: "smooth" })
                .call(() => {
                    this.key_scroll.scrollToTop(0.4);
                })
                .start();

        }
        this.key_opened = !this.key_opened;

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    key_clean_on_click(_e: cc.Event.EventTouch, _data: string) {
        this.edit_begin();
        this.edit_expr.string = "¦";
        this.edit_change();

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    key_del_on_click(_e: cc.Event.EventTouch, _data: string) {
        this.edit_begin();
        let index = this.edit_expr.string.indexOf('¦');
        if (index > -1) {
            if (index > 0) {
                this.edit_expr.string = this.edit_expr.string.substring(0, index - 1)
                    + this.edit_expr.string.substring(index);
            }
        } else {
            this.edit_expr.string = this.edit_expr.string.substring(0, -1) + '¦';
        }
        this.edit_change();

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    key_on_click(_e: cc.Event.EventTouch, data: string) {
        this.edit_begin();
        if (this.edit_expr.string.indexOf('¦') > -1) {
            this.edit_expr.string = this.edit_expr.string.replace('¦', data + '¦');
        } else {
            this.edit_expr.string += data + '¦';
        }
        this.edit_change();

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    edit_cursor_move(n: number) {
        let index = this.edit_expr.string.indexOf('¦');
        if (index + n > -1 && index + n < this.edit_expr.string.length) {
            let tmp = this.edit_expr.string.replace('¦', '');
            this.edit_expr.string = tmp.substring(0, index + n) + '¦' + tmp.substring(index + n);
        }

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    btn_setting_click() {
        if (this.setting_opened) {
            cc.tween(this.setting_node).to(0.5, { x: 1080 }, { easing: "circOut" })
                .call(() => {
                    this.setting_node.active = false;
                })
                .start();
        } else {
            this.setting_node.active = true;
            cc.tween(this.setting_node).to(0.4, { x: 0 }, { easing: "circOut" })
                .call(() => {
                    this.setting_scroll.scrollToTop(1);
                })
                .start();
        }
        this.setting_opened = !this.setting_opened;

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    btn_tex_click() {
        if (this.tex_opened) {
            cc.tween(this.tex_node).to(0.5, { x: 1080 }, { easing: "circOut" })
                .call(() => {
                    this.tex_node.active = false;
                })
                .start();
        } else {
            this.tex_node.active = true;
            cc.tween(this.tex_node).to(0.4, { x: 0 }, { easing: "circOut" }).start();
            if (this.edit_expr.string.length !== 0) {
                this.tex_main_script.show(this.edit_expr.string.replace('¦', ''));
            }
        }
        this.tex_opened = !this.tex_opened;

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    btn_help_click() {
        if (this.help_opened) {
            cc.tween(this.help_node).to(0.5, { x: -1080 }, { easing: "circOut" })
                .call(() => {
                    this.help_node.active = false;
                })
                .start();
        } else {
            this.help_node.active = true;
            cc.tween(this.help_node).to(0.4, { x: 0 }, { easing: "circOut" })
                .call(() => {
                    this.help_scroll.scrollToTop(2);
                })
                .start();
        }
        this.help_opened = !this.help_opened;

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    btn_doc_click() {
        if (this.doc_opened) {
            cc.tween(this.doc_node).to(0.5, { y: -cc.winSize.height }, { easing: "circOut" })
                .call(() => {
                    this.doc_node.active = false;
                })
                .start();
        } else {
            this.doc_node.active = true;
            cc.tween(this.doc_node).to(0.4, { y: 0 }, { easing: "circOut" }).start();
        }
        this.doc_opened = !this.doc_opened;

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    btn_auto_click() {
        if (this.auto_cal) {
            this.auto_btn_sprite.spriteFrame = this.manual_frame;
        } else {
            this.auto_btn_sprite.spriteFrame = this.auto_frame;
        }
        this.auto_cal = !this.auto_cal;

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    btn_copy_click() {
        let str = Utils.debark(this.label_ans.string);
        Utils.copy(str);

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    btn_vibrate_click() {
        if (this.vibrate_switch) {
            this.vibrate_btn_sprite.spriteFrame = this.vibrate_off_frame;
        } else {
            this.vibrate_btn_sprite.spriteFrame = this.vibrate_on_frame;
        }
        this.vibrate_switch = !this.vibrate_switch;

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    btn_restart_click() {
        this.restart_icon.node.angle = 0;
        cc.tween(this.restart_icon.node).to(0.6, { angle: 360 }, { easing: "smooth" })
            .call(() => {
                pt.math.evaluate('restart()');
            })
            .start();

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }

    btn_switch_case() {
        let cnt = 0;
        for (let node of this.alpha_node.children) {
            if (++cnt > 26) break;
            let btn = node.getComponent(cc.Button);
            let label = node.children[0].children[0].getComponent(cc.Label);

            let data = btn.clickEvents[0].customEventData;
            if (this.upper_key) {
                btn.clickEvents[0].customEventData = data.toLowerCase();
                label.string = label.string.toLowerCase();
            } else {
                btn.clickEvents[0].customEventData = data.toUpperCase();
                label.string = label.string.toUpperCase();
            }
        }
        this.upper_key = !this.upper_key;
        if (this.upper_key) {
            this.case_switch_sprite.spriteFrame = this.upper_frame;
        } else {
            this.case_switch_sprite.spriteFrame = this.lower_frame;
        }

        if (this.vibrate_switch) {
            Utils.vibrate();
        }
    }
}
