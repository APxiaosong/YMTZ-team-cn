/**
 * 监狱重工 ZANE 官网 - 公共交互逻辑
 */

// ========================================
// 图标字体加载检测
// ========================================

/**
 * 检测图标字体加载完成后添加类名，触发淡入效果
 */
(function initIconFontLoader() {
    const applyLoaded = () => {
        // 延迟到下一帧，确保初始样式（opacity: 0）已渲染，过渡才能生效
        requestAnimationFrame(() => {
            document.documentElement.classList.add('icons-loaded');
        });
    };

    // 主动请求加载字体，等待实际下载完成
    document.fonts.load('24px "Material Symbols Outlined"')
        .then(applyLoaded)
        .catch(applyLoaded);  // 加载失败也显示，避免图标永久隐藏
})();

// ========================================
// 图片画廊切换功能
// ========================================

/**
 * 初始化图片画廊
 * @param {string} galleryId - 画廊容器的ID
 */
function initGallery(galleryId) {
    const gallery = document.getElementById(galleryId);
    if (!gallery) return;

    const mainImage = gallery.querySelector('.gallery-main');
    const thumbnails = gallery.querySelectorAll('.gallery-thumb');

    if (!mainImage || thumbnails.length === 0) return;

    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            // 更新主图
            const newSrc = thumb.dataset.src || thumb.src;
            mainImage.style.backgroundImage = `url("${newSrc}")`;

            // 更新缩略图激活状态
            thumbnails.forEach(t => t.classList.remove('ring-2', 'ring-primary'));
            thumb.classList.add('ring-2', 'ring-primary');
        });
    });
}

// ========================================
// 移动端导航菜单
// ========================================

function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// ========================================
// 自定义下拉菜单
// ========================================

/**
 * 初始化所有自定义下拉菜单
 */
function initCustomDropdowns() {
    const dropdowns = document.querySelectorAll('.custom-dropdown');

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const menu = dropdown.querySelector('.dropdown-menu');
        const options = dropdown.querySelectorAll('.dropdown-option');
        const hiddenInput = dropdown.querySelector('input[type="hidden"]');
        const selectedText = trigger.querySelector('.dropdown-selected');

        if (!trigger || !menu) return;

        // 点击触发器切换菜单
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !menu.classList.contains('hidden');

            // 关闭所有其他下拉菜单
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                m.classList.add('hidden');
                m.classList.remove('dropdown-open');
            });
            document.querySelectorAll('.dropdown-trigger').forEach(t => {
                t.classList.remove('dropdown-active');
            });

            if (!isOpen) {
                menu.classList.remove('hidden');
                menu.classList.add('dropdown-open');
                trigger.classList.add('dropdown-active');
            }
        });

        // 点击选项
        options.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                const text = option.textContent;

                // 更新显示文本
                if (selectedText) {
                    selectedText.textContent = text;
                    selectedText.classList.remove('text-gray-400');
                    selectedText.classList.add('text-white');
                }

                // 更新隐藏input的值
                if (hiddenInput) {
                    hiddenInput.value = value;
                }

                // 更新选中状态
                options.forEach(o => o.classList.remove('dropdown-selected-option'));
                option.classList.add('dropdown-selected-option');

                // 关闭菜单
                menu.classList.add('hidden');
                menu.classList.remove('dropdown-open');
                trigger.classList.remove('dropdown-active');
            });
        });
    });

    // 点击外部关闭菜单
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(m => {
            m.classList.add('hidden');
            m.classList.remove('dropdown-open');
        });
        document.querySelectorAll('.dropdown-trigger').forEach(t => {
            t.classList.remove('dropdown-active');
        });
    });
}

// ========================================
// 旗舰序列分类筛选
// ========================================

/**
 * 初始化旗舰序列页面的分类筛选功能
 */
function initCategoryFilter() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const productItems = document.querySelectorAll('.product-item');

    if (categoryBtns.length === 0 || productItems.length === 0) return;

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;

            // 更新按钮状态
            categoryBtns.forEach(b => {
                b.classList.remove('text-primary', 'border-primary');
                b.classList.add('text-gray-500', 'border-transparent');
            });
            btn.classList.remove('text-gray-500', 'border-transparent');
            btn.classList.add('text-primary', 'border-primary');

            // 筛选产品
            productItems.forEach((item, index) => {
                const itemCategories = item.dataset.categories || '';
                const shouldShow = category === 'all' || itemCategories.includes(category);

                if (shouldShow) {
                    // 先重置样式，确保动画能触发
                    item.classList.remove('hidden');
                    item.style.transition = 'none';
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(30px)';

                    // 强制重绘后再添加动画
                    item.offsetHeight;

                    // 添加动画，每个元素有递进延迟
                    item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                } else {
                    // 隐藏
                    item.style.transition = 'opacity 0.3s ease';
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.classList.add('hidden');
                    }, 300);
                }
            });
        });
    });
}

// ========================================
// 侧边栏系列切换（产品页/运输页）
// ========================================

/**
 * 初始化侧边栏系列切换功能
 */
function initSeriesFilter() {
    const seriesBtns = document.querySelectorAll('.series-btn');
    const productItems = document.querySelectorAll('.product-card');
    const listTitle = document.getElementById('list-title');
    const listDesc = document.getElementById('list-desc');

    if (seriesBtns.length === 0) return;

    seriesBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const series = btn.dataset.series;
            const seriesName = btn.dataset.name;
            const seriesDesc = btn.dataset.desc;

            // 更新按钮状态（高度和透明度由 CSS 控制）
            seriesBtns.forEach(b => {
                b.classList.remove('series-active');
            });
            btn.classList.add('series-active');

            // 更新列表标题和描述
            if (listTitle) listTitle.textContent = `正在查看：${seriesName} 系列产品`;
            if (listDesc) listDesc.textContent = seriesDesc;

            // 筛选产品
            let visibleIndex = 0;
            productItems.forEach(item => {
                const itemSeries = item.dataset.series;
                const shouldShow = series === 'all' || itemSeries === series;

                if (shouldShow) {
                    item.classList.remove('hidden');
                    item.style.transition = 'none';
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    item.offsetHeight;
                    item.style.transition = `opacity 0.5s ease ${visibleIndex * 0.08}s, transform 0.5s ease ${visibleIndex * 0.08}s`;
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                    visibleIndex++;
                } else {
                    item.style.transition = 'opacity 0.2s ease';
                    item.style.opacity = '0';
                    setTimeout(() => item.classList.add('hidden'), 200);
                }
            });
        });
    });
}

// ========================================
// 移动端滚动高亮
// ========================================

/**
 * 初始化移动端滚动高亮效果
 * 当元素滚动到视口中心区域时，自动触发类似 hover 的高亮状态
 */
function initScrollHighlight() {
    const isMobile = () => window.innerWidth < 768;

    if (!isMobile()) return;

    // 单例 Observer，避免重复创建
    const observer = new IntersectionObserver((entries) => {
        if (!isMobile()) return;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-active');
            } else {
                entry.target.classList.remove('is-active');
            }
        });
    }, {
        // 上下各缩进 40%，只有元素进入中间 20% 区域才触发
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0
    });

    // 观察新元素，跳过已观察的
    const observeNewElements = () => {
        document.querySelectorAll('[data-scroll-highlight]:not([data-observed])').forEach(el => {
            observer.observe(el);
            el.dataset.observed = 'true';
        });
    };

    // 初始设置
    observeNewElements();

    // 延迟捕获动态生成的元素（如精选旗舰卡片）
    setTimeout(observeNewElements, 1000);

    // 窗口大小变化时，在桌面端清理激活状态
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!isMobile()) {
                document.querySelectorAll('[data-scroll-highlight].is-active').forEach(el => {
                    el.classList.remove('is-active');
                });
            }
        }, 100);
    });
}

// ========================================
// 页面加载完成后初始化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // 初始化移动端菜单
    initMobileMenu();

    // 如果页面有图片画廊，初始化它
    if (document.getElementById('product-gallery')) {
        initGallery('product-gallery');
    }

    // 初始化自定义下拉菜单
    initCustomDropdowns();

    // 初始化旗舰序列分类筛选
    initCategoryFilter();

    // 初始化侧边栏系列切换
    initSeriesFilter();

    // 初始化移动端滚动高亮
    initScrollHighlight();
});
