// components/emotion-stats/emotion-stats.js - 月度情绪统计组件
const { EMOTION_TYPES } = require('../../utils/constants');

Component({
  properties: {
    // 当月打卡记录，格式 { "YYYY-MM-DD": { emotionCode, ... } }
    entries: {
      type: Object,
      value: {}
    }
  },

  data: {
    // 是否有打卡数据
    hasData: false,
    // 情绪统计数组 [{ code, emoji, label, count, percent, barWidth, countText }, ...]
    stats: [],
    // 总打卡天数
    totalDays: 0
  },

  observers: {
    'entries': function (entries) {
      this._computeStats(entries || {});
    }
  },

  methods: {
    /**
     * 计算情绪分布统计
     * @private
     * @param {Object} entries - 当月打卡记录
     */
    _computeStats(entries) {
      const keys = Object.keys(entries);

      if (keys.length === 0) {
        this.setData({ hasData: false, stats: [], totalDays: 0 });
        return;
      }

      // 按情绪 code 统计出现次数
      const counts = {};
      keys.forEach(dateStr => {
        const code = entries[dateStr].emotionCode;
        if (code) {
          counts[code] = (counts[code] || 0) + 1;
        }
      });

      const totalDays = keys.length;
      // 找到最大计数值，用于条形宽度归一化
      const maxCount = Math.max(...Object.values(counts), 1);

      const stats = EMOTION_TYPES.map(emotion => {
        const count = counts[emotion.code] || 0;
        const percent = Math.round((count / totalDays) * 100);
        // 宽度相对最大计数值归一化，最多的情绪占满 100%
        const barWidth = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;

        return {
          code: emotion.code,
          emoji: emotion.emoji,
          label: emotion.label,
          count: count,
          percent: percent,
          barWidth: barWidth,
          countText: count + '天'
        };
      });

      this.setData({ hasData: true, stats: stats, totalDays: totalDays });
    }
  }
});
