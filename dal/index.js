// dal/index.js - 数据访问层工厂入口
const LocalStorageAdapter = require('./local-storage-adapter');
// const CloudAdapter = require('./cloud-adapter');

// 是否使用云开发（当前默认关闭，使用本地存储）
const USE_CLOUD = false;
let _instance = null;

/**
 * 创建数据访问层实例（单例模式）
 * @returns {LocalStorageAdapter|CloudAdapter}
 */
function createDAL() {
  if (_instance) return _instance;
  if (USE_CLOUD) {
    // TODO: return new CloudAdapter();
    throw new Error('Cloud adapter not implemented yet');
  }
  _instance = new LocalStorageAdapter();
  return _instance;
}

module.exports = { createDAL };
