// 主类
class Codegg {
    // 渲染元素
    rendering = null;
    // 编辑框
    editor = null;
    // 获取内容
    getContent() {

    };
    // 获取节点相关联行
    getNodeLine(node, offset) {
        // 转存对象
        let that = this;
        let res = { node: node, offset: offset };
        // 定位顶层节点
        while (res.node.parentNode.getAttribute("code-node") !== "box") {
            // 获取选中的父节点
            let selParent = res.node.parentNode;
            for (let i = 0; i < selParent.childNodes.length; i++) {
                if (selParent.childNodes[i].isSameNode(res.node)) break;
                if (selParent.childNodes[i].nodeType === 1) res.offset += selParent.childNodes[i].innerText.length;
                if (selParent.childNodes[i].nodeType === 3) res.offset += selParent.childNodes[i].nodeValue.length;
            }
            // 向上移动一个节点
            res.node = selParent;
        }
        console.log("getNodeLine:");
        console.log(res);
        return res;
    };
    // 获取编辑行信息
    getSelectLines() {
        // 转存对象
        let that = this;
        let sels = window.getSelection();
        //console.log(sels);
        // 当内容为空时的处理
        if (that.editor.childNodes.length === 0) {
            let div = document.createElement("div");
            that.editor.appendChild(div);
            let span = document.createElement("span");
            div.appendChild(span);
            var br = document.createElement("br");
            span.appendChild(br);
            let range = document.createRange();
            range.setStart(span, 0);
            range.setEnd(span, 0);
            sels.removeAllRanges();
            sels.addRange(range);
            return;
        }
        return { start: that.getNodeLine(sels.anchorNode, sels.anchorOffset), end: that.getNodeLine(sels.extentNode, sels.extentOffset) };
    };
    // 设置代码缩进
    setSelectCodeIndentation(space) {
        // 转存对象
        let that = this;
        let selects = that.getSelectLines();
        // 获取相关行信息
        let startLine = selects.start;
        let endLine = selects.end;
        let onlyone = startLine.node.isSameNode(endLine.node);
        let inSelect = false;
        console.log(onlyone);
        // 遍历所有行
        let range = document.createRange();
        let box = this.editor;
        let nodes = box.childNodes;
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            if (node.isSameNode(startLine.node) || node.isSameNode(endLine.node)) {
                if (space > 0) {
                    let txt = node.innerText;
                    if (txt === "\n") txt = "";
                    for (let s = 0; s < space; s++) { txt = " " + txt; }
                    node.innerHTML = "";
                    let span = document.createElement("span");
                    node.appendChild(span);
                    var text = document.createTextNode(txt);
                    span.appendChild(text);
                    // 设置状态需要更新
                    node.setAttribute("code-status", "update");
                    if (node.isSameNode(startLine.node)) range.setStart(text, startLine.offset + space);
                    if (node.isSameNode(endLine.node)) range.setEnd(text, endLine.offset + space);
                }
                // 设置标志或结束
                if (inSelect || onlyone) { break; } else { inSelect = true; }
            } else {
                if (inSelect) {
                    let txt = node.innerText;
                    if (txt === "\n") txt = "";
                    for (let s = 0; s < space; s++) { txt = " " + txt; }
                    node.innerHTML = "";
                    let span = document.createElement("span");
                    node.appendChild(span);
                    var text = document.createTextNode(txt);
                    span.appendChild(text);
                    // 设置状态需要更新
                    node.setAttribute("code-status", "update");
                }
            }
        }
        let sels = window.getSelection();
        sels.removeAllRanges();
        sels.addRange(range);
        that.format();
    };
    // 设置编辑行状态为需要更新
    setSelectLineUpdateStatus() {
        // 转存对象
        let that = this;
        let line = that.getSelectLines().end;
        line.node.setAttribute("code-status", "update");
    };
    // 执行渲染
    render() {
        // 转存对象
        let that = this;
        let line = that.getSelectLines();
        let box = this.editor;
        let nodes = box.childNodes;
        var range = document.createRange();
        //console.log(nodes);
        for (let i = nodes.length - 1; i >= 0; i--) {
            let node = nodes[i];
            let isStart = false;
            let isEnd = false;
            if (node.isSameNode(line.start.node)) isStart = true;
            if (node.isSameNode(line.end.node)) isEnd = true;
            // 新建行元素
            if (node.nodeName !== "DIV") {
                // 处理纯文本的情况
                let div = document.createElement("div");
                let span = document.createElement("span");
                div.appendChild(span);
                // 从元素中导入内容跟
                if (node.nodeType === 1) {
                    let txt = node.innerText;
                    if (txt === "") {
                        var br = document.createElement("br");
                        span.appendChild(br);
                    } else {
                        var text = document.createTextNode(txt);
                        span.appendChild(text);
                    }
                }
                if (node.nodeType === 3) {
                    var text = document.createTextNode(node.nodeValue);
                    span.appendChild(text);
                }
                //nodes[i] = div;
                // 添加新节点
                that.editor.insertBefore(div, node);
                // 删除旧节点
                that.editor.removeChild(node);
                // 替换操作节点
                node = div;
            }
            // 读取处理状态，非就绪列进行内容格式化
            let status = node.getAttribute("code-status");
            if (status !== "ready") {
                let txt = node.innerText;
                if (txt === "\n") txt = "";
                let txts = txt.split('\n');
                console.log(txts);
                // 未出现换行符的情况
                if (txts.length === 1) {
                    node.innerHTML = "";
                    let span = document.createElement("span");
                    node.appendChild(span);
                    if (txt === "") {
                        var br = document.createElement("br");
                        span.appendChild(br);
                        if (isStart) range.setStart(span, 0);
                        if (isEnd) range.setEnd(span, 0);
                    } else {
                        var text = document.createTextNode(txt);
                        span.appendChild(text);
                        if (isStart) range.setStart(text, line.start.offset);
                        if (isEnd) range.setEnd(text, line.end.offset);
                    }
                    node.setAttribute("code-status", "ready");
                } else {
                    // 有出现换行符的情况

                }
            }
        }
        let sels = window.getSelection();
        sels.removeAllRanges();
        sels.addRange(range);
    }
    // 创建编辑器
    constructor(id) {
        // 转存对象
        let that = this;
        // 获取父对象
        let parent = document.getElementById(id);
        // 判断父对象是否存在
        if (parent === null) throw "Id not found";
        // 生成工具栏
        let createToolBar = function () {
            let box = document.createElement("div");
            box.style.width = "100%";
            box.style.height = "50px";
            box.style.border = "1px solid #ccc";
            box.style.borderBottom = "0";
            box.style.boxSizing = "border-box";
            parent.appendChild(box);
        }
        createToolBar();
        // 生成编辑栏
        let createEditor = function () {
            // 添加定位框
            let box = document.createElement("div");
            box.setAttribute("contenteditable", "true");
            box.style.width = "100%";
            box.style.height = "calc(100% - 50px)";
            box.style.border = "1px solid #ccc";
            box.style.lineHeight = "22px";
            box.style.fontSize = "12px";
            box.style.padding = "5px";
            box.style.overflow = "auto";
            box.style.boxSizing = "border-box";
            box.style.fontFamily = "consolas";
            box.style.whiteSpace = "pre";
            box.setAttribute("code-node", "box");
            box.innerHTML = "<div><span><br /></span></div>";
            parent.appendChild(box);
            // 添加渲染层
            let rendering = document.createElement("div");
            box.appendChild(rendering);
            // 添加编辑框
            let textarea=document.createElement("textarea");
            box.appendChild(rendering);
            that.editor = textarea;
            // 处理事件
            textarea.addEventListener("keydown", function (evt) {
                switch (evt.key) {
                    // Tab
                    case 'Tab': that.setSelectCodeIndentation(4); evt.returnValue = false; return;
                }
            });
            textarea.addEventListener("keyup", function (evt) {
                switch (evt.key) {
                    // 删除
                    case 'Delete': case 'Backspace': that.setSelectLineUpdateStatus(); that.format(); break;
                }
            });
            textarea.addEventListener("input", function (e) {
                //console.log(e);
                if (!e.isComposing) {
                    console.log("input");
                    that.setSelectLineUpdateStatus();
                    that.format();
                }
            })
            textarea.addEventListener("compositionend", function (e) {
                console.log("compositionend");
                that.setSelectLineUpdateStatus();
                that.format();
            });
            textarea.addEventListener("click", function (evt) {
                let sels = window.getSelection();
                let selNode = sels.anchorNode;
                let selOffet = sels.anchorOffset;
                console.log(sels);
            });
        }
        createEditor();
    }
}