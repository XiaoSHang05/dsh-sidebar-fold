window.__ModuleLoader__.load({
  id: 'dsh-sidebar-fold',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /**
     * dsh-sidebar-fold — 侧栏整理
     *
     * 干两件事，都只做「加法」，不改任何别的包的代码：
     *
     *  1. 在侧栏「全局面板」图标列表（槽位 `sidebar.panellist`）最前面插一行
     *     「全局面板 ▾」，点它把其余图标折起来 / 展开（像「工作区」那样）。
     *     折叠用纯 CSS + `<html data-sbf-fold>`，所以**别的插件后注册进来的
     *     图标也会自动被折进去**，不需要逐个登记 id。
     *
     *  2. 把侧栏底部的「功能坞」入口（`dsh-dock` 注册到 `sidebar.footer.action`
     *     的那一行）隐藏。功能坞**面板本体不动**，在 设置 → 侧栏整理 里留了
     *     一个「打开功能坞」按钮，仍然能开。
     *
     * 安全底线：这是整理层，不是功能层。任何异常都吞掉，最坏结果只是
     * 「没折叠 / 没隐藏」，绝不会让侧栏渲染失败。卸载即完全复原。
     */

    const NS = 'sidebarFold'
    const STORAGE_KEY = 'dsh-sidebar-fold:collapsed'
    const HEADER_ID = 'dsh-sidebar-fold'

    /* ───────────────────────── 折叠状态（单例） ───────────────────────── */

    let collapsed = false
    const listeners = new Set()

    function readCollapsed() {
      try {
        return window.localStorage.getItem(STORAGE_KEY) === '1'
      } catch (e) {
        return false
      }
    }

    function writeCollapsed(value) {
      try {
        window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
      } catch (e) {
        /* 隐私模式 / 配额满：不打断操作 */
      }
    }

    function applyAttr(value) {
      try {
        if (value) document.documentElement.setAttribute('data-sbf-fold', '1')
        else document.documentElement.removeAttribute('data-sbf-fold')
      } catch (e) {
        /* ignore */
      }
    }

    function setCollapsed(next) {
      const value = !!next
      if (value === collapsed) return
      collapsed = value
      writeCollapsed(value)
      applyAttr(value)
      for (const fn of listeners) {
        try {
          fn()
        } catch (e) {
          /* 一个订阅者出错不影响其它人 */
        }
      }
    }

    function subscribe(fn) {
      listeners.add(fn)
      return () => {
        listeners.delete(fn)
      }
    }

    function useCollapsed() {
      return React.useSyncExternalStore(subscribe, () => collapsed, () => false)
    }

    /**
     * 打开功能坞面板。
     *
     * 它的 `openPanel` 是 dsh-dock 客户端模块内部的私有函数，没有对外导出
     * （`exports` 只有 apply / inject / dockBridge）。但那一行按钮仍在 DOM 里，
     * 只是被 CSS 隐藏 —— 直接 `.click()` 会走它自己的 React onClick，
     * 效果与用户点它完全一致。这是最不侵入的做法：不碰它的源码、不改它的状态。
     */
    function openDock() {
      try {
        const selectors = [
          '[data-slot="sidebar.footer.action"] .docke2-btn',
          '[data-slot="sidebar.footer.action"] button[aria-label="功能坞"]',
        ]
        for (const selector of selectors) {
          const node = document.querySelector(selector)
          if (node && typeof node.click === 'function') {
            node.click()
            return true
          }
        }
      } catch (e) {
        /* ignore */
      }
      return false
    }

    /* ────────────────────────────── 样式 ────────────────────────────── */

    const CSS = `
/* 折叠：把「不含本插件标题行」的面板按钮整行收起。
   用 :has() 而不是按 id 打类，后注册的图标自动纳入。 */
html[data-sbf-fold="1"] nav:has([data-slot="sidebar.panellist"]) button:not(:has([data-sbf-header])) {
  display: none !important;
}

/* 标题行箭头：折叠时转 -90° */
.sbf-chevron { display: inline-flex; align-items: center; justify-content: center; flex: none;
  transition: transform .15s ease; }
html[data-sbf-fold="1"] .sbf-chevron { transform: rotate(-90deg); }
@media (prefers-reduced-motion: reduce) { .sbf-chevron { transition: none; } }

/* 隐藏 dsh-dock 注册到侧栏底部的「功能坞」入口。
   功能坞面板本体不动，仍可从 设置 → 侧栏整理 打开。 */
[data-slot="sidebar.footer.action"] .docke2-btn,
[data-slot="sidebar.footer.action"] button[aria-label="功能坞"] {
  display: none !important;
}

/* 设置页 */
.sbf-page { display: flex; flex-direction: column; gap: 14px; padding: 20px 24px 32px;
  color: var(--dsw-alias-label-primary); font-size: 14px; line-height: 1.6; }
.sbf-page h2 { margin: 0; font-size: 16px; font-weight: 600; }
.sbf-page p { margin: 0; color: var(--dsw-alias-label-secondary); }
.sbf-card { display: flex; flex-direction: column; gap: 10px; padding: 14px 16px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-lg);
  background: var(--dsw-alias-bg-layer-1); }
.sbf-card-title { font-weight: 600; font-size: 13px; color: var(--dsw-alias-label-primary); }
.sbf-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.sbf-btn { padding: 5px 12px; border: 1px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-md); background: transparent; font: inherit; font-size: 13px;
  line-height: 20px; color: var(--dsw-alias-label-primary); cursor: pointer; }
.sbf-btn:hover { background: var(--dsw-alias-interactive-bg-hover); }
.sbf-btn:focus-visible { outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color); outline-offset: 1px; }
.sbf-hint { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
`

    function ensureCss() {
      try {
        if (document.querySelector('style[data-plugin-css="dsh-sidebar-fold"]') !== null) return
        const tag = document.createElement('style')
        tag.dataset.plugin = 'dsh-sidebar-fold'
        tag.dataset.pluginCss = 'dsh-sidebar-fold'
        tag.textContent = CSS
        document.head.appendChild(tag)
      } catch (e) {
        /* ignore */
      }
    }

    /* ────────────────────────────── 组件 ────────────────────────────── */

    function Chevron(props) {
      const size = props && typeof props.size === 'number' ? props.size : 16
      return h(
        'svg',
        {
          className: 'sbf-chevron',
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
        },
        h('path', { d: 'M4 6.25 8 10.25 12 6.25' }),
      )
    }

    /**
     * 侧栏里的标题行图标。
     *
     * 它是一条真正的 `sidebar.panellist` 条目，所以侧栏用**原生行样式**渲染它
     * （行高、悬停、收起成 56px 轨道时的行为全部和别的图标一致）。
     * 这里只画箭头；点击由 apply() 里的捕获阶段监听接管（见 bindRowToggle），
     * 这样**点整行都能开合**，而不是只有箭头那 16px。
     */
    function FoldGlyph(props) {
      const isCollapsed = useCollapsed()
      const t = props && typeof props.t === 'function' ? props.t : undefined
      const title = isCollapsed
        ? t
          ? t('header.expand')
          : '展开全局面板'
        : t
          ? t('header.collapse')
          : '收起全局面板'
      return h(
        'span',
        {
          'data-sbf-header': '1',
          title,
          'aria-label': title,
          style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
        },
        h(Chevron, { size: props && props.size }),
      )
    }

    /** 设置页：折叠开关 + 功能坞入口。 */
    function FoldPage(props) {
      const isCollapsed = useCollapsed()
      const t = props && typeof props.t === 'function' ? props.t : undefined
      const L = (key, fallback) => (t ? t(key) : fallback)

      return h(
        'div',
        { className: 'sbf-page' },
        h('h2', null, L('page.title', '侧栏整理')),

        h(
          'div',
          { className: 'sbf-card' },
          h('span', { className: 'sbf-card-title' }, L('page.foldTitle', '全局面板图标')),
          h(
            'div',
            { className: 'sbf-row' },
            h(
              'button',
              { type: 'button', className: 'sbf-btn', onClick: () => setCollapsed(!collapsed) },
              isCollapsed ? L('page.expand', '展开图标') : L('page.collapse', '收起图标'),
            ),
            h(
              'span',
              { className: 'sbf-hint' },
              isCollapsed ? L('page.stateCollapsed', '当前：已收起') : L('page.stateExpanded', '当前：已展开'),
            ),
          ),
          h('span', { className: 'sbf-hint' }, L('page.tip', '提示：点侧栏里「全局面板」那一行就能开合，选择会记住。')),
        ),

        h(
          'div',
          { className: 'sbf-card' },
          h('span', { className: 'sbf-card-title' }, L('page.dockTitle', '功能坞')),
          h('span', { className: 'sbf-hint' }, L('page.dockNote', '侧栏底部的「功能坞」入口已隐藏。功能坞本身没动，用它自己的面板照常打开。')),
          h(
            'div',
            { className: 'sbf-row' },
            h(
              'button',
              { type: 'button', className: 'sbf-btn', onClick: () => openDock() },
              L('page.openDock', '打开功能坞'),
            ),
          ),
        ),
      )
    }

    /* ────────────────────────── 整行点击接管 ────────────────────────── */

    /**
     * 在捕获阶段拦住「标题行」上的点击。
     *
     * 为什么不在组件里 stopPropagation：图标只占行里 16px，其余宽度归侧栏自己
     * 的按钮（点了会走 selectPanel）。捕获阶段在 document 上先收到事件，能拦下
     * 整行的点击，把它变成折叠开关。
     *
     * 只拦「祖先按钮里含 data-sbf-header」的那些，别的行一律放行。
     */
    function bindRowToggle() {
      const onClick = (event) => {
        try {
          const target = event.target
          if (!target || typeof target.closest !== 'function') return
          const button = target.closest('button')
          if (!button) return
          if (button.querySelector('[data-sbf-header]') === null) return
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          setCollapsed(!collapsed)
        } catch (e) {
          /* 拦截失败就退回默认行为，不影响其它功能 */
        }
      }
      document.addEventListener('click', onClick, true)
      return () => {
        try {
          document.removeEventListener('click', onClick, true)
        } catch (e) {
          /* ignore */
        }
      }
    }

    /* ────────────────────────────── 入口 ────────────────────────────── */

    function apply(ctx) {
      ensureCss()

      collapsed = readCollapsed()
      applyAttr(collapsed)

      /* 语言包 */
      let stopLocale
      try {
        if (ctx.locale && typeof ctx.locale.register === 'function') {
          stopLocale = ctx.locale.register(NS, {
            zh: {
              'header.label': '全局面板',
              'header.collapse': '收起全局面板图标',
              'header.expand': '展开全局面板图标',
              'page.title': '侧栏整理',
              'page.foldTitle': '全局面板图标',
              'page.collapse': '收起图标',
              'page.expand': '展开图标',
              'page.stateCollapsed': '当前：已收起',
              'page.stateExpanded': '当前：已展开',
              'page.tip': '提示：点侧栏里「全局面板」那一行就能开合，选择会记住。',
              'page.dockTitle': '功能坞',
              'page.dockNote': '侧栏底部的「功能坞」入口已隐藏。功能坞本身没动，用它自己的面板照常打开。',
              'page.openDock': '打开功能坞',
            },
            en: {
              'header.label': 'Global panels',
              'header.collapse': 'Collapse the global panel icons',
              'header.expand': 'Expand the global panel icons',
              'page.title': 'Sidebar tidy-up',
              'page.foldTitle': 'Global panel icons',
              'page.collapse': 'Collapse icons',
              'page.expand': 'Expand icons',
              'page.stateCollapsed': 'Now: collapsed',
              'page.stateExpanded': 'Now: expanded',
              'page.tip': 'Tip: click the “Global panels” row in the sidebar to toggle, and the choice is remembered.',
              'page.dockTitle': 'Dock',
              'page.dockNote': 'The dock entry at the sidebar foot is hidden. The dock itself is untouched and still opens from its own panel.',
              'page.openDock': 'Open the dock',
            },
          })
        }
      } catch (e) {
        /* 语言包注册失败：退回中文硬编码 */
      }

      /** 侧栏那一行的名字。 */
      const headerLabel = () => {
        try {
          if (ctx.locale && typeof ctx.locale.bind === 'function') return ctx.locale.bind(NS)('header.label')
        } catch (e) {
          /* ignore */
        }
        return '全局面板'
      }

      /** 设置页那一行的名字（跟侧栏标题分开，别让人以为点它会折叠）。 */
      const settingsLabel = () => {
        try {
          if (ctx.locale && typeof ctx.locale.bind === 'function') return ctx.locale.bind(NS)('page.title')
        } catch (e) {
          /* ignore */
        }
        return '侧栏整理'
      }

      /* 标题行：order -100 排在所有图标之前 */
      ctx.slots.inject('sidebar.panellist', () => {
        return ctx.slots.register(
          { name: 'sidebar.panellist', id: HEADER_ID, order: -100, label: headerLabel, locale: NS },
          FoldGlyph,
        )
      })

      /* 对应的 main 面板：给标题行一个安全落点（万一点击没被拦住也不会报错） */
      ctx.slots.inject('main', () => {
        return ctx.slots.register({ name: 'main', key: HEADER_ID, locale: NS }, FoldPage)
      })

      /* 设置页：折叠开关 + 功能坞入口 */
      ctx.slots.inject('settings.section', () => {
        return ctx.slots.register(
          { name: 'settings.section', id: HEADER_ID, order: 91, label: settingsLabel, locale: NS },
          FoldPage,
        )
      })

      /* 整行点击 → 折叠开关 */
      ctx.effect(() => bindRowToggle(), 'dsh-sidebar-fold: row toggle')

      /* 卸载时把 <html> 状态与监听清干净 */
      ctx.effect(() => {
        return () => {
          try {
            document.documentElement.removeAttribute('data-sbf-fold')
          } catch (e) {
            /* ignore */
          }
          listeners.clear()
          if (typeof stopLocale === 'function') {
            try {
              stopLocale()
            } catch (e) {
              /* ignore */
            }
          }
        }
      }, 'dsh-sidebar-fold: teardown')
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    }
  },
});
