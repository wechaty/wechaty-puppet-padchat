---
name: wechaty puppet padchat Bug report(提bug)
about: 'Create a bug report for a bug you found in the wechaty puppet padchat '

---

> 重要：请不要删除模板自行填写，所有不按照模板填写的issue，我们将不会处理。


## 0. 发 Issue 指南

1. 请运行下面的命令，看问题是否可以被解决：
```
rm -rf package-lock.json
rm -rf node_modules
npm install
```

2. 请在 [FAQ 清单](https://docs.chatie.io/v/zh/faq) 看是否已有解决办法。

3. 请先在issue 中搜关键信息，确认你要发的内容和之前的issue 不重复。

## 1. 提供你的包版本信息
- wechaty 版本：
- wechaty-puppet-padchat 版本：
- node 版本： (运行 `node --version` 获取版本)
- 你使用的操作系统：

## 2. Bug 描述
请用精简的语言描述你遇到的bug

## 3. 复现的步骤 (或者解决的步骤)

**这一部分非常重要，如果你无法给出复现步骤，我们也很难提供相应的解决办法：**
例子:
- 第一步：
- 第二步：
- 。。。

## 4. 期待程序运行的结果
请用精简的语言描述你期待运行的结果

## 5. 程序实际运行的结果
请用精简的语言或者截图描述实际运行的结果（**请不要在这里粘贴日志截图**）

## 6. 完整的日志信息：
通过`WECHATY_LOG=silly`设定环境变量，将设置log 等级为 silly，获取最详细的日志信息（默认log 等级为 info）
**请提供完整的日志信息(不要只提供部分的日志截图，请复制粘贴日志内容！)**
<details>
<summary>
Show Logs
</summary>

```shell
$ WECHATY_LOG=silly node yourbot.js

```

</details>

## 7. 其他信息
有相关bug 的背景信息，可以在这里说明

[bug]
