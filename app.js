// 读取环境变量的辅助函数
const getEnvConfig = () => {
  try {
    const fs = wx.getFileSystemManager()
    const envContent = fs.readFileSync('.env', 'utf8')
    const config = {}
    
    envContent.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=')
        if (key && value) {
          config[key.trim()] = value.trim()
        }
      }
    })
    
    return config
  } catch (error) {
    console.error('读取环境配置失败:', error)
    return {}
  }
}

App({
  onLaunch: function () {
    // 读取环境变量
    const envConfig = getEnvConfig()
    
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
            'Authorization': `Bearer ${envConfig.YUANQI_API_TOKEN || ''}`,
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
            'Authorization': `Bearer ${envConfig.COZE_API_TOKEN || ''}`,
            'Access-Control-Allow-Origin': '*'
          },
          bot_id: '7456266070911909907',
          user_id: '1874008646361327'
        }
      }
    }
  }
}) 