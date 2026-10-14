// dal/cloud-adapter.js - 云开发存储适配器（骨架，待实现）

/**
 * 云开发存储适配器
 * 基于微信云开发数据库实现数据持久化
 */
class CloudAdapter {

  /**
   * 获取指定月份的全部打卡记录
   * @param {string} yearMonth - 格式 "YYYY-MM"
   * @returns {Promise<Object>}
   */
  async getMonthEntries(yearMonth) {
    // TODO: 实现云开发数据库查询
    // 1. 调用云函数或直连云数据库 collection('emotion_entries')
    // 2. 按 yearMonth 字段过滤，聚合返回 { "YYYY-MM-DD": { ... } } 格式
    throw new Error('CloudAdapter not implemented');
  }

  /**
   * 保存单条打卡记录
   * @param {Object} entry - { dateStr, emotionCode, commentText, isPublic, isBackfill }
   * @returns {Promise<void>}
   */
  async saveEntry(entry) {
    // TODO: 实现云函数调用
    // 1. 调用云函数 emotion_save 或直连云数据库 upsert
    // 2. 处理冲突和并发写入
    throw new Error('CloudAdapter not implemented');
  }

  /**
   * 删除指定日期的打卡记录
   * @param {string} dateStr - YYYY-MM-DD 格式
   * @returns {Promise<void>}
   */
  async deleteEntry(dateStr) {
    // TODO: 实现云开发数据库删除
    // 1. 调用云函数 emotion_delete 或直连云数据库 remove
    throw new Error('CloudAdapter not implemented');
  }
}

module.exports = CloudAdapter;
