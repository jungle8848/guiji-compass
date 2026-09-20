/**
 * 设计令牌：暖纸张编辑型门户 + 安静弹簧动效（ai-opc-hub-editorial-motion）
 * 颜色、字体、时长只在这里定义一次，组件与 antd 主题都从这里取值。
 */
export const T = {
  paper: '#F5F0EB',
  paperPanel: '#EDE8DE',
  paperWhite: '#FEFCF9',
  ink: '#3A3A35',
  inkBody: '#4E4E46',
  muted: '#77786F',
  weak: '#9A988F',
  sage: '#6B8F71',
  sageDark: '#49664F',
  softSage: '#A8B5A0',
  ochre: '#D4A574',
  ochreInk: '#7F4F1C',
  hairline: '#DDD7CC',
  code: '#303A35',
} as const

/** 会议/信号分类只用两色 + 中性，靠实心/空心区分，避免彩色标签墙 */
export const KIND_CLASS: Record<string, string> = {
  文档: 'k-sage',
  表格: 'k-sage-o',
  审批: 'k-ochre',
  待办: 'k-ochre-o',
  会议: 'k-ink',
  日程: 'k-ink-o',
}

export const MOTION = {
  fast: 140,
  base: 240,
  reveal: 420,
  liquid: 480,
} as const

export const antdTheme = {
  token: {
    colorPrimary: T.sageDark,
    colorLink: T.sageDark,
    colorBgLayout: T.paper,
    colorBgContainer: T.paperWhite,
    colorBgElevated: T.paperWhite,
    colorText: T.ink,
    colorTextSecondary: T.inkBody,
    colorTextTertiary: T.muted,
    colorTextQuaternary: T.weak,
    colorBorder: T.hairline,
    colorBorderSecondary: T.hairline,
    colorSplit: T.hairline,
    borderRadius: 12,
    fontSize: 14,
    fontFamily:
      "'Inter',-apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',Arial,sans-serif",
    boxShadowSecondary: '0 14px 34px rgba(58,58,53,.10)',
  },
  components: {
    Layout: {
      headerBg: 'transparent',
      siderBg: 'transparent',
      bodyBg: T.paper,
      borderRadiusLG: 0,
    },
    Menu: {
      itemBg: 'transparent',
      itemColor: T.muted,
      itemHoverColor: T.ink,
      itemHoverBg: 'rgba(168,181,160,.16)',
      itemSelectedColor: T.sageDark,
      itemSelectedBg: 'transparent',
      itemBorderRadius: 12,
      itemHeight: 40,
      iconSize: 15,
    },
    Card: {
      colorBgContainer: T.paperWhite,
      colorBorderSecondary: T.hairline,
      paddingLG: 20,
      headerFontSize: 15,
    },
    Table: {
      headerBg: 'transparent',
      headerColor: T.weak,
      headerSplitColor: 'transparent',
      borderColor: T.hairline,
      rowHoverBg: 'rgba(254,252,249,.9)',
      headerBorderRadius: 0,
    },
    Segmented: {
      itemSelectedBg: T.paperWhite,
      itemSelectedColor: T.sageDark,
      trackBg: T.paperPanel,
      borderRadiusSM: 10,
    },
    Alert: { colorInfoBg: 'rgba(168,181,160,.14)', colorWarningBg: 'rgba(212,165,116,.14)' },
    Statistic: { contentFontSize: 30 },
    Drawer: { colorBgElevated: T.paper },
    Timeline: { dotBg: T.paper },
  },
} as const
