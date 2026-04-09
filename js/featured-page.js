/**
 * 旗舰序列页逻辑
 * 负责加载精选产品并渲染全屏展示
 * 支持懒加载：每次加载6个产品，滚动到底部时加载更多
 */

(async function() {
    'use strict';

    // 配置
    const BATCH_SIZE = 6;           // 每次加载数量
    const SCROLL_THRESHOLD = 400;   // 距离底部多少像素时触发加载

    // 获取容器
    const container = document.getElementById('product-showcase');
    const statsActiveModels = document.getElementById('stats-active-models');
    const heroLabel = document.getElementById('hero-label');
    const heroTitle = document.getElementById('hero-title');
    const heroDesc = document.getElementById('hero-desc');
    const statsLabel = document.getElementById('stats-label');
    const statsStatus = document.getElementById('stats-status');

    if (!container) {
        console.error('[FeaturedPage] 找不到容器 #product-showcase');
        return;
    }

    // Hero 区域内容配置
    const heroContent = {
        all: {
            label: 'Flagship Series',
            title: '旗舰序列',
            desc: '集结监狱重工最尖端的技术成果。从防御装备到运输载具，从工业巨兽到精密系统，每一件旗舰产品都代表着我们的技术巅峰与设计理念。',
            statsLabel: 'Active Models',
            status: 'OPTIMAL'
        },
        znhi: {
            label: 'ZNHI Defense & Industry',
            title: '监狱重工精选',
            desc: '汇聚监狱重工的核心技术成果。从防御装备到工业机械，从重型载具到精密系统，每一件产品都代表着极端环境下的技术突破与工程创新。',
            statsLabel: 'Elite Units',
            status: 'COMBAT READY'
        },
        zntp: {
            label: 'ZNTP Transport Solutions',
            title: '监狱运输精选',
            desc: '监狱运输的核心产品线。专注于轨道交通与公共运输领域，从低地板有轨电车到双层公交，从货运机车到城市物流车辆，为现代交通提供可靠的解决方案。',
            statsLabel: 'Premium Vehicles',
            status: 'IN SERVICE'
        },
        znef: {
            label: 'ZNEF Emergency Force',
            title: '监狱紧急精选',
            desc: '监狱紧急部门的核心装备。专注于应急救援与现场支援，从紧急支援车到消防设备，确保在最危急的时刻提供可靠的力量。',
            statsLabel: 'Emergency Units',
            status: 'STANDBY'
        }
    };

    // 状态
    let allFeaturedProducts = [];   // 全部精选产品
    let displayedCount = 0;         // 已显示数量
    let isLoading = false;          // 防止重复加载
    let currentCategory = 'all';    // 当前筛选分类

    // 显示加载状态
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[50vh] gap-6">
            <div class="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p class="text-gray-500 text-sm tracking-wider">加载旗舰产品中...</p>
        </div>
    `;

    try {
        // 初始化数据加载器
        await ProductDataLoader.init();

        // 获取精选产品
        allFeaturedProducts = ProductDataLoader.getFeaturedProducts();

        if (allFeaturedProducts.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center min-h-[50vh] gap-6">
                    <span class="material-symbols-outlined text-6xl text-gray-600">inventory_2</span>
                    <h2 class="text-2xl font-display text-white">暂无旗舰产品</h2>
                    <p class="text-gray-400">敬请期待更多精选产品上线</p>
                </div>
            `;
            return;
        }

        // 初始化 Hero 区域内容
        updateHeroContent();

        // 清空容器
        container.innerHTML = '';

        // 加载第一批
        loadMore();

        // 绑定滚动事件（使用 window，因为是整个页面滚动）
        window.addEventListener('scroll', handleScroll);

        // 初始化分类筛选
        initCategoryFilter();

        console.log(`[FeaturedPage] 成功加载 ${allFeaturedProducts.length} 个旗舰产品`);

    } catch (error) {
        console.error('[FeaturedPage] 加载失败:', error);
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-[50vh] gap-6">
                <span class="material-symbols-outlined text-6xl text-gray-600">error_outline</span>
                <h2 class="text-2xl font-display text-white">加载失败</h2>
                <p class="text-gray-400">无法加载旗舰产品数据，请稍后重试</p>
                <button onclick="location.reload()" class="px-6 py-3 bg-primary text-white text-sm font-bold tracking-wider uppercase">
                    重新加载
                </button>
            </div>
        `;
    }

    /**
     * 处理滚动事件 - 检测是否需要加载更多
     */
    function handleScroll() {
        if (isLoading) return;
        if (displayedCount >= getFilteredProducts().length) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const distanceToBottom = documentHeight - scrollTop - windowHeight;

        if (distanceToBottom < SCROLL_THRESHOLD) {
            loadMore();
        }
    }

    /**
     * 获取当前筛选后的产品列表
     */
    function getFilteredProducts() {
        if (currentCategory === 'all') {
            return allFeaturedProducts;
        }
        return allFeaturedProducts.filter(p => {
            const categories = getCategoriesForProduct(p);
            return categories.includes(currentCategory);
        });
    }

    /**
     * 获取产品的分类标签（按品牌分类）
     */
    function getCategoriesForProduct(product) {
        const categories = [];
        const cls = product.classification;
        if (!cls || !cls.brand) return categories;

        // 按品牌分类
        if (cls.brand === 'ZNHI') {
            categories.push('znhi');
        } else if (cls.brand === 'ZNTP') {
            categories.push('zntp');
        } else if (cls.brand === 'ZNEF') {
            categories.push('znef');
        }

        return categories;
    }

    /**
     * 加载更多产品
     */
    function loadMore() {
        const filteredProducts = getFilteredProducts();
        if (isLoading || displayedCount >= filteredProducts.length) return;

        isLoading = true;

        // 移除加载指示器（如果存在）
        const loader = container.querySelector('.load-more-indicator');
        if (loader) loader.remove();

        // 计算要加载的产品
        const startIndex = displayedCount;
        const endIndex = Math.min(displayedCount + BATCH_SIZE, filteredProducts.length);
        const newProducts = filteredProducts.slice(startIndex, endIndex);

        // 追加新产品区块
        const tempDiv = document.createElement('div');

        newProducts.forEach((product, index) => {
            tempDiv.innerHTML = Renderer.renderFeaturedSection(product);
            const section = tempDiv.firstElementChild;

            // 添加分类数据属性
            const categories = getCategoriesForProduct(product);
            section.setAttribute('data-categories', categories.join(','));

            // 入场动画
            section.style.opacity = '0';
            section.style.transform = 'translateY(40px)';

            container.appendChild(section);

            // 延迟触发动画
            setTimeout(() => {
                section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, index * 100);
        });

        // 更新已显示数量
        displayedCount = endIndex;

        // 添加加载指示器（如果还有更多）
        if (displayedCount < filteredProducts.length) {
            const loaderHtml = `
                <div class="load-more-indicator py-16 flex justify-center">
                    <div class="flex items-center gap-3 text-gray-500">
                        <div class="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        <span class="text-xs tracking-widest">正在加载更多旗舰产品...</span>
                    </div>
                </div>
            `;
            const loaderDiv = document.createElement('div');
            loaderDiv.innerHTML = loaderHtml;
            container.appendChild(loaderDiv.firstElementChild);
        }

        isLoading = false;
    }

    /**
     * 重置产品列表（切换分类时调用）
     */
    function resetProducts() {
        displayedCount = 0;
        container.innerHTML = '';
        loadMore();
    }

    /**
     * 初始化分类筛选
     */
    function initCategoryFilter() {
        const categoryBtns = document.querySelectorAll('.category-btn');
        const viewAllLink = document.getElementById('view-all-link');

        if (categoryBtns.length === 0) return;

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;

                // 如果点击的是当前分类，不做处理
                if (category === currentCategory) return;

                // 更新按钮状态
                categoryBtns.forEach(b => {
                    b.classList.remove('text-primary', 'border-primary');
                    b.classList.add('text-gray-500', 'border-transparent');
                });
                btn.classList.remove('text-gray-500', 'border-transparent');
                btn.classList.add('text-primary', 'border-primary');

                // 更新当前分类并重置列表
                currentCategory = category;
                resetProducts();

                // 更新"查看完整产品列表"按钮的跳转链接
                updateViewAllLink();

                // 更新主题色
                updateThemeColor();

                // 更新 Hero 区域内容
                updateHeroContent();
            });
        });

        console.log('[FeaturedPage] 分类筛选已初始化');
    }

    /**
     * 更新"查看完整产品列表"按钮的跳转链接
     */
    function updateViewAllLink() {
        const viewAllLink = document.getElementById('view-all-link');
        if (!viewAllLink) return;

        if (currentCategory === 'zntp') {
            viewAllLink.href = 'transport.html';
        } else if (currentCategory === 'znef') {
            viewAllLink.href = 'emergency.html';
        } else {
            viewAllLink.href = 'products.html';
        }
    }

    /**
     * 更新主题色（ZNTP 使用绿色主题，其他使用默认蓝色主题）
     */
    function updateThemeColor() {
        const html = document.documentElement;
        html.classList.remove('theme-zntp', 'theme-znef');

        if (currentCategory === 'zntp') {
            html.classList.add('theme-zntp');
        } else if (currentCategory === 'znef') {
            html.classList.add('theme-znef');
        }
    }

    /**
     * 更新 Hero 区域内容
     */
    function updateHeroContent() {
        const content = heroContent[currentCategory];
        if (!content) return;

        // 获取所有需要动画的元素
        const animatedElements = [heroLabel, heroTitle, heroDesc, statsLabel, statsActiveModels, statsStatus].filter(el => el);

        // 移除现有动画类，触发重排
        animatedElements.forEach(el => {
            el.classList.remove('animate-slide-in-left');
            void el.offsetWidth; // 强制重排
        });

        // 更新文本内容
        if (heroLabel) heroLabel.textContent = content.label;
        if (heroTitle) heroTitle.textContent = content.title;
        if (heroDesc) heroDesc.textContent = content.desc;
        if (statsLabel) statsLabel.textContent = content.statsLabel;
        if (statsStatus) statsStatus.textContent = content.status;

        // 更新统计数字（显示当前筛选后的产品数量）
        if (statsActiveModels) {
            const filteredProducts = getFilteredProducts();
            statsActiveModels.textContent = filteredProducts.length;
        }

        // 添加动画类，所有元素一起滑入
        animatedElements.forEach(el => {
            el.classList.add('animate-slide-in-left');
        });
    }
})();
