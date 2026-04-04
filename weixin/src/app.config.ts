export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/transactions/index',
    'pages/statistics/index',
    'pages/settlement/index',
    // 非TabBar页面
    'pages/fab/index',
    'pages/ledger/index',
    'pages/ledger-create/index',
    'pages/expense-form/index',
    'pages/ai-camera/index',
    'pages/inbox/index',
    'pages/member-manage/index',
    'pages/expense-detail/index',
    'pages/wallet/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '拼途记账',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f6fa',
  },
  tabBar: {
    color: '#aaaaaa',
    selectedColor: '#10B981',
    borderStyle: 'white',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png',
      },
      {
        pagePath: 'pages/transactions/index',
        text: '流水',
        iconPath: 'assets/icons/list.png',
        selectedIconPath: 'assets/icons/list-active.png',
      },
      {
        pagePath: 'pages/statistics/index',
        text: '统计',
        iconPath: 'assets/icons/chart.png',
        selectedIconPath: 'assets/icons/chart-active.png',
      },
      {
        pagePath: 'pages/settlement/index',
        text: '结算',
        iconPath: 'assets/icons/settle.png',
        selectedIconPath: 'assets/icons/settle-active.png',
      },
    ],
  },
})
