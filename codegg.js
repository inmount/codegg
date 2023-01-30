/**
 * 码蛋编辑器
 */
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
    editorSelectionStart = 0;
    // 智能提示框
    inspiration = null;
    inspirationIndex = 0;
    inspirationEnable = false;
    inspirationSelectionStart = 0;
    inspirationSelectionLength = 0;
    // 测量器
    fontMeasure = null;
    // 编辑框
    editorBox = null;
    // 工具栏
    toolbarBox = null;
    // 配色
    skin = null;
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
    /**
     * 获取文本宽度
     * @param {*} 文本内容 
     * @returns
     */
    getTextWidth(text) {
        // 转存对象
        let that = this;
        that.fontMeasure.innerHTML = text;
        return that.fontMeasure.offsetWidth;
    };
    // 设置内容
    setContent(content) {
        // 转存对象
        let that = this;
        that.editor.value = content;
        // 重新渲染
        that.render(true);
    };
    // 创建字符串
    createString(chr, num) {
        let str = "";
        for (let i = 0; i < num; i++) {
            str += chr;
        }
        return str;
    };
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
        that.render(true);
    };
    // 获取选中内容
    getSelectContent(str) {
        // 转存对象
        let that = this;
        // 获取相关内容
        let content = that.editor.value;
        let posStart = that.editor.selectionStart;
        let posEnd = that.editor.selectionEnd;
        return content.substring(posStart, posEnd);
    };
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
        that.render(true);
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
    // 执行渲染
    render(contentChanged) {
        // 转存对象
        let that = this;
        // 触发事件
        for (let i = 0; i < that.handlers.length; i++) {
            if (that.handlers[i].name === "Render") {
                if (typeof that.handlers[i].fn === "function") {
                    that.safeModeExecute(that.handlers[i].fn, contentChanged);
                }
            }
        }
    };
    /**
     * 获取行开始代码
     */
    getLineStartHtml(line) {
        // 转存对象
        let that = this;
        // 添加定位框
        let lineNo = document.createElement("div");
        lineNo.style.float = "left";
        lineNo.style.width = "35px";
        lineNo.style.textAlign = "right";
        lineNo.style.color = that.skin.lineNoColor;
        lineNo.style.padding = "0 5px 0 0";
        lineNo.style.overflow = "hidden";
        lineNo.style.boxSizing = "border-box";
        lineNo.style.fontFamily = "consolas";
        lineNo.innerHTML = line;
        return "<div code-line='" + line + "' style='width: 100%;'>" + lineNo.outerHTML
            + "<div style='float: left; padding-left: 5px; width: calc(100% - 35px); max-width: calc(100% - 35px); box-sizing: border-box; white-space: pre-wrap; word-break: break-all; overflow-wrap: break-word;'>";
    };
    /**
     * 获取行结束代码
     */
    getLineEndHtml() {
        return "</div><div style='clear: both;'></div></div>"
    };
    /**
     * 显示智能提示
     * @param {Number} line 
     * @param {Number} left 
     * @param {Array} keys 
     */
    showInspiration(line, left, keys) {
        const that = this;
        const lineCode = "code-line";
        const inspirationCode = "inspiration-line";
        const lineHeight = 18;
        let eles = this.rendering.children;
        let top = 0;
        this.inspirationIndex = 0;
        for (let i = 0; i < eles.length; i++) {
            const ele = eles[i];
            if (ele.hasAttribute(lineCode))
                if (parseInt(ele.getAttribute(lineCode)) === line)
                    top = ele.offsetTop;
        }
        //console.log("pos: " + left + "," + top);
        let editorWidth = parseFloat(that.editor.clientWidth - 5);
        while (left > editorWidth) {
            top += lineHeight;
            left -= editorWidth;
        }
        that.inspiration.style.left = (left + 40) + "px";
        that.inspiration.style.top = (top + lineHeight) + "px";
        that.inspiration.style.display = "block";
        that.inspiration.innerHTML = "";
        // 添加待选项
        for (let i = 0; i < keys.length; i++) {
            let item = document.createElement("div");
            that.inspiration.appendChild(item);
            item.style.width = "100%";
            item.style.padding = "0 5px";
            item.style.lineHeight = "24px";
            item.style.cursor = "default";
            item.setAttribute(inspirationCode, i);
            item.innerHTML = keys[i];
            item.addEventListener("mouseover", function () {
                let idx = parseInt(item.getAttribute(inspirationCode));
                if (idx != that.inspirationIndex)
                    item.style.backgroundColor = that.skin.inspirationHoverColor;
            });
            item.addEventListener("mouseout", function () {
                let idx = parseInt(item.getAttribute(inspirationCode));
                if (idx != that.inspirationIndex)
                    item.style.backgroundColor = "";
            });
            item.addEventListener("click", function () {
                // 处理内容
                let content = that.editor.value;
                that.editor.value = content.substring(0, that.inspirationSelectionStart) + item.innerHTML + content.substring(that.inspirationSelectionStart + that.inspirationSelectionLength, content.length);
                that.editor.selectionStart = that.inspirationSelectionStart + item.innerHTML.length;
                that.editor.selectionEnd = that.inspirationSelectionStart + item.innerHTML.length;
                that.editor.focus();
                // 重新渲染
                that.render();
                // 隐藏智能提示
                that.hideInspiration();
            });
        }
        // 更新提示框
        that.updateInspiration();
        that.inspirationEnable = true;
    };
    /**
     * 更新智能提示框
     */
    updateInspiration() {
        const that = this;
        let items = that.inspiration.children;
        let idx = that.inspirationIndex;
        let top1 = idx * 24;
        let top2 = top1 + 24;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            item.removeEventListener("mouseover", function () { });
            item.removeEventListener("mouseout", function () { });
            if (idx === i) {
                item.style.backgroundColor = that.skin.inspirationSelectedColor;
                // 自动调整滚动条
                if (that.inspiration.scrollTop + that.inspiration.offsetHeight < top2) that.inspiration.scrollTop = top2 - that.inspiration.offsetHeight;
                if (that.inspiration.scrollTop > top1) that.inspiration.scrollTop = top1;
            } else {
                item.style.backgroundColor = "";
            }
        }
    };
    /**
     * 隐藏智能提示
     */
    hideInspiration() {
        const that = this;
        that.inspiration.style.display = "none";
        that.inspirationEnable = false;
    };
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
            inspirationoColor: "#333333",
            inspirationBackgroundColor: "#fefefe",
            inspirationSelectedColor: "#dddddd",
            inspirationHoverColor: "#eeeeee",
            lineNoColor: "#888888",
            lineNoBackgroundColor: "#ebebeb",
            borderColor: "#cccccc",
            toolbarItemColor: "#d81e06",
            toolbarItemBackgroudColorHover: "#ffffff",
            toolbarBackgroundColor: "#ebebeb",
            toolbarSpliteColor: "#dddddd",
        };
        that.skin = skin;
        //let toolbar = [["h1", "h2", "h3", "p", "div"], ["b", "i", "s"], ["table", "ol", "ul"], ["link", "image", "audio", "video"], ["view"]];
        let toolbar = [];
        let logoImg = "";
        // 设置默认
        // 填充自定义皮肤
        if (typeof cfg === "undefined") cfg = {};
        if (typeof cfg.logo !== "undefined") logoImg = cfg.logo;
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
            div.style.padding = "4px";
            div.style.borderRadius = "6px";
            div.style.color = skin.toolbarItemColor;
            div.style.textAlign = "center";
            div.style.lineHeight = "22px";
            div.style.fontSize = "16px";
            div.style.fontFamily = "consolas";
            div.style.boxSizing = "border-box";
            div.style.overflow = "hidden";
            div.innerHTML = html;
            box.appendChild(div);
            // 添加事件处理
            if (typeof fn === "function") {
                div.style.cursor = "pointer";
                div.addEventListener("mouseover", function () { div.style.backgroundColor = skin.toolbarItemBackgroudColorHover; });
                div.addEventListener("mouseout", function () { div.style.backgroundColor = ""; });
                div.addEventListener("click", function () {
                    let arg = {
                        setResult: function (e) {
                            that.safeModeExecute(fn, e);
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
        };
        let createToolSeparate = function (box) {
            // 生成分隔
            let separate = document.createElement("div");
            separate.style.float = "left";
            separate.style.width = "1";
            separate.style.height = "20px";
            separate.style.margin = "10px 0px 0px 10px";
            separate.style.backgroundColor = skin.toolbarSpliteColor;
            box.appendChild(separate);
        };
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
            // 生成图标
            if (logoImg !== "") {
                createToolItem(box, logoImg, "");
                createToolSeparate(box);
            }
            for (let x = 0; x < toolbar.length; x++) {
                let group = toolbar[x];
                if (x > 0) {
                    // 生成分割
                    createToolSeparate(box);
                }
                let groupBox = document.createElement("div");
                groupBox.style.float = "left";
                box.appendChild(groupBox);
                for (let y = 0; y < group.length; y++) {
                    let item = group[y];
                    if (typeof item !== "object") throw "工具栏配置项必须为对象";
                    let name = item.name;
                    let html = item.html;
                    // 生成工具项
                    createToolItem(groupBox, html, name, function () { });
                }
                let groupClear = document.createElement("div");
                groupClear.style.clear = "both";
                groupBox.appendChild(groupClear);
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
        };
        that.safeModeExecute(createToolBar);
        // 生成编辑栏
        let createEditor = function () {
            // 添加定位框
            let box = document.createElement("div");
            //box.setAttribute("texteditable", "true");
            box.style.width = "100%";
            box.style.height = "calc(100% - 40px)";
            box.style.border = "1px solid " + skin.borderColor;
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
            // 添加测量层
            let fontMeasure = document.createElement("div");
            rect.appendChild(fontMeasure);
            fontMeasure.style.opacity = 0;
            fontMeasure.style.position = "absolute";
            fontMeasure.style.zIndex = "-1";
            fontMeasure.style.fontFamily = "consolas";
            fontMeasure.style.fontSize = "12px";
            fontMeasure.style.left = "0";
            fontMeasure.style.left = "0";
            fontMeasure.style.whiteSpace = "pre";
            that.fontMeasure = fontMeasure;
            // 添加背景层
            let background = document.createElement("div");
            rect.appendChild(background);
            background.style.width = "40px";
            background.style.height = "100%";
            background.style.backgroundColor = skin.lineNoBackgroundColor;
            background.style.borderRight = "1px solid " + skin.borderColor;
            background.style.fontFamily = "consolas";
            background.style.position = "absolute";
            background.style.left = "0";
            background.style.top = "0";
            background.style.zIndex = "1";
            // 添加渲染层
            let rendering = document.createElement("div");
            rect.appendChild(rendering);
            rendering.style.width = "100%";
            rendering.style.lineHeight = "18px";
            rendering.style.fontSize = "12px";
            rendering.style.overflowY = "auto";
            rendering.style.boxSizing = "border-box";
            rendering.style.fontFamily = "consolas";
            rendering.style.whiteSpace = "pre";
            rendering.style.position = "absolute";
            rendering.style.zIndex = "2";
            rendering.style.padding = "5px";
            rendering.style.wordBreak = "break-all";
            that.rendering = rendering;
            // 添加编辑框
            let textarea = document.createElement("textarea");
            rect.appendChild(textarea);
            textarea.style.width = "calc(100% - 40px)";
            textarea.style.marginLeft = "40px";
            textarea.style.height = "100%";
            textarea.style.lineHeight = "18px";
            textarea.style.fontSize = "12px";
            textarea.style.boxSizing = "border-box";
            textarea.style.fontFamily = "consolas";
            textarea.style.position = "absolute";
            textarea.style.zIndex = "3";
            textarea.style.backgroundColor = "rgba(0, 0, 0, 0)";
            textarea.style.caretColor = "rgba(0, 0, 0, 1)";
            textarea.style.color = "rgba(0, 0, 0, 0)";
            textarea.style.border = "0";
            textarea.style.outline = "none";
            textarea.style.padding = "5px";
            textarea.style.resize = "none";
            textarea.style.overflow = "hidden";
            that.editor = textarea;
            // 添加智能提示
            let inspiration = document.createElement("div");
            rect.appendChild(inspiration);
            inspiration.style.position = "absolute";
            inspiration.style.zIndex = "4";
            inspiration.style.minWidth = "100px";
            inspiration.style.minHeight = "10px";
            inspiration.style.maxHeight = "200px";
            inspiration.style.backgroundColor = skin.inspirationBackgroundColor;
            inspiration.style.color = skin.inspirationoColor;
            inspiration.style.boxShadow = "1px 1px 3px #888888";
            inspiration.style.overflowX = "hidden";
            inspiration.style.overflowY = "auto";
            inspiration.style.fontFamily = "consolas";
            inspiration.style.fontSize = "12px";
            inspiration.style.display = "none";
            that.inspiration = inspiration;
            // 处理事件
            textarea.addEventListener("keydown", function (evt) {
                switch (evt.key) {
                    // Tab
                    case "Tab": that.setSelectCodeIndentation(4); evt.preventDefault(); return;
                    // 回车
                    case "Enter":
                        if (that.inspirationEnable) {
                            // 读取所有的待选项
                            let items = that.inspiration.children;
                            for (let i = 0; i < items.length; i++) {
                                if (i == that.inspirationIndex) {
                                    let item = items[i];
                                    // 处理内容
                                    let content = that.editor.value;
                                    that.editor.value = content.substring(0, that.inspirationSelectionStart) + item.innerHTML + content.substring(that.inspirationSelectionStart + that.inspirationSelectionLength, content.length);
                                    that.editor.selectionStart = that.inspirationSelectionStart + item.innerHTML.length;
                                    that.editor.selectionEnd = that.inspirationSelectionStart + item.innerHTML.length;
                                    that.editor.focus();
                                    // 重新渲染
                                    that.render();
                                    // 隐藏智能提示
                                    that.hideInspiration();
                                    break;
                                }
                            }
                        } else {
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
                            that.render(true);
                        }
                        evt.preventDefault();
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
                            evt.preventDefault();
                        }
                        break;
                    case "ArrowDown":
                        if (that.inspirationEnable) {
                            let items = that.inspiration.children;
                            if (that.inspirationIndex < items.length - 1) {
                                that.inspirationIndex++;
                                that.updateInspiration();
                            }
                            evt.preventDefault();
                        }
                        break;
                    case "ArrowUp":
                        if (that.inspirationEnable) {
                            if (that.inspirationIndex > 0) {
                                that.inspirationIndex--;
                                that.updateInspiration();
                            }
                            evt.preventDefault();
                        }
                        break;
                    default:
                        //console.log("keydown: " + evt.key);
                        break;
                }
            });
            textarea.addEventListener("keyup", function (evt) {
                switch (evt.key) {
                    case "ArrowLeft":
                    case "ArrowRight":
                        let posStart2 = that.editor.selectionStart;
                        if (posStart2 !== that.editorSelectionStart) {
                            that.editorSelectionStart = posStart2;
                            that.hideInspiration();
                        }
                        break;
                }
            });
            textarea.addEventListener("input", function (e) {
                that.editorSelectionStart = that.editor.selectionStart;
                that.render(true);
            });
            textarea.addEventListener("mouseup", function () {
                let posStart = that.editor.selectionStart;
                if (posStart !== that.editorSelectionStart) {
                    that.editorSelectionStart = posStart;
                    that.hideInspiration();
                }
            });
        };
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
        };
        that.safeModeExecute(createViewer);
        // 根据工具栏调整大小
        that.editorBox.style.height = "calc(100% - " + that.toolbarBox.clientHeight + "px)";
        parent.addEventListener("resize", function () {
            that.editorBox.style.height = "calc(100% - " + that.toolbarBox.clientHeight + "px)";
        });
    }
}