import { createElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode, RefObject } from 'react'
import { KIND_CLASS } from './theme'
import { initial } from './data'

/** 动效能力探测：减少动效或不支持观察器时，CSS 不隐藏任何内容 */
const canMotion =
  typeof window !== 'undefined' &&
  'IntersectionObserver' in window &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (canMotion) document.documentElement.classList.add('motion-on')

/**
 * 进入视口只触发一次；页面切换或条件渲染出新节点时继续接管，
 * 保证「动画没跑起来」也永远不会把内容留在隐藏态。
 */
export function useReveal(key: string) {
  useEffect(() => {
    const revealAll = () => document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-on)')
      .forEach((n) => n.classList.add('is-on'))
    if (!canMotion) { revealAll(); return }
    // rootMargin 每个值都必须带单位，否则 Chrome 会抛 SyntaxError
    let io: IntersectionObserver | null = null
    try {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('is-on'); io?.unobserve(e.target) }
        }),
        { threshold: 0.08, rootMargin: '0px 0px -7% 0px' },
      )
    } catch {
      // 动效参数不当时直接显示内容，绝不把页面留在隐藏态
      document.documentElement.classList.remove('motion-on')
      revealAll()
      return
    }
    const watch = (root: ParentNode) => {
      const list = Array.from(root.querySelectorAll?.<HTMLElement>('[data-reveal]:not(.is-on)') ?? [])
      list.forEach((n) => io?.observe(n))
    }
    watch(document)
    const mo = new MutationObserver((records) => records.forEach((r) =>
      r.addedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement)) return
        if (n.matches('[data-reveal]:not(.is-on)')) io.observe(n)
        watch(n)
      })))
    mo.observe(document.body, { childList: true, subtree: true })
    return () => { io?.disconnect(); mo.disconnect() }
  }, [key])
}

/** 指针局部柔光：仅精确指针 + 未开启减少动效；只写 CSS 变量，不动布局 */
export function usePointerGlow() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-glow]')
      if (!el) return
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) return
      el.style.setProperty('--px', `${(((e.clientX - r.left) / r.width) * 100).toFixed(2)}%`)
      el.style.setProperty('--py', `${(((e.clientY - r.top) / r.height) * 100).toFixed(2)}%`)
    }
    document.body.addEventListener('pointermove', onMove, { passive: true })
    return () => document.body.removeEventListener('pointermove', onMove)
  }, [])
}

/** 快捷键：/ 聚焦搜索，Esc 清空 */
export function useSlashFocus(inputRef: RefObject<HTMLInputElement | null>, onEsc?: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName ?? ''
      if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(tag)) {
        e.preventDefault(); inputRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) onEsc?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inputRef, onEsc])
}

/** 共享液态指示层的位置：跟随 active 项，尺寸变化只发生在交互与 resize 时 */
export function useLiquid(ref: RefObject<HTMLElement | null>, dep?: unknown) {
  const [box, setBox] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const sync = useCallback(() => {
    const root = ref.current
    if (!root) return
    const active = root.querySelector<HTMLElement>('[aria-current="page"]')
      ?? root.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!active) { setBox((b) => ({ ...b, w: 0 })); return }
    setBox({ x: active.offsetLeft, y: active.offsetTop, w: active.offsetWidth, h: active.offsetHeight })
  }, [ref])
  useLayoutEffect(() => {
    sync()
    const raf = requestAnimationFrame(sync)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null
    if (ref.current) ro?.observe(ref.current)
    window.addEventListener('resize', sync)
    return () => { cancelAnimationFrame(raf); ro?.disconnect(); window.removeEventListener('resize', sync) }
  }, [sync, dep, ref])
  return box
}

/** 带共享指示层的一组切换按钮 */
export function LiquidTabs(props: { value: string; children: ReactNode; className?: string; block?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const box = useLiquid(ref, props.value)
  return (
    <div ref={ref} className={`${props.className ?? 'gg-tabs'}${props.block ? ' gg-seg' : ''}`}>
      <span className="gg-liq" aria-hidden="true"
            style={{ transform: `translate3d(${box.x}px,${box.y}px,0)`, width: box.w, height: box.h }} />
      {props.children}
    </div>
  )
}

type RevealProps = { children: ReactNode; as?: string; stagger?: number; className?: string; glow?: boolean }
export function Reveal({ children, as = 'div', stagger, className = '', glow }: RevealProps) {
  return createElement(
    as,
    {
      'data-reveal': '',
      className: `gg-rv ${stagger === undefined ? '' : 'gg-stg'} ${className}`.trim(),
      style: stagger === undefined ? undefined : ({ '--gi': stagger } as CSSProperties),
      ...(glow ? { 'data-glow': '' } : {}),
    },
    children,
  )
}

/** 分类标记：两色 + 实心/空心，状态永远带文字，不靠颜色单独表意 */
export function Dot({ kind }: { kind: string }) {
  return <span className={`gg-dot ${KIND_CLASS[kind] ?? 'k-ink'}`}><i aria-hidden="true" />{kind}</span>
}

const KIND_CHAR: Record<string, string> = { 文档: '文', 审批: '审', 会议: '会', 待办: '办', 表格: '表', 日程: '程' }
export function KindMark({ kind }: { kind: string }) {
  return <span className="gg-kmark" aria-hidden="true">{KIND_CHAR[kind] ?? '·'}</span>
}

export function Ava({ name, tone = 'sage' }: { name: string; tone?: 'sage' | 'ochre' | 'ink' }) {
  return <span className={`gg-ava gg-ava-${tone}`} aria-hidden="true">{initial(name)}</span>
}

export function Pill({ children, tone = '' }: { children: ReactNode; tone?: string }) {
  return <span className={`gg-pill ${tone}`.trim()}><span className="gg-pill-dot" aria-hidden="true" />{children}</span>
}

export function PageHead(props: { eyebrow: string; title: string; lede: string; pills?: ReactNode; xl?: boolean }) {
  return (
    <header className="gg-head">
      <div className="gg-eyebrow">{props.eyebrow}</div>
      <h1 className={`gg-page${props.xl ? ' gg-page-xl' : ''}`}>{props.title}</h1>
      <p className="gg-lede">{props.lede}</p>
      {props.pills ? <div className="gg-pills">{props.pills}</div> : null}
      <div className="gg-hair" />
    </header>
  )
}

export function Btn(props: {
  children: ReactNode; onClick?: () => void; tone?: 'pri' | 'ochre' | ''; size?: 'lg' | ''
  arrow?: boolean; href?: string; note?: string
}) {
  const cls = `gg-btn ${props.tone ?? ''} ${props.size === 'lg' ? 'gg-btn-lg' : ''}`.trim()
  const inner = <>{props.children}{props.arrow ? <span className="gg-ar" aria-hidden="true">→</span> : null}</>
  if (props.href) return <a className={cls} href={props.href} target="_blank" rel="noreferrer">{inner}</a>
  return <button type="button" className={cls} onClick={props.onClick} title={props.note}>{inner}</button>
}

/** 迷你柱图：数值来自数据本身 */
export function Spark({ values, warnAt, caption = '周一→周五 实测' }: { values: number[]; warnAt?: number; caption?: string }) {
  const max = Math.max(...values, 1)
  return (
    <>
      <div className="gg-spark" aria-hidden="true">
        {values.map((v, i) => (
          <i key={i} className={v === max ? 'hi' : i === warnAt ? 'w' : ''}
             style={{ height: `${Math.max(8, Math.round((v / max) * 100))}%` }} />
        ))}
      </div>
      <div className="gg-spark-cap">{caption}</div>
    </>
  )
}

export function Kpi(props: { label: string; value: string | number; unit?: string; delta?: string; warn?: boolean; children?: ReactNode }) {
  return (
    <div className={`gg-kpi${props.warn ? ' gg-kpi-warn' : ''}`} data-glow="">
      <div className="gg-k-lab">{props.label}</div>
      <div className="gg-k-val">{props.value}{props.unit ? <span className="gg-k-unit">{props.unit}</span> : null}</div>
      {props.delta ? <div className="gg-k-delta">{props.delta}</div> : null}
      {props.children}
    </div>
  )
}
