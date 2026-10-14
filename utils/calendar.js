// utils/calendar.js - 日历工具纯函数集合

/**
 * 获取指定月份的天数
 * @param {number} year - 年份
 * @param {number} month - 月份（1-12）
 * @returns {number} 天数
 */
function getDaysInMonth(year, month) {
  // month 传入 1-12，Date 构造器月份为 0-11
  // 取该月第 0 天即为上月最后一天，巧妙获取天数
  return new Date(year, month, 0).getDate();
}

/**
 * 获取指定月份第一天是星期几
 * @param {number} year - 年份
 * @param {number} month - 月份（1-12）
 * @returns {number} 0=周日, 1=周一, ...6=周六
 */
function getFirstDayOfWeek(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * 生成 42 格（6行7列）日历网格数据
 * @param {number} year - 年份
 * @param {number} month - 月份（1-12）
 * @param {Object} entries - 打卡记录，格式：{ "YYYY-MM-DD": { emotionCode, commentText, isBackfill, ... } }
 * @returns {Array<Object>} 42 格数据数组
 */
function generateCalendarGrid(year, month, entries = {}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  // 计算上月信息（用于填充前置空格）
  const prev = getPrevMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(prev.year, prev.month);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${padZero(today.getMonth() + 1)}-${padZero(today.getDate())}`;

  const grid = [];

  // 前置格：上月日期（显示但不属于当月）
  for (let i = 0; i < firstDay; i++) {
    grid.push({
      day: 0,        // 非当月日期为 0
      dateStr: '',   // 非当月为空字符串
      status: 'empty',
      emotionCode: 0,
      isBackfill: false,
      isToday: false
    });
  }

  // 当月格
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${padZero(month)}-${padZero(d)}`;
    const entry = entries[dateStr];
    const isTodayCell = dateStr === todayStr;

    let status = 'empty';
    let emotionCode = 0;
    let isBackfill = false;

    if (entry) {
      status = entry.isBackfill ? 'backfill' : 'checked';
      emotionCode = entry.emotionCode || 0;
      isBackfill = !!entry.isBackfill;
    }

    grid.push({
      day: d,
      dateStr,
      status,
      emotionCode,
      isBackfill,
      isToday: isTodayCell
    });
  }

  // 后置格：补满 42 格
  const remaining = 42 - grid.length;
  for (let i = 0; i < remaining; i++) {
    grid.push({
      day: 0,
      dateStr: '',
      status: 'empty',
      emotionCode: 0,
      isBackfill: false,
      isToday: false
    });
  }

  return grid;
}

/**
 * 补录日期合法性校验（不晚于今天）
 * @param {string} dateStr - YYYY-MM-DD 格式日期字符串
 * @returns {boolean} 是否合法
 */
function isValidBackfillDate(dateStr) {
  if (!dateStr) return false;

  const target = new Date(dateStr.replace(/-/g, '/'));
  const today = new Date();
  // 比较日期部分（忽略时分秒）
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return target <= today;
}

/**
 * 判断给定日期是否是今天
 * @param {string} dateStr - YYYY-MM-DD 格式日期字符串
 * @returns {boolean}
 */
function isToday(dateStr) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${padZero(today.getMonth() + 1)}-${padZero(today.getDate())}`;
  return dateStr === todayStr;
}

/**
 * 格式化年月为 YYYY-MM
 * @param {number} year
 * @param {number} month - 1-12
 * @returns {string}
 */
function formatYearMonth(year, month) {
  return `${year}-${padZero(month)}`;
}

/**
 * 获取上一个月
 * @param {number} year
 * @param {number} month - 1-12
 * @returns {{ year: number, month: number }}
 */
function getPrevMonth(year, month) {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
}

/**
 * 获取下一个月
 * @param {number} year
 * @param {number} month - 1-12
 * @returns {{ year: number, month: number }}
 */
function getNextMonth(year, month) {
  if (month === 12) {
    return { year: year + 1, month: 1 };
  }
  return { year, month: month + 1 };
}

/**
 * 数字补零（1 -> "01"）
 * @param {number} n
 * @returns {string}
 */
function padZero(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

module.exports = {
  getDaysInMonth,
  getFirstDayOfWeek,
  generateCalendarGrid,
  isValidBackfillDate,
  isToday,
  formatYearMonth,
  getPrevMonth,
  getNextMonth,
  padZero
};
