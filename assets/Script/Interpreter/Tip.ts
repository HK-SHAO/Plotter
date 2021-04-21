export class Tip {
    type: string = null;
    content: string = null;

    constructor(name: string, content: string) {
        this.type = name;
        this.content = content;
    }

    toString() {
        return this.content;
    }
}

export class Ans {
    value: any;
    sim: string;
    tip: Tip;
    err: string;
    time: number;

    constructor(value: any, time: number, sim?: string, tip?: Tip, err?: string) {
        this.value = value;
        this.time = time;
        this.sim = sim;
        this.tip = tip;
        this.err = err;
    }
}