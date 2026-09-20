import { Fragment, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { App as AntdApp, ConfigProvider } from 'antd'
import Overview from './Overview'
import { antdTheme } from './theme'
import { APPROVAL_INSTANCE, DOCS, linkForMeeting, linkForTitle, SOURCE_LINKS, TODO_DETAIL, AITABLE_LEDGER, AITABLE_Q3 } from './links'
import {
  approvals, dataSources, dayDate, docUpdates, docsByDay, kindCount, lane, ledgerAmount, ledgerFieldCount,
  ledgerRecordCount, ledgerRows, ledgerStatusClass, ledgerTableCount, members,
  meetingCount, meetingsByDay, overdueApprovals, passedApprovals, pendingApprovals,
  planBlocked, planRows, planRunning, planStatusClass,
  signals, TODAY_INDEX, docCount, meetingEntries, days,
} from './data'
import type { Approval, Signal } from './data'
import {
  Ava, Btn, Dot, KindMark, LiquidTabs, PageHead, Pill, Reveal, useLiquid, usePointerGlow, useReveal, useSlashFocus,
} from './ui'

/* ---------------- 权限与拉取失败提示（可重试） ---------------- */
function SourceNotice({ text }: { text: string }) {
  const { message } = AntdApp.useApp()
  const [retrying, setRetrying] = useState(false)
  return (
    <div className="gg-notice" role="status">
      <p><b>{text}</b><span>已跳过无权限内容，仅显示你可访问范围。</span></p>
      <Btn onClick={() => { setRetrying(true); window.setTimeout(() => { setRetrying(false); message.success('已重试，无新增可见数据') }, 700) }}>
        {retrying ? '重新拉取中…' : '重试'}
      </Btn>
    </div>
  )
}

const signalLink = (s: Signal): string | null =>
  (s.kind === '审批' ? APPROVAL_INSTANCE : s.kind === '待办' ? TODO_DETAIL : linkForTitle(s.title))

/* ---------------- 周知 · 驾驶舱 ---------------- */
function Dashboard({ go }: { go: (k: string) => void }) {
  const { message } = AntdApp.useApp()
  const [view, setView] = useState('按周')
  const [cat, setCat] = useState('全部')
  const [q, setQ] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  useSlashFocus(searchRef, () => setQ(''))
  const [openId, setOpenId] = useState<string | null>(null)
  const [vstate, setVstate] = useState<'doing' | 'done' | 'doubt'>('done')
  const [fixed, setFixed] = useState(false)
  useReveal('dashboard')

  const cats = ['全部', ...Array.from(new Set(signals.map((s) => s.kind)))]
  const norm = q.trim().toLowerCase()
  const list = signals.filter((s) => {
    const catOk = cat === '全部' || s.kind === cat
    const hay = `${s.title} ${s.person} ${s.detail} ${s.source}`.toLowerCase()
    return catOk && (!norm || hay.includes(norm))
  })
  const sections = view === '按周'
    ? [{ label: '', items: list }]
    : view === '按天'
      ? days.map((d, i) => ({ label: `${d} ${dayDate(i)}`, items: list.filter((s) => s.day === d) }))
        .filter((g) => g.items.length > 0)
      : [...members.map((m) => m.name), '你'].map((p) => ({ label: p, items: list.filter((s) => s.person === p) }))
        .filter((g) => g.items.length > 0)

  const copy = (t: string) => {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(t).then(
      () => message.success('已复制到剪贴板 · 未改动原文'),
      () => message.warning('复制失败，请手动选择文本'),
    )
    else message.warning('当前环境不支持剪贴板，请手动选择文本')
  }

  return (
    <div>
      <PageHead
        eyebrow="周知 · 团队进展驾驶舱"
        title="本周团队进展"
        lede="散在文档、审批、待办、会议、日程里的真实信号，已按人归拢到一屏——每条都能点开核验出处，这是你敢直接引用的前提。"
        pills={<>
          <Pill tone="on">本周 09/07 – 09/11</Pill>
          <Pill>{`覆盖 ${kindCount} 类信号`}</Pill>
          <Pill>仅你可见范围</Pill>
        </>}
      />
      <SourceNotice text="部分数据源拉取失败（无权限或未共享）" />

      <div className="gg-toolbar">
        <div className="gg-search" data-glow="">
          <span className="gg-search-ico" aria-hidden="true" />
          <input
            ref={searchRef} type="search" placeholder="搜索信号、成员或出处" aria-label="搜索本周信号"
            value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off"
          />
          {q ? <button type="button" className="gg-clear" onClick={() => setQ('')}>清除</button> : <span className="gg-kbd">/</span>}
        </div>
        <LiquidTabs value={cat}>
          {cats.map((c) => (
            <button type="button" key={c} className="gg-tab" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
          ))}
          <span className="gg-count" aria-live="polite">
            {list.length === signals.length ? `全部 ${signals.length} 条` : `显示 ${list.length} 条 · 共 ${signals.length} 条`}
          </span>
        </LiquidTabs>
        <LiquidTabs value={view} block>
          {['按周', '按天', '按人'].map((v) => (
            <button type="button" key={v} className="gg-tab" aria-pressed={view === v} onClick={() => setView(v)}>{v}</button>
          ))}
        </LiquidTabs>
      </div>

      <div className="gg-rows">
        {sections.map((sec) => (
          <div key={sec.label || 'all'}>
            {sec.label ? <div className="gg-day-h">{sec.label}</div> : null}
            {sec.items.map((s: Signal, i) => {
              const url = signalLink(s)
              return (
                <Reveal key={s.id} className="gg-row" stagger={Math.min(i, 7)} glow>
                  <KindMark kind={s.kind} />
                  <div className="gg-row-main">
                    <h3>{url
                      ? <a className="gg-ext-title" href={url} target="_blank" rel="noreferrer">{`${s.title} ↗`}</a>
                      : s.title}</h3>
                    <p>{`${s.person} · ${s.detail}`}</p>
                    <span className="gg-src">{`来源 · ${s.source} · ${s.day} ${s.time}`}</span>
                  </div>
                  <div className="gg-row-side">
                    <Dot kind={s.kind} />
                    <Btn arrow onClick={() => setOpenId(openId === s.id ? null : s.id)}>核验</Btn>
                  </div>
                </Reveal>
              )
            })}
          </div>
        ))}
        {list.length === 0 ? <div className="gg-empty">没有匹配的信号 · 换个关键词或清除筛选</div> : null}
      </div>

      {openId ? (
        <Reveal className="gg-panel">
          <div className="gg-vrow">
            <span className="gg-vlabel">核验状态</span>
            <LiquidTabs value={vstate} block>
              {([['doing', '① 核验中'], ['done', '② 已核验'], ['doubt', '③ 存疑待纠错']] as const).map(([k, label]) => (
                <button type="button" key={k} className="gg-tab" aria-pressed={vstate === k} onClick={() => setVstate(k as 'doing' | 'done' | 'doubt')}>{label}</button>
              ))}
            </LiquidTabs>
          </div>
          {vstate === 'doing' ? (
            <div className="gg-rule-sage">
              <p><b>核验中</b> · 正在打开原文《登录重构 · 技术方案》…</p>
              <div className="gg-bar"><i /></div>
            </div>
          ) : null}
          {vstate === 'done' ? (
            <div className="gg-rule-sage">
              <div className="gg-lead">已核验 · 对上了</div>
              <p><b>属实：</b>李工 周三 14:20 提交 v12，改了鉴权章节 + 补 3 张时序图。</p>
              <a className="gg-ext" href={DOCS.登录重构} target="_blank" rel="noreferrer">跳到钉钉文档原文（演示）↗</a>
            </div>
          ) : null}
          {vstate === 'doubt' ? (
            <div className="gg-rule-ochre">
              <div className="gg-lead warn">存疑 · 待纠错</div>
              <p><b>时间/归属存疑：</b>该文档最后编辑其实在<b>上周</b>，不计入本周。要不要剔出本周汇总？</p>
              <div className="gg-acts">
                <Btn tone="ochre" onClick={() => { setFixed(true); message.success('已修正：同类「跨周误算」判断规则当场更新') }}>标记纠错</Btn>
                <Btn onClick={() => { setFixed(true); message.info('已保留该条到本周') }}>仍然采用</Btn>
              </div>
              {fixed ? <p className="gg-fixed">已修正：同类「跨周误算」判断规则当场更新</p> : null}
            </div>
          ) : null}
        </Reveal>
      ) : null}

      <h2 className="gg-sec-h">逐人本周亮点<span className="gg-sec-n">只讲做过的事，不含定性评价</span></h2>
      <p className="gg-sec-sub">每条都可回溯到上面的信号，复制即可贴进周会纪要。</p>
      <div className="gg-people">
        {members.map((m, i) => (
          <Reveal key={m.name} className="gg-person" stagger={Math.min(i, 7)} glow>
            <div className="gg-p-head"><Ava name={m.name} /><b>{m.name}</b><span className="gg-p-tag">{m.role}</span></div>
            <p className="gg-p-hl">{m.hl}</p>
            <div className="gg-p-act">
              <Btn onClick={() => copy(m.hl)}>复制</Btn>
              <Btn note="静态演示：接入后可一键发钉钉消息表扬" onClick={() => message.info('静态演示：接入后可一键发钉钉消息表扬')}>表扬</Btn>
            </div>
          </Reveal>
        ))}
      </div>

      <h2 className="gg-sec-h">周知出口 · 一键周报<span className="gg-sec-n">由已核验进展自动成稿 · 只陈述事实</span></h2>
      <ReportInline go={go} />
    </div>
  )
}

function ReportInline({ go }: { go: (k: string) => void }) {
  const { message } = AntdApp.useApp()
  const draft = `【搜索与账号组 · 本周】
· 完成登录重构技术方案 v12，鉴权章节定稿（李工）
· Q3 测试机采购审批已过技术负责人（王姐）
· 搜索性能评审产出 5 条行动项，2 条本周启动（小赵）
风险：转正审批卡在 HR 已超时，需你催办。`
  return (
    <div className="gg-draft" data-glow="">
      <textarea rows={9} defaultValue={draft} aria-label="周报草稿" />
      <div className="gg-exit">
        <Btn tone="pri" size="lg" href={DOCS.周报草稿}>打开周报草稿（钉钉）↗</Btn>
        <Btn size="lg" note="静态演示：接入后发邮件" onClick={() => message.info('静态演示：接入后把周报发邮件给上级')}>邮件发上级</Btn>
        <Pill tone="on">来源可溯率 100%</Pill>
      </div>
      <button type="button" className="gg-mod-link" style={{ marginTop: 10 }} onClick={() => go('overview')}>回到总览 <span className="gg-ar">→</span></button>
    </div>
  )
}

/* ---------------- 同频 · 会议泳道 ---------------- */
function Sync() {
  useReveal('sync')
  return (
    <div>
      <PageHead
        eyebrow="同频 · 跨源进展与协作"
        title="一周会议泳道图"
        lede="把每个人一周的会议铺成「人 × 天」网格：谁被会挤爆、哪些议题撞在一起，一眼看清——帮你在周会前砍掉重复对齐。"
        pills={<>
          <Pill tone="on">共享日历 5 人</Pill>
          <Pill>未共享 1 人</Pill>
          <Pill>粗粒度忙闲，不越权</Pill>
        </>}
      />
      <SourceNotice text="部分日程源未共享（受权限限制）" />
      <div className="gg-legend">
        <span><i className="lg-n" />常规会</span>
        <span><i className="lg-r" />评审 / 决策</span>
        <span><i className="lg-x" />跨组会</span>
        <span><i className="lg-c" />同日撞车</span>
      </div>
      <div className="gg-scroll">
        <div className="gg-lane">
          <div className="gg-corner">人 \ 天</div>
          {['周一', '周二', '周三', '周四', '周五'].map((d, i) => (
            <div className="gg-col-h" key={d}>{`${d} ${dayDate(i)}`}</div>
          ))}
          {lane.map((row) => (
            <Fragment key={row.name}>
              <div className="gg-who"><Ava name={row.name} /><b>{row.name}</b></div>
              {row.shared ? row.cells.map((cell, i) => (
                <div className={`gg-cell${cell.length > 1 ? ' clash' : ''}`} key={`${row.name}-${i}`}>
                  {cell.length > 1 ? <span className="gg-clash">{`同日撞车 · ${cell.length} 场`}</span> : null}
                  {cell.map((m) => (
                    <a key={m.t} className={`gg-mtg ${m.c}`} href={linkForMeeting(m.t)} target="_blank" rel="noreferrer"
                       title={`打开《${m.t}》听记纪要`}>
                      <b>{m.t}</b>{m.h ? <span className="gg-mtg-h">{m.h}</span> : null}
                    </a>
                  ))}
                </div>
              )) : <div className="gg-blank">未向你共享日程 · 受权限限制不显示（不越权补全）</div>}
            </Fragment>
          ))}
        </div>
      </div>
      <div className="gg-duo">
        <Reveal className="gg-note ochre" glow>
          <h3>可合并</h3>
          <p>周三最挤：<b>{`小赵同日 2 场`}</b>，「搜索性能评审」与「迭代同步 · 站会」议题重叠，建议并成一场；<b>老周同日 2 场</b>，「扩容预算」与「故障复盘」可拆一场到周四。跨组周会共 3 条记录、分散在周二与周三两个时段，可并到同一场。</p>
        </Reveal>
        <Reveal className="gg-note">
          <h3>数据边界</h3>
          <p><b>诚实标注：</b>只含你可见 / 被共享的日程，未共享者显式标注为受限；跨人粒度多为「忙 / 闲」，不越权补全内容。</p>
        </Reveal>
      </div>
      <div className="gg-statband">
        <div><dt>会议条目</dt><dd>{meetingCount}<span>场</span></dd><p>5 位共享日历成员</p></div>
        <div className="warn"><dt>同日撞车</dt><dd>{overdueClashCount}<span>处</span></dd><p>小赵、老周 · 均在周三</p></div>
        <div><dt>评审 / 决策</dt><dd>{meetingEntries.filter((m) => m.c === 'r').length}<span>场</span></dd><p>{`跨组会 ${meetingEntries.filter((m) => m.c === 'x').length} · 常规会 ${meetingEntries.filter((m) => m.c === 'n').length}`}</p></div>
        <div><dt>不可见成员</dt><dd>{lane.filter((r) => !r.shared).length}<span>人</span></dd><p>小吴 · 未共享日程</p></div>
      </div>
      <p className="gg-tip">{`按天分布：${meetingsByDay.map((n, i) => `${['一', '二', '三', '四', '五'][i]} ${n}`).join(' · ')}（${dayDate(TODAY_INDEX)} 为今天）`}</p>
    </div>
  )
}
const overdueClashCount = lane.filter((r) => r.shared).reduce((n, r) => n + r.cells.filter((c) => c.length > 1).length, 0)

/* ---------------- 流转 · OA 全景 ---------------- */
function Flow() {
  useReveal('flow')
  const [cat, setCat] = useState('全部')
  const cats = ['全部', '待你处理', '已通过', '已超时']
  const inCat = (a: Approval) => {
    if (cat === '全部') return true
    if (cat === '待你处理') return a.node.includes('待你')
    return a.status === cat
  }
  const list = approvals.filter(inCat)
  const countOf = (c: string) => approvals.filter((a) => (c === '全部' ? true : c === '待你处理' ? a.node.includes('待你') : a.status === c)).length

  return (
    <div>
      <PageHead
        eyebrow="流转 · 团队审批动态全景"
        title="团队 OA 全景"
        lede="跨人的审批流转状态、卡点与时效聚合到一张表。按你可见与管理员权限范围取数，卡在你链上的排在最前；台账沉淀见「连表 · 表格信息」。"
        pills={<>
          <Pill tone="warn">{`待你处理 ${pendingApprovals.length}`}</Pill>
          <Pill tone="warn">{`已超时 ${overdueApprovals.length}`}</Pill>
          <Pill tone="on">{`已通过 ${passedApprovals.length}`}</Pill>
        </>}
      />
      <SourceNotice text="部分审批源拉取失败（跨组织 · 无权限）" />
      <LiquidTabs value={cat} className="gg-tabs gg-tabs-top">
        {cats.map((c) => (
          <button type="button" key={c} className="gg-tab" aria-pressed={cat === c} onClick={() => setCat(c)}>
            {c}<span className="gg-tab-n">{countOf(c)}</span>
          </button>
        ))}
        <span className="gg-count" aria-live="polite">{list.length === approvals.length ? `全部 ${approvals.length} 条` : `显示 ${list.length} 条 · 共 ${approvals.length} 条`}</span>
      </LiquidTabs>
      <div className="gg-scroll">
        <table className="gg-table">
          <caption className="gg-sr">团队审批列表</caption>
          <thead><tr><th>审批事项</th><th>当前节点</th><th>状态</th><th>时效</th><th>操作</th></tr></thead>
          <tbody>
            {list.map((a) => {
              const over = a.status === '已超时'
              return (
                <tr key={a.key}>
                  <td><div className="gg-t-title">{a.title}</div><div className="gg-t-sub">{`发起人 ${a.from}`}</div></td>
                  <td className="gg-t-sub">{a.node}</td>
                  <td><Dot kind="审批" /></td>
                  <td className={`gg-sla${over ? ' over' : ''}`}>{a.sla}</td>
                  <td>
                    <Btn tone={over ? 'ochre' : ''} href={APPROVAL_INSTANCE}>
                      {over ? '催办 · 打开审批单' : '去处理 · 打开审批单'} ↗
                    </Btn>
                  </td>
                </tr>
              )
            })}
            {list.length === 0 ? <tr><td colSpan={5} className="gg-empty">该状态下暂无可见审批</td></tr> : null}
          </tbody>
        </table>
      </div>
      <p className="gg-tip">窄屏时表格横向滚动；页面无横向溢出。</p>
      <div className="gg-duo">
        <Reveal className="gg-note ochre" glow>
          <h3>卡点提示</h3>
          <p>{overdueApprovals.map((a) => `「${a.title}」${a.sla}，卡在${a.node.split(' · ')[0]}`).join('；')}。两项都在你可见范围内可直接催办。</p>
        </Reveal>
        <Reveal className="gg-note">
          <h3>权限口径</h3>
          <p>列表按 OA 管理员权限聚合，仅覆盖你链上 + 权限范围内实例；跨组织审批显式标注为不可见，不绕过。</p>
        </Reveal>
      </div>
    </div>
  )
}

/* ---------------- 连表 · 表格信息（第六板块，连通钉钉 AI 表格） ---------------- */
function AiTableCard(props: {
  title: string; desc: string; url: string; sync: string
  columns: string[]; rows: { key: string; cells: ReactNode[] }[]; foot: ReactNode
}) {
  return (
    <Reveal className="gg-ledger" glow>
      <div className="gg-lg-head">
        <div>
          <h3>{props.title}</h3>
          <p>{props.desc}</p>
        </div>
        <div className="gg-lg-side">
          <span className="gg-sync"><i aria-hidden="true" />{props.sync}</span>
          <Btn tone="pri" href={props.url}>打开 AI 表格 ↗</Btn>
        </div>
      </div>
      <div className="gg-scroll gg-lg-table">
        <table className="gg-table">
          <caption className="gg-sr">{`${props.title}预览`}</caption>
          <thead><tr>{props.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {props.rows.map((r) => (
              <tr key={r.key}>{r.cells.map((c, i) => <td key={i}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="gg-lg-foot">{props.foot}</div>
    </Reveal>
  )
}

function Ledger() {
  useReveal('ledger')
  const money = (n: number) => `¥${n.toLocaleString('zh-CN')}`
  const pendingMoney = pendingApprovals.filter((a) => a.amount)
  return (
    <div>
      <PageHead
        eyebrow="连表 · 团队数据表格与 AI 表格联动"
        title="表格信息"
        lede="散在群聊与会议里的口头进度，落成表才谈得上共享与统计。已连通两张真实演示表——审批台账承接流转数据，Q3 测试计划表挂住里程碑与到期日，点开即真表核验。"
        pills={<>
          <Pill tone="on">{`${ledgerTableCount} 张数据表 · ${ledgerRecordCount} 条记录`}</Pill>
          <Pill>字段结构化 · 可筛选统计</Pill>
          <Pill tone="warn">个人空间演示库 · 仅你可见</Pill>
        </>}
      />

      <AiTableCard
        title="审批台账"
        desc={`OA 审批回流 · ${ledgerRows.length} 条记录 · ${ledgerFieldCount} 个字段（事项 / 发起人 / 节点 / 状态 / 滞留 / 金额 / 日期）`}
        url={AITABLE_LEDGER} sync="已同步 · 今天 09:30"
        columns={['审批事项', '状态', '时效', '金额', '发起日期']}
        rows={ledgerRows.map((a) => ({
          key: a.key,
          cells: [
            <><div className="gg-t-title">{a.title}</div><div className="gg-t-sub">{`发起人 ${a.from} · ${a.node}`}</div></>,
            <span className={`gg-dot ${ledgerStatusClass(a.status)}`}><i aria-hidden="true" />{a.status}</span>,
            <span className={`gg-sla${a.status === '已超时' ? ' over' : ''}`}>{a.sla}</span>,
            <span className="gg-t-sub">{a.amount ?? '—'}</span>,
            <span className="gg-sla">{a.date}</span>,
          ],
        }))}
        foot={<>
          <p>{`与流转 · OA 清单一一对应：含金额审批 ${pendingMoney.length} 单，共 ${money(ledgerAmount)}，全部待你处理；打开真表可再按状态 / 金额筛选统计。`}</p>
          <p className="gg-lg-bound">表位置 · 「千问大赛测试用」文件夹（你的个人空间）· 成员仅你一人，企业内其他用户不可见。</p>
        </>}
      />

      <AiTableCard
        title="Q3 测试计划表"
        desc={`${planRows.length} 条用例 · 5 个字段（用例名称 / 模块 / 负责人 / 状态 / 到期日）· 负责人与到期日已补齐`}
        url={AITABLE_Q3} sync="已同步 · 今天 09:42"
        columns={['用例名称', '状态', '模块', '负责人', '到期日']}
        rows={planRows.map((p) => ({
          key: p.key,
          cells: [
            <div className="gg-t-title">{p.name}</div>,
            <span className={`gg-dot ${planStatusClass(p.status)}`}><i aria-hidden="true" />{p.status}</span>,
            <span className="gg-t-sub">{p.module}</span>,
            <span className="gg-t-sub">{p.owner}</span>,
            <span className={`gg-sla${p.status === '阻塞' ? ' over' : ''}`}>{p.due}</span>,
          ],
        }))}
        foot={<>
          <p>{`里程碑「Q3 测试计划 80%」的 8 条记录就在这张表里；阻塞 ${planBlocked} 条正是依赖扩容预算的容量回归，卡点与流转 · OA 同源互证。`}</p>
          <p className="gg-lg-bound">单选状态 + 日期字段已结构化，接入后可挂看板与自动提醒；记录为职场有AI硅蜜模拟数据。</p>
        </>}
      />

      <div className="gg-statband">
        <div><dt>数据表</dt><dd>{ledgerTableCount}<span>张</span></dd><p>审批台账 + Q3 测试计划</p></div>
        <div><dt>记录</dt><dd>{ledgerRecordCount}<span>条</span></dd><p>{`台账 ${ledgerRows.length} · 计划 ${planRows.length}`}</p></div>
        <div className="warn"><dt>待你处理金额</dt><dd>{pendingMoney.length}<span>单</span></dd><p>{`共 ${money(ledgerAmount)}`}</p></div>
        <div><dt>计划进行中</dt><dd>{planRunning}<span>条</span></dd><p>{`阻塞 ${planBlocked} 条 · 卡在扩容预算`}</p></div>
      </div>
      <div className="gg-duo">
        <Reveal className="gg-note ochre" glow>
          <h3>为什么独立成板块</h3>
          <p>表格是其余主线的结构化出口：审批沉淀成台账、测试计划挂住里程碑。单列板块后，记录数、字段、可见性一屏说清，口径只维护一处。</p>
        </Reveal>
        <Reveal className="gg-note">
          <h3>权限与边界</h3>
          <p>演示库建在<b>你的个人空间「千问大赛测试用」文件夹</b>内，成员仅你一人，企业内其他钉钉用户不可见；表内内容为虚构企业模拟数据，点开真表即可核验。</p>
        </Reveal>
      </div>
    </div>
  )
}

/* ---------------- 笔耕 · 文档动态 ---------------- */
function Docs() {
  useReveal('docs')
  const byDay = ['周一', '周二', '周三', '周四', '周五']
    .map((d) => ({ day: d, items: docUpdates.filter((x) => x.day === d) }))
    .filter((g) => g.items.length)
  return (
    <div>
      <PageHead
        eyebrow="笔耕 · 团队文档创作与更新动态"
        title="本周文档"
        lede="本周谁新增、上传、改版、分享了什么，按天归集；每条可跳回原文核验版本历史。"
        pills={<>
          <Pill tone="on">{`${docCount} 次更新`}</Pill>
          <Pill>编辑 4 · 上传 1 · 新建 1 · 分享 1</Pill>
          <Pill tone="warn">未共享不显示</Pill>
        </>}
      />
      <SourceNotice text="部分文档节点未共享（受权限限制）" />
      <p className="gg-tip">{`本周共 ${docCount} 次文档动作 · 按天归集 · 仅显示你可见与被共享范围 · ${docsByDay.join(' / ')}`}</p>
      {byDay.map((g) => (
        <div key={g.day}>
          <div className="gg-day-h">{`${g.day} ${dayDate(['周一', '周二', '周三', '周四', '周五'].indexOf(g.day))}`}</div>
          <div className="gg-tl">
            {g.items.map((d, i) => (
              <Reveal key={d.name} className="gg-tl-item" stagger={Math.min(i, 7)}>
                <div className="gg-tl-t">{d.name}</div>
                <div className="gg-tl-m">{`${d.time} · ${d.person} · ${d.act}`}
                  <a className="gg-ext-inline" href={linkForTitle(d.name) ?? DOCS.演示文件夹} target="_blank" rel="noreferrer">打开原文 · 版本历史 ↗</a></div>
              </Reveal>
            ))}
          </div>
        </div>
      ))}
      <div className="gg-duo">
        <Reveal className="gg-note" glow>
          <h3>权限口径</h3>
          <p><b>未共享给你的文档不显示。</b>这里只出现你可见 / 被共享的库与目录，无权限处显式标注而非绕过、也不用其他信号推算。</p>
        </Reveal>
        <Reveal className="gg-note">
          <h3>为什么值得单独一屏</h3>
          <p>文档是团队唯一留痕的进展。周会上说不清「这周到底交付了什么」，多半是文档动态没被看见。</p>
        </Reveal>
      </div>
    </div>
  )
}

/* ---------------- 设置 · 透明与边界 ---------------- */
function Settings() {
  useReveal('settings')
  return (
    <div>
      <PageHead
        eyebrow="设置 · 数据源与合规"
        title="透明与边界"
        lede="硅基罗盘只以你本人权限取数，团队知情、自愿共享，不做监控。"
        pills={<Pill tone="on">合规优先设计</Pill>}
      />
      <div className="gg-rows">
        {dataSources.map((s, i) => (
          <Reveal key={s.name} className="gg-row" stagger={Math.min(i, 7)}>
            <span className={`gg-dot ${s.ok ? 'k-sage' : 'k-ochre'}`}><i aria-hidden="true" />{s.ok ? '可见' : '受限'}</span>
            <div className="gg-row-main">
              <h3>{s.name}</h3>
              <p>{s.scope}</p>
            </div>
            <div className="gg-row-side">
              {SOURCE_LINKS[s.name]
                ? <a className="gg-ext-title" href={SOURCE_LINKS[s.name]} target="_blank" rel="noreferrer">打开示例对象 ↗</a>
                : <span className="gg-src">{s.ok ? '正常拉取' : '不越权补全'}</span>}
            </div>
          </Reveal>
        ))}
      </div>
      <div className="gg-duo">
        <Reveal className="gg-note ochre" glow>
          <h3>考勤的精确边界</h3>
          <p>实测：<b>本人打卡记录可读</b>（attendance check-record 对自己的 userId 正常返回），但<b>他人 / 下属的 selfsetting 连管理员都不可代理</b>。因此「管理者看板看下属全量活动」在权限层不成立——我们按人显式标注，而不是绕过。</p>
        </Reveal>
        <Reveal className="gg-note">
          <h3>数据性质</h3>
          <p>站内人名、审批、会议、文档内容均为虚构企业「职场有AI硅蜜有限公司」的模拟数据；「打开原文 / 纪要 / 审批单」跳转到你钉钉里的真实演示对象，需浏览器已登录钉钉网页版。</p>
        </Reveal>
      </div>
    </div>
  )
}

/* ---------------- 外壳：左侧栏 + 内容列 ---------------- */
type NavItem = { key: string; label: string; num: string; note?: string }
const NAV: NavItem[] = [
  { key: 'overview', label: '总览', num: '01' },
  { key: 'dashboard', label: '周知 · 驾驶舱', num: '02', note: `${signals.length}` },
  { key: 'sync', label: '同频 · 协作', num: '03', note: `${meetingCount}` },
  { key: 'flow', label: '流转 · OA', num: '04', note: `${pendingApprovals.length}` },
  { key: 'docs', label: '笔耕 · 文档', num: '05', note: `${docCount}` },
  { key: 'ledger', label: '连表 · 表格信息', num: '06', note: `${ledgerRecordCount}` },
  { key: 'settings', label: '边界与规范', num: '07' },
]

function SideNav({ active, onPick }: { active: string; onPick: (k: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const box = useLiquid(ref, active)
  return (
    <div className="gg-nav" ref={ref}>
      <span className="gg-liq" aria-hidden="true"
            style={{ transform: `translate3d(${box.x}px,${box.y}px,0)`, width: box.w, height: box.h }} />
      {NAV.map((n) => (
        <button type="button" key={n.key} className="gg-nav-item" aria-current={active === n.key ? 'page' : undefined}
                onClick={() => onPick(n.key)}>
          <span className="gg-nav-k">{n.num}</span>{n.label}{n.note ? <span className="gg-nav-n">{n.note}</span> : null}
        </button>
      ))}
    </div>
  )
}

function Shell() {
  const [key, setKey] = useState('overview')
  usePointerGlow()
  const screens: Record<string, ReactNode> = {
    overview: <Overview go={setKey} />,
    dashboard: <Dashboard go={setKey} />,
    sync: <Sync />,
    flow: <Flow />,
    docs: <Docs />,
    ledger: <Ledger />,
    settings: <Settings />,
  }
  return (
    <div className="gg-shell">
      <aside className="gg-side">
        <button type="button" className="gg-brand" onClick={() => setKey('overview')} title="回到总览">
          <span className="gg-dial" aria-hidden="true" /><span className="gg-brand-t">硅基罗盘</span>
        </button>
        <div className="gg-brand-sub">钉钉聚合 · 一站式工作台<br />管理者视角</div>
        <div className="gg-side-hr" />
        <div className="gg-side-cap">五条主线</div>
        <SideNav active={key} onPick={setKey} />
        <div className="gg-side-foot">
          <div className="gg-side-user"><Ava name="陈" />陈 · 团队负责人</div>
          <div className="gg-side-stat"><i aria-hidden="true" />数据源 · 仅你可见范围</div>
          <div className="gg-side-stat warn"><i aria-hidden="true" />模拟数据 · 静态演示</div>
        </div>
      </aside>
      <div className="gg-col">
        <main className="gg-main" key={key}>{screens[key]}</main>
        <footer className="gg-foot">
          <div><h5>演示性质</h5><p>本页面为<b>静态设计演示</b>，未接入钉钉后端；复制、催办、表扬、生成周报等动作仅弹出提示，不产生真实写入。所有人名、审批、会议、文档均为虚构企业「职场有AI硅蜜有限公司」（500 人软件公司）的模拟数据。</p></div>
          <div><h5>数据边界</h5><p>仅取你可见 / 被共享范围，权限不可代看处以「受限」显式标注，不越权补全、不以其他数据源推算。</p></div>
          <div><h5>视觉规范</h5><p>暖纸张编辑型门户 + 安静弹簧动效（ai-opc-hub-editorial-motion）。衬线标题、发丝线结构、单主色单辅色、减少动效可直接阅读。</p></div>
        </footer>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <AntdApp>
        <Shell />
      </AntdApp>
    </ConfigProvider>
  )
}
