# JSON-js
为 Adobe 脚本语言 ExtendScript 适配的 JSON

## 调用方式调整

```jsx
// 原 json2 导入时会导致全局变量污染
(function () {
	//@include "json2.jsx"
	// JSON 存在于全局作用域
    JSON.stringify({ name: 'box', number: [1, 2, 3] }, null, 4);
})();

JSON.stringify({ name: 'box', number: [1, 2, 3] }, null, 4); // 依然可以执行

// 因大量扩展和脚本使用了原 json2，为了规避 Adobe 宿主中既有 JSON 全局变量污染和全局变量名冲突，作出以下调整：
// 原 JSON 全局标识符已调整为 JSON2
// 现 JSON2 仅在局部作用域生效
(function () {
    //@include "json2.jsx"
	//现 JSON2 只存在于局部作用域
 
    JSON2.stringify({ name: 'box', number: [1, 2, 3] }, null, 4);
})();

JSON2.stringify({ name: 'box', number: [1, 2, 3] }, null, 4); // 抛出错误：JSON2 is undefined
```



## 规避原型污染

```jsx
// 原 json2 中涉及原型污染的代码片段
if (typeof Date.prototype.toJSON !== 'function') {
    Date.prototype.toJSON = function () {
        return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z' : null;
    };

    Boolean.prototype.toJSON = this_value;
    Number.prototype.toJSON = this_value;
    String.prototype.toJSON = this_value;
}
```



## 适配 ExtendScript 可以正确解析的时间格式

```jsx
// ExtendScript 无法正确解析 ISO 8601 日期字符串，以下代码会返回错误的时间。
new Date("2012-04-23T18:25:43.511Z")

// ExtendScript 能够正确解析的时间字符串格式
new Date("Mon Dec 05 2022 21:53:06 GMT+0800")
```



## 修复由 ExtendScript 连续三目运算符 bug 导致的格式化错误

```jsx
// 该问题在 Adobe 论坛的讨论：https://community.adobe.com/t5/illustrator-discussions/strange-amp-annoying-json-behavior-in-extendscript/td-p/11964686
// ExtendScript 无法正确处理连续的三目运算符，原 json2 中的两处代码会导致错误的格式化结果
v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';

```

