import {
  approvals, clashes, dataSources, dayDate, docCount, docUpdates, docsByDay, exposureAmount,
  kindCount, lateTodoCount, loadByPerson, meetingCount, meetingsByDay, milestoneAvg, milestones,
  overdueApprovals, passedApprovals, pendingApprovals, signals, signalsByDay, teamLoad, TODAY_INDEX,
  upcomingDays,
} from './data'
import { Btn, Kpi, PageHead, Pill, Reveal, Spark, useReveal } from './ui'
import { APPROVAL_INSTANCE, linkForMeeting, linkForTitle, TODO_DETAIL } from './links'

const yuan = (n: number) => `¥${n.toLocaleString('zh-CN')}`

export default function Overview({ go }: { go: (k: string) => void }) {
  useReveal('overview')
  const money = yuan(exposureAmount)
  const busiest = Math.max(...meetingsByDay)

  return (
    <div className="gg-dense">
      <PageHead
        eyebrow="总览 · 管理者视角"
        title="本周经营与团队快照"
        lede="四条主线的精华聚到一屏：谁在推进、什么卡在你这里、今明后天怎么排、留痕是否跟上。每个数字都可点进对应主线核验出处。"
        pills={<>
          <Pill tone="on">本周 09/07 – 09/11</Pill>
          <Pill>{`基准日 今天 ${dayDate(TODAY_INDEX)} 周三`}</Pill>
          <Pill>{`${dataSources.length} 类数据源 · ${dataSources.filter((s) => s.ok).length} 可见 ${dataSources.filter((s) => !s.ok).length} 受限`}</Pill>
          <Pill tone="warn">模拟数据</Pill>
        </>}
      />

      <Reveal className="gg-tsum" glow>
        <b>本周结论</b>
        <p>
          交付面正常（{signals.length} 条信号、{docCount} 次文档留痕，均较上周上升）；
          <b>{`瓶颈在审批`}</b>——{pendingApprovals.length} 项等你处理、{overdueApprovals.length} 项已超时，合计金额敞口 {money}；
          会议负荷集中在{`周${'一二三四五'[meetingsByDay.indexOf(busiest)]}`}（{busiest} 场 / 占 {Math.round((busiest / meetingCount) * 100)}%），
          {clashes.map((c) => c.name).join(' 与 ')} 各自同日 2 场，建议当场砍并。
        </p>
      </Reveal>

      <div className="gg-kpis">
        <Kpi label="本周交付信号" value={signals.length} unit="条" delta={`▲ 较上周 +${signals.length - 5} 条`}>
          <Spark values={signalsByDay} />
        </Kpi>
        <Kpi label="待你处理审批" value={pendingApprovals.length} unit="项" delta={`敞口 ${money}`} warn />
        <Kpi label="待办逾期" value={lateTodoCount} unit="项" delta="逾期 1 天后已补交" warn={lateTodoCount > 0} />
        <Kpi label="会议负荷" value={meetingCount} unit="场" delta={`周三 ${busiest} 场 · 占 ${Math.round((busiest / meetingCount) * 100)}%`} warn>
          <Spark values={meetingsByDay} warnAt={meetingsByDay.indexOf(busiest)} />
        </Kpi>
        <Kpi label="文档留痕" value={docCount} unit="次" delta={`▲ 较上周 +${docCount - 5} 次`}>
          <Spark values={docsByDay} />
        </Kpi>
        <Kpi label="里程碑平均进度" value={milestoneAvg} unit="%" delta={`${milestones.length} 在途 · ${milestones.filter((m) => m.late).length} 滞后`} warn />
        <Kpi label="风险项" value={overdueApprovals.length} unit="项" delta="均为审批超时" warn />
      </div>

      <div className="gg-cockpit">
        {/* 需要你拍板 */}
        <Reveal as="section" className="gg-mod gg-sp5" glow>
          <div className="gg-mod-h">
            <span className="gg-mod-tag">04 流转</span>
            <h3>需要你拍板</h3>
            <button type="button" className="gg-mod-link" onClick={() => go('flow')}>OA 全景 <span className="gg-ar">→</span></button>
          </div>
          <div className="gg-mod-sub">
            {`${pendingApprovals.length} 项待你处理 · ${overdueApprovals.length} 项已超时需催办 · ${passedApprovals.length} 项本周通过 · 覆盖 ${kindCount} 类信号`}
          </div>
          {[...pendingApprovals, ...overdueApprovals].map((a) => {
            const mine = a.node.includes('待你')
            return (
              <div className="gg-mini" key={a.key}>
                <div className="gg-m-main">
                  <a className="gg-m-t gg-ext-title" href={APPROVAL_INSTANCE} target="_blank" rel="noreferrer">{`${a.title} ↗`}</a>
                  <div className="gg-m-m">{`${a.from} 发起 · ${a.node.replace(' · ', ' ')} · ${mine ? (a.amount ?? '金额未填') : '需你催办'}`}</div>
                </div>
                <span className={`gg-m-r ${mine ? 'ok' : 'over'}`}>{a.sla}</span>
              </div>
            )
          })}
          <div className="gg-mod-foot" style={{ marginBottom: 0 }}>{`本周已通过 ${passedApprovals.length} 项`}</div>
          {passedApprovals.map((a) => (
            <div className="gg-mini" key={a.key}>
              <div className="gg-m-main">
                <a className="gg-m-t gg-ext-title" href={APPROVAL_INSTANCE} target="_blank" rel="noreferrer">{`${a.title} ↗`}</a>
                <div className="gg-m-m">{`${a.from} 发起 · ${a.node}`}</div>
              </div>
              <span className="gg-m-r ok">{a.sla}</span>
            </div>
          ))}
          <div className="gg-mod-foot">超时项不在你链上，只能催办；跨组织实例按权限不显示。</div>
        </Reveal>

        {/* 接下来三天 */}
        <Reveal as="section" className="gg-mod gg-sp4" glow>
          <div className="gg-mod-h">
            <span className="gg-mod-tag">03 同频</span>
            <h3>接下来三天</h3>
            <button type="button" className="gg-mod-link" onClick={() => go('sync')}>整周泳道 <span className="gg-ar">→</span></button>
          </div>
          <div className="gg-mod-sub">5 位共享日历成员 · 未共享者不计入</div>
          <div className="gg-days3">
            {upcomingDays.map((d, i) => (
              <div className={`gg-daycol${i === 0 ? ' today' : ''}`} key={d.day}>
                <div className="gg-dc-h"><b>{d.label}</b><span className="gg-dc-n">{d.slots.length} 场</span></div>
                <div className="gg-dc-d">{`${d.date} ${d.day}`}</div>
                {d.slots.length === 0 ? <span className="gg-slot free">无会议安排</span> : d.slots.map((m, j) => (
                  <a className="gg-slot" key={`${m.t}-${j}`} href={linkForMeeting(m.t)} target="_blank" rel="noreferrer"
                     title={`打开《${m.t}》听记纪要`}>
                    {m.h ? <span className="gg-slot-tm">{m.h}</span> : null}
                    {m.t}<span className="gg-slot-who"> · {m.who}</span>
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div className="gg-mod-foot">
            {`周三 ${busiest} 场最挤：${clashes.map((c) => `${c.name}（${c.day} ${c.n} 场）`).join('、')}。建议合并「搜索性能评审 + 迭代同步 · 站会」。`}
          </div>
        </Reveal>

        {/* 文档动态线 */}
        <Reveal as="section" className="gg-mod gg-sp3" glow>
          <div className="gg-mod-h">
            <span className="gg-mod-tag">05 笔耕</span>
            <h3>文档动态线</h3>
            <button type="button" className="gg-mod-link" onClick={() => go('docs')}>全部 <span className="gg-ar">→</span></button>
          </div>
          <div className="gg-mod-sub">编辑 4 · 上传 1 · 新建 1 · 分享 1</div>
          {[...docUpdates].reverse().slice(0, 6).map((d) => (
            <div className="gg-mini" key={`${d.name}-${d.time}`}>
              <div className="gg-m-main">
                <a className="gg-m-t gg-ext-title" href={linkForTitle(d.name) ?? TODO_DETAIL} target="_blank" rel="noreferrer">{`${d.name} ↗`}</a>
                <div className="gg-m-m">{`${d.person} · ${d.act}`}</div>
              </div>
              <span className="gg-m-r ok">{d.time}</span>
            </div>
          ))}
          <div className="gg-mod-foot">未共享给你的文档不显示，也不绕过。</div>
        </Reveal>

        {/* 团队负荷 */}
        <Reveal as="section" className="gg-mod gg-sp4" glow>
          <div className="gg-mod-h">
            <span className="gg-mod-tag">02 周知</span>
            <h3>团队负荷</h3>
            <button type="button" className="gg-mod-link" onClick={() => go('dashboard')}>逐人亮点 <span className="gg-ar">→</span></button>
          </div>
          <div className="gg-mod-sub">本周可见动作计数 · 只反映产出量，不做绩效评价</div>
          <table className="gg-htable">
            <thead><tr><th>成员</th><th>会议</th><th>文档</th><th>发起</th><th>信号</th><th>合计</th></tr></thead>
            <tbody>
              {[...teamLoad]
                .sort((a, b) => sum(loadByPerson[b]) - sum(loadByPerson[a]))
                .map((n) => {
                  const v = loadByPerson[n]
                  return (
                    <tr key={n}>
                      <td>{n}{v.shared ? '' : <sup>†</sup>}</td>
                      <td>{v.meet || '—'}</td><td>{v.doc}</td><td>{v.appr}</td><td>{v.sig}</td><td><b>{sum(v)}</b></td>
                    </tr>
                  )
                })}
              <tr className="sum"><td>你 · 负责人</td>
                <td>{loadByPerson['你'].meet}</td><td>{loadByPerson['你'].doc}</td>
                <td>{loadByPerson['你'].appr}</td><td>{loadByPerson['你'].sig}</td><td><b>{sum(loadByPerson['你'])}</b></td>
              </tr>
            </tbody>
          </table>
          <div className="gg-legend-mini">
            <span>{`全组：会议 ${meetingCount} · 文档 ${docCount} · 审批单 ${approvals.length} · 信号 ${signals.length}`}</span>
            <span>† 小吴日程未共享，仅计文档与审批</span>
          </div>
        </Reveal>

        {/* 里程碑 */}
        <Reveal as="section" className="gg-mod gg-sp4" glow>
          <div className="gg-mod-h">
            <span className="gg-mod-tag">项目</span>
            <h3>里程碑进度</h3>
            <button type="button" className="gg-mod-link" onClick={() => go('dashboard')}>来源核验 <span className="gg-ar">→</span></button>
          </div>
          <div className="gg-mod-sub">进度为演示模拟值 · 接入后由项目字段回填</div>
          {milestones.map((m) => (
            <div className="gg-mst" key={m.name}>
              <div className="gg-mst-h"><b>{m.name}</b><span className="gg-mst-own">{m.owner}</span>
                <span className={`gg-mst-pc${m.late ? ' warn' : ''}`}>{m.pct}%</span></div>
              <div className="gg-prog"><i className={m.late ? 'warn' : ''} style={{ width: `${m.pct}%` }} /></div>
              <div className="gg-mst-m">{m.note}</div>
            </div>
          ))}
        </Reveal>

        {/* 风险与数据源 */}
        <Reveal as="section" className="gg-mod gg-sp4" glow>
          <div className="gg-mod-h">
            <span className="gg-mod-tag">预警</span>
            <h3>风险与数据源</h3>
            <button type="button" className="gg-mod-link" onClick={() => go('settings')}>边界 <span className="gg-ar">→</span></button>
          </div>
          <div className="gg-mod-sub">事实与推断分开 · 仅用你本人权限取数</div>
          {overdueApprovals.map((a) => (
            <div className="gg-risk" key={a.key}>
              <span className="gg-rk" aria-hidden="true" />
              <div><b>{`${a.title}超时${a.sla.replace('超时 ', '')}`}</b>
                <p>{`${a.from} 发起 · ${a.node}。推断：需你催办或提前沟通节点处理人。`}</p></div>
            </div>
          ))}
          <div className="gg-risk">
            <span className="gg-rk sage" aria-hidden="true" />
            <div><b>{`周三会议密度占 ${Math.round((busiest / meetingCount) * 100)}%`}</b>
              <p>{`${busiest} 场集中，${clashes.length} 人同日 2 场。建议：合并搜索性能评审与站会。`}</p></div>
          </div>
          <div className="gg-mod-foot">数据源健康 · 最近拉取 10:40</div>
          {dataSources.map((s) => (
            <div className={`gg-srcdot${s.ok ? '' : ' lim'}`} key={s.name}>
              <i aria-hidden="true" />{s.name}<span className="gg-srcdot-r">{s.ok ? '可见' : '受限'}</span>
            </div>
          ))}
          <div className="gg-mod-foot">2 个数据源拉取失败已跳过，仅显示你可访问范围。</div>
        </Reveal>
      </div>

      <div className="gg-exit">
        <Btn tone="pri" size="lg" arrow onClick={() => go('dashboard')}>看完整驾驶舱</Btn>
        <Btn size="lg" onClick={() => go('dashboard')}>生成经营周报</Btn>
        <Pill tone="on">计数与柱图由 mock 数据实时算出 · 环比、金额、里程碑进度为演示模拟值</Pill>
      </div>
    </div>
  )
}

const sum = (v: { meet: number; doc: number; appr: number; sig: number }) => v.meet + v.doc + v.appr + v.sig
