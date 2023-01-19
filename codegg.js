/*

Version 2.0.2301.4
解决box-sizing兼容性问题

*/

// 主类
class Codegg {
    // 配置
    config = {};
    // 预览外框
    viewerRect = null;
    // 预览元素
    viewerBox = null;
    // 渲染元素外框
    renderingRect = null;
    // 渲染元素
    rendering = null;
    // 编辑框
    editor = null;
    // 编辑框
    editorBox = null;
    // 工具栏
    toolbarBox = null;
    // 句柄
    handlers = [];
    // 处罚错误事件
    raiseError(ex) {
        // 转存对象
        let that = this;
        let binded = false;
        for (let i = 0; i < that.handlers.length; i++) {
            if (that.handlers[i].name === "error") {
                if (typeof that.handlers[i].fn === "function") {
                    binded = true;
                    that.handlers[i].fn(ex);
                }
            }
        }
        if (!binded) throw ex;
    };
    // 安全模式运行
    safeModeExecute(fn, arg) {
        // 转存对象
        let that = this;
        try {
            fn(arg);
        } catch (ex) {
            that.raiseError(ex);
        }
    };
    // 绑定事件
    bind(name, fn) {
        this.handlers.push({ name: name, fn: fn });
    };
    // 获取内容
    getContent() {
        // 转存对象
        let that = this;
        return that.editor.value;
    };
    // 设置内容
    setContent(content) {
        // 转存对象
        let that = this;
        that.editor.value = content;
        // 重新渲染
        that.render();
    };
    // 创建字符串
    createString(chr, num) {
        let str = "";
        for (let i = 0; i < num; i++) {
            str += chr;
        }
        return str;
    }
    // 插入内容
    insertContent(str) {
        // 转存对象
        let that = this;
        // 获取相关内容
        let content = that.editor.value;
        let posStart = that.editor.selectionStart;
        let posEnd = that.editor.selectionEnd;
        let len = str.length;
        that.editor.value = content.substring(0, posStart) + str + content.substring(posEnd, content.length);
        that.editor.selectionStart = posStart;
        that.editor.selectionEnd = posStart + len;
        that.editor.focus();
        // 重新渲染
        that.render();
    }
    // 获取选中内容
    getSelectContent(str) {
        // 转存对象
        let that = this;
        // 获取相关内容
        let content = that.editor.value;
        let posStart = that.editor.selectionStart;
        let posEnd = that.editor.selectionEnd;
        return content.substring(posStart, posEnd);
    }
    // 设置代码缩进
    setSelectCodeIndentation(space) {
        // 转存对象
        let that = this;
        if (space <= 0) return;
        let str = that.createString(' ', space);
        // 获取相关内容
        let content = that.editor.value;
        let posStart = that.editor.selectionStart;
        let posEnd = that.editor.selectionEnd;
        let len = str.length;
        that.editor.value = content.substring(0, posStart) + str + content.substring(posEnd, content.length);
        that.editor.selectionStart = posStart + len;
        that.editor.selectionEnd = posStart + len;
        that.editor.focus();
        // 重新渲染
        that.render();
    };
    // 获取代码缩进
    getSelectCodeIndentation() {
        // 转存对象
        let that = this;
        let editor = that.editor;
        let str = "";
        let content = editor.value;
        let posStart = editor.selectionStart;
        let posEnd = editor.selectionEnd;
        let space = 0;
        if (content === "") return 0;
        if (content[posStart] === '\n') posStart--;
        for (let i = posStart; i >= 0; i--) {
            let chr = content[i];
            switch (chr) {
                case '\n': return space;
                case ' ': space++; break;
                default: space = 0; break;
            }
        }
        return space;
    };
    // 渲染java脚本关键字
    renderJavascriptKey(txt, colors) {
        const keys = ["var", "let", "const", "function", "for", "while", "do", "switch", "case", "break", "if", "else", "default"];
        let key = txt.toLowerCase();
        let isKey = false;
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] === key) {
                return "<span style='color:" + colors.javaKey + ";'>" + txt + "</span>";
            }
        }
        return "<span style='color:" + colors.text + ";'>" + txt + "</span>";
    }
    // 渲染java脚本
    renderJavascript(txt) {
        // 转存对象
        let that = this;
        let html = "";
        const colors = {
            javaKey: "#c586c0",
            javaSign: "#808080",
            javaNoteLine: "#6a9955",
            javaNotes: "#6a9955",
            javaString: "#c3602c",
            javaStringSingle: "#c3602c",
            text: "#222222"
        };
        let key = "";
        let keyType = "text";
        let isEscape = false;
        //console.log(txt);
        for (let i = 0; i < txt.length; i++) {
            let chr = txt[i];
            switch (chr) {
                case '\n': // 处理换行
                    // 设置转义无效
                    if (isEscape) isEscape = false;
                    if (keyType === "javaNoteLine") {
                        html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                        keyType = "text";
                        key = "";
                        html += "<br />";
                    } else if (keyType === "javaNotes") {
                        key += "<br />";
                    } else {
                        if (key !== "") {
                            html += that.renderJavascriptKey(key, colors);
                            key = "";
                        }
                        html += "<br />";
                    }
                    break;
                case '\\': // 转义符
                    if (keyType === "javaStringSingle" || keyType === "javaString") {
                        isEscape = !isEscape;
                    }
                    key += chr;
                    break;
                case '\'': // 单引号
                    if (keyType === "text") {
                        if (key !== "") {
                            html += that.renderJavascriptKey(key), colors;
                            key = "";
                        }
                        keyType = "javaStringSingle";
                        key = chr;
                    } else if (keyType === "javaStringSingle") {
                        if (isEscape) {
                            key += chr;
                            isEscape = false;
                        } else {
                            key += chr;
                            html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                            keyType = "text";
                            key = "";
                        }
                    } else {
                        key += chr;
                    }
                    break;
                case '"':
                    if (keyType === "text") {
                        if (key !== "") {
                            html += that.renderJavascriptKey(key, colors);
                            key = "";
                        }
                        keyType = "javaString";
                        key = chr;
                    } else if (keyType === "javaString") {
                        if (isEscape) {
                            key += chr;
                            isEscape = false;
                        } else {
                            key += "&quot;";
                            html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                            keyType = "text";
                            key = "";
                        }
                    } else {
                        key += "&quot;";
                    }
                    break;
                case '/':
                    // 设置转义无效
                    if (isEscape) isEscape = false;
                    if (keyType === "text") {
                        if (key !== "") {
                            // 处理注释
                            if (key === "/") {
                                keyType = "javaNoteLine";
                            } else {
                                html += that.renderJavascriptKey(key, colors);
                                key = "";
                            }
                        }
                        key += chr;
                    } else if (keyType === "javaNotes") {
                        if (key.length >= 3 && key.endsWith("*")) {
                            key += chr;
                            html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                            keyType = "text";
                            key = "";
                        } else {
                            key += chr;
                        }
                    } else {
                        key += chr;
                    }
                    break;
                case '*':
                    // 设置转义无效
                    if (isEscape) isEscape = false;
                    if (keyType === "text") {
                        if (key !== "") {
                            // 处理注释
                            if (key === "/") {
                                keyType = "javaNotes";
                                key += chr;
                            } else {
                                html += that.renderJavascriptKey(key, colors);
                                html += "<span style='color:" + colors.javaSign + ";'>" + chr + "</span>";
                                key = "";
                            }
                        } else {
                            html += "<span style='color:" + colors.javaSign + ";'>" + chr + "</span>";
                        }
                    } else {
                        key += chr;
                    }
                    break;
                case ' ':
                    // 设置转义无效
                    if (isEscape) isEscape = false;
                    if (keyType === "javaString" || keyType === "javaStringSingle" || keyType === "javaNotes" || keyType === "javaNoteLine") {
                        key += "&nbsp;";
                    } else {
                        if (key !== "") {
                            html += that.renderJavascriptKey(key, colors);
                            key = "";
                        }
                        html += "&nbsp;";
                    }
                    break;
                    break;
                case '<': key += "&lt;"; break;
                case '>': key += "&gt;"; break;
                case '&': key += "&amp;"; break;
                case '(': case ')':
                case '{': case '}':
                case '[': case ']':
                case '+': case '-':
                case ':': case ';': case ',': case '.':
                case '!': case '=': case '|':
                    // 设置转义无效
                    if (isEscape) isEscape = false;
                    if (keyType === "javaString" || keyType === "javaStringSingle" || keyType === "javaNotes" || keyType === "javaNoteLine") {
                        key += chr;
                    } else {
                        if (key !== "") {
                            html += that.renderJavascriptKey(key, colors);
                            key = "";
                        }
                        html += "<span style='color:" + colors.javaSign + ";'>" + chr + "</span>";
                    }
                    break;
                default:
                    // 设置转义无效
                    if (isEscape) isEscape = false;
                    if (key === "/") {
                        html += "<span style='color:" + colors.javaSign + ";'>" + key + "</span>";
                        key = "";
                    }
                    key += chr;
                    break;
            }
        }
        if (key !== "") {
            html += that.renderJavascriptKey(key, colors);
            key = "";
        }
        return html;
    }
    // 渲染java脚本关键字
    renderCssKey(txt, colors) {
        const keys = [
            // a
            "align-content", "align-items", "align-self", "all", "animation",
            "animation-delay", "animation-direction", "animation-duration", "animation-fill-mode", "animation-iteration-count",
            "animation-name", "animation-play-state", "animation-timing-function",
            // b
            "backface-visibility", "background", "background-attachment", "background-blend-mode", "background-clip",
            "background-color", "background-image", "background-origin", "background-position", "background-repeat",
            "background-size", "border", "border-bottom", "border-bottom-color", "border-bottom-left-radius",
            "border-bottom-right-radius", "border-bottom-style", "border-bottom-width", "border-collapse", "border-color",
            "border-image", "border-image-outset", "border-image-repeat", "border-image-slice", "border-image-source",
            "border-image-width", "border-left", "border-left-color", "border-left-style", "border-left-width",
            "border-radius", "border-right", "border-right-color", "border-right-style", "border-right-width",
            "border-spacing", "border-style", "border-top", "border-top-color", "border-top-left-radius",
            "border-top-right-radius", "border-top-style", "border-top-width", "border-width", "bottom",
            "box-decoration-break", "box-shadow", "box-sizing", "break-after", "break-before",
            "break-inside",
            // c
            "caption-side", "caret-color", "@charset", "clear", "clip",
            "clip-path", "color", "column-count", "column-fill", "column-gap",
            "column-rule", "column-rule-color", "column-rule-style", "column-rule-width", "column-span",
            "column-width", "columns", "content", "counter-increment", "counter-reset",
            "cursor",
            // d
            "direction", "display",
            // e
            "empty-cells",
            // f
            "filter", "flex", "flex-basis", "flex-direction", "flex-flow",
            "flex-grow", "flex-shrink", "flex-wrap", "float", "font",
            "@font-face", "font-family", "font-feature-settings", "@font-feature-values", "font-kerning",
            "font-language-override", "font-size", "font-size-adjust", "font-stretch", "font-style",
            "font-synthesis", "font-variant", "font-variant-alternates", "font-variant-caps", "font-variant-east-asian",
            "font-variant-ligatures", "font-variant-numeric", "font-variant-position", "font-weight",
            // g
            "grid", "grid-area", "grid-auto-columns", "grid-auto-flow", "grid-auto-rows",
            "grid-column", "grid-column-end", "grid-column-gap", "grid-column-start", "grid-gap",
            "grid-row", "grid-row-end", "grid-row-gap", "grid-row-start", "grid-template",
            "grid-template-areas", "grid-template-columns", "grid-template-rows",
            // h
            "hanging-punctuation", "height", "hyphens",
            // i
            "image-rendering", "@import", "isolation",
            // j
            "justify-content",
            // k
            "@keyframes",
            // l
            "left", "letter-spacing", "line-break", "line-height", "list-style",
            "list-style-image", "list-style-position", "list-style-type",
            // m
            "margin", "margin-bottom", "margin-left", "margin-right", "margin-top",
            "mask", "mask-type", "max-height", "max-width", "@media",
            "min-height", "min-width", "mix-blend-mode",
            // o
            "object-fit", "object-position", "opacity", "order", "orphans",
            "outline", "outline-color", "outline-offset", "outline-style", "outline-width",
            "overflow", "overflow-wrap", "overflow-x", "overflow-y",
            // p
            "padding", "padding-bottom", "padding-left", "padding-right", "padding-top",
            "page-break-after", "page-break-before", "page-break-inside", "perspective", "perspective-origin",
            "pointer-events", "position",
            // q
            "quotes",
            // r
            "resize", "right",
            // q
            "scroll-behavior",
            // t
            "tab-size", "table-layout", "text-align", "text-align-last", "text-combine-upright",
            "text-decoration", "text-decoration-color", "text-decoration-line", "text-decoration-style", "text-indent",
            "text-justify", "text-orientation", "text-overflow", "text-shadow", "text-transform",
            "text-underline-position", "top", "transform", "transform-origin", "transform-style",
            "transition", "transition-delay", "transition-duration", "transition-property", "transition-timing-function",
            // u
            "unicode-bidi", "user-select",
            // v
            "vertical-align", "visibility",
            // w
            "white-space", "widows", "width", "word-break", "word-spacing",
            "word-wrap", "writing-mode",
            // z
            "z-index",
        ];
        const values = [
            "stretch", "center", "flex-start", "flex-end", "space-between", "space-around", "initial", "inherit",
            "baseline", "auto", "unset", "none", "normal", "alternate", "forwards", "backwards", "both", "infinite",
            "paused", "running", "visible", "hidden", "scroll", "fixed",
            "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "saturation", "color", "luminosity",
            "border-box", "padding-box", "content-box", "repeat", "repeat-x", "repeat-y", "repeat-y", "no-repeat",
            "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset",
            "separate", "collapse", "stretch", "round", "fill", "slice", "clone",
            "always", "avoid", "avoid-column", "avoid-page", "avoid-region", "column", "page", "recto", "region", "verso",
            "clip-source", "basic-shape", "margin-box", "fill-box", "stroke-box", "view-box",
            "balance", "default", "crosshair", "pointer", "move", "e-resize", "ne-resize", "nw-resize",
            "n-resize", "se-resize", "sw-resize", "s-resize", "w-resize", "text", "wait", "help",
            "ltr", "rtl", "block", "inline", "inline-block", "list-item", "run-in", "compact", "marker",
            "table", "inline-table", "table-row-group", "table-header-group", "table-footer-group", "table-row", "table-column-group",
            "table-column", "table-cell", "table-caption", "hide", "show", "flex-grow", "flex-shrink", "flex-basis",
            "row", "row-reverse", "column-reverse", "flex-direction", "flex-wrap", "nowrap", "wrap", "wrap-reverse",
            "feature-value", "wider", "narrower", "ultra-condensed", "extra-condensed", "condensed",
            "semi-condensed", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded",
            "italic", "oblique", "small-caps", "all-small-caps", "petite-caps", "all-petite-caps", "unicase", "titling-caps",
            "bold", "bolder", "lighter", "max-content", "min-content", "dense", "length", "first", "last", "allow-end", "force-end",
            "manual", "isolate", "inside", "outside", "disc", "circle", "square", "decimal", "decimal-leading-zero",
            "lower-roman", "upper-roman", "lower-alpha", "upper-alpha", "lower-greek", "lower-latin", "upper-latin",
            "hebrew", "armenian", "georgian", "cjk-ideographic", "hiragana", "katakana", "hiragana-iroha", "katakana-iroha",
            "color-burn", "difference", "exclusion", "hue", "saturation", "luminosity",
            "contain", "cover", "scale-down", "absolute", "relative", "static", "horizontal", "vertical", "smooth",
            "automatic", "justify", "start", "end", "underline", "overline", "line-through", "blink", "wavy",
            "inter-word", "inter-ideograph", "inter-cluster", "distribute", "kashida", "clip", "ellipsis",
            "capitalize", "uppercase", "lowercase", "flat", "preserve-3d", "linear", "ease", "ease-in", "ease-out", "ease-in-out",
            "embed", "bidi-override", "isolate-override", "plaintext", "sub", "top", "left", "right", "bottom", "text-top", "middle", "text-bottom",
            "pre", "pre-wrap", "pre-line", "break-all", "keep-all", "break-word", "horizontal-tb", "vertical-rl", "vertical-lr",
        ];
        let key = txt.toLowerCase();
        let isKey = false;
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] === key) {
                return "<span style='color:" + colors.cssKey + ";'>" + txt + "</span>";
            }
        }
        for (let i = 0; i < values.length; i++) {
            if (values[i] === key) {
                return "<span style='color:" + colors.cssValue + ";'>" + txt + "</span>";
            }
        }
        return "<span style='color:" + colors.text + ";'>" + txt + "</span>";
    }
    // 渲染css样式
    renderCss(txt) {
        // 转存对象
        let that = this;
        const colors = {
            cssSign: "#808080",
            cssKey: "#3e9cd6",
            cssValue: "#c3602c",
            cssNotes: "#6a9955",
            text: "#d0a342"
        };
        let html = "";
        let key = "";
        let keyType = "text";
        //console.log(txt);
        for (let i = 0; i < txt.length; i++) {
            let chr = txt[i];
            switch (chr) {
                case '\n': // 处理换行
                    if (keyType === "cssNotes") {
                        key += "<br />";
                    } else {
                        if (key !== "") {
                            html += that.renderCssKey(key, colors);
                            key = "";
                        }
                        html += "<br />";
                    }
                    break;
                case ' ':
                    if (keyType === "cssNotes") {
                        key += "&nbsp;";
                    } else {
                        if (key !== "") {
                            html += that.renderCssKey(key, colors);
                            key = "";
                        }
                        html += "&nbsp;";
                    }
                    break;
                case '"':
                    if (keyType === "text") {
                        if (key !== "") {
                            html += that.renderCssKey(key, colors);
                            key = "";
                        }
                        keyType = "javaString";
                        key = chr;
                    } else if (keyType === "javaStringSingle" || keyType === "javaNotes" || keyType === "javaNoteLine") {
                        key += "&quot;";
                    } else if (keyType === "javaString") {
                        key += "&quot;";
                        html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                        keyType = "text";
                        key = "";
                    } else {
                        throw "不支持的类型\"" + keyType + "\"";
                    }
                    break;
                case '/':
                    if (keyType === "text") {
                        if (key !== "") {
                            html += that.renderCssKey(key, colors);
                            key = "";
                        }
                        key += chr;
                    } else if (keyType === "cssNotes") {
                        if (key.length >= 3 && key.endsWith("*")) {
                            key += chr;
                            html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                            keyType = "text";
                            key = "";
                        } else {
                            key += chr;
                        }
                    } else {
                        key += chr;
                    }
                    break;
                case '*':
                    if (keyType === "text") {
                        if (key !== "") {
                            // 处理注释
                            if (key === "/") {
                                keyType = "cssNotes";
                                key += chr;
                            } else {
                                key += chr;
                            }
                        } else {
                            key += chr;
                        }
                    } else {
                        key += chr;
                    }
                    break;
                case '{': case '}':
                case '(': case ')':
                case ':': case ';':
                    if (key !== "") {
                        html += that.renderCssKey(key, colors);
                        key = "";
                    }
                    html += "<span style='color:" + colors.cssSign + ";'>" + chr + "</span>";
                    break;
                default: key += chr; break;
            }
        }
        if (key !== "") {
            html += that.renderCssKey(key, colors);
            key = "";
        }
        return html;
    }
    // 执行渲染
    render() {
        // 转存对象
        let that = this;
        let txt = that.editor.value;
        let html = "";
        const colors = {
            xmlSign: "#808080",
            xmlTagName: "#3e9cd6",
            xmlAttrName: "#d0a342",
            xmlAttrValue: "#c3602c",
            xmlAttrValueString: "#c3602c",
            xmlAttrValueStringSingle: "#c3602c",
            xmlNotes: "#6a9955",
            text: "#222222"
        };
        let nodeName = "";
        let key = "";
        let keyType = "text";
        let isEscape = false;
        for (let i = 0; i < txt.length; i++) {
            let chr = txt[i];
            switch (chr) {
                case '\n':
                    // 设置转义无效
                    if (isEscape) isEscape = false;
                    // 兼容java脚本
                    if (keyType === "text" && (nodeName === "script" || nodeName === "style")) {
                        key += chr;
                    } else if (keyType === "javaString" || keyType === "javaStringSingle") {
                        keyType = "text";
                        key += chr;
                    } else {
                        if (key !== "") {
                            html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                            keyType = "text";
                            key = "";
                        }
                        html += "<br />";
                    }
                    break;
                case '<': // 左括
                    // 设置转义无效
                    if (isEscape) isEscape = false;
                    if (keyType === "javaString" || keyType === "javaStringSingle") {
                        key += chr;
                    } else if (keyType === "text") {
                        if (nodeName === "script" || nodeName === "style") {
                            key += chr;
                        } else {
                            // 填充之前内容
                            if (key !== "") html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                            html += "<span style='color:" + colors.xmlSign + ";'>&lt;</span>";
                            keyType = "xmlTagName";
                            key = "";
                        }
                    } else if (keyType === "xmlTagName") {
                        // 填充之前内容
                        if (key !== "") html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                        html += "<span style='color:" + colors.xmlSign + ";'>&lt;</span>";
                        keyType = "xmlTagName";
                        key = "";
                    } else {
                        key += "&lt;";
                    }
                    break;
                case '>': // 右括
                    // 设置转义无效
                    if (isEscape) isEscape = false;
                    if (keyType === "javaString") {
                        key += chr;
                    } else if (keyType === "xmlNotes") {
                        if (key.length >= 4 && key.endsWith("--")) {
                            html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                            html += "<span style='color:" + colors.xmlSign + ";'>&gt;</span>";
                            keyType = "text";
                            key = "";
                        } else {
                            key += "&gt;";
                        }
                    } else if (keyType === "xmlTagName") {
                        if (key.startsWith("/")) {
                            nodeName = "";
                            html += "<span style='color:" + colors.xmlSign + ";'>/</span>";
                            html += "<span style='color:" + colors[keyType] + ";'>" + key.substr(1) + "</span>";
                        } else {
                            nodeName = key.toLowerCase();
                            //console.log("node=" + nodeName);
                            html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                        }
                        html += "<span style='color:" + colors.xmlSign + ";'>&gt;</span>";
                        keyType = "text";
                        key = "";
                    } else if (keyType === "xmlAttrName") {
                        if (key === "/") {
                            nodeName = "";
                            html += "<span style='color:" + colors.xmlSign + ";'>/</span>";
                        } else {
                            nodeName = key;
                            html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                        }
                        html += "<span style='color:" + colors.xmlSign + ";'>&gt;</span>";
                        keyType = "text";
                        key = "";
                    } else if (keyType === "xmlAttrValue") {
                        html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                        html += "<span style='color:" + colors.xmlSign + ";'>&gt;</span>";
                        keyType = "text";
                        key = "";
                    } else if (keyType === "text") {
                        if (nodeName === "script") {
                            let endStr = key.substr(key.length - 8);
                            if (endStr.toLowerCase() === "</script") {
                                // 输出渲染的脚本内容
                                html += that.renderJavascript(key.substr(0, key.length - 8));
                                html += "<span style='color:" + colors.xmlSign + ";'>&lt;/</span>";
                                html += "<span style='color:" + colors.xmlTagName + ";'>" + endStr.substr(2) + "</span>";
                                html += "<span style='color:" + colors.xmlSign + ";'>&gt;</span>";
                                nodeName = "";
                                key = "";
                            } else {
                                key += chr;
                            }
                        } else if (nodeName === "style") {
                            let endStr = key.substr(key.length - 7);
                            if (endStr.toLowerCase() === "</style") {
                                // 输出渲染的样式内容
                                html += that.renderCss(key.substr(0, key.length - 7));
                                html += "<span style='color:" + colors.xmlSign + ";'>&lt;/</span>";
                                html += "<span style='color:" + colors.xmlTagName + ";'>" + endStr.substr(2) + "</span>";
                                html += "<span style='color:" + colors.xmlSign + ";'>&gt;</span>";
                                nodeName = "";
                                key = "";
                            } else {
                                key += chr;
                            }
                        } else {
                            // 填充之前内容
                            if (key !== "") html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                            html += "<span style='color:" + colors.xmlSign + ";'>&gt;</span>";
                            keyType = "text";
                            key = "";
                        }
                    } else {
                        key += "&gt;";
                    }
                    break;
                case ' ': // 空格
                    // 设置转义无效
                    if (isEscape) isEscape = false;
                    if (keyType === "xmlTagName") {
                        // 填充之前内容
                        nodeName = key.toLowerCase();
                        //console.log("node=" + nodeName);
                        if (key !== "") html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                        html += "&nbsp;";
                        keyType = "xmlAttrName";
                        key = "";
                    } else if (keyType === "xmlAttrValue") {
                        // 填充之前内容
                        if (key !== "") html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                        html += "&nbsp;";
                        keyType = "xmlAttrName";
                        key = "";
                    } else if (keyType === "text") {
                        // 兼容java脚本
                        if (nodeName === "script" || nodeName === "style") {
                            key += chr;
                        } else {
                            key += "&nbsp;";
                        }
                    } else if (keyType === "javaString" || keyType === "javaStringSingle") {
                        key += chr;
                    } else {
                        key += "&nbsp;";
                    }
                    break;
                case '=': // 等号
                    // 设置转义无效
                    if (isEscape) isEscape = false;
                    if (keyType === "xmlAttrName") {
                        // 填充之前内容
                        if (key !== "") html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                        html += "<span style='color:" + colors.xmlSign + ";'>" + chr + "</span>";
                        keyType = "xmlAttrValue";
                        key = "";
                    } else {
                        key += chr;
                    }
                    break;
                case '-': // 减号
                    // 设置转义无效
                    if (isEscape) isEscape = false;
                    if (keyType === "xmlTagName") {
                        if (key === "!-") {
                            // 注释
                            keyType = "xmlNotes";
                            key += chr;
                        } else {
                            key += chr;
                        }
                    } else {
                        key += chr;
                    }
                    break;
                case '\\': // 转义符
                    if (keyType === "javaStringSingle" || keyType === "javaString") {
                        isEscape = !isEscape;
                    }
                    key += chr;
                    break;
                case '&': // 转义符
                    if (keyType === "javaStringSingle" || keyType === "javaString") {
                        key += chr;
                    } else if (keyType === "text") {
                        // 兼容java脚本
                        if (nodeName === "script") {
                            key += chr;
                        } else {
                            key += "&amp;";
                        }
                    } else {
                        key += "&amp;";
                    }
                    break;
                case '\'': // 单引号
                    if (keyType === "text") {
                        // 兼容java脚本
                        if (nodeName === "script") {
                            keyType = "javaStringSingle";
                            key += chr;
                        } else {
                            key += chr;
                        }
                    } else if (keyType === "javaString") {
                        key += chr;
                    } else if (keyType === "javaStringSingle") {
                        key += chr;
                        if (isEscape) {
                            isEscape = false;
                        } else {
                            keyType = "text";
                        }
                    } else if (keyType === "xmlAttrValueString") {
                        key += chr;
                        html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                        keyType = "xmlAttrValue";
                        key = "";
                    } else if (keyType === "xmlAttrValueStringSingle") {
                        key += chr;
                        html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                        keyType = "text";
                        key = "";
                    } else if (keyType === "xmlAttrValue") {
                        // 填充之前内容
                        if (key !== "") html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                        keyType = "xmlAttrValueStringSingle";
                        key = chr;
                    } else {
                        key += chr;
                    }
                    break;
                case '"': // 处理引号
                    if (keyType === "text") {
                        // 兼容java脚本
                        if (nodeName === "script") {
                            keyType = "javaString";
                            key += chr;
                        } else if (nodeName === "style") {
                            key += chr;
                        } else {
                            key += "&quot;";
                        }
                    } else if (keyType === "javaString") {
                        key += chr;
                        if (isEscape) {
                            isEscape = false;
                        } else {
                            keyType = "text";
                        }
                    } else if (keyType === "javaStringSingle") {
                        key += chr;
                    } else if (keyType === "xmlAttrValueString") {
                        key += "&quot;";
                        html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                        keyType = "xmlAttrValue";
                        key = "";
                    } else if (keyType === "xmlAttrValueStringSingle") {
                        key += "&quot;";
                    } else if (keyType === "xmlAttrValue") {
                        // 填充之前内容
                        if (key !== "") html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
                        keyType = "xmlAttrValueString";
                        key = "&quot;";
                    } else {
                        key += "&quot;";
                    }
                    break;
                default:
                    // 设置转义无效
                    if (isEscape) isEscape = false;
                    key += chr;
                    break;
            }
        }
        if (key !== "") {
            //console.log("[" + keyType + "][" + nodeName + "]" + key);
            if (keyType === "javaString" || keyType === "javaStringSingle" || (keyType === "text" && nodeName === "script") || (keyType === "text" && nodeName === "style"))
                key = key.replace(/&/, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/, "&quot;");
            html += "<span style='color:" + colors[keyType] + ";'>" + key + "</span>";
            key = "";
        }
        that.rendering.innerHTML = html;
        that.renderingRect.style.width = that.rendering.offsetWidth + "px";
        that.renderingRect.style.height = that.rendering.offsetHeight + "px";
        //console.log(that.rendering.offsetHeight);
    }
    // 创建编辑器
    constructor(id, cfg) {
        // 转存对象
        let that = this;
        // 获取父对象
        let parent = document.getElementById(id);
        // 判断父对象是否存在
        if (parent === null) throw "Id not found";
        // 设置默认皮肤颜色
        let skin = {
            borderColor: "#cccccc",
            toolbarItemColor: "#d81e06",
            toolbarItemBackgroudColorHover: "#ffffff",
            toolbarBackgroundColor: "#ebebeb",
            toolbarSpliteColor: "#dddddd",
        };
        //let toolbar = [["h1", "h2", "h3", "p", "div"], ["b", "i", "s"], ["table", "ol", "ul"], ["link", "image", "audio", "video"], ["view"]];
        let toolbar = [];
        // 设置默认
        // 填充自定义皮肤
        if (typeof cfg === "undefined") cfg = {};
        if (typeof cfg.colors === "undefined") cfg.colors = {};
        if (typeof cfg.toolbar === "object") toolbar = cfg.toolbar;
        for (let k in cfg.colors) skin[k] = cfg.colors[k];
        that.config.colors = skin;
        that.config.toolbar = toolbar;
        // 生成工具项
        let createToolItem = function (box, html, event, fn) {
            // 生成标题1
            let div = document.createElement("div");
            div.style.float = "left";
            div.style.width = "30px";
            div.style.height = "30px";
            div.style.margin = "5px 0px 5px 6px";
            div.style.cursor = "pointer";
            div.style.padding = "4px";
            div.style.borderRadius = "2px";
            div.style.color = skin.toolbarItemColor;
            div.style.textAlign = "center";
            div.style.lineHeight = "22px";
            div.style.fontSize = "16px";
            div.style.fontFamily = "consolas";
            div.style.boxSizing = "border-box";
            div.style.overflow = "hidden";
            div.innerHTML = html;
            box.appendChild(div);
            div.addEventListener("mouseover", function () { div.style.backgroundColor = skin.toolbarItemBackgroudColorHover; });
            div.addEventListener("mouseout", function () { div.style.backgroundColor = ""; });
            div.addEventListener("click", function () {
                let arg = {
                    setResult: function (e) {
                        if (typeof fn === "function") that.safeModeExecute(fn, e);
                    }
                };
                let binded = false;
                for (let i = 0; i < that.handlers.length; i++) {
                    if (that.handlers[i].name === event) {
                        if (typeof that.handlers[i].fn === "function") {
                            binded = true;
                            that.safeModeExecute(that.handlers[i].fn, arg);
                        }
                    }
                }
                // 无绑定事件则以默认参数执行
                if (!binded) arg.setResult({});
            });
        }
        let createToolSeparate = function (box) {
            // 生成分隔
            let separate = document.createElement("div");
            separate.style.float = "left";
            separate.style.width = "1";
            separate.style.height = "20px";
            separate.style.margin = "10px 0px 0px 10px";
            separate.style.backgroundColor = skin.toolbarSpliteColor;
            box.appendChild(separate);
        }
        // 生成工具栏
        let createToolBar = function () {
            // 创建工具栏容器
            let box = document.createElement("div");
            box.style.width = "100%";
            box.style.minHeight = "40px";
            box.style.border = "1px solid " + skin.borderColor;
            box.style.borderBottom = "1px solid " + skin.toolbarBackgroundColor;
            box.style.boxSizing = "border-box";
            box.style.backgroundColor = skin.toolbarBackgroundColor;
            parent.appendChild(box);
            that.toolbarBox = box;
            // 创建查看模式工具栏容器
            let boxView = document.createElement("div");
            boxView.style.width = "100%";
            boxView.style.height = "40px";
            boxView.style.border = "1px solid " + skin.borderColor;
            boxView.style.borderBottom = "1px solid " + skin.toolbarBackgroundColor;
            boxView.style.boxSizing = "border-box";
            boxView.style.backgroundColor = skin.toolbarBackgroundColor;
            boxView.style.display = "none";
            parent.appendChild(boxView);
            for (let x = 0; x < toolbar.length; x++) {
                let group = toolbar[x];
                if (x > 0) {
                    // 生成分割
                    createToolSeparate(box);
                }
                for (let y = 0; y < group.length; y++) {
                    let item = group[y];
                    if (typeof item !== "object") throw "工具栏配置项必须为对象";
                    let name = item.name;
                    let html = item.html;
                    let groupBox = document.createElement("div");
                    groupBox.style.float = "left";
                    box.appendChild(groupBox);
                    // 生成工具项
                    createToolItem(groupBox, html, name);
                    let groupClear = document.createElement("div");
                    groupClear.style.clear = "both";
                    groupBox.appendChild(groupClear);
                }
            }
            let boxClear = document.createElement("div");
            boxClear.style.clear = "both";
            box.appendChild(boxClear);
            // *****************************************************************
            // 生成代码
            let codeSvg = "";
            codeSvg += "<svg t=\"1624256160527\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"11428\" width=\"20\" height=\"20\">";
            codeSvg += "<path d=\"M305.6 225.6c-17.6-17.6-43.2-17.6-59.2 0L19.2 460.8c-25.6 30.4-25.6 72 0 97.6l225.6 235.2c8 8 20.8 12.8 30.4 12.8s20.8-4.8 30.4-12.8c17.6-17.6 17.6-43.2 0-59.2L88 512l217.6-225.6c17.6-17.6 17.6-43.2 0-60.8zM1001.6 460.8L774.4 225.6c-17.6-17.6-43.2-17.6-59.2 0s-17.6 43.2 0 59.2L932.8 512 715.2 737.6c-17.6 17.6-17.6 43.2 0 59.2 8 8 17.6 12.8 30.4 12.8 12.8 0 20.8-4.8 30.4-12.8l225.6-235.2c28.8-28.8 28.8-70.4 0-100.8zM612.8 230.4c-20.8-8-46.4 4.8-56 25.6L382.4 742.4c-8 20.8 4.8 46.4 25.6 56 4.8 0 8 4.8 12.8 4.8 17.6 0 33.6-12.8 38.4-30.4l179.2-491.2c8-20.8-4.8-46.4-25.6-51.2z\" p-id=\"11429\" fill=\"" + skin.toolbarItemColor + "\"></path>";
            codeSvg += "</svg>";
            createToolItem(boxView, codeSvg, "code", function () {
                boxView.style.display = "none";
                box.style.display = "block";
                that.viewerBox.style.display = "none";
                that.editorBox.style.display = "block";
            });
        }
        that.safeModeExecute(createToolBar);
        // 生成编辑栏
        let createEditor = function () {
            // 添加定位框
            let box = document.createElement("div");
            //box.setAttribute("texteditable", "true");
            box.style.width = "100%";
            box.style.height = "calc(100% - 40px)";
            box.style.border = "1px solid " + skin.borderColor;
            box.style.padding = "5px";
            box.style.boxSizing = "border-box";
            box.style.overflow = "auto";
            box.setAttribute("code-node", "box");
            parent.appendChild(box);
            that.editorBox = box;
            let rect = document.createElement("div");
            //box.setAttribute("texteditable", "true");
            rect.style.width = "100%";
            rect.style.boxSizing = "border-box";
            rect.style.position = "relative";
            rect.style.overflow = "hidden";
            rect.style.minWidth = "100%";
            rect.style.minHeight = "100%";
            box.appendChild(rect);
            that.renderingRect = rect;
            // 添加渲染层
            let rendering = document.createElement("div");
            rect.appendChild(rendering);
            rendering.style.lineHeight = "18px";
            rendering.style.fontSize = "12px";
            rendering.style.overflowY = "auto";
            rendering.style.boxSizing = "border-box";
            rendering.style.fontFamily = "consolas";
            rendering.style.whiteSpace = "pre";
            rendering.style.position = "absolute";
            rendering.style.zIndex = "2";
            rendering.style.padding = "0";
            rendering.style.wordBreak = "break-all";
            that.rendering = rendering;
            // 添加编辑框
            let textarea = document.createElement("textarea");
            rect.appendChild(textarea);
            textarea.style.width = "100%";
            textarea.style.height = "100%";
            textarea.style.lineHeight = "18px";
            textarea.style.fontSize = "12px";
            textarea.style.boxSizing = "border-box";
            textarea.style.fontFamily = "consolas";
            textarea.style.position = "absolute";
            textarea.style.zIndex = "2";
            textarea.style.backgroundColor = "rgba(0, 0, 0, 0)";
            textarea.style.caretColor = "rgba(0, 0, 0, 1)";
            textarea.style.color = "rgba(0, 0, 0, 0.1)";
            textarea.style.border = "0";
            textarea.style.outline = "none";
            textarea.style.padding = "0";
            textarea.style.resize = "none";
            textarea.style.overflow = "hidden";
            that.editor = textarea;
            // 处理事件
            textarea.addEventListener("keydown", function (evt) {
                switch (evt.key) {
                    // Tab
                    case "Tab": that.setSelectCodeIndentation(4); evt.returnValue = false; return;
                    // 回车
                    case "Enter":
                        // 获取相关内容
                        let content = that.editor.value;
                        let posStart = that.editor.selectionStart;
                        let posEnd = that.editor.selectionEnd;
                        //console.log(content[posStart]);
                        // 生成新内容
                        let str = "\n" + that.createString(' ', that.getSelectCodeIndentation());
                        let len = str.length;
                        that.editor.value = content.substring(0, posStart) + str + content.substring(posEnd, content.length);
                        that.editor.selectionStart = posStart + len;
                        that.editor.selectionEnd = posStart + len;
                        that.editor.focus();
                        // 重新渲染
                        that.render();
                        evt.returnValue = false;
                        return;
                    case "s":
                        console.log(evt);
                        // 保存快捷键
                        if (evt.ctrlKey) {
                            for (let i = 0; i < that.handlers.length; i++) {
                                if (that.handlers[i].name === "save") {
                                    if (typeof that.handlers[i].fn === "function") that.safeModeExecute(that.handlers[i].fn);
                                }
                            }
                            evt.returnValue = false;
                        }
                        break;
                }
            });
            textarea.addEventListener("input", function (e) {
                that.render();
            })
        }
        that.safeModeExecute(createEditor);
        // 生成预览栏
        let createViewer = function () {
            // 添加定位框
            let box = document.createElement("div");
            //box.setAttribute("texteditable", "true");
            box.style.width = "100%";
            box.style.height = "calc(100% - 40px)";
            box.style.border = "1px solid " + skin.borderColor;
            box.style.padding = "5px";
            box.style.boxSizing = "border-box";
            box.style.overflow = "auto";
            box.style.display = "none";
            box.setAttribute("code-node", "viewer");
            parent.appendChild(box);
            that.viewerBox = box;
            let rect = document.createElement("div");
            //box.setAttribute("texteditable", "true");
            rect.style.width = "100%";
            rect.style.boxSizing = "border-box";
            rect.style.position = "relative";
            rect.style.overflow = "hidden";
            rect.style.minWidth = "100%";
            rect.style.minHeight = "100%";
            box.appendChild(rect);
            that.viewerRect = rect;
        }
        that.safeModeExecute(createViewer);
        // 根据工具栏调整大小
        that.editorBox.style.height = "calc(100% - " + that.toolbarBox.clientHeight + "px)";
        parent.addEventListener("resize", function () {
            that.editorBox.style.height = "calc(100% - " + that.toolbarBox.clientHeight + "px)";
        });
    }
}