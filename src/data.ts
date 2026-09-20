/**
 * 演示数据：全部为虚构企业「职场有AI硅蜜有限公司」（500 人软件公司 · 搜索与账号组）的模拟数据，
 * 不接入任何真实钉钉账号。口径统一在这里计算，页面只消费派生值，避免计数与数据不一致。
 */
export type Signal = {
  id: string; kind: string; title: string; person: string
  detail: string; source: string; day: string; time: string
}

export const signals: Signal[] = [
  { id: 's1', kind: '文档', title: '更新《登录重构 · 技术方案》', person: '李工', detail: '修订接口鉴权章节，补 3 张时序图', source: '钉钉文档', day: '周三', time: '14:20' },
  { id: 's2', kind: '审批', title: '通过「Q3 测试机采购」审批', person: '王姐', detail: '发起 · 到你链上，金额 ¥48,000', source: 'OA 审批', day: '周二', time: '10:05' },
  { id: 's3', kind: '会议', title: '主持「搜索性能」评审', person: '小赵', detail: '生成 5 条行动项，2 条指派给你团队', source: 'AI 听记', day: '周四', time: '15:00' },
  { id: 's4', kind: '待办', title: '完成待办「补充迁移用例」', person: '李工', detail: '逾期 1 天后本周补交', source: '待办', day: '周五', time: '09:40' },
  { id: 's5', kind: '表格', title: '更新《Q3 测试计划表》8 条记录', person: '王姐', detail: '补齐负责人与到期日', source: '钉钉多维表', day: '周二', time: '11:30' },
  { id: 's6', kind: '日程', title: '新建里程碑「灰度上线」评审', person: '你', detail: '已邀请 4 位参会人', source: '日程', day: '周一', time: '09:00' },
  { id: 's7', kind: '文档', title: '创建《推荐召回 · AB 实验设计》', person: '小陈', detail: '初稿完成，待评审', source: '钉钉文档', day: '周四', time: '10:15' },
  { id: 's8', kind: '审批', title: '发起「服务器扩容」预算审批', person: '老周', detail: '¥120,000 · 到财务节点', source: 'OA 审批', day: '周三', time: '16:40' },
]

export type Member = { name: string; role: string; hl: string }
export const members: Member[] = [
  { name: '李工', role: '技术', hl: '本周产出技术方案 v12 + 迁移用例，鉴权章节文档化清晰。' },
  { name: '王姐', role: '测试', hl: '推进测试机采购审批落地，跨部门对齐 2 次会议。' },
  { name: '小赵', role: '搜索', hl: '主持搜索性能评审，拆出 5 条行动项并跟进 2 条。' },
  { name: '小陈', role: '推荐', hl: '独立完成推荐召回 AB 实验设计初稿，主动约评审。' },
  { name: '老周', role: '运维', hl: '牵头服务器扩容方案与预算，风险前置同步到位。' },
  { name: '小吴', role: '值班', hl: '本周值班稳定，处理 3 起线上告警，无越级。' },
]

export type Approval = {
  key: string; title: string; from: string; node: string
  status: '审批中' | '已通过' | '已超时'; sla: string; days: number; amount?: string
}
export const approvals: Approval[] = [
  { key: 'a1', title: 'Q3 测试机采购', from: '王姐', node: '部门审批 · 待你处理', status: '审批中', sla: '已 2 天', days: 2, amount: '¥48,000' },
  { key: 'a2', title: '线上灰度发布申请', from: '李工', node: '技术负责人 · 已通过', status: '已通过', sla: '0.5 天', days: 0.5 },
  { key: 'a3', title: '试用期转正', from: '小赵', node: 'HR 复核 · 卡住', status: '已超时', sla: '超时 3 天', days: 3 },
  { key: 'a4', title: '市场物料预算追加', from: '陈敏', node: '财务 · 待你处理', status: '审批中', sla: '已 1 天', days: 1 },
  { key: 'a5', title: '服务器扩容预算', from: '老周', node: '财务 · 待你处理', status: '审批中', sla: '已 1 天', days: 1, amount: '¥120,000' },
  { key: 'a6', title: '技术分享会报销', from: '小陈', node: '已归档', status: '已通过', sla: '1.2 天', days: 1.2 },
  { key: 'a7', title: '外包供应商准入', from: '小吴', node: '采购复核 · 卡住', status: '已超时', sla: '超时 5 天', days: 5 },
]

export type DocUpdate = { name: string; person: string; act: string; day: string; time: string }
export const docUpdates: DocUpdate[] = [
  { name: '《值班手册》', person: '小吴', act: '更新告警处置', day: '周一', time: '15:40' },
  { name: '《Q3 测试计划表》', person: '王姐', act: '多维表更新 8 条记录', day: '周二', time: '11:30' },
  { name: '《登录重构 · 技术方案》', person: '李工', act: '编辑 v12 · 鉴权章节', day: '周三', time: '14:20' },
  { name: '《服务器扩容方案》', person: '老周', act: '编辑 v3', day: '周三', time: '17:00' },
  { name: '《推荐召回 · AB 实验设计》', person: '小陈', act: '新建初稿 · 待评审', day: '周四', time: '10:15' },
  { name: '《搜索性能评审纪要》', person: '小赵', act: '上传 · AI 听记导出', day: '周四', time: '16:10' },
  { name: '《新人入职指引》', person: '你', act: '分享给团队', day: '周五', time: '09:00' },
]

export const days = ['周一', '周二', '周三', '周四', '周五'] as const
/** 演示基准日：以本周三为「今天」 */
export const TODAY_INDEX = 2
export const dayDate = (i: number) => `09/${String(7 + i).padStart(2, '0')}`

export type Meeting = { t: string; h: string; c: 'n' | 'r' | 'x' }
export type LaneRow = { name: string; shared: boolean; cells: Meeting[][] }
export const lane: LaneRow[] = [
  { name: '李工', shared: true, cells: [[], [{ t: '需求对齐', h: '10:00', c: 'n' }], [], [{ t: '方案评审', h: '14:00', c: 'r' }], []] },
  { name: '王姐', shared: true, cells: [[{ t: '采购审批', h: '10:00', c: 'r' }], [{ t: '跨组周会', h: '15:00', c: 'x' }], [{ t: '供应商', h: '11:00', c: 'n' }], [], [{ t: '复盘', h: '16:00', c: 'n' }]] },
  { name: '小赵', shared: true, cells: [[], [{ t: '跨组周会', h: '15:00', c: 'x' }], [{ t: '搜索性能评审', h: '10:00', c: 'r' }, { t: '迭代同步 · 站会', h: '', c: 'n' }], [{ t: '1:1 · 你', h: '13:00', c: 'n' }], []] },
  { name: '小陈', shared: true, cells: [[], [{ t: 'AB 实验设计', h: '11:00', c: 'r' }], [{ t: '跨组周会', h: '15:00', c: 'x' }], [], [{ t: '评审 · 召回', h: '10:00', c: 'r' }]] },
  { name: '老周', shared: true, cells: [[{ t: '容量评估', h: '09:30', c: 'n' }], [], [{ t: '扩容预算', h: '14:00', c: 'r' }, { t: '故障复盘', h: '16:00', c: 'x' }], [], [{ t: '周会', h: '15:00', c: 'n' }]] },
  { name: '小吴', shared: false, cells: [[], [], [], [], []] },
]

/* ---------- 连表 · 审批台账（与钉钉 AI 表格演示库同源） ---------- */
/** 发起日期与真实演示库「审批台账（硅基罗盘演示）」的记录逐条对齐 */
const ledgerDates: Record<string, string> = {
  a1: '09/08', a2: '09/09', a3: '09/06', a4: '09/09', a5: '09/09', a6: '09/07', a7: '09/04',
}
export type LedgerRow = Approval & { date: string }
export const ledgerRows: LedgerRow[] = approvals.map((a) => ({ ...a, date: ledgerDates[a.key] ?? '—' }))
export const ledgerAmount = ledgerRows.reduce((sum, a) => sum + (a.amount ? Number(a.amount.replace(/[^0-9]/g, '')) : 0), 0)
export const ledgerFieldCount = 7

/** 台账预览里的状态标记：只用两色 + 文字，与 Dot 同一语法 */
export const ledgerStatusClass = (s: Approval['status']) =>
  s === '已通过' ? 'k-sage' : s === '已超时' ? 'k-ochre' : 'k-ochre-o'

/** Q3 测试计划：与 Base 内「Q3 测试计划表」8 条记录同源，负责人与到期日已补齐 */
export type PlanRow = {
  key: string; name: string; module: string; owner: string
  status: '未开始' | '进行中' | '已完成' | '阻塞'; due: string
}
export const planRows: PlanRow[] = [
  { key: 'p1', name: '登录重构 · 鉴权接口回归', module: '账号', owner: '王姐', status: '进行中', due: '09/11' },
  { key: 'p2', name: '迁移用例补充 · 账号域', module: '账号', owner: '李工', status: '已完成', due: '09/10' },
  { key: 'p3', name: '搜索性能 · P95 压测', module: '搜索', owner: '小赵', status: '进行中', due: '09/12' },
  { key: 'p4', name: '推荐召回 · AB 埋点校验', module: '推荐', owner: '小陈', status: '未开始', due: '09/18' },
  { key: 'p5', name: '灰度发布 · 冒烟用例', module: '发布', owner: '王姐', status: '未开始', due: '09/15' },
  { key: 'p6', name: '扩容 · 容量回归', module: '运维', owner: '老周', status: '阻塞', due: '09/16' },
  { key: 'p7', name: '值班告警 · 处置演练', module: '值班', owner: '小吴', status: '进行中', due: '09/10' },
  { key: 'p8', name: '测试机到货 · 台架验证', module: '测试环境', owner: '王姐', status: '未开始', due: '09/19' },
]
export const planStatusClass = (s: PlanRow['status']) =>
  s === '已完成' ? 'k-sage' : s === '进行中' ? 'k-sage-o' : s === '阻塞' ? 'k-ochre' : 'k-ink-o'
export const planRunning = planRows.filter((p) => p.status === '进行中').length
export const planBlocked = planRows.filter((p) => p.status === '阻塞').length
export const ledgerTableCount = 2
export const ledgerRecordCount = ledgerRows.length + planRows.length

/* ---------- 派生口径：所有计数由数据算出，不再手写 ---------- */
export const kindCount = new Set(signals.map((s) => s.kind)).size
export const pendingApprovals = approvals.filter((a) => a.node.includes('待你'))
export const overdueApprovals = approvals.filter((a) => a.status === '已超时')
export const passedApprovals = approvals.filter((a) => a.status === '已通过')
export const meetingEntries = lane.filter((r) => r.shared).flatMap((r) => r.cells.flat())
export const meetingCount = meetingEntries.length
export const docCount = docUpdates.length
export const lateTodoCount = signals.filter((s) => s.detail.includes('逾期')).length
export const exposureAmount = pendingApprovals.reduce((sum, a) => sum + (a.amount ? Number(a.amount.replace(/[^0-9]/g, '')) : 0), 0)

/** 同日撞车：某人某天 ≥2 场 */
export const clashes = lane.filter((r) => r.shared).flatMap((r) =>
  r.cells.map((c, i) => ({ name: r.name, day: days[i], n: c.length })).filter((x) => x.n > 1),
)
export const meetingsByDay = days.map((_, i) =>
  lane.filter((r) => r.shared).reduce((n, r) => n + r.cells[i].length, 0),
)
export const signalsByDay = days.map((d) => signals.filter((s) => s.day === d).length)
export const docsByDay = days.map((d) => docUpdates.filter((x) => x.day === d).length)
export const busiestShare = Math.round((Math.max(...meetingsByDay) / meetingCount) * 100)

/** 每人负荷：会议 / 文档 / 发起审批 / 信号，只反映产出量 */
export type Load = { meet: number; doc: number; appr: number; sig: number; shared: boolean }
export const loadByPerson: Record<string, Load> = Object.fromEntries(
  [...members.map((m) => m.name), '你', '陈敏'].map((name) => [name, {
    meet: lane.find((r) => r.name === name && r.shared)?.cells.flat().length ?? 0,
    doc: docUpdates.filter((d) => d.person === name).length,
    appr: approvals.filter((a) => a.from === name).length,
    sig: signals.filter((s) => s.person === name).length,
    shared: lane.find((r) => r.name === name)?.shared ?? false,
  }]),
)
export const teamLoad = members.map((m) => m.name).filter((n) => n in loadByPerson)

/** 接下来三天的会议（含人），按时间排序 */
export const upcomingDays = [0, 1, 2].map((off) => {
  const i = TODAY_INDEX + off
  const slots = lane.filter((r) => r.shared).flatMap((r) => r.cells[i].map((m) => ({ ...m, who: r.name })))
  return { label: ['今天', '明天', '后天'][off], day: days[i], date: dayDate(i), slots: slots.sort((a, b) => a.h.localeCompare(b.h)) }
})

/** 里程碑：进度为演示模拟值，接入后由项目字段回填 */
export type Milestone = { name: string; owner: string; pct: number; note: string; late: boolean }
export const milestones: Milestone[] = [
  { name: '登录重构 · 技术方案', owner: '李工', pct: 85, note: 'v12 鉴权章节已定稿，待终审', late: false },
  { name: 'Q3 测试计划', owner: '王姐', pct: 80, note: '8 条记录已补齐负责人与到期日', late: false },
  { name: '灰度上线里程碑', owner: '你', pct: 68, note: '评审日程已建 · 邀请 4 人', late: false },
  { name: '服务器扩容', owner: '老周', pct: 45, note: '预算审批中 ¥120,000 · 卡财务', late: true },
  { name: '推荐召回 AB 实验', owner: '小陈', pct: 30, note: '初稿完成，待评审后启动', late: true },
]
export const milestoneAvg = Math.round(milestones.reduce((s, m) => s + m.pct, 0) / milestones.length)

export const dataSources = [
  { name: '钉钉文档 / 云盘', scope: '你可见 / 被共享的节点', ok: true },
  { name: 'AI 听记（会议纪要）', scope: '你参加或被共享的会议', ok: true },
  { name: 'OA 审批', scope: '你链上 + 管理员权限范围', ok: true },
  { name: '钉钉 AI 表格', scope: '审批台账演示库 · 个人空间仅你可见', ok: true },
  { name: '待办 / 日程 / 多维表', scope: '你相关角色 + 共享日历', ok: true },
  { name: '考勤打卡', scope: '本人可读 · 他人/下属 selfsetting 不可代看', ok: false },
]

/** 头像取字：小赵→赵、老周→周，避免同前缀无法区分 */
export const initial = (name: string) =>
  ['小', '老', '阿'].includes(name[0]) && name.length > 1 ? name[1] : name[0]
