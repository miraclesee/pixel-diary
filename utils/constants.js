// utils/constants.js - 全局常量定义

// 情绪类型枚举
const EMOTION_TYPES = [
  { code: 1, emoji: '😊', label: '快乐', color: 'var(--emotion-1)' },
  { code: 2, emoji: '😌', label: '平静', color: 'var(--emotion-2)' },
  { code: 3, emoji: '😥', label: '难过', color: 'var(--emotion-3)' },
  { code: 4, emoji: '😰', label: '焦虑', color: 'var(--emotion-4)' },
  { code: 5, emoji: '😴', label: '疲惫', color: 'var(--emotion-5)' },
  { code: 6, emoji: '🎉', label: '惊喜', color: 'var(--emotion-6)' }
];

// 本地存储键前缀
const STORAGE_PREFIX = 'emotion_';

// 格子状态
const CELL_STATUS = {
  EMPTY: 'empty',       // 无记录
  CHECKED: 'checked',   // 当日打卡
  BACKFILL: 'backfill'  // 补录
};

// 星期标题（周日开始）
const WEEK_TITLES = ['日', '一', '二', '三', '四', '五', '六'];

// 每月最大文字长度
const MAX_COMMENT_LENGTH = 200;

module.exports = {
  EMOTION_TYPES,
  STORAGE_PREFIX,
  CELL_STATUS,
  WEEK_TITLES,
  MAX_COMMENT_LENGTH
};
