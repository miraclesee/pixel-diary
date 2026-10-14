// components/checkin-sheet/checkin-sheet.js - 打卡弹窗组件
const { EMOTION_TYPES, MAX_COMMENT_LENGTH } = require('../../utils/constants');
const { createDAL } = require('../../dal/index');

Component({
  properties: {
    // 弹窗是否可见
    visible: {
      type: Boolean,
      value: false
    },
    // 打卡日期，格式 YYYY-MM-DD
    dateStr: {
      type: String,
      value: ''
    },
    // 已有打卡记录（编辑模式），null 表示新建模式
    existingEntry: {
      type: Object,
      value: null
    }
  },

  data: {
    // 情绪列表（供 WXML 渲染）
    emotions: EMOTION_TYPES,
    // 最大文字长度
    maxCommentLength: MAX_COMMENT_LENGTH,
    // 选中的情绪 code，0 表示未选中
    selectedEmotion: 0,
    // 输入的文字内容
    commentText: '',
    // 是否匿名发布到广场
    isPublic: false,
    // 是否为补录
    isBackfill: false,
    // 是否正在保存中（防重复提交）
    saving: false,
    // 关闭动画状态
    closing: false
  },

  observers: {
    // 监听 visible 变化：打开时初始化数据
    'visible': function (visible) {
      if (visible) {
        const entry = this.properties.existingEntry;
        const today = this._getTodayStr();
        const isBackfill = this.properties.dateStr < today;

        if (entry) {
          // 编辑模式：填充已有数据
          this.setData({
            selectedEmotion: entry.emotionCode || 0,
            commentText: entry.commentText || '',
            isPublic: !!entry.isPublic,
            isBackfill: isBackfill,
            closing: false
          });
        } else {
          // 新建模式：重置为空
          this.setData({
            selectedEmotion: 0,
            commentText: '',
            isPublic: false,
            isBackfill: isBackfill,
            closing: false
          });
        }
      }
    },
    // 监听 existingEntry 变化：填充已有数据
    'existingEntry': function (entry) {
      if (entry && this.properties.visible) {
        this.setData({
          selectedEmotion: entry.emotionCode || 0,
          commentText: entry.commentText || '',
          isPublic: !!entry.isPublic
        });
      }
    }
  },

  lifetimes: {
    // 组件挂载：初始化 DAL 实例
    attached() {
      this._dal = createDAL();
      this._closeTimer = null;
    },
    // 组件卸载：清理定时器
    detached() {
      if (this._closeTimer) {
        clearTimeout(this._closeTimer);
        this._closeTimer = null;
      }
    }
  },

  methods: {
    /**
     * 点击情绪表情
     */
    onEmotionTap(e) {
      const code = Number(e.currentTarget.dataset.code);
      this.setData({ selectedEmotion: code });
      // 轻触震动反馈
      wx.vibrateShort({ type: 'light' });
    },

    /**
     * 输入框内容变化
     */
    onCommentInput(e) {
      this.setData({ commentText: e.detail.value });
    },

    /**
     * 隐私开关切换
     */
    onPublicChange(e) {
      this.setData({ isPublic: e.detail.value });
    },

    /**
     * 点击遮罩层关闭弹窗（不保存）
     */
    onMaskTap() {
      this.close();
    },

    /**
     * 保存打卡记录
     */
    async onSave() {
      // 校验：必须选择情绪
      if (this.data.selectedEmotion === 0) {
        wx.showToast({ title: '请先选择今天的情绪', icon: 'none' });
        return;
      }
      // 防重复提交
      if (this.data.saving) {
        return;
      }

      this.setData({ saving: true });

      const entry = {
        dateStr: this.properties.dateStr,
        emotionCode: this.data.selectedEmotion,
        commentText: this.data.commentText,
        isPublic: this.data.isPublic,
        isBackfill: this.data.isBackfill
      };

      try {
        await this._dal.saveEntry(entry);
        // 保存成功，通知父组件
        this.triggerEvent('saved', { ...entry });
        this.close();
      } catch (err) {
        console.error('[checkin-sheet] 保存失败:', err);
        wx.showToast({ title: '保存失败，请重试', icon: 'none' });
      } finally {
        this.setData({ saving: false });
      }
    },

    /**
     * 关闭弹窗（带动画）
     */
    close() {
      // 添加关闭动画 class
      this.setData({ closing: true });
      // 等待动画完成后通知父组件
      this._closeTimer = setTimeout(() => {
        this.setData({ closing: false });
        this.triggerEvent('close');
      }, 300);
    },

    /**
     * 阻止事件冒泡（用于弹窗面板的 catchtap）
     */
    preventBubble() {
      // 空方法，仅阻止冒泡
    },

    /**
     * 获取今天的日期字符串 YYYY-MM-DD
     */
    _getTodayStr() {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
});
