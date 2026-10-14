// components/calendar-grid/calendar-grid.js
const { generateCalendarGrid } = require('../../utils/calendar');
const { WEEK_TITLES } = require('../../utils/constants');

Component({
  properties: {
    year: {
      type: Number,
      value: new Date().getFullYear()
    },
    month: {
      type: Number,
      value: new Date().getMonth() + 1
    },
    entries: {
      type: Object,
      value: {}
    }
  },

  data: {
    days: [],
    weekTitles: WEEK_TITLES,
    animating: false,
    slideClass: ''
  },

  observers: {
    'year, month, entries': function () {
      this.initGrid();
    }
  },

  lifetimes: {
    attached() {
      this.initGrid();
    },
    detached() {
      if (this._animTimer) {
        clearTimeout(this._animTimer);
        this._animTimer = null;
      }
      this._clearLongPressTimer();
    }
  },

  methods: {
    /**
     * 清理长按定时器
     */
    _clearLongPressTimer() {
      if (this._longPressTimer) {
        clearTimeout(this._longPressTimer);
        this._longPressTimer = null;
      }
    },

    /**
     * 生成 42 格日历网格数据
     */
    initGrid() {
      const { year, month, entries } = this.properties;
      if (!year || !month) return;
      const days = generateCalendarGrid(year, month, entries || {});
      this.setData({ days });
    },

    /**
     * 触摸开始 — 阻止冒泡 + 启动长按计时器（600ms）
     */
    onCellTouchStart(e) {
      // catchtouchstart 自动阻止触摸事件向上冒泡
      if (this.data.animating) return;

      const { dateStr, status, index } = e.currentTarget.dataset;
      this._longPressTriggered = false;

      // 仅空格子支持长按补录
      if (status === 'empty') {
        this._longPressTimer = setTimeout(() => {
          this._longPressTriggered = true;
          this.triggerEvent('celllongpress', { dateStr, index });
        }, 600);
      }
    },

    /**
     * 触摸结束 — 清理长按计时器
     */
    onCellTouchEnd(e) {
      this._clearLongPressTimer();
    },

    /**
     * 点击格子处理
     */
    onCellTap(e) {
      if (this.data.animating) return;
      // 如果刚触发了长按，忽略本次 tap
      if (this._longPressTriggered) {
        this._longPressTriggered = false;
        return;
      }

      const { dateStr, status, index } = e.currentTarget.dataset;
      const emotionCode = this.data.days[index]
        ? this.data.days[index].emotionCode
        : 0;

      this.triggerEvent('celltap', { dateStr, status, emotionCode });
    },

    /**
     * 精确更新单个格子（路径更新，不替换整个数组）
     * @param {string} dateStr - YYYY-MM-DD 格式日期
     * @param {number} emotionCode - 情绪代码
     * @param {boolean} isBackfill - 是否补录
     */
    updateCell(dateStr, emotionCode, isBackfill) {
      const index = this.data.days.findIndex(d => d.dateStr === dateStr);
      if (index === -1) return;

      this.setData({
        [`days[${index}].status`]: isBackfill ? 'backfill' : 'checked',
        [`days[${index}].emotionCode`]: emotionCode,
        [`days[${index}].isBackfill`]: !!isBackfill
      });
    },

    /**
     * 月份切换滑动动画
     * @param {string} direction - 'left' 或 'right'
     */
    slideTransition(direction) {
      if (this.data.animating) return;

      this.setData({ animating: true, slideClass: `slide-${direction}-out` });

      // 用 setTimeout 代替 transitionend 监听（300ms 对应 CSS transition 时长）
      this._animTimer = setTimeout(() => {
        this.setData({ animating: false, slideClass: '' });
        this.triggerEvent('animationend', { direction });
        this._animTimer = null;
      }, 300);
    }
  }
});
