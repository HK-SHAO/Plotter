import { complex, Complex } from "mathjs";

declare var wx: any;

export default class Utils {

    /**
    * 复制文本至设备剪贴板
    * @param value 文本内容
    */
    public static copy(value: string): boolean {
        if (cc.sys.isBrowser && document !== undefined) {
            // 创建输入元素
            let element = document.createElement('textarea');
            element.readOnly = true;
            element.style.opacity = '0';
            element.value = value;
            document.body.appendChild(element);
            // 选择元素
            element.select();
            // 复制
            let result = document.execCommand('copy');
            element.remove();
            return result;
        } else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.setClipboardData({
                data: value
            });
            return true;
        } else if (cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID) {
            setTimeout(() => {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "JavaCopy", "(Ljava/lang/String;)V", value);
            }, 100);
            return true;
        }

        return false;
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

    public static debark(str: string) {
        return str.replace(/<\/*(color|size).*?>/g, '');
    }

    public static vecs2comps(arr: any[]): any[] {
        let comp = <Complex[]>[];
        for (let i = 0, len = arr.length / 2; i < len; i++) {
            comp.push(complex(arr[i], arr[len + i]));
        }
        return comp;
    }
}