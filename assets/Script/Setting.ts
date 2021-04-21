import { PlotterKernel } from "./Interpreter/PlotterKernel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Setting extends cc.Component {

    @property(cc.ScrollView)
    scrollview: cc.ScrollView = null;

    @property(cc.Label)
    number_type_label: cc.Label = null;

    @property(cc.Label)
    matrix_type_label: cc.Label = null;

    @property(cc.Label)
    type_security_label: cc.Label = null;

    @property(cc.Label)
    epsilon_label: cc.Label = null;

    @property(cc.Label)
    precision_label: cc.Label = null;

    @property(cc.EditBox)
    randseed_edit: cc.EditBox = null;

    @property(cc.Slider)
    epsilon_slider: cc.Slider = null;

    @property(cc.Slider)
    precision_slider: cc.Slider = null;

    pt: PlotterKernel = undefined;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        let sliders = [this.epsilon_slider, this.precision_slider];
        for (let slider of sliders) {
            slider.node.on(cc.Node.EventType.TOUCH_START, this.start_slider_handle, this);
            slider.node.on(cc.Node.EventType.TOUCH_CANCEL, this.end_slider_handle, this);
            slider.node.on(cc.Node.EventType.TOUCH_END, this.end_slider_handle, this);

            slider.handle.node.on(cc.Node.EventType.TOUCH_START, this.start_slider_handle, this);
            slider.handle.node.on(cc.Node.EventType.TOUCH_CANCEL, this.end_slider_handle, this);
            slider.handle.node.on(cc.Node.EventType.TOUCH_END, this.end_slider_handle, this);
        }
    }

    start_slider_handle() {
        this.scrollview.cancelInnerEvents = false;
    }

    end_slider_handle() {
        this.scrollview.cancelInnerEvents = true;
    }

    click_number_type() {
        let type = this.pt.math.config().number;
        switch (type) {
            case 'number':
                type = 'BigNumber';
                break;
            case 'BigNumber':
                type = 'Fraction';
                break;
            case 'Fraction':
            default:
                type = 'number';
                break;
        }
        this.pt.math.config({ number: type });
        this.number_type_label.string = type;

        // 更改了计算内核的配置，之前的缓存就可能带来错误，因此需要清空
        this.pt.eval_cache.clear();
    }

    click_matrix_type() {
        let type = this.pt.math.config().matrix;
        switch (type) {
            case 'Matrix':
                type = 'Array';
                break;
            case 'Array':
            default:
                type = 'Matrix';
                break;
        }
        this.pt.math.config({ matrix: type });
        this.matrix_type_label.string = type;

        // 更改了计算内核的配置，之前的缓存就可能带来错误，因此需要清空
        this.pt.eval_cache.clear();
    }

    click_type_security() {
        let type = !this.pt.math.config().predictable;
        this.pt.math.config({ predictable: type });
        this.type_security_label.string = type.toString();

        // 更改了计算内核的配置，之前的缓存就可能带来错误，因此需要清空
        this.pt.eval_cache.clear();
    }

    epsilon_change() {
        let p = this.epsilon_slider.progress;
        let epsilon = 10 ** (12 - 48 * p);
        this.pt.math.config({ epsilon: epsilon });
        this.epsilon_label.string = epsilon.toPrecision(3);

        // 更改了计算内核的配置，之前的缓存就可能带来错误，因此需要清空
        this.pt.eval_cache.clear();
    }

    precision_change() {
        let precision = Math.ceil(1 + 128 * this.precision_slider.progress);
        this.pt.math.config({ precision: precision });
        this.precision_label.string = precision.toString();

        if (this.number_type_label.string === 'BigNumber') {
            // 更改了计算内核的配置，之前的缓存就可能带来错误，因此需要清空
            this.pt.eval_cache.clear();
        }
    }

    click_generate_randseed() {
        this.randseed_edit.string = (Date.now() % 1e12 + Math.floor(1e12 * Math.random())).toString(36);
        this.randseed_change();
    }

    randseed_change() {
        this.pt.math.config({ randomSeed: this.randseed_edit.string });

        // 更改了计算内核的配置，之前的缓存就可能带来错误，因此需要清空
        this.pt.eval_cache.clear();
    }


    // update (dt) {}
}
