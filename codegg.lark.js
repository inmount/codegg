// 主类
class LarkCodegg {
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
    }
    // 创建编辑器
    constructor(id, cfg) {
        var lark = this;
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
            note: "#6a9955",
            string: "#c3602c",
            text: "#222222",
            numeric: "#aa0000",
        };
        if (typeof (cfg.colors.codeKey) !== "undefined") codeColors.key = cfg.colors.codeKey;
        if (typeof (cfg.colors.codeSign) !== "undefined") codeColors.sign = cfg.colors.codeSign;
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
            ]
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
        codegg.bind("Render", function () {
            const that = codegg;
            let txt = that.editor.value;
            let html = "";
            let key = "";
            let keyType = "text";
            let isEscape = false;
            for (let i = 0; i < txt.length; i++) {
                let chr = txt[i];
                switch (chr) {
                    case '\n': // 处理换行
                        // 设置转义无效
                        if (isEscape) isEscape = false;
                        if (keyType === "note") {
                            html += "<span style='color:" + codeColors[keyType] + ";'>" + key + "</span>";
                            keyType = "text";
                            key = "";
                            html += "<br />";
                        } else {
                            if (key !== "") {
                                html += lark.renderKey(key, codeKeys, codeColors);
                                key = "";
                            }
                            html += "<br />";
                        }
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
                                html += lark.renderKey(key, codeKeys, codeColors);
                                key = "";
                            }
                            html += "&nbsp;";
                        }
                        break;
                    case '<': key += "&lt;"; break;
                    case '>': key += "&gt;"; break;
                    case '&': key += "&amp;"; break;
                    case ',':
                    case '(': case ')':
                    case '{': case '}':
                    case '[': case ']':
                        // 设置转义无效
                        if (isEscape) isEscape = false;
                        if (keyType === "string" || keyType === "note") {
                            key += chr;
                        } else {
                            if (key !== "") {
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
            if (key !== "") {
                html += lark.renderKey(key, codeKeys, codeColors);
                key = "";
            }
            // 输出内容
            that.rendering.innerHTML = html;
            that.renderingRect.style.width = that.rendering.offsetWidth + "px";
            that.renderingRect.style.height = that.rendering.offsetHeight + "px";
        });
        return codegg;
    }
}