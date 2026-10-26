# dsh-sidebar-fold · 侧栏整理

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Release](https://img.shields.io/github/v/release/XiaoSHang05/dsh-sidebar-fold)](https://github.com/XiaoSHang05/dsh-sidebar-fold/releases)

> 侧栏顶部那排图标，收成一行。

DeepSeek Harness 的侧栏顶部会随着插件越装越多而越拉越长 —— 插件、插件市场、自动化任务、上下文洞察、技能中心、记忆系统、更多…… 每一个都是一个独立插件往 `sidebar.panellist` 槽位里注册的图标。装到第七个，它们就占了小半屏。

这个插件在最前面加一行「全局面板 ▾」。点它，其余图标收起来；再点，展开。

```
收起时                          展开时
┌──────────────────────┐        ┌──────────────────────┐
│ ▸ 全局面板           │        │ ▾ 全局面板           │
│                      │        │ ◆ 插件               │
│ 工作区          🔍 ⚙ │        │ ◆ 插件市场           │
│  ▸ 阿宅              │        │ ◆ 自动化任务         │
│  ▸ Agent创作者       │        │ ◆ 上下文洞察         │
│  ▸ Remotion动画      │        │ ◆ 技能中心           │
└──────────────────────┘        │ ◆ 记忆系统           │
                                │ ◆ 更多               │
                                └──────────────────────┘
```

## 装

```sh
dsh plugin --profile desktop add "github:XiaoSHang05/dsh-sidebar-fold"
```

装完**重启 DSH**。浏览器侧的代码在进程重启时才会重新读取。

## 它还做了一件事

隐藏侧栏底部的「功能坞」入口（`dsh-dock` 注册的那一行）。

**功能坞本身没有任何改动** —— 插件没删、配置没动、面板照常打开。只是那一行按钮不再显示，好让侧栏底部干净一点。想打开功能坞时：**设置 → 侧栏整理 → 打开功能坞**。

如果你没装 `dsh-dock`，这条规则什么也不会命中，不会有任何影响。

## 用法

- **点整行**就开合，不用瞄准那个小箭头。
- 状态记在浏览器的 `localStorage`（键 `dsh-sidebar-fold:collapsed`），刷新后保持。
- 默认是**展开**的 —— 装上不会突然把你的图标藏起来。
- 设置 → 侧栏整理 里也有同一个开关，以及那个「打开功能坞」按钮。

## 为什么后来装的图标也会被折进去

折叠不是逐个登记 id 的，而是纯 CSS：

```css
html[data-sbf-fold="1"] nav:has([data-slot="sidebar.panellist"]) button:not(:has([data-sbf-header])) {
  display: none !important;
}
```

规则读作「在全局面板那一列里，凡是不包含我的标题行的按钮，都藏起来」。所以无论哪个插件、什么时候注册进来的图标，都自动落进这张网里 —— 包括你以后新装的插件。

## 卸载

插件管理器里禁用或卸载即可。这个插件没有往任何别的包里写东西，也没有替换任何槽位，卸载后侧栏立刻回到原样（`<html>` 上的状态属性也会一并清掉）。

手工卸载的话两步：

1. 从 profile 的 `package.json` 里删掉 `dsh.profile.bundles` 中的 `"dsh-sidebar-fold"`，以及 `dependencies` 里的那一行；
2. 删掉 `node_modules/dsh-sidebar-fold`（那是个软链，删链接不动源码）。

改完重启 DSH。

## 边界

- 折叠时被收起的图标**点不到**，要先展开。这是折叠本身的意思。
- 「打开功能坞」是去 `.click()` 那个被隐藏的原按钮 —— 它的 `openPanel` 没有对外导出。如果哪天 `dsh-dock` 改了这个按钮的类名或 `aria-label`，这个按钮会失效，但隐藏本身不受影响。
- 侧栏收起成 56px 轨道时折叠仍然生效，标题行只剩箭头。
- 只在 **Web** 界面有效（`dsh.client.platform: "web"`）。

## 开发

插件全部逻辑在 `client.js` 一个文件里，没有构建步骤：

```
client.js            全部逻辑：标题行、折叠状态、CSS、功能坞隐藏与打开
index.js             宿主半部，空实现
cordis.patch.yml     往 profile 里插一行 sidebar-fold
package.json         包清单，含 dsh.bundle 与 dsh.client 声明
locale/{zh,en}.json  插件管理器里显示的名字与说明
icon.svg             图标
```

改完 `client.js` 直接重启 DSH 就能看到，不需要打包。

## License

MIT
