export default {
  pages: [
    'pages/index/index',
    'pages/ledger/index',
    'pages/expense/index',
    'pages/ledger-detail/index',
    'pages/settlement/index',
    'pages/ai-camera/index',
    'pages/voice/index'
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
  },
  permission: {
    "scope.camera": {
      desc: "用于拍照识别小票"
    },
    "scope.record": {
      desc: "用于语音记账"
    }
  }
}
