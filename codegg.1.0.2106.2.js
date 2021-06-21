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
        let toolbar = [["h1", "h2", "h3", "p", "div"], ["b", "i", "s"], ["table", "ol", "ul"], ["link", "image", "audio", "video"], ["view"]];
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
            div.style.width = "20px";
            div.style.height = "20px";
            div.style.margin = "5px 0px 5px 6px";
            div.style.cursor = "pointer";
            div.style.padding = "4px";
            div.style.borderRadius = "2px";
            div.style.color = skin.toolbarItemColor;
            div.style.textAlign = "center";
            div.style.lineHeight = "20px";
            div.style.fontSize = "16px";
            div.style.fontFamily = "consolas";
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
                    let name = group[y].toLowerCase();
                    let groupBox = document.createElement("div");
                    groupBox.style.float = "left";
                    box.appendChild(groupBox);
                    switch (name) {
                        case "h1":
                            // 生成标题1
                            createToolItem(groupBox, "H1", "h1", function (e) {
                                if (typeof e === "undefined") e = {};
                                // 生成属性
                                let pros = "";
                                for (let key in e) pros += " " + key + "=\"" + e[key] + "\"";
                                let str = "<h1" + pros + ">" + that.getSelectContent() + "</h1>";
                                that.insertContent(str);
                            });
                            break;
                        case "h2":
                            // 生成标题2
                            createToolItem(groupBox, "H2", "h2", function (e) {
                                if (typeof e === "undefined") e = {};
                                // 生成属性
                                let pros = "";
                                for (let key in e) pros += " " + key + "=\"" + e[key] + "\"";
                                let str = "<h2" + pros + ">" + that.getSelectContent() + "</h2>";
                                that.insertContent(str);
                            });
                            break;
                        case "h3":
                            // 生成标题3
                            createToolItem(groupBox, "H3", "h3", function (e) {
                                if (typeof e === "undefined") e = {};
                                // 生成属性
                                let pros = "";
                                for (let key in e) pros += " " + key + "=\"" + e[key] + "\"";
                                let str = "<h3" + pros + ">" + that.getSelectContent() + "</h3>";
                                that.insertContent(str);
                            });
                            break;
                        case "p":
                            // 生成段落
                            createToolItem(groupBox, "P", "p", function (e) {
                                if (typeof e === "undefined") e = {};
                                // 生成属性
                                let pros = "";
                                for (let key in e) pros += " " + key + "=\"" + e[key] + "\"";
                                let str = "<p" + pros + ">" + that.getSelectContent() + "</p>";
                                that.insertContent(str);
                            });
                            break;
                        case "div":
                            // 生成区块
                            createToolItem(groupBox, "<span style='font-size:12px;'>DIV</span>", "div", function (e) {
                                if (typeof e === "undefined") e = {};
                                // 生成属性
                                let pros = "";
                                for (let key in e) pros += " " + key + "=\"" + e[key] + "\"";
                                let str = "<div" + pros + ">" + that.getSelectContent() + "</div>";
                                that.insertContent(str);
                            });
                            break;
                        case "b":
                            // 生成加粗
                            createToolItem(groupBox, "<strong>B</strong>", "b", function (e) {
                                if (typeof e === "undefined") e = {};
                                // 生成属性
                                let pros = "";
                                for (let key in e) pros += " " + key + "=\"" + e[key] + "\"";
                                let str = "<strong" + pros + ">" + that.getSelectContent() + "</strong>";
                                that.insertContent(str);
                            });
                            break;
                        case "i":
                            // 生成斜体
                            createToolItem(groupBox, "<i>I</i>", "i", function (e) {
                                if (typeof e === "undefined") e = {};
                                // 生成属性
                                let pros = "";
                                for (let key in e) pros += " " + key + "=\"" + e[key] + "\"";
                                let str = "<i" + pros + ">" + that.getSelectContent() + "</i>";
                                that.insertContent(str);
                            });
                            break;
                        case "s":
                            // 生成删除线
                            createToolItem(groupBox, "<s>S</s>", "s", function (e) {
                                if (typeof e === "undefined") e = {};
                                // 生成属性
                                let pros = "";
                                for (let key in e) pros += " " + key + "=\"" + e[key] + "\"";
                                let str = "<s" + pros + ">" + that.getSelectContent() + "</s>";
                                that.insertContent(str);
                            });
                            break;
                        case "table":
                            // 生成表格
                            let tableSvg = "";
                            tableSvg += "<svg t=\"1624247810018\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"3424\" width=\"20\" height=\"20\">";
                            tableSvg += "<path d=\"M63.29814 120.015398l0 783.435039 895.355061 0L958.653201 120.015398 63.29814 120.015398 63.29814 120.015398zM399.05616 623.651916 399.05616 455.773418l223.840044 0 0 167.879522L399.05616 623.652939 399.05616 623.651916zM622.896204 679.611415l0 167.881568L399.05616 847.492984 399.05616 679.611415 622.896204 679.611415 622.896204 679.611415zM622.896204 231.933373l0 167.881568L399.05616 399.814941 399.05616 231.933373 622.896204 231.933373 622.896204 231.933373zM343.09666 231.933373l0 167.881568L119.257639 399.814941 119.257639 231.933373 343.09666 231.933373 343.09666 231.933373zM119.257639 455.773418l223.840044 0 0 167.879522L119.257639 623.652939 119.257639 455.773418 119.257639 455.773418zM678.855704 455.773418l223.840044 0 0 167.879522L678.855704 623.652939 678.855704 455.773418 678.855704 455.773418zM678.855704 399.814941 678.855704 231.933373l223.840044 0 0 167.881568L678.855704 399.814941 678.855704 399.814941zM119.257639 679.611415l223.840044 0 0 167.881568L119.257639 847.492984 119.257639 679.611415 119.257639 679.611415zM678.855704 847.492984 678.855704 679.611415l223.840044 0 0 167.881568L678.855704 847.492984 678.855704 847.492984zM678.855704 847.492984\" p-id=\"3425\" fill=\"" + skin.toolbarItemColor + "\"></path>";
                            tableSvg += "</svg>";
                            createToolItem(groupBox, tableSvg, "table", function (e) {
                                if (typeof e === "undefined") e = {};
                                // 读取行设置
                                if (typeof e["rows"] === "undefined") e.rows = 3;
                                e.rows = parseInt(e.rows);
                                if (isNaN(e.rows)) e.rows = 3;
                                if (e.rows <= 0) e.rows = 1;
                                // 读取列设置
                                if (typeof e["columns"] === "undefined") e.columns = 3;
                                e.columns = parseInt(e.columns);
                                if (isNaN(e.columns)) e.columns = 3;
                                if (e.columns <= 0) e.columns = 1;
                                // 读取表格设置
                                let prosTable = "";
                                if (typeof e.table === "undefined") e.table = {};
                                for (let key in e.table) prosTable += " " + key + "=\"" + e.table[key] + "\"";
                                // 读取表格设置
                                let prosTr = "";
                                if (typeof e.tr === "undefined") e.tr = {};
                                for (let key in e.tr) prosTr += " " + key + "=\"" + e.tr[key] + "\"";
                                // 读取表格设置
                                let prosTd = "";
                                if (typeof e.td === "undefined") e.td = {};
                                for (let key in e.td) prosTd += " " + key + "=\"" + e.td[key] + "\"";
                                // 处理选中文字
                                let selectStr = that.getSelectContent();
                                selectStr = (selectStr === "" ? "&nbsp;" : selectStr);
                                let space = that.getSelectCodeIndentation();
                                let str = "";
                                str += "<table" + prosTable + ">\n";
                                for (let i = 0; i < e.rows; i++) {
                                    str += that.createString(' ', space + 4) + "<tr" + prosTr + ">\n";
                                    for (let j = 0; j < e.columns; j++) {
                                        str += that.createString(' ', space + 8) + "<td" + prosTd + ">" + selectStr + "</td>\n";
                                    }
                                    str += that.createString(' ', space + 4) + "</tr>\n";
                                }
                                str += that.createString(' ', space) + "</table>";
                                that.insertContent(str);
                            });
                            break;
                        case "ol":
                            // 生成有序列表
                            let olSvg = "";
                            olSvg += "<svg t=\"1624254901018\" style=\"margin:2px 0 0 2px\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"8740\" width=\"16\" height=\"16\">";
                            olSvg += "<path d=\"M330.666667 192h640a42.666667 42.666667 0 0 0 0-85.333333h-640a42.666667 42.666667 0 0 0 0 85.333333zM970.666667 469.333333h-640a42.666667 42.666667 0 1 0 0 85.333334h640a42.666667 42.666667 0 0 0 0-85.333334zM970.666667 832h-640a42.666667 42.666667 0 0 0 0 85.333333h640a42.666667 42.666667 0 0 0 0-85.333333zM94.378667 735.914667a85.333333 85.333333 0 0 0-82.474667 63.317333 32 32 0 1 0 61.866667 16.469333 21.333333 21.333333 0 1 1 20.608 26.88 32 32 0 1 0 0 64 21.333333 21.333333 0 1 1-20.565334 27.093334 32 32 0 1 0-61.653333 17.066666 85.333333 85.333333 0 1 0 153.130667-70.314666 10.709333 10.709333 0 0 1 0-11.861334 85.333333 85.333333 0 0 0-70.912-132.736zM181.333333 458.581333a85.333333 85.333333 0 0 0-170.666666 0 32 32 0 0 0 64 0 21.333333 21.333333 0 0 1 42.666666 0 43.989333 43.989333 0 0 1-9.685333 27.52L17.664 598.570667A32 32 0 0 0 42.666667 650.581333h106.666666a32 32 0 0 0 0-64h-17.877333a10.624 10.624 0 0 1-8.32-17.322666L157.866667 526.08a108.544 108.544 0 0 0 23.466666-67.498667zM170.666667 223.914667h-10.666667A10.666667 10.666667 0 0 1 149.333333 213.333333V69.248A58.752 58.752 0 0 0 90.666667 10.581333H64a32 32 0 0 0 0 64h10.666667A10.666667 10.666667 0 0 1 85.333333 85.333333v128a10.666667 10.666667 0 0 1-10.666666 10.666667H64a32 32 0 0 0 0 64H170.666667a32 32 0 0 0 0-64z\" p-id=\"8741\" fill=\"" + skin.toolbarItemColor + "\"></path>";
                            olSvg += "</svg>";
                            createToolItem(groupBox, olSvg, "ol", function (e) {
                                if (typeof e === "undefined") e = {};
                                // 读取行设置
                                if (typeof e["line"] === "undefined") e.line = 3;
                                e.line = parseInt(e.line);
                                if (isNaN(e.line)) e.line = 3;
                                if (e.line <= 0) e.line = 1;
                                // 读取ol设置
                                let prosOl = "";
                                if (typeof e.ol === "undefined") e.ol = {};
                                for (let key in e.ol) prosOl += " " + key + "=\"" + e.ol[key] + "\"";
                                // 读取li设置
                                let prosLi = "";
                                if (typeof e.li === "undefined") e.li = {};
                                for (let key in e.li) prosLi += " " + key + "=\"" + e.li[key] + "\"";
                                // 处理选中文字
                                let selectStr = that.getSelectContent();
                                selectStr = (selectStr === "" ? "&nbsp;" : selectStr);
                                let space = that.getSelectCodeIndentation();
                                let str = "";
                                str += "<ol" + prosOl + ">\n";
                                for (let i = 0; i < e.line; i++) {
                                    str += that.createString(' ', space + 4) + "<li" + prosLi + ">" + selectStr + "</li>\n";
                                }
                                str += that.createString(' ', space) + "</ol>";
                                that.insertContent(str);
                            });
                            break;
                        case "ul":
                            // 生成无序列表
                            let ulSvg = "";
                            ulSvg += "<svg t=\"1624255159274\" style=\"margin:2px 0 0 2px\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"9666\" width=\"16\" height=\"16\">";
                            ulSvg += "<path d=\"M106.666667 170.581333m-106.666667 0a106.666667 106.666667 0 1 0 213.333333 0 106.666667 106.666667 0 1 0-213.333333 0Z\" p-id=\"9667\" fill=\"" + skin.toolbarItemColor + "\"></path>";
                            ulSvg += "<path d=\"M362.666667 213.333333H981.333333a42.666667 42.666667 0 0 0 0-85.333333H362.666667a42.666667 42.666667 0 0 0 0 85.333333z\" p-id=\"9668\" fill=\"" + skin.toolbarItemColor + "\"></path>";
                            ulSvg += "<path d=\"M106.666667 511.914667m-106.666667 0a106.666667 106.666667 0 1 0 213.333333 0 106.666667 106.666667 0 1 0-213.333333 0Z\" p-id=\"9669\" fill=\"" + skin.toolbarItemColor + "\"></path>";
                            ulSvg += "<path d=\"M981.333333 469.333333H362.666667a42.666667 42.666667 0 0 0 0 85.333334H981.333333a42.666667 42.666667 0 0 0 0-85.333334z\" p-id=\"9670\" fill=\"" + skin.toolbarItemColor + "\"></path>";
                            ulSvg += "<path d=\"M106.666667 853.248m-106.666667 0a106.666667 106.666667 0 1 0 213.333333 0 106.666667 106.666667 0 1 0-213.333333 0Z\" p-id=\"9671\" fill=\"" + skin.toolbarItemColor + "\"></path>";
                            ulSvg += "<path d=\"M981.333333 810.666667H362.666667a42.666667 42.666667 0 0 0 0 85.333333H981.333333a42.666667 42.666667 0 0 0 0-85.333333z\" p-id=\"9672\" fill=\"" + skin.toolbarItemColor + "\"></path>";
                            ulSvg += "</svg>";
                            createToolItem(groupBox, ulSvg, "ul", function (e) {
                                if (typeof e === "undefined") e = {};
                                // 读取行设置
                                if (typeof e["line"] === "undefined") e.line = 3;
                                e.line = parseInt(e.line);
                                if (isNaN(e.line)) e.line = 3;
                                if (e.line <= 0) e.line = 1;
                                // 读取ul设置
                                let prosUl = "";
                                if (typeof e.ul === "undefined") e.ul = {};
                                for (let key in e.ul) prosUl += " " + key + "=\"" + e.ul[key] + "\"";
                                // 读取li设置
                                let prosLi = "";
                                if (typeof e.li === "undefined") e.li = {};
                                for (let key in e.li) prosLi += " " + key + "=\"" + e.li[key] + "\"";
                                // 处理选中文字
                                let selectStr = that.getSelectContent();
                                selectStr = (selectStr === "" ? "&nbsp;" : selectStr);
                                let space = that.getSelectCodeIndentation();
                                let str = "";
                                str += "<ul" + prosUl + ">\n";
                                for (let i = 0; i < e.line; i++) {
                                    str += that.createString(' ', space + 4) + "<li" + prosLi + ">" + selectStr + "</li>\n";
                                }
                                str += that.createString(' ', space) + "</ul>";
                                that.insertContent(str);
                            });
                            break;
                        case "link":
                            // 生成链接图片
                            let linkSvg = "";
                            linkSvg += "<svg t=\"1624246199838\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"2569\" width=\"20\" height=\"20\">";
                            linkSvg += "<path d=\"M846.08 419.413333l-167.466667 167.253334a170.666667 170.666667 0 0 1-276.053333-50.346667 68.906667 68.906667 0 0 1 15.786667-26.026667 67.2 67.2 0 0 1 58.453333-18.56 85.333333 85.333333 0 0 0 21.333333 34.56 85.333333 85.333333 0 0 0 120.746667 0l167.253333-167.253333a85.333333 85.333333 0 0 0-120.746666-120.746667L540.8 362.666667a213.333333 213.333333 0 0 0-108.586667-11.733334l5.12-5.546666 167.253334-167.466667a170.666667 170.666667 0 1 1 241.493333 241.493333zM482.986667 661.333333l-123.946667 123.946667a85.333333 85.333333 0 0 1-120.746667-120.746667L405.333333 497.706667a85.333333 85.333333 0 0 1 120.746667 0 80 80 0 0 1 17.92 27.093333 58.026667 58.026667 0 0 0 56.746667-16 58.026667 58.026667 0 0 0 16-29.653333 170.666667 170.666667 0 0 0-271.573334-42.666667l-167.253333 168.106667a170.666667 170.666667 0 0 0 0 241.493333 170.666667 170.666667 0 0 0 241.493333 0l167.253334-167.466667a64 64 0 0 0 5.12-5.546666 210.56 210.56 0 0 1-108.8-11.733334z\" p-id=\"2570\" fill=\"" + skin.toolbarItemColor + "\"></path>";
                            linkSvg += "</svg>";
                            createToolItem(groupBox, linkSvg, "link", function (e) {
                                if (typeof e === "undefined") e = {};
                                if (typeof e["href"] === "undefined") e.href = "";
                                // 生成属性
                                let pros = "";
                                for (let key in e) pros += " " + key + "=\"" + e[key] + "\"";
                                let str = "<a" + pros + ">" + that.getSelectContent() + "</a>";
                                that.insertContent(str);
                            });
                            break;
                        case "image":
                            // 生成图片按钮
                            let imageSvg = "";
                            imageSvg += "<svg t=\"1624183498541\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"1205\" width=\"20\" height=\"20\">";
                            imageSvg += "<path d=\"M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32z m-40 632H136v-39.9l138.5-164.3 150.1 178L658.1 489 888 761.6V792z m0-129.8L664.2 396.8c-3.2-3.8-9-3.8-12.2 0L424.6 666.4l-144-170.7c-3.2-3.8-9-3.8-12.2 0L136 652.7V232h752v430.2z\" p-id=\"1206\" fill=\"" + skin.toolbarItemColor + "\"></path>";
                            imageSvg += "<path d=\"M304 456c48.6 0 88-39.4 88-88s-39.4-88-88-88-88 39.4-88 88 39.4 88 88 88z m0-116c15.5 0 28 12.5 28 28s-12.5 28-28 28-28-12.5-28-28 12.5-28 28-28z\" p-id=\"1207\" fill=\"" + skin.toolbarItemColor + "\"></path>";
                            imageSvg += "</svg>";
                            createToolItem(groupBox, imageSvg, "image", function (e) {
                                if (typeof e === "undefined") e = {};
                                if (typeof e["src"] === "undefined") e.src = "";
                                if (typeof e["alt"] === "undefined") e.alt = that.getSelectContent();
                                // 生成属性
                                let pros = "";
                                for (let key in e) pros += " " + key + "=\"" + e[key] + "\"";
                                let str = "<img" + pros + "/>";
                                that.insertContent(str);
                            });
                            break;
                        case "audio":
                            // 生成音频按钮
                            let audioSvg = "";
                            audioSvg += "<svg t=\"1624259722615\" style=\"margin:1px 0 0 0px\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"15247\" width=\"20\" height=\"18\">";
                            audioSvg += "<path d=\"M903.108141 64.004733c-183.118598 3.806699-376.940978 48.998971-560.01455 111.995747-0.11154-1.285273 0 559.991014 0 559.991014-33.038464-8.006348-89.207741-2.405793-128.463814 16.297175-72.740698 34.886555-112.499214 105.334024-88.587618 157.412123 23.798009 51.966559 102.141308 65.967434 174.938288 31.139208 66.584488-37.635155 98.110505-92.848665 98.110505-148.84705l0.896416-475.993948c144.275941-44.73997 302.868959-75.821873 447.12034-83.995019l0 447.990151c-42.00058-7.897877-90.718141 3.695159-130.926912 22.960944-72.851215 34.885532-112.554472 105.33607-88.586594 157.298536 23.853267 52.080146 102.140285 66.081021 174.938288 31.194466 51.801806-24.750707 100.57565-67.983347 100.57565-154.560168L903.108141 64.004733 903.108141 64.004733zM903.108141 64.004733\" p-id=\"15248\" fill=\"" + skin.toolbarItemColor + "\"></path>";
                            audioSvg += "</svg>";
                            createToolItem(groupBox, audioSvg, "audio", function (e) {
                                if (typeof e === "undefined") e = {};
                                if (typeof e["src"] === "undefined") e.src = "";
                                // 生成属性
                                let pros = "";
                                for (let key in e) pros += " " + key + "=\"" + e[key] + "\"";
                                let str = "<audio" + pros + ">" + that.getSelectContent() + "</audio>";
                                that.insertContent(str);
                            });
                            break;
                        case "video":
                            // 生成视频按钮
                            let videoSvg = "";
                            videoSvg += "<svg t=\"1624183498541\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"1205\" width=\"20\" height=\"20\">";
                            videoSvg += "<path d=\"M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32z m-40 632H136v-39.9l138.5-164.3 150.1 178L658.1 489 888 761.6V792z m0-129.8L664.2 396.8c-3.2-3.8-9-3.8-12.2 0L424.6 666.4l-144-170.7c-3.2-3.8-9-3.8-12.2 0L136 652.7V232h752v430.2z\" p-id=\"1206\" fill=\"" + skin.toolbarItemColor + "\"></path>";
                            videoSvg += "<path d=\"M304 456c48.6 0 88-39.4 88-88s-39.4-88-88-88-88 39.4-88 88 39.4 88 88 88z m0-116c15.5 0 28 12.5 28 28s-12.5 28-28 28-28-12.5-28-28 12.5-28 28-28z\" p-id=\"1207\" fill=\"" + skin.toolbarItemColor + "\"></path>";
                            videoSvg += "</svg>";
                            createToolItem(groupBox, videoSvg, "video", function (e) {
                                if (typeof e === "undefined") e = {};
                                if (typeof e["src"] === "undefined") e.src = "";
                                // 生成属性
                                let pros = "";
                                for (let key in e) pros += " " + key + "=\"" + e[key] + "\"";
                                let str = "<video" + pros + ">" + that.getSelectContent() + "</video>";
                                that.insertContent(str);
                            });
                            break;
                        case "view":
                            // 生成预览
                            let viewSvg = "";
                            viewSvg += "<svg t=\"1624255516213\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"10572\" width=\"20\" height=\"20\">";
                            viewSvg += "<path d=\"M512 416a96 96 0 1 0 0 192 96 96 0 0 0 0-192z m511.952 102.064c-0.016-0.448-0.064-0.864-0.096-1.296a8.16 8.16 0 0 0-0.08-0.656c0-0.32-0.064-0.624-0.128-0.928-0.032-0.368-0.064-0.736-0.128-1.088-0.032-0.048-0.032-0.096-0.032-0.144a39.488 39.488 0 0 0-10.704-21.536c-32.672-39.616-71.536-74.88-111.04-107.072-85.088-69.392-182.432-127.424-289.856-150.8-62.112-13.504-124.576-14.064-187.008-2.64-56.784 10.384-111.504 32-162.72 58.784-80.176 41.92-153.392 99.696-217.184 164.48-11.808 11.984-23.552 24.224-34.288 37.248-14.288 17.328-14.288 37.872 0 55.216 32.672 39.616 71.52 74.848 111.04 107.056 85.12 69.392 182.448 127.408 289.888 150.784 62.096 13.504 124.608 14.096 187.008 2.656 56.768-10.4 111.488-32 162.736-58.768 80.176-41.936 153.376-99.696 217.184-164.48 11.792-12 23.536-24.224 34.288-37.248 5.712-5.872 9.456-13.44 10.704-21.568l0.032-0.128a12.592 12.592 0 0 0 0.128-1.088c0.064-0.304 0.096-0.624 0.128-0.928l0.08-0.656 0.096-1.28c0.032-0.656 0.048-1.296 0.048-1.952l-0.096-1.968zM512 704c-106.032 0-192-85.952-192-192s85.952-192 192-192 192 85.968 192 192c0 106.048-85.968 192-192 192z\" fill=\"" + skin.toolbarItemColor + "\" p-id=\"10573\"></path>";
                            viewSvg += "</svg>";
                            createToolItem(groupBox, viewSvg, "view", function () {
                                that.viewerRect.innerHTML = that.getContent();
                                box.style.display = "none";
                                boxView.style.display = "block";
                                that.editorBox.style.display = "none";
                                that.viewerBox.style.display = "block";
                            });
                            break;
                        default: throw "不支持名称为'" + name + "'的功能。";
                    }
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