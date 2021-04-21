import MainPlotter from "./Main";
import { PlotterKernel } from "./Interpreter/PlotterKernel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemDef extends cc.Component {

    main: MainPlotter = undefined;
    symbol_name: string = undefined;
    main_scope: object = undefined;
    scope_node: Map<string, cc.Node> = undefined;
    label_symbol: cc.Label = undefined;
    label_value: cc.Label = undefined;

    pt: PlotterKernel = undefined;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.label_symbol = this.node.children[0].getComponent(cc.Label);
        this.label_value = this.node.children[1].getComponent(cc.Label);
        this.main_scope = this.pt.scope;
        this.scope_node = this.main.scope_node;

        if (this.symbol_name.length > 24) {
            this.label_symbol.string = this.symbol_name.substring(0, 24) + "...";
        } else {
            this.label_symbol.string = this.symbol_name;
        }
    }

    update(dt) {
        // 当项目不在可视范围内时，不进行更新
        if (Math.abs(this.node.y + this.main.def_content.y) - this.main.def_first_item.height
            > (this.main.def_mask.height / 2)) {
            // cc.log(this.symbol_name);
            return;
        }

        if (this.symbol_name !== undefined) {
            let value = this.main_scope[this.symbol_name];
            if (value === undefined) {
                this.node.destroy();
                this.scope_node.delete(this.symbol_name);
                return;
            }

            let value_string = this.pt.ans_format(value).str
                .replace(/<\/*(color|size).*?>/g, '');
            let delta = this.label_symbol.string.length + value_string.length - 28;
            if (delta > 0) {
                this.label_value.string = value_string.slice(0, -delta - 2).replace('\n', '') + "...";
            } else {
                this.label_value.string = value_string.replace('\n', '');
            }
        }
    }
}
