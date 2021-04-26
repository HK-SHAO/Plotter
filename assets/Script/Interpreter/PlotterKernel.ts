import { create, all, EvalFunction, MathNode, typed, Matrix, Complex, complex } from 'mathjs'
import { Tip, Ans } from './Tip';

import * as numbers from 'numbers'
import * as numeric from 'numeric'
import Utils from '../Utils';

export class PlotterKernel {
    math = create(all, {
        randomSeed: 'HK-SHAO', // 随机数种子
        number: 'number', // 默认是数字number，分数Fraction，大数BigNumber可选
        // precision: 64, // 大数的精度（只在number为BigNumber时有效）
    });

    scope: object = {};

    // 编译表达式的缓存
    eval_cache: Map<string, EvalFunction> = new Map();
    simp_cache: Map<string, string> = new Map();

    cnt_ans = 0;

    constructor() {
        const that = this;
        const import_scope = {
            HKSHAO: "Hello! I'm HK-SHAO",
            π: that.math.pi,
            τ: that.math.tau,
            _: typed('_', {
                '': function () {
                    return that.scope[`_${that.cnt_ans - 1}`] || 0;
                },
                'number': function (num: number) {
                    return that.scope[`_${(that.cnt_ans + num) % that.cnt_ans}`] || 0;
                }
            }),
            _cnt: function () {
                return that.cnt_ans;
            },
            delete: function (nodes: MathNode[]) {
                if (nodes.length === 0) {
                    return new Tip("Delete", `Please enter the symbol you want to delete`);
                }
                for (let node of nodes) {
                    if (node.isSymbolNode) {
                        if (that.scope[node.name] === undefined) {
                            return new Tip("Delete", `The symbol '${node.name}' does not exist`);
                        }
                        delete that.scope[node.name];
                    } else {
                        return new Tip("Delete", `'${node.name || node.value}' is not a symbol`);
                    }
                }
            },
            Delete: function (value: Object) {
                if (value === undefined) {
                    return new Tip("Delete", `Please enter the value you want to delete`);
                }
                let deleted_key: string[] = new Array();
                for (let key in that.scope) {
                    if (that.scope[key] === value) {
                        delete that.scope[key];
                        deleted_key.push(key);
                    }
                }
                if (deleted_key.length === 0) {
                    return new Tip("Delete", `The value '${value}' does not exist`);
                }
                return new Tip("Delete", `The symbol '${deleted_key.join(", ")}' has been deleted`);
            },
            clear: function () {
                for (let key in that.scope) {
                    delete that.scope[key];
                }
                that.cnt_ans = 0;
                return new Tip("Clear", `All symbols removed`);
            },
            clear_cache: function () {
                that.eval_cache.clear();
                that.simp_cache.clear();
                return new Tip("ClearCache", `All calculation caches have been deleted`);
            },
            // START 高级权限：操作系统底层
            sys_eval_cache: function () {
                return that.eval_cache;
            },
            sys_simp_cache: function () {
                return that.simp_cache;
            },
            sys_scope: function () {
                return that.scope;
            },
            // END 高级权限：操作系统底层

            // START 微积分支持
            D: function (expr: MathNode | string, variable: MathNode | string, scope?: object) {
                let node = that.math.derivative(that.math.simplify(expr), variable);
                if (scope === undefined) {
                    return node;
                } else {
                    // 符号代换
                    let transformed = node.transform((child, _path, _parent) => {
                        if (child.isSymbolNode) {
                            let name = child.name;
                            if (scope[name] !== undefined) {
                                return that.math.parse(scope[name]);
                            }
                        }
                        return child;
                    });

                    let ans: any;
                    try {
                        ans = transformed.evaluate();
                    } catch (e) {
                        ans = transformed;
                    }
                    return ans;
                }
            },
            // 全微分（待实现）
            // END 微积分支持

            // START 转换
            LaTeX: function (expr: MathNode | string) {
                let options = {
                    parenthesis: 'auto',
                    implicit: 'hide'
                };
                if ((<MathNode>expr).toTex !== undefined) {
                    return (<MathNode>expr).toTex(options);
                }
                return that.math.parse(<string>expr).toTex(options);
            },
            HTML: function (expr: string) {
                return that.math.parse(expr).toHTML();
            },
            // END 转换

            equals: function (expr1: string | MathNode, expr2: string | MathNode) {
                let node1 = that.math.simplify(expr1);
                let node2 = that.math.simplify(expr2);
                return node1.equals(node2);
            },
            Compile: function (node: MathNode) {
                return node.compile();
            },
            $: function (nodes: MathNode[]) {
                if (nodes.length > 1) {
                    return nodes;
                }
                return nodes[0];
            },
            // START 自定义数据类型的构造函数
            List: function (...args: any[]) {
                return args;
            },
            Map: typed('Map', {
                'Object': function (obj: object) {
                    return new Map(Object.entries(obj));;
                },
                'Array': function (arr: Array<[any, any]>) {
                    return new Map(arr);
                },
                'Matrix': function (matrix: Matrix) {
                    return new Map(<any>matrix.toArray());;
                }
            }),
            Set: function (...args: any[]) {
                return Array.from(new Set<any>(args));
            },
            // END 自定义数据类型的构造函数
            pickRandom: typed('pickRandom', {
                'string': function (str: string) {
                    return that.math.pickRandom(str.split(''));
                }
            }),
            fmin: typed('fmin', {
                'function': function (f: Function) {
                    return numeric.uncmin((x: number[]) => f(...x), new Array<number>(that.cal_fn_num(f)).fill(0));
                },
                'function, Matrix': function (f: Function, mat: Matrix) {
                    return numeric.uncmin((x: number[]) => f(...x), <any>mat.toArray());
                },
                'function, Array': function (f: Function, arr: Array<any>) {
                    return numeric.uncmin((x: number[]) => f(...x), arr);
                },
                'function, number': function (f: Function, n: number) {
                    return numeric.uncmin((x: number[]) => f(...x), [n]);
                }
            }),
            fzero: typed('fzero', {
                'function, Array': function (f: Function, arr: Array<any>) {
                    let ans = numeric.uncmin((x: number[]) => f(...x) ** 2, arr);
                    if (ans.f > (<any>that.math.config).epsilon) {
                        ans.message = "May not find the zero, try change initial point or use 'cfzero'";
                    }
                    return ans;
                },
                'function': function (f: Function) {
                    return import_scope.fzero(f, new Array<number>(that.cal_fn_num(f)).fill(0));
                },
                'function, Matrix': function (f: Function, mat: Matrix) {
                    return import_scope.fzero(f, <any>mat.toArray());
                },
                'function, number': function (f: Function, n: number) {
                    return import_scope.fzero(f, [n]);
                }
            }),
            solveEq: typed('solveEq', {
                'function, Array': function (f: Function, x0: number[]) {
                    let ans = numeric.uncmin((x: number[]) => {
                        let sum = 0;
                        f(...x).forEach((value: number) => {
                            sum += value ** 2;
                        });
                        return sum;
                    }, x0);
                    if (ans.f > (<any>that.math.config).epsilon) {
                        ans.message = "May not find the solve of the Equations, try change initial point or use 'csolveEq'";
                    }
                    return ans;
                },
                'function, Matrix': function (f: Function, x0: Matrix) {
                    return import_scope.solveEq(f, x0.toArray());
                },
                'function': function (f: Function) {
                    return import_scope.solveEq(f, new Array<number>(that.cal_fn_num(f)).fill(0));
                }
            }),
            cfzero: typed('cfzero', {
                'function, Array': function (f: Function, arr: Array<Complex>) {
                    let re_arr = [];
                    let im_arr = [];
                    for (let c of arr) {
                        re_arr.push(c.re);
                        im_arr.push(c.im);
                    }

                    let ans = numeric.uncmin((x: number[]) => {
                        let c = <Complex[]>[];
                        for (let i = 0, len = x.length / 2; i < len; i++) {
                            c.push(complex(x[i], x[len + i]));
                        }
                        let fv = f(...c);
                        return fv.re ** 2 + fv.im ** 2;
                    }, [...re_arr, ...im_arr]);

                    ans.solution = Utils.vecs2comps(ans.solution);
                    ans.gradient = Utils.vecs2comps(ans.gradient);
                    let new_inv = [];
                    for (let k of ans.invHessian) {
                        new_inv.push(Utils.vecs2comps(k));
                    }
                    ans.invHessian = new_inv;

                    if (ans.f > (<any>that.math.config).epsilon) {
                        ans.message = "May not find the zero, try change initial point";
                    }
                    return ans;
                },
                'function': function (f: Function) {
                    return import_scope.cfzero(f, new Array<Complex>(that.cal_fn_num(f)).fill(complex(0, 0)));
                },
                'function, Matrix': function (f: Function, mat: Matrix) {
                    return import_scope.cfzero(f, <any>mat.toArray());
                },
                'function, number': function (f: Function, n: number) {
                    return import_scope.cfzero(f, [n]);
                }
            }),
            csolveEq: typed('csolveEq', {
                'function, Array': function (f: Function, arr: Array<Complex>) {
                    let re_arr = [];
                    let im_arr = [];
                    for (let c of arr) {
                        re_arr.push(c.re);
                        im_arr.push(c.im);
                    }

                    let ans = numeric.uncmin((x: number[]) => {
                        let c = <Complex[]>[];
                        for (let i = 0, len = x.length / 2; i < len; i++) {
                            c.push(complex(x[i], x[len + i]));
                        }
                        let sum = 0;
                        f(...c).forEach((value: Complex) => {
                            sum += value.re ** 2 + value.im ** 2;
                        });
                        return sum;
                    }, [...re_arr, ...im_arr]);


                    ans.solution = Utils.vecs2comps(ans.solution);
                    ans.gradient = Utils.vecs2comps(ans.gradient);
                    let new_inv = [];
                    for (let k of ans.invHessian) {
                        new_inv.push(Utils.vecs2comps(k));
                    }
                    ans.invHessian = new_inv;

                    if (ans.f > (<any>that.math.config).epsilon) {
                        ans.message = "May not find the solve of the Equations, try change initial point";
                    }
                    return ans;
                },
                'function': function (f: Function) {
                    return import_scope.csolveEq(f, new Array<Complex>(that.cal_fn_num(f)).fill(complex(0, 0)));
                },
                'function, Matrix': function (f: Function, mat: Matrix) {
                    return import_scope.csolveEq(f, <any>mat.toArray());
                }
            })
        };
        // 设置为rawArgs，其函数接受的参数为 MathNode[]
        import_scope.delete['rawArgs'] = true;
        import_scope.$['rawArgs'] = true;

        this.math.import(import_scope);
        this.math.import(numeric, { wrap: true, silent: true });
        this.math.import(numbers, { wrap: true, silent: true });
    }

    expr_fomat(expr: string): string {
        return expr.replace('¦', '')
            .replace(/d\((.+)\)\/d\((.+)\)/g, "D('$1','$2')")
            .replace(/d\((.+)\)\/d(.\b)/g, "D('$1','$2')")
            .replace(/\(D\('(.*)','(.*)'\)\)\(\)/g, "D('$1','$2',{})")
            .replace(/\(D\('(.*)','(.*)'\)\)\((.+)\)/g, "D('$1','$2',$3)")
            .replace(/√/g, ' sqrt');
    }

    evaluate(expr: string, scope?: object): Ans {
        let time = Date.now();

        // 尝试解析表达式为计算树，并缓存化简后的表达式
        let node: MathNode = undefined;
        let ans: any, simp_expr: string, tip: Tip, err: string;

        simp_expr = this.simp_cache.get(expr);

        // 尝试获取缓存并运算
        let code = this.eval_cache.get(expr);
        if (code === undefined) {
            try {
                node = this.math.parse(expr);
                code = node.compile();
                this.eval_cache.set(expr, code);
            } catch (e) {
                tip = new Tip("Parse", "Cannot parse this expression");
                err = e.toString();
            }
        }
        if (code !== undefined) {
            try {
                ans = code.evaluate(scope);
            } catch (e) {
                err = e.toString();

                if (node !== undefined) {
                    // 如果无法计算，则尝试化简节点，只返回化简结果
                    // 尝试化简节点（化简节点可能产生某些问题，已经提交issue到GitHub，希望能尽快修复）
                    try {
                        node = this.math.simplify(node);
                        simp_expr = node.toString();
                        this.simp_cache.set(expr, simp_expr);
                    } catch (e) {
                        tip = new Tip("Simplify", "Cannot simplify this expression");
                        err = e.toString();
                    }
                }

            }
        }

        time = Date.now() - time;
        return new Ans(ans, time, simp_expr, tip, err);
    }

    ans_format(value: any): { type: string, str: string } {
        let type: string = this.type(value);

        let str: string;
        // 格式化输出
        switch (type) {
            case "Number":
                str = `<color=#81d4fa>${this.math.format(value, this.math.config())}</color>`;
                break;
            case "String":
                str = `<color=#80cbc4>'${value}'</color>`;
                break;
            case "Function":
                str = `<color=#e6ee9c>${(<Function>value).name}()</color>`;
                break;
            case "Object":
                // 遍历此对象，为其设置字符串形式
                let s = <string[]>[];
                for (let key in value) {
                    // 递归解析一个对象
                    let str = this.ans_format(value[key]).str;
                    s.push(`${key}: ${str}`);
                }
                str = '{' + s.join(', ') + '}';
                break;
            case "Map":
                // 遍历此Map，为其设置字符串形式
                let s2 = <string[]>[];
                (<Map<any, any>>value).forEach((value, key) => {
                    s2.push(`${this.ans_format(key).str}-> ${this.ans_format(value).str}`);
                });
                str = '{' + s2.join(', ') + '}';
                break;
            case "Set":
                // 遍历此Set，为其设置字符串形式
                let s3 = <string[]>[];
                (<Set<any>>value).forEach((key) => {
                    s3.push(this.ans_format(key).str);
                });
                str = '<color=#f4511e>{</color>' + s3.join(', ') + '<color=#f4511e>}</color>';
                break;
            case "Boolean":
                str = `<color=#fb8c00>${value}</color>`;
                break;
            default:
                str = this.math.format(value, this.math.config());
                break;
        };

        return { type: type, str: str }
    }

    type(value: any): string {
        let type: string = typeof value;
        if (type === "object") {
            if (value === null) {
                return "Null";
            }
            type = value.type;
            if (type === undefined && value.constructor !== undefined) {
                type = value.constructor.name;
                if (type === 'Object') {
                    // 极为强大的获取类名方法
                    type = Object.prototype.toString.call(value).slice(8, -1);
                }
            }
        } else {
            type = type.slice(0, 1).toUpperCase() + type.slice(1);
        }
        return type;
    }

    cal_fn_num(fn) {
        let num = 0;
        if (fn && fn.syntax && fn.syntax.indexOf && fn.syntax.indexOf('()') === -1) {
            num = fn.syntax.split(',').length;
        }
        return num;
    }
}