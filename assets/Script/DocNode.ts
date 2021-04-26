import Docs from "./Interpreter/Docs";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DocNode extends cc.Component {

    @property(cc.Label)
    title_label: cc.Label = null;

    @property(cc.Layout)
    layout: cc.Layout = null;

    @property(cc.Prefab)
    item: cc.Prefab = null;

    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;

    docs = <string[]>[];

    cnt = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.docs = [...Docs.constants, ...Docs.functions];
    }

    update() {
        if (this.cnt < this.docs.length) {
            let node = cc.instantiate(this.item);
            let [name, details] = this.docs[this.cnt].split("|");
            node.children[0].getComponent(cc.Label).string = name;
            node.children[1].getComponent(cc.Label).string = details;
            this.layout.node.addChild(node);
            this.layout.updateLayout();

            this.cnt++;
            this.title_label.string = `常数和函数(${this.cnt})`;
        } else {
            this.enabled = false;
        }
    }
}
