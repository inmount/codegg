# Codegg Editor
English | [简体中文](README_zhCN.md)

![license](https://img.shields.io/github/license/inmount/codegg)
![codeSize](https://img.shields.io/github/languages/code-size/inmount/codegg)
![lastCommit](https://img.shields.io/github/last-commit/inmount/codegg)

## Introduction
Codegg is an easy-to-use front-end editor written in vanilla JavaScript. This editor mainly supports HTML editing, and supports a functional scripting language called **Lark** in addition.

## Getting Started
The editor is easy-to-use and free-to-extend. This is only a core editor which you can add some mostly-used code into it quickly. Extensions developments are welcome.

Here's an example:
```js
// Construct an object.
var codegg = new Codegg("editor", {
  // Configure colors
  colors: {
    borderColor: "#cccccc",
    toolbarItemColor: "#d81e06",
    toolbarItemBackgroudColorHover: "#ffffff",
    toolbarBackgroundColor: "#ebebeb",
    toolbarSpliteColor: "#dddddd",
  },
  // Configure toolbar
  toolbar: [["h1", "h2", "h3", "p", "div"], ["b", "i", "s"], ["table", "ol", "ul"], ["link", "image", "audio", "video"], ["view"]]
});
// onError callback.
codegg.bind("error", function (ex) {
  alert(ex);
});
// Save event callback.
codegg.bind("save", function () {
  alert("Save");
});
// On adding image. Should give a URL to the image by calling e.setResult.
codegg.bind("image", function (e) {
  // Setting the result.
  e.setResult({ src: "https://a.com/b.jpg" });
});
// Getting the content inside the editor.
function getContent() {
  alert(codegg.getContent());
}
// Setting the content inside the editor.
function setContent() {
  codegg.setContent("<div>Testing content</div>");
}
```

## Toolbar Event Registration
Every item in the toolbar provides a event registration, by using method `bind(string, void)`.
Use `setResult(object)` to set the related arguments.

## `setResult(object)` for Simple Elements
For simple elements, just pass the new properties object into the `setResult(object)` method. The object will be used as the properties of the corresponding HTML element. For example,
```js
codegg.bind("div", function (e) {
  // Set the result
  e.setResult({ name: "d1" });
});
```

After running that, you're expected to get the following content while clicking the `div` toolbar item:
```html
<div name="d1"></div>
```

## `setResult(object)` for Complex Elements
So-called **complex elements** are `table`, `ol` and `ul`, which you can set the their own properties and children's properties, respectively.

`table` related settings:
```javascript
codegg.bind("table", function (e) {
  // Setting the result.
  e.setResult({
    rows: 2,
    columns: 4,
    table: { name: "tab1" },
    tr: { style: "background-color:#ebebeb;" },
    td: { style: "color:#222;" }
  });
});
```

You'll get the following result after clicking the `table` toolbar item:
```html
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

`ul` and `ol` related settings:

```js
// If you want to set the `ul`, just replace the first
// argument with `"ul"`.
codegg.bind("ol", function (e) {
  // Setting the result.
  e.setResult({
    lines: 2,
    ol: { name: "list1" },
    li: { style: "color:#222;" }
  });
});
```
Result after clicking the `ol` (or `ul`) toolbar item:
```html
<ol name="list1">
  <li style="color:#222;">&nbsp;</li>
  <li style="color:#222;">&nbsp;</li>
  <li style="color:#222;">&nbsp;</li>
</ol>
```
