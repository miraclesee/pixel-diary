// dal/local-storage-adapter.js - 本地存储适配器
const { STORAGE_PREFIX } = require('../utils/constants');

/**
 * 本地存储适配器
 * 存储键格式：emotion_YYYY_MM
 * 每条记录以月为单位聚合存储
 */
class LocalStorageAdapter {

  /**
   * 获取指定月份的全部打卡记录
   * @param {string} yearMonth - 格式 "YYYY-MM"
   * @returns {Promise<Object>} { "YYYY-MM-DD": { emotionCode, commentText, isPublic, isBackfill, createdAt }, ... }
   */
  async getMonthEntries(yearMonth) {
    const key = this._buildKey(yearMonth);
    try {
      const data = wx.getStorageSync(key);
      return data || {};
    } catch (e) {
      console.error(`[DAL] 读取月份数据失败: ${key}`, e);
      return {};
    }
  }

  /**
   * 保存单条打卡记录（只更新目标日，不全月覆盖）
   * @param {Object} entry - { dateStr, emotionCode, commentText, isPublic, isBackfill }
   * @returns {Promise<void>}
   */
  async saveEntry(entry) {
    const { dateStr, emotionCode, commentText, isPublic, isBackfill } = entry;

    // 从 dateStr (YYYY-MM-DD) 提取年月
    const yearMonth = dateStr.substring(0, 7); // "YYYY-MM"
    const key = this._buildKey(yearMonth);

    try {
      // 读取当月已有数据
      const monthData = wx.getStorageSync(key) || {};

      // 只更新目标日
      monthData[dateStr] = {
        emotionCode,
        commentText: commentText || '',
        isPublic: !!isPublic,
        isBackfill: !!isBackfill,
        createdAt: Date.now()
      };

      // 写回存储
      wx.setStorageSync(key, monthData);

      // 写入后检查存储容量
      this._checkStorageQuota();
    } catch (e) {
      console.error(`[DAL] 保存记录失败: ${dateStr}`, e);
      throw e;
    }
  }

  /**
   * 删除指定日期的打卡记录
   * @param {string} dateStr - YYYY-MM-DD 格式
   * @returns {Promise<void>}
   */
  async deleteEntry(dateStr) {
    const yearMonth = dateStr.substring(0, 7);
    const key = this._buildKey(yearMonth);

    try {
      const monthData = wx.getStorageSync(key) || {};
      if (monthData[dateStr]) {
        delete monthData[dateStr];
        wx.setStorageSync(key, monthData);
      }
    } catch (e) {
      console.error(`[DAL] 删除记录失败: ${dateStr}`, e);
      throw e;
    }
  }

  /**
   * 构建存储键
   * @private
   * @param {string} yearMonth - "YYYY-MM"
   * @returns {string} "emotion_YYYY_MM"
   */
  _buildKey(yearMonth) {
    // "YYYY-MM" -> "emotion_YYYY_MM"
    return `${STORAGE_PREFIX}${yearMonth.replace('-', '_')}`;
  }

  /**
   * 检查本地存储容量使用情况
   * @private
   */
  _checkStorageQuota() {
    try {
      const info = wx.getStorageInfoSync();
      // 微信小程序限制约 10MB，超过 80% 发出警告
      const usagePercent = (info.currentSize / info.limitSize) * 100;
      if (usagePercent > 80) {
        console.warn(`[DAL] 存储容量使用率较高: ${usagePercent.toFixed(1)}%`);
      }
    } catch (e) {
      // 获取存储信息失败不阻断主流程
    }
  }
}

module.exports = LocalStorageAdapter;
