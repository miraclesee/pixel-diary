// app.js - 像素日记小程序入口
const EventBus = require('./utils/event-bus');

App({
  onLaunch() {
    // 初始化事件总线，供各页面/组件通信
    this.eventBus = new EventBus();

    console.log('[App] 像素日记启动');
  }
});
