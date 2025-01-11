import config from './config'

App({
  onLaunch: function () {
    this.globalData = {
      ingredients: {
        vegetables: [
          { 
            id: 'tomato',
            name: '番茄',
            image: '/images/vegetables/tomato.jpg',
            selected: false
          },
          {
            id: 'potato',
            name: '土豆',
            image: '/images/vegetables/potato.jpg',
            selected: false
          },
          {
            id: 'cabbage',
            name: '白菜',
            image: '/images/vegetables/cabbage.jpg',
            selected: false
          },
          {
            id: 'pepper',
            name: '青椒',
            image: '/images/vegetables/pepper.jpg',
            selected: false
          },
          {
            id: 'eggplant',
            name: '茄子',
            image: '/images/vegetables/eggplant.jpg',
            selected: false
          },
          {
            id: 'carrot',
            name: '胡萝卜',
            image: '/images/vegetables/carrot.png',
            selected: false
          }
        ],
        meat: [
          {
            id: 'pork',
            name: '猪肉',
            image: '/images/meats/pork.png',
            selected: false
          },
          {
            id: 'chicken',
            name: '鸡肉',
            image: '/images/meats/chicken.jpg',
            selected: false
          },
          {
            id: 'beef',
            name: '牛肉',
            image: '/images/meats/beef.jpg',
            selected: false
          },
          {
            id: 'fish',
            name: '鱼',
            image: '/images/meats/fish.jpg',
            selected: false
          }
        ],
        condiments: [
          {
            id: 'scallion',
            name: '葱',
            image: '/images/condiments/scallion.png',
            selected: false
          },
          {
            id: 'ginger',
            name: '姜',
            image: '/images/condiments/ginger.png',
            selected: false
          },
          {
            id: 'garlic',
            name: '蒜',
            image: '/images/condiments/garlic.png',
            selected: false
          }
        ]
      },
      dishes: [],
      apiConfigs: {
        yuanqi: {
          name: '腾讯元器 AI',
          url: 'https://yuanqi.tencent.com/openapi/v1/agent/chat/completions',
          headers: {
            'X-Source': 'openapi',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.YUANQI_API_TOKEN}`,
            'Access-Control-Allow-Origin': '*'
          },
          assistant_id: 'XgIHxucOhOTJ',
          user_id: '123'
        },
        coze: {
          name: '字节扣子 AI',
          url: 'https://api.coze.cn/v3/chat',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.COZE_API_TOKEN}`,
            'Access-Control-Allow-Origin': '*'
          },
          bot_id: '7456266070911909907',
          user_id: '1874008646361327'
        }
      }
    }
  }
}) 