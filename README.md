# 属于码农的HTML编辑器

作为一个码农，对现有网上现有的富文本编辑器意见很大，虽然能无脑鼠标操作，但是结果是要么排版很糟糕，要么就是限制很严重，有些编辑器甚至直接取消了源代码编辑功能。

对于我这种臭写代码的，就是喜欢直接用HTML代码编写详情页，不行吗？怎么就没人能体谅我们这群既当工程师，又当美工，又当客服的苦逼打工人。

所以我做了这个基于原生Js的HTML编辑器，取名codegg，中文就叫码蛋吧，打工人不容易，我有空就更新增加功能，尽量让它茁壮成长。

## 怎么开始

我尽量让使用简单一点，也更自由一点，所以，我只提供一个核心编辑器，可以快速添加一些常用的代码，欢迎感兴趣的人自己扩展开发。

以下是简单的使用案例:

``` javascript
// 实例化一个对象
var codegg = new Codegg("editor", {
    // colors: {
    //     borderColor: "#cccccc",
    //     toolbarItemColor: "#d81e06",
    //     toolbarItemBackgroudColorHover: "#ffffff",
    //     toolbarBackgroundColor: "#ebebeb",
    //     toolbarSpliteColor: "#dddddd",
    // },
    // toolbar: [["h1", "h2", "h3", "p", "div"], ["b", "i", "s"], ["table", "ol", "ul"], ["link", "image", "audio", "video"], ["view"]]
});
// 绑定错误
codegg.bind("error", function (ex) {
    alert(ex);
});
// 绑定保存
codegg.bind("save", function () {
    alert("保存");
});
// 绑定图片操作，可以自行扩展是上传还是添加网络地址
codegg.bind("image", function (e) {
    // 设置结果
    e.setResult({ src: "https://a.com/b.jpg" });
});
// 获取内容
function getContent() {
    alert(codegg.getContent());
}
// 设置内容
function setContent() {
    codegg.setContent("<div>测试内容</div>");
}
```

## 工具栏的事件扩展

每一个工具栏功能项，都提供事件注册，使用bind(string,void)方式注册。

使用setResult(object)方法进行相关参数设定。

### 标准事件结果参数设定

所有简单元素，在setResult时遵循直接使用对象属性方式一对一设置元素属性，比如添加以下代码：

``` javascript
codegg.bind("div", function (e) {
    // 设置结果
    e.setResult({ name: "d1" });
});
```

随后点击工具栏中的"DIV"功能项时，可以得到以下结果：

``` html
<div name="d1"></div>
```

### 复杂对象事件结果参数设定

复杂对象目标主要针对"table", "ol", "ul"三个功能项，可分别设置功能参数和元素属性。

表格相关设定：

``` javascript
codegg.bind("table", function (e) {
    // 设置结果
    e.setResult({
        rows: 2,
        columns: 4,
        table: { name: "tab1" },
        tr: { style: "background-color:#ebebeb;" },
        td: { style: "color:#222;" }
    });
});
```

随后点击工具栏中的表格功能项时，可以得到以下结果：

``` html
<table name="tab1">
    <tr style="background-color:#ebebeb;">
        <td style="color:#222;">&nbsp;</td>
        <td style="color:#222;">&nbsp;</td>
        <td style="color:#222;">&nbsp;</td>
        <td style="color:#222;">&nbsp;</td>
    </tr>
    <tr style="background-color:#ebebeb;">
        <td style="color:#222;">&nbsp;</td>
        <td style="color:#222;">&nbsp;</td>
        <td style="color:#222;">&nbsp;</td>
        <td style="color:#222;">&nbsp;</td>
    </tr>
</table>
```

列表相关设定（有序列表和无序列表参数大致相同）：

``` javascript
codegg.bind("ol", function (e) {
    // 设置结果
    e.setResult({
        lines: 2,
        ol: { name: "list1" },
        li: { style: "color:#222;" }
    });
});
```

随后点击工具栏中的有序列表功能项时，可以得到以下结果：

``` html
<ol name="list1">
    <li style="color:#222;">&nbsp;</li>
    <li style="color:#222;">&nbsp;</li>
    <li style="color:#222;">&nbsp;</li>
</ol>
```



