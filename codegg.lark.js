// 主类
class LarkCodegg {
    // 智能提示
    inspirationKeys = [];
    // 渲染java脚本关键字
    renderKey(txt, keys, colors) {
        let key = txt;
        let isKey = false;
        if (!isNaN(parseFloat(key))) return "<span style='color:" + colors.numeric + ";'>" + txt + "</span>";
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] === key) {
                return "<span style='color:" + colors.key + ";'>" + txt + "</span>";
            }
        }
        return "<span style='color:" + colors.text + ";'>" + txt + "</span>";
    };
    /**
     * 添加智能提示关键字
     * @param {String} key 
     */
    addInspirationKey(key, isCheck) {
        const lark = this;
        if (typeof key === "undefined") return;
        if (key === null) return;
        if (key === "") return;
        if (typeof isCheck === "undefined") isCheck = false;
        if (isCheck) {
            if (!isNaN(parseFloat(key))) return;
            if (key[0] === '"') return;
        }
        for (let i = 0; i < lark.inspirationKeys.length; i++)
            if (lark.inspirationKeys[i] === key) return;
        lark.inspirationKeys.push(key);
    };
    /**
     * 添加智能提示关键字列表
     * @param {String} keys 
     */
    addInspirationKeys(keys) {
        const lark = this;
        for (let i = 0; i < keys.length; i++) lark.addInspirationKey(keys[i]);
    };
    // 创建编辑器
    constructor(id, cfg) {
        const lark = this;
        // 容错处理
        if (typeof (cfg) === "undefined") cfg = {};
        if (typeof (cfg.colors) === "undefined") cfg.colors = {};
        // 初始化关键字
        let codeKeys = ["@", "$", "!", "+", "-", "*", "/", "let", "if", "while", "for", "foreach", "equal", "not", "compare", "and", "or"];
        if (typeof (cfg.codeKeys) === "object") codeKeys = cfg.codeKeys;
        // 处理代码颜色配置
        let codeColors = {
            key: "#c586c0",
            sign: "#808080",
            signs: ["#ff0000", "#0000ff", "#009900"],
            note: "#6a9955",
            string: "#c3602c",
            text: "#222222",
            numeric: "#aa0000",
        };
        if (typeof (cfg.colors.codeKey) !== "undefined") codeColors.key = cfg.colors.codeKey;
        if (typeof (cfg.colors.codeSign) !== "undefined") codeColors.sign = cfg.colors.codeSign;
        if (typeof (cfg.colors.codeSigns) !== "undefined") codeColors.signs = cfg.colors.codeSigns;
        if (typeof (cfg.colors.codeNote) !== "undefined") codeColors.note = cfg.colors.codeNote;
        if (typeof (cfg.colors.codeString) !== "undefined") codeColors.string = cfg.colors.codeString;
        if (typeof (cfg.colors.codeText) !== "undefined") codeColors.text = cfg.colors.codeText;
        // 处理界面颜色配置
        let uiColors = {
            borderColor: "#cccccc",
            toolbarItemColor: "#d81e06",
            toolbarItemBackgroudColorHover: "#ffffff",
            toolbarBackgroundColor: "#ebebeb",
            toolbarSpliteColor: "#dddddd"
        };
        if (typeof (cfg.colors.borderColor) !== "undefined") uiColors.borderColor = cfg.colors.borderColor;
        if (typeof (cfg.colors.toolbarItemColor) !== "undefined") uiColors.toolbarItemColor = cfg.colors.toolbarItemColor;
        if (typeof (cfg.colors.toolbarItemBackgroudColorHover) !== "undefined") uiColors.toolbarItemBackgroudColorHover = cfg.colors.toolbarItemBackgroudColorHover;
        if (typeof (cfg.colors.toolbarBackgroundColor) !== "undefined") uiColors.toolbarBackgroundColor = cfg.colors.toolbarBackgroundColor;
        if (typeof (cfg.colors.toolbarSpliteColor) !== "undefined") uiColors.toolbarSpliteColor = cfg.colors.toolbarSpliteColor;
        // 生成图标
        let logoImg = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
        logoImg += "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 1024 1024\" style=\"enable-background:new 0 0 1024 1024;\" xml:space=\"preserve\">";
        logoImg += "<style type=\"text/css\">";
        logoImg += ".logo_st0{fill:#E21357;}";
        logoImg += "</style>";
        logoImg += "<g id=\"K\">";
        logoImg += "<g>";
        logoImg += "<path class=\"logo_st0\" d=\"M256,825.5V183.1h129.8v262.2h89.3C487,462,495,473,520,482c24,10,50,12,69.4,7.3L768,825.5H623.6L474.1,541.2h-88.3v284.2H256z\"/>";
        logoImg += "</g>";
        logoImg += "</g>";
        logoImg += "<g id=\"K2\">";
        logoImg += "<circle class=\"logo_st0\" cx=\"607.5\" cy=\"302.5\" r=\"102.5\"/>";
        logoImg += "</g>";
        logoImg += "</svg>";
        // 实例化一个码蛋对象
        var codegg = new Codegg("editor", {
            colors: uiColors,
            // toolbar: [["h1", "h2", "h3", "p", "div"], ["b", "i", "s"], ["table", "ol", "ul"], ["link", "image", "audio", "video"], ["view"]]
            toolbar: [
                [
                    { name: "step", html: "@" }
                ],
                [
                    { name: "calculate", html: "!" },
                    { name: "addition", html: "+" },
                    { name: "subtraction", html: "-" },
                    { name: "multiplication", html: "*" },
                    { name: "division", html: "/" },
                ]
            ],
            logo: logoImg,
        });
        // 添加工具事件
        codegg.bind("step", function () {
            codegg.insertContent("@(fn)");
        });
        codegg.bind("calculate", function () {
            codegg.insertContent("!()");
        });
        codegg.bind("addition", function () {
            codegg.insertContent("+(val, val)");
        });
        codegg.bind("subtraction", function () {
            codegg.insertContent("-(val, val)");
        });
        codegg.bind("multiplication", function () {
            codegg.insertContent("*(val, val)");
        });
        codegg.bind("division", function () {
            codegg.insertContent("/(val, val)");
        });
        // 添加呈现事件
        var showInspiration = function (line, lineString, key) {
            const that = codegg;
            //let x = context.measureText(lineString).width;
            let x = codegg.getTextWidth(lineString);
            if (key === "") {
                that.hideInspiration();
            } else {
                let keys = [];
                for (let i = 0; i < lark.inspirationKeys.length; i++) {
                    let inspirationKey = lark.inspirationKeys[i];
                    if (inspirationKey.startsWith(key) && inspirationKey != key) keys.push(inspirationKey);
                }
                if (keys.length <= 0) {
                    that.hideInspiration();
                } else {
                    that.inspirationSelectionLength = key.length;
                    that.inspirationSelectionStart = that.editor.selectionStart - that.inspirationSelectionLength;
                    that.showInspiration(line, x, keys.sort());
                }
            }
        };
        codegg.bind("Render", function (contentChanged) {
            const that = codegg;
            if (typeof (contentChanged) === "undefined") contentChanged = false;
            let txt = that.editor.value;
            // 初始化智能提示列表集合
            lark.inspirationKeys = [];
            lark.addInspirationKeys(codeKeys);
            // 当前输入相关
            let posStart = that.editor.selectionStart;
            let posKey = "";
            let line = 1;
            // 添加行开始
            let html = that.getLineStartHtml(1);
            let key = "";
            let keyType = "text";
            let isEscape = false;
            let sign = 0;
            for (let i = 0; i < txt.length; i++) {
                let chr = txt[i];
                if (posStart == i) posKey = key;
                switch (chr) {
                    case '\n': // 处理换行
                        // 设置转义无效
                        if (isEscape) isEscape = false;
                        if (keyType === "note") {
                            html += "<span style='color:" + codeColors[keyType] + ";'>" + key + "</span>";
                            keyType = "text";
                            key = "";
                            //html += "<br />";
                        } else {
                            if (key !== "") {
                                // 添加智能提示
                                lark.addInspirationKey(key, true);
                                html += lark.renderKey(key, codeKeys, codeColors);
                                key = "";
                            }
                            //html += "<br />";
                        }
                        html += that.getLineEndHtml();
                        line++;
                        html += that.getLineStartHtml(line);
                        break;
                    case '\\': // 转义符
                        if (keyType === "string" || keyType === "string") {
                            isEscape = !isEscape;
                        }
                        key += chr;
                        break;
                    case '"':
                        if (keyType === "text") {
                            if (key !== "") {
                                // 添加智能提示
                                lark.addInspirationKey(key, true);
                                html += lark.renderKey(key, codeKeys, codeColors);
                                key = "";
                            }
                            keyType = "string";
                            key = chr;
                        } else if (keyType === "string") {
                            if (isEscape) {
                                key += chr;
                                isEscape = false;
                            } else {
                                key += "&quot;";
                                html += "<span style='color:" + codeColors[keyType] + ";'>" + key + "</span>";
                                keyType = "text";
                                key = "";
                            }
                        } else {
                            key += "&quot;";
                        }
                        break;
                    case '#':
                        // 设置转义无效
                        if (isEscape) isEscape = false;
                        if (keyType === "text") {
                            if (key !== "") {
                                // 添加智能提示
                                lark.addInspirationKey(key, true);
                                html += lark.renderKey(key, codeKeys, codeColors);
                                key = "";
                            }
                            keyType = "note";
                            key += chr;
                        } else if (keyType === "note") {
                            key += chr;
                            html += "<span style='color:" + codeColors[keyType] + ";'>" + key + "</span>";
                            keyType = "text";
                            key = "";
                        } else {
                            key += chr;
                        }
                        break;
                    case ' ':
                        // 设置转义无效
                        if (isEscape) isEscape = false;
                        if (keyType === "string" || keyType === "note") {
                            key += "&nbsp;";
                        } else {
                            if (key !== "") {
                                // 添加智能提示
                                lark.addInspirationKey(key, true);
                                html += lark.renderKey(key, codeKeys, codeColors);
                                key = "";
                            }
                            html += "&nbsp;";
                        }
                        break;
                    case '<': key += "&lt;"; break;
                    case '>': key += "&gt;"; break;
                    case '&': key += "&amp;"; break;
                    case '(':
                        // 设置转义无效
                        if (isEscape) isEscape = false;
                        if (keyType === "string" || keyType === "note") {
                            key += chr;
                        } else {
                            if (key !== "") {
                                // 添加智能提示
                                lark.addInspirationKey(key, true);
                                html += lark.renderKey(key, codeKeys, codeColors);
                                key = "";
                            }
                            sign++;
                            html += "<span style='color:" + codeColors.signs[sign % codeColors.signs.length] + ";'>" + chr + "</span>";
                        }
                        break;
                    case ')':
                        // 设置转义无效
                        if (isEscape) isEscape = false;
                        if (keyType === "string" || keyType === "note") {
                            key += chr;
                        } else {
                            if (key !== "") {
                                // 添加智能提示
                                lark.addInspirationKey(key, true);
                                html += lark.renderKey(key, codeKeys, codeColors);
                                key = "";
                            }
                            html += "<span style='color:" + codeColors.signs[sign % codeColors.signs.length] + ";'>" + chr + "</span>";
                            sign--;
                        }
                        break;
                    case ',':
                    case '{': case '}':
                    case '[': case ']':
                        // 设置转义无效
                        if (isEscape) isEscape = false;
                        if (keyType === "string" || keyType === "note") {
                            key += chr;
                        } else {
                            if (key !== "") {
                                // 添加智能提示
                                lark.addInspirationKey(key, true);
                                html += lark.renderKey(key, codeKeys, codeColors);
                                key = "";
                            }
                            html += "<span style='color:" + codeColors.sign + ";'>" + chr + "</span>";
                        }
                        break;
                    default:
                        // 设置转义无效
                        if (isEscape) isEscape = false;
                        if (key === "/") {
                            html += "<span style='color:" + codeColors.sign + ";'>" + key + "</span>";
                            key = "";
                        }
                        key += chr;
                        break;
                }
            }
            if (posStart >= txt.length) posKey = key;
            if (key !== "") {
                // 添加智能提示
                lark.addInspirationKey(key, true);
                html += lark.renderKey(key, codeKeys, codeColors);
                key = "";
            }

            // 添加行结束
            html += that.getLineEndHtml();
            // 输出内容
            that.rendering.innerHTML = html;
            //that.renderingRect.style.width = that.rendering.offsetWidth + "px";
            that.renderingRect.style.height = that.rendering.offsetHeight + "px";
            // 处理智能提示
            if (contentChanged) {
                // 光标位置
                let posTop = 0;
                let posLeft = 0;
                line = 1;
                let lineString = "";
                // 进行智能提示定位
                for (let i = 0; i < txt.length; i++) {
                    let chr = txt[i];
                    lineString += chr;
                    if (i == posStart) {
                        showInspiration(line, lineString, posKey);
                    }
                    // 换行
                    if (chr === '\n') {
                        lineString = "";
                        line++;
                    }
                }
                if (posStart >= txt.length) {
                    showInspiration(line, lineString, posKey);
                }
            }
        });
        // 初始化呈现
        codegg.render(false);
        return codegg;
    }
}