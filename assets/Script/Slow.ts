const { ccclass, property } = cc._decorator;

@ccclass
export default class Slow extends cc.Component {

    cnt = 0;

    onLoad() {
        for (let node of this.node.children) {
            node.active = false;
        }
    }

    update() {
        let node = this.node.children[this.cnt];
        if (node !== undefined) {
            node.active = true;
            this.cnt++;
        } else {
            this.enabled = false;
        }
    }
}
