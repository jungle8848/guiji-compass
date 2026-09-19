import { useEffect, useState } from 'react'
import {
  ConfigProvider, App as AntdApp, Layout, Menu, Card, Segmented, Statistic, List, Tag,
  Button, Drawer, Table, Timeline, Input, Alert, Avatar, Tooltip, Progress, Row, Col,
  Skeleton, Empty,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  DashboardOutlined, TeamOutlined, AuditOutlined, FileTextOutlined, SolutionOutlined,
  SettingOutlined, CheckCircleOutlined, WarningOutlined, LinkOutlined, MessageOutlined,
  CalendarOutlined, FileAddOutlined, TableOutlined,
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout
const { TextArea } = Input

/* 调色板集中一处（editorial-motion token）——颜色不再散落硬编码 */
const C = {
  paper: '#F5F0EB', container: '#FCFAF6', ink: '#2A2621', body: '#5C544A', muted: '#6B6055',
  sage: '#5E6E54', sageSoft: '#7C8B6F', sageWash: '#E7ECE1',
  ochre: '#A8621F', ochreSoft: '#C08A3E', ochreWash: '#F4E7D6',
  red: '#B4452F', purple: '#8C7BB5', purpleWash: '#E6E2F0', purpleSoft: '#C9C0E0',
  iconBg: '#F1E9DE', teal: '#4B7B8C', violet: '#7D6B9E', amber: '#B0855A', gray: '#C9C4BC',
}
const laneColors: Record<string, { bg: string; bd: string }> = {
  green: { bg: C.sageWash, bd: C.sageSoft }, gold: { bg: C.ochreWash, bd: C.ochreSoft }, purple: { bg: C.purpleWash, bd: C.purpleSoft },
}

/* 模拟取数 loading —— 覆盖加载态 */
function useMockLoad(ms = 500) {
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), ms); return () => clearTimeout(t) }, [ms])
  return loading
}

/* 可关闭的错误/重试提示 —— 覆盖错误态（qa-4） */
function ErrorHint() {
  const { message } = AntdApp.useApp()
  const [retrying, setRetrying] = useState(false)
  return (
    <Alert closable type="warning" showIcon style={{ marginBottom: 14 }}
      message="部分数据源拉取失败（无权限或未共享）"
      description={<span>{retrying ? '重新拉取中…' : '已跳过无权限内容，仅显示你可访问范围。'} <Button size="small" type="link" onClick={() => { setRetrying(true); setTimeout(() => { setRetrying(false); message.success('已重试，无新增') }, 800) }}>重试</Button></span>} />
  )
}

/* ---------- 数据（虚构企业「职场有AI硅蜜」· 搜索与账号组，全部为模拟假数据，不接真实企业） ---------- */
type Signal = { id: string; ic: React.ReactNode; kind: string; kindColor: string; title: string; person: string; detail: string; source: string; time: string }
const signals: Signal[] = [
  { id: 's1', ic: <FileTextOutlined />, kind: '文档', kindColor: 'green', title: '更新《登录重构 · 技术方案》', person: '李工', detail: '修订接口鉴权章节，补 3 张时序图', source: '钉钉文档', time: '周三 14:20' },
  { id: 's2', ic: <AuditOutlined />, kind: '审批', kindColor: 'gold', title: '通过「Q3 测试机采购」审批', person: '王姐', detail: '发起 · 到你链上，金额 ¥48,000', source: 'OA 审批', time: '周二 10:05' },
  { id: 's3', ic: <TeamOutlined />, kind: '会议', kindColor: 'purple', title: '主持「搜索性能」评审', person: '小赵', detail: '生成 5 条行动项，2 条指派给你团队', source: 'AI 听记', time: '周四 15:00' },
  { id: 's4', ic: <CheckCircleOutlined />, kind: '待办', kindColor: 'cyan', title: '完成待办「补充迁移用例」', person: '李工', detail: '逾期 1 天后本周补交', source: '待办', time: '周五 09:40' },
  { id: 's5', ic: <TableOutlined />, kind: '表格', kindColor: 'blue', title: '更新《Q3 测试计划表》8 条记录', person: '王姐', detail: '补齐负责人与到期日', source: '钉钉多维表', time: '周二 11:30' },
  { id: 's6', ic: <CalendarOutlined />, kind: '日程', kindColor: 'geekblue', title: '新建里程碑「灰度上线」评审', person: '你', detail: '已邀请 4 位参会人', source: '日程', time: '周一 09:00' },
  { id: 's7', ic: <FileTextOutlined />, kind: '文档', kindColor: 'green', title: '创建《推荐召回 · AB 实验设计》', person: '小陈', detail: '初稿完成，待评审', source: '钉钉文档', time: '周四 10:15' },
  { id: 's8', ic: <AuditOutlined />, kind: '审批', kindColor: 'gold', title: '发起「服务器扩容」预算审批', person: '老周', detail: '¥120,000 · 到财务节点', source: 'OA 审批', time: '周三 16:40' },
]
const kindCount = new Set(signals.map((s) => s.kind)).size
const members = [
  { name: '李工', color: C.sage, hl: '本周产出技术方案 v12 + 迁移用例，鉴权章节文档化清晰。' },
  { name: '王姐', color: C.ochre, hl: '推进测试机采购审批落地，跨部门对齐 2 次会议。' },
  { name: '小赵', color: C.purple, hl: '主持搜索性能评审，拆出 5 条行动项并跟进 2 条。' },
  { name: '小陈', color: C.teal, hl: '独立完成推荐召回 AB 实验设计初稿，主动约评审。' },
  { name: '老周', color: C.violet, hl: '牵头服务器扩容方案与预算，风险前置同步到位。' },
  { name: '小吴', color: C.amber, hl: '本周值班稳定，处理 3 起线上告警，无越级。' },
]
type Approval = { key: string; title: string; from: string; node: string; status: string; color: string; sla: string }
const approvals: Approval[] = [
  { key: 'a1', title: 'Q3 测试机采购', from: '王姐', node: '部门审批 · 待你处理', status: '审批中', color: 'gold', sla: '已 2 天' },
  { key: 'a2', title: '线上灰度发布申请', from: '李工', node: '技术负责人 · 已通过', status: '已通过', color: 'green', sla: '0.5 天' },
  { key: 'a3', title: '试用期转正', from: '小赵', node: 'HR 复核 · 卡住', status: '已超时', color: 'red', sla: '超时 3 天' },
  { key: 'a4', title: '市场物料预算追加', from: '陈敏', node: '财务 · 待你处理', status: '审批中', color: 'gold', sla: '已 1 天' },
  { key: 'a5', title: '服务器扩容预算', from: '老周', node: '财务 · 待你处理', status: '审批中', color: 'gold', sla: '已 1 天' },
  { key: 'a6', title: '技术分享会报销', from: '小陈', node: '已归档', status: '已通过', color: 'green', sla: '1.2 天' },
  { key: 'a7', title: '外包供应商准入', from: '小吴', node: '采购复核 · 卡住', status: '已超时', color: 'red', sla: '超时 5 天' },
]
const docUpdates = [
  { name: '《登录重构 · 技术方案》', person: '李工', act: '编辑 v12', time: '周三 14:20', color: 'green' },
  { name: '《搜索性能评审纪要》', person: '小赵', act: '上传', time: '周四 16:10', color: 'purple' },
  { name: '《Q3 测试计划表》(多维表)', person: '王姐', act: '更新 8 条记录', time: '周二 11:30', color: 'blue' },
  { name: '《新人入职指引》', person: '你', act: '分享给团队', time: '周五 09:00', color: 'gold' },
  { name: '《推荐召回 · AB 实验设计》', person: '小陈', act: '新建初稿', time: '周四 10:15', color: 'green' },
  { name: '《服务器扩容方案》', person: '老周', act: '编辑 v3', time: '周三 17:00', color: 'purple' },
  { name: '《值班手册》', person: '小吴', act: '更新告警处置', time: '周一 15:40', color: 'blue' },
]
const days = ['周一', '周二', '周三', '周四', '周五']
type Meeting = { t: string; h: string; c: string }
type LaneRow = { name: string; color: string; shared: boolean; cells: Meeting[][] }
const lane: LaneRow[] = [
  { name: '李工', color: C.sage, shared: true, cells: [[], [{ t: '需求对齐', h: '10:00', c: 'green' }], [], [{ t: '方案评审', h: '14:00', c: 'gold' }], []] },
  { name: '王姐', color: C.ochre, shared: true, cells: [[{ t: '采购审批', h: '10:00', c: 'gold' }], [{ t: '跨组周会', h: '15:00', c: 'purple' }], [{ t: '供应商', h: '11:00', c: 'green' }], [], [{ t: '复盘', h: '16:00', c: 'green' }]] },
  { name: '小赵', color: C.purple, shared: true, cells: [[], [{ t: '跨组周会', h: '15:00', c: 'purple' }], [{ t: '搜索性能评审', h: '10:00', c: 'gold' }, { t: '迭代同步 · 站会', h: '—', c: 'green' }], [{ t: '1:1 · 你', h: '13:00', c: 'green' }], []] },
  { name: '小陈', color: C.teal, shared: true, cells: [[], [{ t: 'AB 实验设计', h: '11:00', c: 'gold' }], [{ t: '跨组周会', h: '15:00', c: 'purple' }], [], [{ t: '评审 · 召回', h: '10:00', c: 'gold' }]] },
  { name: '老周', color: C.violet, shared: true, cells: [[{ t: '容量评估', h: '09:30', c: 'green' }], [], [{ t: '扩容预算', h: '14:00', c: 'gold' }, { t: '故障复盘', h: '16:00', c: 'purple' }], [], [{ t: '周会', h: '15:00', c: 'green' }]] },
  { name: '小吴', color: C.amber, shared: false, cells: [[], [], [], [], []] },
]
const meetingCount = lane.filter((r) => r.shared).reduce((n, r) => n + r.cells.reduce((m, c) => m + c.length, 0), 0)
const pendingCount = approvals.filter((a) => a.node.includes('待你')).length
const docCount = docUpdates.length

/* ---------- 周知 · 驾驶舱 ---------- */
function Dashboard({ onNavigate }: { onNavigate: (k: string) => void }) {
  const { message } = AntdApp.useApp()
  const [view, setView] = useState('按周')
  const [open, setOpen] = useState(false)
  const [vstate, setVstate] = useState('② 已核验')
  const [fixed, setFixed] = useState(false)
  const [generating, setGenerating] = useState(false)
  const loading = useMockLoad()
  const [draft] = useState<Signal[]>(signals)

  const genReport = () => { setGenerating(true); message.loading({ content: '正在汇总本周进展…', key: 'rep' }); setTimeout(() => { setGenerating(false); message.success({ content: '周报草稿已生成，来源可溯率 100%', key: 'rep' }) }, 900) }
  const copy = (t: string) => navigator.clipboard?.writeText(t).then(() => message.success('已复制到剪贴板')).catch(() => message.warning('复制失败，请手动选择'))

  return (
    <div>
      <div className="gg-eyebrow">周知 · 团队进展驾驶舱</div>
      <div className="gg-page">本周团队进展</div>
      <p className="gg-lede">散在文档、审批、待办、会议、日程里的真实信号，已按人归拢到一屏，每条都能点开核验出处——这是你敢直接用的前提。</p>
      <div className="gg-hair" />
      <ErrorHint />
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
        <Segmented options={['按周', '按天', '按人']} value={view} onChange={(v) => setView(v as string)} />
        <Tag icon={<CalendarOutlined />}>本周 09/08 – 09/14</Tag>
        <Tag color="green">覆盖 {kindCount} 类信号</Tag>
        <Tag>仅你可见范围</Tag>
        <div style={{ flex: 1 }} />
        <Button type="primary" loading={generating} icon={<FileTextOutlined />} onClick={genReport}>生成周报 →</Button>
      </div>

      {loading ? (
        <Card size="small" style={{ marginBottom: 16 }}><Skeleton active paragraph={{ rows: 2 }} /></Card>
      ) : (
        <Row gutter={[12, 12]} style={{ marginBottom: 18 }}>
          <Col xs={12} md={6}><Card size="small"><Statistic title="本周信号" value={signals.length} suffix="条" /></Card></Col>
          <Col xs={12} md={6}><Card size="small"><Statistic title="审批待你处理" value={pendingCount} suffix="项" valueStyle={{ color: C.ochre }} /></Card></Col>
          <Col xs={12} md={6}><Card size="small"><Statistic title="团队会议" value={meetingCount} suffix="场" /></Card></Col>
          <Col xs={12} md={6}><Card size="small"><Statistic title="文档更新" value={docCount} suffix="次" /></Card></Col>
        </Row>
      )}

      <List
        dataSource={draft}
        locale={{ emptyText: <Empty description="本周暂无新进展" /> }}
        renderItem={(s) => (
          <Card size="small" hoverable style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: C.iconBg, display: 'grid', placeItems: 'center', fontSize: 16 }}>{s.ic}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: C.body }}>{s.person} · {s.detail}</div>
                <span className="gg-src"><span className="dot" />来源 · {s.source}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Tag color={s.kindColor}>{s.kind}</Tag>
                <div style={{ fontSize: 12, color: C.muted, margin: '4px 0' }}>{s.time}</div>
                <Button size="small" icon={<LinkOutlined />} onClick={() => { setFixed(false); setOpen(true) }}>核验</Button>
              </div>
            </div>
          </Card>
        )}
      />

      <div className="gg-head">逐人本周亮点（只讲做过的事）<Button size="small" type="link" onClick={() => onNavigate('feedback')} style={{ marginLeft: 10 }}>反馈中心 →</Button></div>
      <Row gutter={[12, 12]}>
        {members.map((m) => (
          <Col key={m.name} xs={24} sm={12} md={8}>
            <Card size="small" hoverable style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                <Avatar style={{ background: m.color }} size="small">{m.name[0]}</Avatar><b>{m.name}</b>
              </div>
              <div style={{ fontSize: 13, color: C.body, minHeight: 40 }}>{m.hl}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Button size="small" onClick={() => copy(m.hl)}>复制</Button>
                <Tooltip title="一键发钉钉消息表扬 TA"><Button size="small" icon={<MessageOutlined />} onClick={() => message.success(`已把表扬发给 ${m.name}`)}>表扬</Button></Tooltip>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Drawer title="来源核验" width={420} open={open} onClose={() => setOpen(false)}>
        <Segmented block options={['① 核验中', '② 已核验', '③ 存疑待纠错']} value={vstate} onChange={(v) => setVstate(v as string)} style={{ marginBottom: 16 }} />
        {vstate === '① 核验中' && (
          <Card size="small"><div className="gg-eyebrow" style={{ marginBottom: 8 }}>核验中</div><p style={{ color: C.body }}>正在打开原文《登录重构 · 技术方案》…</p><Progress percent={64} status="active" /></Card>
        )}
        {vstate === '② 已核验' && (
          <Card size="small" style={{ borderColor: C.sageSoft }}>
            <div className="gg-eyebrow" style={{ color: C.sage, marginBottom: 8 }}>已核验 · 对上了</div>
            <p style={{ color: C.ink }}><b>属实：</b>李工 周三 14:20 提交 v12，改了鉴权章节 + 3 图。</p>
            <a href="https://alidocs.dingtalk.com/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', marginTop: 8 }}><LinkOutlined />跳到钉钉文档原文</a>
          </Card>
        )}
        {vstate === '③ 存疑待纠错' && (
          <Card size="small" style={{ borderColor: C.ochreSoft }}>
            <div className="gg-eyebrow" style={{ color: C.red, marginBottom: 8 }}>存疑 · 待纠错</div>
            <p style={{ color: C.ink }}><b>时间/归属存疑：</b>该文档最后编辑其实在<b>上周</b>，不计入本周。要不要剔出本周汇总？</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Button danger type="primary" disabled={fixed} onClick={() => { setFixed(true); message.success('已修正：同类「跨周误算」规则当场更新') }}>标记纠错</Button>
              <Button disabled={fixed} onClick={() => { setFixed(true); message.info('已保留该条到本周') }}>仍然采用</Button>
            </div>
            {fixed && <Alert style={{ marginTop: 12 }} type="success" showIcon message="已修正：同类「跨周误算」判断规则当场更新" />}
          </Card>
        )}
      </Drawer>
    </div>
  )
}

/* ---------- 同频 · 会议泳道 ---------- */
function Sync() {
  const { message } = AntdApp.useApp()
  const loading = useMockLoad(400)
  const openMeeting = (t: string) => message.info(`打开《${t}》纪要与行动项`)
  return (
    <div>
      <div className="gg-eyebrow">同频 · 跨源进展与协作</div>
      <div className="gg-page">一周会议泳道图</div>
      <p className="gg-lede">把每个人一周的会议铺成人 × 天网格，谁被会挤爆、哪些会撞在一起，一眼看清——帮你在周会前砍掉重复对齐。</p>
      <div className="gg-hair" />
      <ErrorHint />
      <div className="gg-legend">
        <span><i style={{ background: C.sageWash, borderColor: C.sageSoft }} />常规会</span>
        <span><i style={{ background: C.ochreWash, borderColor: C.ochreSoft }} />评审 / 决策</span>
        <span><i style={{ background: C.purpleWash, borderColor: C.purpleSoft }} />跨组会</span>
        <span><i style={{ background: C.red, borderColor: C.red }} />同日撞车</span>
      </div>
      {loading ? (<Card size="small"><Skeleton active paragraph={{ rows: 3 }} /></Card>) : (<div className="gg-scroll">
        <div className="gg-lane"><div /><div className="gg-head-cell">人 \ 天</div>{days.map((d) => <div key={d} className="gg-head-cell">{d}</div>)}</div>
        {lane.map((row) => (
          <div key={row.name} className="gg-lane" style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <Avatar size="small" style={{ background: row.shared ? row.color : C.gray }}>{row.name[0]}</Avatar>{row.name}
            </div>
            {row.shared ? (
              row.cells.map((cell, i) => (
                <div key={i} className="gg-day">
                  {cell.length > 1 && <span className="gg-over-badge">撞车 ×{cell.length}</span>}
                  {cell.map((m, j) => (
                    <div key={j} className="gg-mtg" role="button" tabIndex={0} style={{ background: laneColors[m.c].bg, borderColor: laneColors[m.c].bd }} onClick={() => openMeeting(m.t)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMeeting(m.t) } }}>
                      <div style={{ fontWeight: 600 }}>{m.t}</div><div style={{ fontSize: 10.5, color: C.muted }}>{m.h}</div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '2 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 60, border: '1px dashed rgba(42,38,33,.12)', borderRadius: 10, background: 'rgba(42,38,33,.03)', color: C.muted, fontSize: 12.5 }}>
                未向你共享日程 · 受权限限制不显示（不越权补全）
              </div>
            )}
          </div>
        ))}
      </div>)}
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col xs={24} md={16}><Card size="small" style={{ borderLeft: `3px solid ${C.ochre}`, height: '100%' }}>
          <div className="gg-serif" style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>💡 可合并</div>
          <p style={{ color: C.body, margin: 0 }}>小赵<b> 周三撞了 3 场会</b>：搜索性能评审与「迭代同步·站会」议题高度重叠，建议合并为一场；跨组周会也与你团队迭代同步错峰。</p>
        </Card></Col>
        <Col xs={24} md={8}><Card size="small" style={{ height: '100%' }}>
          <div className="gg-serif" style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>数据边界</div>
          <p style={{ color: C.body, margin: 0 }}><b>诚实标注：</b>只含你可见/被共享日程，未共享者灰显；跨人多为粗粒度「忙/闲」，不越权补全。</p>
        </Card></Col>
      </Row>
    </div>
  )
}

/* ---------- 流转 · OA 全景 ---------- */
function FlowBoard() {
  const { message } = AntdApp.useApp()
  const [retrying, setRetrying] = useState(false)
  const loading = useMockLoad(400)
  const cols: ColumnsType<Approval> = [
    { title: '审批事项', dataIndex: 'title', render: (v) => <b>{v}</b> },
    { title: '发起人', dataIndex: 'from' },
    { title: '当前节点', dataIndex: 'node' },
    { title: '状态', dataIndex: 'status', render: (v, r) => <Tag color={r.color}>{v}</Tag> },
    { title: '时效', dataIndex: 'sla', render: (v, r) => <span style={{ color: r.color === 'red' ? C.red : C.muted }}>{v}</span> },
    { title: '操作', key: 'op', render: (_, r) => r.status === '已超时' ? <Button size="small" danger icon={<WarningOutlined />} onClick={() => message.success(`已向「${r.title}」当前处理人发催办`)}>催办</Button> : <Button size="small" onClick={() => message.info(`打开审批单：${r.title}`)}>去处理</Button> },
  ]
  return (
    <div>
      <div className="gg-eyebrow">流转 · 团队审批动态全景</div>
      <div className="gg-page">团队 OA 全景</div>
      <p className="gg-lede">跨人的审批流转状态、卡点与时效一目了然。列表按 OA 管理员权限聚合，卡在你链上的高亮。</p>
      <div className="gg-hair" />
      <Alert
        type="warning" showIcon style={{ marginBottom: 14 }}
        message="部分审批源拉取失败（跨组织 · 无权限）"
        description={<span>{retrying ? '重新拉取中…' : '已跳过无权限实例，仅显示你可访问范围。'} <Button size="small" type="link" onClick={() => { setRetrying(true); setTimeout(() => { setRetrying(false); message.success('已重试，新增 0 条') }, 800) }}>重试</Button></span>}
      />
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}><Tag color="gold">待你处理 2</Tag><Tag color="red">已超时 1</Tag><Tag color="green">本周通过 3</Tag></div>
      {loading ? <Card size="small"><Skeleton active paragraph={{ rows: 4 }} /></Card> : <Table size="middle" columns={cols} dataSource={approvals} pagination={false} locale={{ emptyText: <Empty description="暂无可见审批" /> }} />}
    </div>
  )
}

/* ---------- 笔耕 · 文档动态 ---------- */
function Docs() {
  const { message } = AntdApp.useApp()
  const loading = useMockLoad(400)
  return (
    <div>
      <div className="gg-eyebrow">笔耕 · 团队文档创作与更新动态</div>
      <div className="gg-page">本周文档</div>
      <p className="gg-lede">本周谁新增、上传、改版、分享了什么，按时间线归集，可跳回原文核验版本。</p>
      <div className="gg-hair" />
      <ErrorHint />
      {loading ? <Card size="small"><Skeleton active paragraph={{ rows: 3 }} /></Card> : docUpdates.length === 0 ? <Empty description="本周无文档更新" /> : (
        <Card size="small" title={<span className="gg-serif">文档动态（{docUpdates.length}）</span>}>
          <Timeline items={docUpdates.map((d) => ({ color: d.color, children: <span><b>{d.name}</b> · {d.act} <span style={{ color: C.muted }}>— {d.person} · {d.time}</span> <a href="https://alidocs.dingtalk.com/" target="_blank" rel="noreferrer" style={{ marginLeft: 6 }} onClick={() => message.info('跳转版本历史')}><LinkOutlined />版本</a></span> }))} />
        </Card>
      )}
      <Alert style={{ marginTop: 14 }} type="info" showIcon icon={<FileAddOutlined />} message="未共享给你的文档不显示" description="受节点权限限制，这里只出现你可见/被共享的库与目录，无权限处显式标注而非绕过。" />
    </div>
  )
}

/* ---------- 周报 ---------- */
function Report() {
  const { message } = AntdApp.useApp()
  const [busy, setBusy] = useState<'' | 'doc' | 'mail'>('')
  const [draft, setDraft] = useState(`【搜索与账号组 · 本周】\n· 完成登录重构技术方案 v12，鉴权章节定稿（李工）\n· Q3 测试机采购审批已过技术负责人（王姐）\n· 搜索性能评审产出 5 条行动项，2 条本周启动（小赵）\n风险：转正审批卡在 HR 已超时，需你催办。`)
  return (
    <div>
      <div className="gg-eyebrow">周知出口 · 一键周报</div>
      <div className="gg-page">本周周报草稿</div>
      <p className="gg-lede">由已核验的进展自动成稿，只陈述事实、每句可回溯。改两句即可发给上级。</p>
      <div className="gg-hair" />
      <Card size="small"><TextArea rows={9} value={draft} onChange={(e) => setDraft(e.target.value)} style={{ fontFamily: 'inherit', fontSize: 14 }} /></Card>
      <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <Button type="primary" loading={busy === 'doc'} icon={<FileTextOutlined />} onClick={() => { setBusy('doc'); setTimeout(() => { setBusy(''); message.success('已存为钉钉文档并同步给上级') }, 800) }}>存为钉钉文档</Button>
        <Button loading={busy === 'mail'} icon={<MessageOutlined />} onClick={() => { setBusy('mail'); setTimeout(() => { setBusy(''); message.success('周报已发邮件给上级') }, 800) }}>邮件发上级</Button>
        <Tag color="green">来源可溯率 100%</Tag>
      </div>
    </div>
  )
}

/* ---------- 反馈 ---------- */
function Feedback() {
  const { message } = AntdApp.useApp()
  const copy = (t: string) => navigator.clipboard?.writeText(t).then(() => message.success('已复制')).catch(() => message.warning('复制失败'))
  return (
    <div>
      <div className="gg-eyebrow">反馈 · 逐人亮点</div>
      <div className="gg-page">给团队说句公道话</div>
      <p className="gg-lede">每人一句基于本周真实产出的亮点，只讲做过的事，不含「摸鱼/不努力」式定性。</p>
      <div className="gg-hair" />
      <List grid={{ gutter: 12, column: 3 }} dataSource={members} locale={{ emptyText: <Empty description="本周无可归纳产出" /> }} renderItem={(m) => (
        <List.Item><Card size="small" hoverable style={{ height: '100%' }}><div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}><Avatar style={{ background: m.color }} size="small">{m.name[0]}</Avatar><b>{m.name}</b></div><div style={{ fontSize: 13, color: C.body, minHeight: 40 }}>{m.hl}</div><div style={{ display: 'flex', gap: 8, marginTop: 10 }}><Button size="small" onClick={() => copy(m.hl)}>复制</Button><Button size="small" type="primary" icon={<MessageOutlined />} onClick={() => message.success(`已把表扬发给 ${m.name}`)}>表扬</Button></div></Card></List.Item>
      )} />
    </div>
  )
}

/* ---------- 设置 ---------- */
function Settings() {
  const sources = [
    { n: '钉钉文档 / 云盘', p: '你可见/被共享的节点', ok: true },
    { n: 'AI 听记（会议纪要）', p: '你参加或被共享的会议', ok: true },
    { n: 'OA 审批', p: '你链上 + 管理员权限范围', ok: true },
    { n: '待办 / 日程 / 多维表', p: '你相关角色 + 共享日历', ok: true },
    { n: '考勤打卡', p: '个人 selfsetting 不可代看', ok: false },
  ]
  return (
    <div>
      <div className="gg-eyebrow">设置 · 数据源与合规</div>
      <div className="gg-page">透明与边界</div>
      <div className="gg-hair" />
      <Alert type="success" showIcon message="硅基罗盘只以你本人权限取数，团队知情、自愿共享，不做监控。" style={{ marginBottom: 16 }} />
      <List dataSource={sources} renderItem={(s) => (
        <List.Item actions={[s.ok ? <Tag key="t" color="green">可见</Tag> : <Tag key="t" color="red">受限</Tag>]}><List.Item.Meta title={s.n} description={<span style={{ color: C.muted }}>{s.p}</span>} /></List.Item>
      )} />
    </div>
  )
}

/* ---------- Shell ---------- */
const items = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: '周知 · 驾驶舱' },
  { key: 'sync', icon: <TeamOutlined />, label: '同频 · 协作' },
  { key: 'flow', icon: <AuditOutlined />, label: '流转 · OA' },
  { key: 'docs', icon: <FileTextOutlined />, label: '笔耕 · 文档' },
  { key: 'report', icon: <SolutionOutlined />, label: '周报' },
  { key: 'settings', icon: <SettingOutlined />, label: '设置' },
]

function Shell() {
  const { message } = AntdApp.useApp()
  const [k, setK] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const screens: Record<string, React.ReactNode> = {
    dashboard: <Dashboard onNavigate={setK} />, sync: <Sync />, flow: <FlowBoard />, docs: <Docs />, report: <Report />, feedback: <Feedback />, settings: <Settings />,
  }
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={212} theme="light" collapsible collapsed={collapsed} onCollapse={setCollapsed} breakpoint="lg" collapsedWidth={64} style={{ borderRight: '1px solid rgba(42,38,33,.08)' }}>
        <div style={{ padding: '18px 18px 10px' }} className="gg-brand">{!collapsed && <><span className="gg-dial" />硅基罗盘</>}</div>
        {!collapsed && <div style={{ padding: '0 18px 12px', fontSize: 11, color: C.muted, letterSpacing: '.04em' }}>钉钉聚合一站式工作台</div>}
        <Menu mode="inline" items={items} selectedKeys={[k]} onClick={(e) => setK(e.key)} style={{ border: 'none', background: 'transparent', padding: '0 8px' }} />
      </Sider>
      <Layout>
        <Header style={{ background: C.paper, borderBottom: '1px solid rgba(42,38,33,.08)', display: 'flex', alignItems: 'center', padding: '0 24px', height: 60, lineHeight: '60px' }}>
          <span style={{ fontSize: 13, color: C.muted }}>数据源：仅你可见范围</span>
          <div style={{ flex: 1 }} />
          <Button size="small" type="primary" ghost onClick={() => message.info('模拟登录：接入钉钉 OAuth 后由此换取本人权限 token')}>扫码登录（Demo 模拟）</Button>
          <Avatar style={{ background: C.sage, marginLeft: 12 }}>陈</Avatar>
        </Header>
        <Content style={{ padding: '22px 28px' }}><div style={{ maxWidth: 1080, margin: '0 auto' }}>{screens[k]}</div></Content>
      </Layout>
    </Layout>
  )
}

export default function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: C.sage, colorBgLayout: C.paper, colorBgContainer: C.container, colorText: C.ink, colorTextSecondary: C.body, borderRadius: 12, fontFamily: "'Inter','Noto Sans SC',system-ui" }, components: { Layout: { headerBg: C.paper, siderBg: C.paper, bodyBg: C.paper }, Menu: { itemSelectedBg: C.sageWash, itemSelectedColor: C.ink, itemBorderRadius: 10 } } }}>
      <AntdApp>
        <Shell />
      </AntdApp>
    </ConfigProvider>
  )
}
