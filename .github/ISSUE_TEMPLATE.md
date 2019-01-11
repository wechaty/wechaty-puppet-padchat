### 0. 发 Issue 指南

1. 请运行下面的命令，看问题是否可以被解决：
```
rm -rf package-lock.json
rm -rf node_modules
npm install
```

2. 请在 [FAQ 清单](https://docs.chatie.io/v/zh/faq) 看是否已有解决办法。

3. 请先在issue 中搜关键信息，确认你要发的内容和之前的issue 不重复。

### 1. 提供你的包版本信息
- wechaty 版本：
- wechaty-puppet-padchat 版本：
- node 版本： (运行 `node --version` 获取版本)

### 2. 期待程序运行的结果

### 3. 程序实际运行的结果

### 4. 复现的步骤 (或者解决的步骤)

**这一部分非常重要，如果你无法给出复现步骤，我们也很难提供相应的解决办法：**
例子:
- 第一步：
- 第二步：
- 。。。

### 5. 完整的日志信息：
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

