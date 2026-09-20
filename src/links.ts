/**
 * 真实跳转层：站内每个对象指向钉钉里的真实演示对象。
 * 文档由 dws doc +create 建在「千问大赛测试用」文件夹下（虚构企业模拟内容）；
 * 纪要 / 审批 / 待办 URL 来自 dws 只读命令的真实返回。
 * 注意：跳转需要浏览器已登录钉钉网页版。
 */
const NODE = (id: string) => `https://alidocs.dingtalk.com/i/nodes/${id}`

/** 演示文档（本次为硅基罗盘新建，标题与站内 mock 一一对应） */
export const DOCS = {
  登录重构: NODE('QOG9lyrgJP3DBooNulXD0xlxVzN67Mw4'),
  搜索性能评审: NODE('vy20BglGWOe9roojIvGd45NqJA7depqY'),
  推荐召回: NODE('14lgGw3P8vvGK11jcZQqbKwj85daZ90D'),
  服务器扩容: NODE('o14dA3GK8g5r6mmlTE7oeymkV9ekBD76'),
  Q3测试计划: NODE('ZX6GRezwJl7G6bbeF0QqY43MVdqbropQ'),
  值班手册: NODE('vy20BglGWOe9roojIvGQzMLXJA7depqY'),
  新人入职指引: NODE('Qnp9zOoBVBZP6ooEueny72OAV1DK0g6l'),
  周报草稿: NODE('QOG9lyrgJP3DBooNulXD5rkwVzN67Mw4'),
  演示文件夹: NODE('ydxXB52LJq7G611vFZ3EwpEDWqjMp697'),
} as const

/** 真实 AI 听记纪要（dws minutes +list-mine 返回） */
export const MINUTES = {
  评审: 'https://shanji.dingtalk.com/app/transcribes/76327569643435363130353030365f363733353735363931315f30',
  周会: 'https://shanji.dingtalk.com/app/transcribes/7632756964343537313337303637333639355f363733353735363931315f35',
  一对一: 'https://shanji.dingtalk.com/app/transcribes/7632756964343535303336353439333639355f363733353735363931315f35',
  录制: 'https://shanji.dingtalk.com/app/transcribes/76327569643435363038383034305f363733353735363931315f39',
} as const

/** 连表板块：真实钉钉 AI 表格演示库（两张表），建于「千问大赛测试用」文件夹（个人空间 · 仅本人可见） */
const AITABLE_OPEN = NODE('20eMKjyp81R7pXXmsrKEz9DNWxAZB1Gv')
export const AITABLE_LEDGER = `${AITABLE_OPEN}?entrance=data&sheetId=lz3pSvP`
export const AITABLE_Q3 = `${AITABLE_OPEN}?entrance=data&sheetId=hERWDMS`

/** 真实审批实例（dws oa approval list-submitted 返回，RUNNING 状态） */
export const APPROVAL_INSTANCE
  = 'https://aflow.dingtalk.com/dingtalk/mobile/homepage.htm?corpid=ding604c3166bcf39424&dd_share=false'
  + '&showmenu=true&dd_progress=false&back=native&procInstId=GZJIWWTXQLiHfCGVKK2gCA05601788140846&swfrom=oa&dinghash=approval#approval'

/** 真实待办详情（dws todo +get 返回的 detailUrl.pcUrl） */
export const TODO_DETAIL
  = 'https://n.dingtalk.com/dingding/dd-todo/detail/index.html?dd_darkmode=true&dd_full_screen=true'
  + '&newPage=true&at_iframe=1&from=homePage&taskId=57326349767&bizTag=teambition#/detail'

/** 按标题关键词找真实跳转目标；找不到返回 null（不编造链接） */
export function linkForTitle(title: string): string | null {
  const t = title.replace(/[《》「」]/g, '')
  if (t.includes('登录重构')) return DOCS.登录重构
  if (t.includes('搜索性能')) return DOCS.搜索性能评审
  if (t.includes('AB 实验') || t.includes('推荐召回')) return DOCS.推荐召回
  if (t.includes('服务器扩容') || t.includes('扩容')) return DOCS.服务器扩容
  if (t.includes('测试计划')) return DOCS.Q3测试计划
  if (t.includes('值班手册')) return DOCS.值班手册
  if (t.includes('入职指引')) return DOCS.新人入职指引
  if (t.includes('灰度')) return DOCS.登录重构
  return null
}

/** 会议名 → 真实纪要 */
export function linkForMeeting(name: string): string {
  if (name.includes('1:1')) return MINUTES.一对一
  if (name.includes('周会')) return MINUTES.周会
  if (name.includes('评审') || name.includes('复盘') || name.includes('评估')) return MINUTES.评审
  return MINUTES.录制
}

/** 数据源行 → 真实对象 */
export const SOURCE_LINKS: Record<string, string> = {
  '钉钉文档 / 云盘': DOCS.演示文件夹,
  'AI 听记（会议纪要）': MINUTES.评审,
  'OA 审批': APPROVAL_INSTANCE,
  '钉钉 AI 表格': AITABLE_OPEN,
  '待办 / 日程 / 多维表': TODO_DETAIL,
}
