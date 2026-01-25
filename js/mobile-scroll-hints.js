/**
 * 移动端横向滚动指示器模块
 * 为横向滚动容器提供渐变遮罩和箭头按钮导航
 */

const MobileScrollHints = (function() {
    'use strict';

    // 配置常量
    const CONFIG = {
        SCROLL_AMOUNT: 150,      // 每次点击滚动的距离（像素）
        EDGE_THRESHOLD: 10,      // 判定到达边缘的阈值（像素）
        HIDDEN_CLASSES: ['opacity-0', 'pointer-events-none'],
    };

    // 元素 ID 常量
    const ELEMENT_IDS = {
        HINT_LEFT: 'scroll-hint-left',
        HINT_RIGHT: 'scroll-hint-right',
        BTN_LEFT: 'scroll-left-btn',
        BTN_RIGHT: 'scroll-right-btn',
    };

    /**
     * 初始化滚动指示器
     * @param {HTMLElement} scrollContainer - 横向滚动容器元素
     * @param {Object} [options] - 可选配置
     * @param {number} [options.scrollAmount] - 每次点击滚动距离
     * @param {number} [options.edgeThreshold] - 边缘判定阈值
     */
    function init(scrollContainer, options = {}) {
        if (!scrollContainer) {
            console.warn('[MobileScrollHints] 未提供滚动容器');
            return;
        }

        const hintLeft = document.getElementById(ELEMENT_IDS.HINT_LEFT);
        const hintRight = document.getElementById(ELEMENT_IDS.HINT_RIGHT);
        const btnLeft = document.getElementById(ELEMENT_IDS.BTN_LEFT);
        const btnRight = document.getElementById(ELEMENT_IDS.BTN_RIGHT);

        if (!hintLeft || !hintRight) {
            // 静默返回，可能在桌面端不需要这些元素
            return;
        }

        // 合并配置
        const scrollAmount = options.scrollAmount ?? CONFIG.SCROLL_AMOUNT;
        const edgeThreshold = options.edgeThreshold ?? CONFIG.EDGE_THRESHOLD;

        /**
         * 更新指示器显示状态
         */
        function updateHints() {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
            const maxScroll = scrollWidth - clientWidth;

            // 左侧指示器：不在最左边时显示
            const showLeft = scrollLeft > edgeThreshold;
            toggleVisibility(hintLeft, showLeft);

            // 右侧指示器：不在最右边时显示
            const showRight = scrollLeft < maxScroll - edgeThreshold;
            toggleVisibility(hintRight, showRight);
        }

        /**
         * 切换元素可见性
         */
        function toggleVisibility(element, visible) {
            if (visible) {
                element.classList.remove(...CONFIG.HIDDEN_CLASSES);
            } else {
                element.classList.add(...CONFIG.HIDDEN_CLASSES);
            }
        }

        // 绑定按钮点击事件
        btnLeft?.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        btnRight?.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        // 监听滚动事件（passive 优化性能）
        scrollContainer.addEventListener('scroll', updateHints, { passive: true });

        // 初始状态检查
        updateHints();

        // 返回清理函数（可选使用）
        return function cleanup() {
            scrollContainer.removeEventListener('scroll', updateHints);
        };
    }

    // 公开 API
    return {
        init,
        CONFIG,
    };
})();
