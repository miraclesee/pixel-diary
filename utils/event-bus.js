// utils/event-bus.js - 极简发布/订阅事件总线

class EventBus {
  constructor() {
    // 存储格式：{ eventName: [{ callback, owner }, ...] }
    this._events = {};
  }

  /**
   * 订阅事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} [owner] - 订阅者引用（页面或组件实例），用于批量清理
   */
  on(event, callback, owner) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push({ callback, owner: owner || null });
  }

  /**
   * 发布事件
   * @param {string} event - 事件名称
   * @param {*} data - 传递的数据
   */
  emit(event, data) {
    const listeners = this._events[event];
    if (!listeners) return;
    listeners.forEach(({ callback }) => {
      try {
        callback(data);
      } catch (e) {
        console.error(`[EventBus] 事件 "${event}" 回调执行出错:`, e);
      }
    });
  }

  /**
   * 取消订阅（按回调函数引用精确移除）
   * @param {string} event - 事件名称
   * @param {Function} callback - 要移除的回调函数
   */
  off(event, callback) {
    const listeners = this._events[event];
    if (!listeners) return;
    this._events[event] = listeners.filter(item => item.callback !== callback);
  }

  /**
   * 按 owner 批量清理所有监听
   * 适用于页面/组件销毁时清理其注册的所有事件
   * @param {Object} owner - 订阅者引用（页面或组件实例）
   */
  offAll(owner) {
    Object.keys(this._events).forEach(event => {
      this._events[event] = this._events[event].filter(
        item => item.owner !== owner
      );
    });
  }
}

module.exports = EventBus;
