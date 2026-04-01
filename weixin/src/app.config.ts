export default {
  pages: [
    'pages/index/index',
    'pages/ledger/index',
    'pages/expense/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'TripNow',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f5f5'
  },
  tabBar: {
    list: [
      {
        pagePath: 'pages/index/index',
        text: '账本',
        iconPath: './assets/icons/home.png',
        selectedIconPath: './assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/expense/index',
        text: '记账',
        iconPath: './assets/icons/add.png',
        selectedIconPath: './assets/icons/add-active.png'
      }
    ]
  }
}
