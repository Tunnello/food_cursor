const app = getApp()

Page({
  data: {
    ingredients: {
      vegetables: [
        {
          id: 'tomato',
          name: '番茄',
          image: 'https://images.unsplash.com/photo-1517666005606-69dea9b54865?q=80&w=1776&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        }
      ],
      meat: [],
      condiments: []
    },
    recommendedDishes: [],
    calendarDays: [],
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    showDatePicker: false,
    selectedDish: null,
    quickDates: [],
    generators: [
      { id: 'coze', name: '字节扣子 AI' }
    ],
    currentGeneratorIndex: 0,
    pollingTimer: null,
    conversationId: null,
    chatId: null
  },

  onLoad: function () {
    this.setData({
      ingredients: app.globalData.ingredients
    })
    this.initCalendar()
    this.initQuickDates()
    
    // 按照新的顺序设置生成器列表
    const generators = [
      { id: 'coze', name: '字节扣子 AI' },
      { id: 'yuanqi', name: '腾讯元器 AI' }
    ]
    this.setData({ generators })
  },

  initCalendar: function() {
    const { currentYear, currentMonth } = this.data
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    
    // 获取上个月的天数
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate()
    
    // 计算日历起始日期（包括上个月的日期）
    const startDay = firstDay.getDay()
    const calendarDays = []
    
    // 添加上个月的日期
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i
      calendarDays.push({
        day,
        fullDate: `${currentMonth === 0 ? 12 : currentMonth}/${day}`,
        isCurrentMonth: false,
        dishes: []
      })
    }
    
    // 添加当前月的日期
    for (let day = 1; day <= lastDay.getDate(); day++) {
      calendarDays.push({
        day,
        fullDate: `${currentMonth + 1}/${day}`,
        isCurrentMonth: true,
        dishes: []
      })
    }
    
    // 添加下个月的日期
    const remainingDays = 42 - calendarDays.length // 保持6行
    for (let day = 1; day <= remainingDays; day++) {
      calendarDays.push({
        day,
        fullDate: `${currentMonth === 11 ? 1 : currentMonth + 2}/${day}`,
        isCurrentMonth: false,
        dishes: []
      })
    }
    
    this.setData({ calendarDays })
  },

  prevMonth: function() {
    let { currentYear, currentMonth } = this.data
    if (currentMonth === 0) {
      currentMonth = 11
      currentYear--
    } else {
      currentMonth--
    }
    this.setData({ currentYear, currentMonth })
    this.initCalendar()
  },

  nextMonth: function() {
    let { currentYear, currentMonth } = this.data
    if (currentMonth === 11) {
      currentMonth = 0
      currentYear++
    } else {
      currentMonth++
    }
    this.setData({ currentYear, currentMonth })
    this.initCalendar()
  },

  toggleIngredient: function (e) {
    const { id, category } = e.currentTarget.dataset
    const ingredients = this.data.ingredients
    
    ingredients[category] = ingredients[category].map(item => {
      if (item.id === id) {
        return { ...item, selected: !item.selected }
      }
      return item
    })
    
    this.setData({ ingredients })
  },

  updateRecommendedDishes: function () {
    const selectedIngredients = [
      ...this.data.ingredients.vegetables,
      ...this.data.ingredients.meat,
      ...this.data.ingredients.condiments
    ].filter(item => item.selected)

    if (selectedIngredients.length === 0) {
      this.setData({ recommendedDishes: [] })
    }
  },

  generateDishes: function(ingredients) {
    const currentGenerator = this.data.generators[this.data.currentGeneratorIndex]
    const apiConfig = app.globalData.apiConfigs[currentGenerator.id]

    const prompt = `我有以下食材：${ingredients.join('、')}。
请推荐5道可以用这些食材烹饪的菜品。对于每道菜品：
1. 使用搜索工具查找对应的菜品图片
2. 验证图片URL是否可以访问（必须是直接可访问的图片链接）
3. 提供3-5个简短的烹饪步骤
4. 搜索并提供一个相关的烹饪教学视频链接（优先bilibili或其他视频平台的视频）
5. 如果找不到合适的图片，可以使用以下默认图片之一：
   - https://example.com/chinese-food-1.jpg
   - https://example.com/chinese-food-2.jpg
   - https://example.com/chinese-food-3.jpg

请确保返回的JSON格式完全符合以下规范：
{
  "dishes": [
    {
      "id": 数字ID（1-100之间）,
      "name": "菜品名称",
      "ingredients": [使用的食材ID数组],
      "image": "经过验证的可访问图片URL",
      "description": [
        "步骤1：准备工作，如切菜等",
        "步骤2：开始烹饪的主要步骤",
        "步骤3：调味和收尾工作"
      ],
      "video": {
        "url": "视频链接URL",
        "platform": "视频平台名称，如bilibili",
        "title": "视频标题"
      }
    }
  ]
}`

    console.log('当前使用的生成器:', currentGenerator.name)
    console.log('API请求参数:', {
      url: apiConfig.url,
      headers: apiConfig.headers,
      prompt: prompt
    })

    if (currentGenerator.id === 'coze') {
      // 清理可能存在的轮询定时器
      if (this.data.pollingTimer) {
        clearInterval(this.data.pollingTimer)
      }
      this.setData({ 
        conversationId: null,
        chatId: null
      })
    }

    // 根据不同的API构建请求数据
    let requestData = {}
    if (currentGenerator.id === 'yuanqi') {
      requestData = {
        assistant_id: apiConfig.assistant_id,
        user_id: apiConfig.user_id,
        stream: false,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ]
      }
    } else if (currentGenerator.id === 'coze') {
      requestData = {
        bot_id: apiConfig.bot_id,
        user_id: apiConfig.user_id,
        stream: true,  // 改为流式响应
        auto_save_history: true,
        additional_messages: [
          {
            role: 'user',
            content: prompt,
            content_type: 'text'
          }
        ]
      }
    }

    // 使用不同的请求配置
    const requestConfig = {
      url: apiConfig.url,
      method: 'POST',
      header: apiConfig.headers,
      data: requestData,
      success: (res) => {
        console.log('API返回原始数据:', res.data)
        
        try {
          if (currentGenerator.id === 'yuanqi') {
            const content = res.data.choices[0].message.content
            this.processResponse(content)
            wx.hideLoading()
          } else if (currentGenerator.id === 'coze') {
            // 处理流式响应
            const responseText = res.data
            console.log('流式响应文本:', responseText)

            // 分割事件流
            const events = responseText.split('\n\n').filter(event => event.trim())
            
            // 处理每个事件
            for (const event of events) {
              const lines = event.split('\n')
              let eventType = ''
              let eventData = ''

              // 解析事件类型和数据
              for (const line of lines) {
                if (line.startsWith('event:')) {
                  eventType = line.slice(6).trim()
                } else if (line.startsWith('data:')) {
                  eventData = line.slice(5).trim()
                }
              }

              // 只处理完成的消息事件
              if (eventType === 'conversation.message.completed' && eventData) {
                try {
                  const messageData = JSON.parse(eventData)
                  console.log('消息数据:', messageData)

                  // 处理不同类型的消息
                  if (messageData.type === 'tool_response' && messageData.content) {
                    const toolResponse = JSON.parse(messageData.content)
                    console.log('工具响应:', toolResponse)

                    if (toolResponse.recipes && toolResponse.recipes.length > 0) {
                      const dishes = toolResponse.recipes.slice(0, 5).map((recipe, index) => ({
                        id: index + 1,
                        name: recipe.name,
                        ingredients: ingredients,
                        image: recipe.image || this.getDefaultDishImage(),
                        description: [
                          "准备食材和调料",
                          "按照菜谱步骤烹饪",
                          "调味后装盘即可"
                        ],
                        video: {
                          url: "https://www.bilibili.com/video/BV1234567890",
                          platform: "bilibili",
                          title: `${recipe.name}烹饪教程`
                        }
                      }))

                      if (dishes.length > 0) {
                        this.setData({ recommendedDishes: dishes })
                      }
                    }
                  } else if (messageData.type === 'answer') {
                    console.log('AI回答:', messageData.content)
                  }
                } catch (parseError) {
                  console.error('解析消息数据失败:', parseError)
                }
              }
            }
            wx.hideLoading()
          }
        } catch (error) {
          console.error('解析菜品数据失败:', error)
          wx.showToast({
            title: '生成菜品失败',
            icon: 'none'
          })
          wx.hideLoading()
        }
      },
      fail: (error) => {
        console.error('API调用失败:', error)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        })
        wx.hideLoading()
      }
    }

    // 发送请求前显示加载提示
    wx.showLoading({
      title: '生成菜品中...',
      mask: true
    })

    // 发送请求
    wx.request(requestConfig)
  },

  getDefaultDishImage: function() {
    // 返回一个默认的菜品图片URL
    return 'https://example.com/default-dish-image.jpg'
  },

  showDatePicker: function(e) {
    const dish = e.currentTarget.dataset.dish
    this.setData({
      showDatePicker: true,
      selectedDish: dish
    })
  },

  hideDatePicker: function() {
    this.setData({
      showDatePicker: false,
      selectedDish: null
    })
  },

  addDishToDate: function(e) {
    const fullDate = e.currentTarget.dataset.date
    const calendarDays = this.data.calendarDays.map(day => {
      if (day.fullDate === fullDate) {
        const isDishExists = day.dishes.some(dish => dish.id === this.data.selectedDish.id)
        if (!isDishExists) {
          return {
            ...day,
            dishes: [...day.dishes, this.data.selectedDish]
          }
        }
      }
      return day
    })
    
    this.setData({ calendarDays })
    this.hideDatePicker()
  },

  removeDish: function(e) {
    const { date, dishId } = e.currentTarget.dataset
    const calendarDays = this.data.calendarDays.map(day => {
      if (day.fullDate === date) {
        return {
          ...day,
          dishes: day.dishes.filter(dish => dish.id !== dishId)
        }
      }
      return day
    })
    
    this.setData({ calendarDays })
  },

  initQuickDates: function() {
    const today = new Date()
    const quickDates = []
    
    for(let i = 0; i < 3; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      let label = ''
      switch(i) {
        case 0:
          label = '今天'
          break
        case 1:
          label = '明天'
          break
        case 2:
          label = '后天'
          break
      }
      
      quickDates.push({
        label: `${label} (${date.getMonth() + 1}/${date.getDate()})`,
        fullDate: `${date.getMonth() + 1}/${date.getDate()}`
      })
    }
    
    this.setData({ quickDates })
  },

  generateDishesWithSelected: function() {
    const selectedIngredients = [
      ...this.data.ingredients.vegetables,
      ...this.data.ingredients.meat,
      ...this.data.ingredients.condiments
    ].filter(item => item.selected)
      .map(item => item.name)

    if (selectedIngredients.length === 0) {
      wx.showToast({
        title: '请选择食材',
        icon: 'none'
      })
      return
    }

    this.generateDishes(selectedIngredients)
  },

  onGeneratorChange: function(e) {
    this.setData({
      currentGeneratorIndex: e.detail.value
    })
  },

  openVideo: function(e) {
    // 阻止事件冒泡
    if (e && e.currentTarget && typeof e.currentTarget.dataset === 'object') {
      // 获取视频数据
      const video = e.currentTarget.dataset.video
      
      // 如果是在菜品卡片内点击，阻止冒泡
      if (typeof e.stopPropagation === 'function') {
        e.stopPropagation()
      }

      // 复制视频链接到剪贴板
      wx.setClipboardData({
        data: video.url,
        success: () => {
          wx.showToast({
            title: '视频链接已复制',
            icon: 'success'
          })

          // 如果是bilibili链接，尝试打开小程序
          if (video.platform && video.platform.toLowerCase() === 'bilibili') {
            const aid = this.extractBilibiliAid(video.url)
            if (aid) {
              wx.navigateToMiniProgram({
                appId: 'wx7564fd5313d24844', // bilibili小程序的appId
                path: `pages/video/video?aid=${aid}`,
                fail: () => {
                  // 如果打开失败，提示用户手动打开
                  wx.showModal({
                    title: '提示',
                    content: '视频链接已复制，请手动打开浏览器观看',
                    showCancel: false
                  })
                }
              })
            } else {
              wx.showModal({
                title: '提示',
                content: '视频链接已复制，请手动打开浏览器观看',
                showCancel: false
              })
            }
          }
        },
        fail: () => {
          wx.showToast({
            title: '复制链接失败',
            icon: 'none'
          })
        }
      })
    }
  },

  extractBilibiliAid: function(url) {
    if (!url) return ''
    try {
      const match = url.match(/av(\d+)/) || url.match(/video\/(\d+)/)
      return match ? match[1] : ''
    } catch (error) {
      console.error('解析视频ID失败:', error)
      return ''
    }
  },

  // 添加新方法处理普通响应
  processResponse: function(content) {
    try {
      const dishesData = JSON.parse(content)
      console.log('解析后的菜品数据:', dishesData)
      
      const dishes = dishesData.dishes.map(dish => {
        return {
          ...dish,
          image: dish.image || this.getDefaultDishImage()
        }
      })
      console.log('最终处理的菜品数据:', dishes)
      
      this.setData({ recommendedDishes: dishes })
    } catch (error) {
      console.error('处理响应数据失败:', error)
      wx.showToast({
        title: '处理数据失败',
        icon: 'none'
      })
    }
  },

  // 轮询对话状态
  startStatusPolling: function(ingredients, apiConfig) {
    console.log('开始轮询对话状态, chatId:', this.data.chatId, 'conversationId:', this.data.conversationId)
    
    const pollingTimer = setInterval(() => {
      const retrieveUrl = `${apiConfig.url}/retrieve`
      console.log('请求对话详情接口:', retrieveUrl)
      
      // 查询对话详情
      wx.request({
        url: retrieveUrl,
        method: 'GET',
        header: apiConfig.headers,
        data: {
          chat_id: this.data.chatId,
          conversation_id: this.data.conversationId
        },
        success: (res) => {
          console.log('对话详情接口返回:', {
            status: res.statusCode,
            headers: res.header,
            data: res.data
          })

          // 检查响应格式
          if (!res.data || typeof res.data.status !== 'string') {
            console.error('无效的状态响应格式')
            return
          }

          const status = res.data.status
          console.log('当前对话状态:', status)

          // 检查是否完成
          if (status === 'completed' || status === 'failed' || status === 'error') {
            console.log('对话状态已结束:', status)
            // 停止状态轮询
            clearInterval(this.data.pollingTimer)
            this.setData({ pollingTimer: null })

            if (status === 'completed') {
              // 获取消息详情
              this.getMessageDetails(ingredients, apiConfig)
            } else {
              console.error('对话状态异常:', status)
              wx.showToast({
                title: '生成失败，请重试',
                icon: 'none'
              })
              wx.hideLoading()
            }
          } else if (status === 'created' || status === 'in_progress') {
            console.log('对话仍在进行中, 状态:', status)
          } else {
            console.warn('未知的对话状态:', status)
          }
        },
        fail: (error) => {
          console.error('状态查询失败:', error)
          clearInterval(this.data.pollingTimer)
          this.setData({ pollingTimer: null })
          wx.hideLoading()
          wx.showToast({
            title: '查询状态失败',
            icon: 'none'
          })
        }
      })
    }, 1000)

    this.setData({ pollingTimer })
  },

  // 获取消息详情
  getMessageDetails: function(ingredients, apiConfig) {
    const messageUrl = `${apiConfig.url}/message/list`
    console.log('请求消息详情接口:', messageUrl)
    
    wx.request({
      url: messageUrl,
      method: 'GET',
      header: apiConfig.headers,
      data: {
        chat_id: this.data.chatId,
        conversation_id: this.data.conversationId
      },
      success: (res) => {
        console.log('消息详情接口返回:', {
          status: res.statusCode,
          headers: res.header,
          data: res.data
        })

        try {
          if (!res.data || !res.data.data || !Array.isArray(res.data.data.messages)) {
            throw new Error('Invalid message details format')
          }

          const messages = res.data.data.messages
          console.log('所有消息:', messages)

          // 找到所有工具响应消息
          const toolResponses = messages.filter(msg => 
            msg.role === 'assistant' && 
            msg.type === 'tool_response' && 
            msg.content
          )

          console.log('找到的工具响应:', toolResponses)

          if (toolResponses.length === 0) {
            console.log('未找到任何工具响应消息')
            wx.hideLoading()
            wx.showToast({
              title: '未找到菜品数据',
              icon: 'none'
            })
            return
          }

          // 获取最后一个工具响应
          const finalToolResponse = toolResponses[toolResponses.length - 1]
          console.log('最终工具响应:', finalToolResponse)

          try {
            const toolResponse = JSON.parse(finalToolResponse.content)
            console.log('解析后的工具响应:', toolResponse)

            if (!toolResponse.recipes) {
              throw new Error('No recipes data in response')
            }

            if (toolResponse.recipes.length === 0) {
              console.log('菜品列表为空')
              wx.showToast({
                title: '未找到合适的菜品',
                icon: 'none'
              })
              wx.hideLoading()
              return
            }

            console.log('找到菜品数据, 数量:', toolResponse.recipes.length)
            
            const dishes = toolResponse.recipes.slice(0, 5).map((recipe, index) => ({
              id: index + 1,
              name: recipe.name,
              ingredients: ingredients,
              image: recipe.image || this.getDefaultDishImage(),
              description: [
                "准备食材和调料",
                "按照菜谱步骤烹饪",
                "调味后装盘即可"
              ],
              video: {
                url: "https://www.bilibili.com/video/BV1234567890",
                platform: "bilibili",
                title: `${recipe.name}烹饪教程`
              }
            }))

            console.log('处理后的菜品数据:', dishes)
            this.setData({ recommendedDishes: dishes })
            wx.hideLoading()

          } catch (parseError) {
            console.error('解析工具响应失败:', parseError)
            wx.showToast({
              title: '解析数据失败',
              icon: 'none'
            })
            wx.hideLoading()
          }
        } catch (error) {
          console.error('处理消息详情失败:', error)
          wx.showToast({
            title: '获取结果失败',
            icon: 'none'
          })
          wx.hideLoading()
        }
      },
      fail: (error) => {
        console.error('获取消息详情失败:', error)
        wx.showToast({
          title: '获取结果失败',
          icon: 'none'
        })
        wx.hideLoading()
      }
    })
  },

  onUnload: function() {
    // 页面卸载时清理轮询定时器
    if (this.data.pollingTimer) {
      clearInterval(this.data.pollingTimer)
    }
  }
}) 