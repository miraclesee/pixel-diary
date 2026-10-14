// pages/index/index.js - 首页逻辑
const { createDAL } = require('../../dal/index');
const { formatYearMonth, getPrevMonth, getNextMonth, padZero, isValidBackfillDate } = require('../../utils/calendar');

Page({
  data: {
    // 当前显示的年月
    year: 0,
    month: 0,
    // 当月打卡数据，格式 { "YYYY-MM-DD": { emotionCode, commentText, ... } }
    entries: {},
    // 打卡弹窗状态
    sheetVisible: false,
    sheetDateStr: '',
    sheetExistingEntry: null
  },

  /**
   * 页面加载：初始化 DAL、加载当月数据
   */
  onLoad() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // 创建数据访问层实例
    this._dal = createDAL();
    // 获取全局事件总线
    this._eventBus = getApp().eventBus;

    // 初始设置年月
    this.setData({ year, month });

    // 加载当月数据
    this._initialLoad = true;
    this.loadMonthData(year, month);
  },

  /**
   * 页面显示（从后台切回）
   */
  onShow() {
    // 跳过首次 onShow（onLoad 已加载，避免重复请求）
    if (this._initialLoad) {
      this._initialLoad = false;
      return;
    }
    // 每次显示时刷新当月数据（其他页面可能修改了记录）
    if (this._dal && this.data.year && this.data.month) {
      this.loadMonthData(this.data.year, this.data.month);
    }
  },

  /**
   * 页面隐藏（切到后台或跳转其他页面）
   */
  onHide() {
    // 暂停动画（日历组件内部已处理 detached，此处做扩展清理）
  },

  /**
   * 页面卸载：清理事件总线监听
   */
  onUnload() {
    if (this._eventBus) {
      this._eventBus.offAll(this);
    }
  },

  /**
   * 加载指定月份的数据
   * @param {number} year - 年份
   * @param {number} month - 月份（1-12）
   */
  async loadMonthData(year, month) {
    try {
      const yearMonth = formatYearMonth(year, month);
      const entries = await this._dal.getMonthEntries(yearMonth);
      this.setData({ entries });
    } catch (err) {
      console.error('[index] 加载月份数据失败:', err);
      this.setData({ entries: {} });
    }
  },

  /**
   * 切换到上个月
   */
  onPrevMonth() {
    const { year, month } = this.data;
    const prev = getPrevMonth(year, month);

    // 触发日历组件向右滑出动画，动画结束后在 onAnimationEnd 中更新数据
    const grid = this.selectComponent('#calendarGrid');
    if (grid) {
      grid.slideTransition('right');
    } else {
      // 组件未就绪时直接更新
      this.setData({ year: prev.year, month: prev.month });
      this.loadMonthData(prev.year, prev.month);
    }
  },

  /**
   * 切换到下个月
   */
  onNextMonth() {
    const { year, month } = this.data;
    const next = getNextMonth(year, month);

    // 触发日历组件向左滑出动画
    const grid = this.selectComponent('#calendarGrid');
    if (grid) {
      grid.slideTransition('left');
    } else {
      this.setData({ year: next.year, month: next.month });
      this.loadMonthData(next.year, next.month);
    }
  },

  /**
   * 月份切换动画结束回调
   * 根据动画方向更新年月并加载新数据
   */
  onAnimationEnd(e) {
    const { direction } = e.detail;
    const { year, month } = this.data;

    // 根据滑动方向计算新月份
    const newMonth = direction === 'left'
      ? getNextMonth(year, month)
      : getPrevMonth(year, month);

    this.setData({ year: newMonth.year, month: newMonth.month });
    this.loadMonthData(newMonth.year, newMonth.month);
  },

  /**
   * 日历格子长按事件（补录入口）
   */
  onCellLongPress(e) {
    if (this.data.sheetVisible) return;
    const { dateStr } = e.detail;
    if (!dateStr) return;

    if (!isValidBackfillDate(dateStr)) {
      wx.showToast({ title: '该日期不可补录', icon: 'none' });
      return;
    }

    this.setData({
      sheetDateStr: dateStr,
      sheetExistingEntry: null,
      sheetVisible: true
    });
  },

  /**
   * 日历格子点击事件
   * 边界处理：弹窗显示中忽略新点击（防快速连续点击）
   */
  onCellTap(e) {
    // 弹窗显示中不处理新的点击
    if (this.data.sheetVisible) return;

    const { dateStr, status } = e.detail;

    // 非当月格子（dateStr 为空）不响应
    if (!dateStr) return;

    const existingEntry = (status === 'checked' || status === 'backfill')
      ? (this.data.entries[dateStr] || null)
      : null;

    // 合并为单次 setData，避免多次触发渲染调度
    this.setData({
      sheetDateStr: dateStr,
      sheetExistingEntry: existingEntry,
      sheetVisible: true
    });
  },

  /**
   * 打卡保存成功回调
   * 更新本地数据（通过 observer 自动刷新日历网格） + 广播事件
   */
  onSaved(e) {
    const entry = e.detail;
    const { dateStr, emotionCode, isBackfill } = entry;

    // 更新本地 entries 数据（observer 会自动触发 initGrid 全量重算）
    const updatedEntries = {
      ...this.data.entries,
      [dateStr]: {
        emotionCode,
        commentText: entry.commentText || '',
        isPublic: !!entry.isPublic,
        isBackfill: !!isBackfill,
        createdAt: Date.now()
      }
    };
    this.setData({ entries: updatedEntries });

    // 通过事件总线广播保存事件（供广场页等其他模块监听）
    if (this._eventBus) {
      this._eventBus.emit('entry-saved', entry);
    }
  },

  /**
   * 打卡弹窗关闭回调
   */
  onSheetClose() {
    this.setData({
      sheetVisible: false,
      sheetExistingEntry: null
    });
  },

  /**
   * 浮动"+"按钮点击：触发今天的打卡
   * 边界处理：弹窗显示中忽略点击
   */
  onFabTap() {
    // 弹窗显示中忽略
    if (this.data.sheetVisible) return;

    const now = new Date();
    const y = now.getFullYear();
    const m = padZero(now.getMonth() + 1);
    const d = padZero(now.getDate());
    const todayStr = `${y}-${m}-${d}`;

    // 判断今天是否有已有记录（编辑模式）
    const existingEntry = this.data.entries[todayStr] || null;

    this.setData({
      sheetDateStr: todayStr,
      sheetExistingEntry: existingEntry,
      sheetVisible: true
    });
  }
});