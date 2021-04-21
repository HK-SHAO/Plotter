declare var wx: any;

export default class Utils {

    /**
    * 复制文本至设备剪贴板
    * @param value 文本内容
    */
    public static copy(value: string): boolean {
        if (!document) return false;
        // 创建输入元素
        let element = document.createElement('textarea');
        element.readOnly = true;
        element.style.opacity = '0';
        element.value = value;
        document.body.appendChild(element);
        // 选择元素
        element.select();
        // 兼容低版本 iOS 的特殊处理
        let range = document.createRange();
        range.selectNodeContents(element);
        let selection = getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        // 复制
        let result = document.execCommand('copy');
        element.remove();
        return result;
    }

    /**
     * 震动
     * @param time 震动的持续时间
     */
    public static vibrate(time = 30) {
        if (navigator && navigator.vibrate) {
            navigator.vibrate(time);
        }
        else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            if (time < 35) {
                wx.vibrateShort();
            } else {
                wx.vibrateLong();
            }
        } else if (cc.sys.isNative) {
            (<any>jsb).Device.vibrate(time / 1000);
        }
    }
}