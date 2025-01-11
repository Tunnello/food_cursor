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
          { id: 1, name: '土豆', image: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Patates.jpg', selected: false },
          { id: 2, name: '胡萝卜', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Carrot.jpg', selected: false },
          { id: 3, name: '青椒', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Bell_pepper.jpg', selected: false },
          { id: 4, name: '茄子', image: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Eggplant.jpg', selected: false },
          { id: 5, name: '白菜', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Napa_cabbage.jpg', selected: false },
          { id: 6, name: '韭菜', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Allium_tuberosum.jpg', selected: false },
          { id: 7, name: '豆芽', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Bean_sprouts.jpg', selected: false },
          { id: 8, name: '莴笋', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Lettuce.jpg', selected: false }
        ],
        meat: [
          { id: 11, name: '猪肉', image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Pork.jpg', selected: false },
          { id: 12, name: '鸡肉', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Chicken.jpg', selected: false },
          { id: 13, name: '牛肉', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Beef.jpg', selected: false },
          { id: 14, name: '羊肉', image: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Lamb.jpg', selected: false },
          { id: 15, name: '鱼', image: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Fish.jpg', selected: false }
        ],
        condiments: [
          { id: 21, name: '葱', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Scallions.jpg', selected: false },
          { id: 22, name: '姜', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Ginger.jpg', selected: false },
          { id: 23, name: '蒜', image: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Garlic.jpg', selected: false },
          { id: 24, name: '花椒', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Sichuan_pepper.jpg', selected: false },
          { id: 25, name: '桂皮', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Cinnamon.jpg', selected: false }
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
            'Authorization': `Bearer ${envConfig.YUANQI_API_TOKEN || ''}`
          },
          assistant_id: 'XgIHxucOhOTJ',
          user_id: '123'
        },
        coze: {
          name: '字节扣子 AI',
          url: 'https://api.coze.cn/v3/chat',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${envConfig.COZE_API_TOKEN || ''}`
          },
          bot_id: '7456266070911909907',
          user_id: '1874008646361327'
        }
      }
    }
  }
}) 