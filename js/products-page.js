/**
 * 产品列表页逻辑（监狱重工 - ZNHI）
 * 负责加载产品数据并渲染侧边栏和产品列表
 * 支持懒加载：每次加载14个产品，滚动到底部时加载更多
 */

(async function() {
    'use strict';

    // 配置
    const BATCH_SIZE = 14;          // 每次加载数量
    const SCROLL_THRESHOLD = 200;   // 距离底部多少像素时触发加载

    // 获取容器
    const seriesContainer = document.getElementById('series-list-container');
    const productsContainer = document.getElementById('products-list-container');
    const listTitle = document.getElementById('list-title');
    const listDesc = document.getElementById('list-desc');
    // 产品列表的滚动容器（section 元素）
    const scrollContainer = productsContainer?.closest('section');
    // 移动端系列选择器
    const mobileSeriesSelector = document.getElementById('mobile-series-selector');

    // 筛选面板相关元素
    const filterBtn = document.getElementById('filter-btn');
    const filterPanel = document.getElementById('filter-panel');
    const filterOverlay = document.getElementById('filter-overlay');
    const filterCloseBtn = document.getElementById('filter-close-btn');
    const filterOptionsContainer = document.getElementById('filter-options-container');
    const filterApplyBtn = document.getElementById('filter-apply-btn');
    const filterClearBtn = document.getElementById('filter-clear-btn');
    const activeFiltersContainer = document.getElementById('active-filters');

    if (!seriesContainer || !productsContainer || !scrollContainer) {
        console.error('[ProductsPage] 找不到必要的容器');
        return;
    }

    // 状态
    let currentSeries = 'all';
    let currentProducts = [];   // 当前筛选后的全部产品
    let displayedCount = 0;     // 已显示数量
    let isLoading = false;      // 防止重复加载
    let currentSeriesName = '全部';

    // 筛选状态
    let selectedSubcategories = new Set(); // 当前选中的子分类
    let availableSubcategories = [];       // 可用的子分类列表

    // 显示加载状态
    productsContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-24 gap-6">
            <div class="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p class="text-gray-500 text-sm tracking-wider">加载产品数据中...</p>
        </div>
    `;

    try {
        // 初始化数据加载器
        await ProductDataLoader.init();

        // 获取 ZNHI 品牌的所有产品
        const allProducts = ProductDataLoader.getProductsByBrand('ZNHI');

        if (allProducts.length === 0) {
            productsContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center py-24 gap-6">
                    <span class="material-symbols-outlined text-6xl text-gray-600">inventory_2</span>
                    <h2 class="text-2xl font-display text-white">暂无产品数据</h2>
                </div>
            `;
            return;
        }

        // 获取所有系列
        const seriesData = getSeriesFromProducts(allProducts);

        // 渲染侧边栏系列列表
        renderSeriesList(seriesData);

        // 渲染移动端系列选择器
        renderMobileSeriesSelector(seriesData);

        // 初始化产品列表（显示全部）
        resetProducts(allProducts, '全部');

        // 绑定滚动事件
        scrollContainer.addEventListener('scroll', handleScroll);

        // 绑定筛选面板事件
        initFilterPanel();

        console.log(`[ProductsPage] 成功加载 ${allProducts.length} 个产品，${seriesData.length} 个系列`);

    } catch (error) {
        console.error('[ProductsPage] 加载失败:', error);
        productsContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center py-24 gap-6">
                <span class="material-symbols-outlined text-6xl text-gray-600">error_outline</span>
                <h2 class="text-2xl font-display text-white">加载失败</h2>
                <p class="text-gray-400">无法加载产品数据，请稍后重试</p>
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
        if (displayedCount >= currentProducts.length) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const distanceToBottom = scrollHeight - scrollTop - clientHeight;

        if (distanceToBottom < SCROLL_THRESHOLD) {
            loadMore();
        }
    }

    /**
     * 加载更多产品
     */
    function loadMore() {
        if (isLoading || displayedCount >= currentProducts.length) return;

        isLoading = true;

        // 计算要加载的产品
        const startIndex = displayedCount;
        const endIndex = Math.min(displayedCount + BATCH_SIZE, currentProducts.length);
        const newProducts = currentProducts.slice(startIndex, endIndex);

        // 移除列表结尾（如果存在）
        const footer = productsContainer.querySelector('.list-footer');
        if (footer) footer.remove();

        // 追加新产品卡片
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');

        newProducts.forEach((product, index) => {
            tempDiv.innerHTML = Renderer.renderProductListCard(product);
            const card = tempDiv.firstElementChild;

            // 入场动画
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            fragment.appendChild(card);

            // 延迟触发动画
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });

        productsContainer.appendChild(fragment);

        // 更新已显示数量
        displayedCount = endIndex;

        // 添加列表结尾或加载指示器
        appendFooter();

        isLoading = false;
    }

    /**
     * 添加列表结尾或加载状态
     */
    function appendFooter() {
        const hasMore = displayedCount < currentProducts.length;
        const seriesTag = currentSeriesName === '全部' ? 'ALL' : currentSeriesName.toUpperCase();

        const footerHtml = hasMore ? `
            <div class="list-footer pt-8 flex justify-center">
                <div class="flex items-center gap-3 text-gray-500">
                    <div class="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span class="text-xs tracking-widest">正在加载更多...</span>
                </div>
            </div>
        ` : `
            <div class="list-footer pt-12 flex justify-center border-t border-white/5">
                <div class="text-center">
                    <p class="text-gray-500 text-xs tracking-widest mb-4">END OF [${seriesTag}] SERIES DATA LISTING</p>
                    <p class="text-gray-600 text-xs mb-4">共 ${currentProducts.length} 个产品</p>
                    <button class="px-8 py-3 border border-white/5 hover:border-primary/40 text-gray-400 hover:text-white text-xs font-bold tracking-widest uppercase transition-all">
                        申请更高级别访问权限
                    </button>
                </div>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = footerHtml;
        productsContainer.appendChild(tempDiv.firstElementChild);
    }

    /**
     * 重置产品列表（切换系列时调用）
     */
    function resetProducts(products, seriesName) {
        currentProducts = products;
        currentSeriesName = seriesName;
        displayedCount = 0;

        // 滚动到顶部
        scrollContainer.scrollTop = 0;

        if (products.length === 0) {
            productsContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center py-24 gap-6">
                    <span class="material-symbols-outlined text-4xl text-gray-600">search_off</span>
                    <p class="text-gray-400">该系列暂无产品</p>
                </div>
            `;
            return;
        }

        // 清空容器
        productsContainer.innerHTML = '';

        // 加载第一批
        loadMore();
    }

    /**
     * 从产品列表中提取系列信息
     */
    function getSeriesFromProducts(products) {
        const seriesMap = new Map();

        products.forEach(product => {
            const cls = product.classification;
            if (cls && cls.series) {
                const key = cls.series;
                if (!seriesMap.has(key)) {
                    seriesMap.set(key, {
                        name: cls.series,
                        nameEn: cls.seriesEn || '',
                        count: 0,
                        products: [],
                        thumbnail: product.media?.thumbnail || ''
                    });
                }
                const seriesInfo = seriesMap.get(key);
                seriesInfo.count++;
                seriesInfo.products.push(product);
            }
        });

        return Array.from(seriesMap.values());
    }

    /**
     * 渲染侧边栏系列列表
     */
    function renderSeriesList(seriesData) {
        // "全部"选项 - 使用业务领域背景图
        let html = `
            <button class="series-btn series-active w-full text-left group border-b border-white/5 transition-all duration-300"
                    data-series="all" data-name="全部产品" data-desc="ZNHI 品牌的全部产品线">
                <div class="series-inner relative overflow-hidden">
                    <img alt="All Products"
                         loading="lazy"
                         class="w-full h-full object-cover saturate-50 contrast-125 transition-transform duration-700 group-hover:scale-110"
                         src="assets/images/products/business-defense.webp"/>
                    <div class="absolute inset-0 bg-gradient-to-t from-surface-dark to-transparent opacity-80"></div>
                    <div class="absolute bottom-6 left-8">
                        <span class="text-primary font-mono text-[11px] tracking-[0.3em] uppercase block mb-1">All Products</span>
                        <h3 class="text-white font-display text-xl font-bold">全部产品</h3>
                    </div>
                    <div class="absolute top-4 right-4">
                        <span class="material-symbols-outlined text-primary text-3xl opacity-20">apps</span>
                    </div>
                </div>
            </button>
        `;

        // 添加各系列
        seriesData.forEach((series, index) => {
            const thumbUrl = Renderer.getImageUrl(series.thumbnail);
            html += `
                <button class="series-btn w-full text-left group border-b border-white/5 transition-all duration-300 hover:bg-surface-highlight/30"
                        data-series="${series.nameEn.toLowerCase()}"
                        data-name="[${series.name}]"
                        data-desc="${series.name}系列产品，共${series.count}个型号">
                    <div class="series-inner relative overflow-hidden">
                        <img alt="${series.name} Series"
                             loading="lazy"
                             class="w-full h-full object-cover saturate-50 contrast-125 transition-transform duration-700 group-hover:scale-110"
                             src="${thumbUrl}"/>
                        <div class="absolute inset-0 bg-gradient-to-t from-surface-dark/90 to-transparent"></div>
                        <div class="absolute bottom-6 left-8">
                            <span class="text-gray-500 font-mono text-[11px] tracking-[0.3em] uppercase block mb-1">Series ${String(index + 1).padStart(2, '0')}</span>
                            <h3 class="text-gray-300 group-hover:text-white font-display text-xl font-bold transition-colors">[${series.name}] ${series.nameEn}</h3>
                        </div>
                    </div>
                </button>
            `;
        });

        seriesContainer.innerHTML = html;

        // 绑定点击事件（调用公共切换函数）
        const seriesBtns = seriesContainer.querySelectorAll('.series-btn');
        seriesBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                switchSeries(btn.dataset.series, btn.dataset.name, btn.dataset.desc);
            });
        });
    }

    /**
     * 渲染移动端系列选择器
     */
    function renderMobileSeriesSelector(seriesData) {
        if (!mobileSeriesSelector) return;

        const container = mobileSeriesSelector.querySelector('div');
        if (!container) return;

        // "全部"选项
        let html = `
            <button class="mobile-series-btn series-active px-4 py-2 text-sm font-bold tracking-wider whitespace-nowrap
                          border-b-2 border-primary text-primary transition-colors"
                    data-series="all" data-name="全部产品" data-desc="ZNHI 品牌的全部产品线">
                全部
            </button>
        `;

        // 各系列选项
        seriesData.forEach(series => {
            html += `
                <button class="mobile-series-btn px-4 py-2 text-sm font-bold tracking-wider whitespace-nowrap
                              border-b-2 border-transparent text-gray-500 hover:text-white transition-colors"
                        data-series="${series.nameEn.toLowerCase()}"
                        data-name="[${series.name}]"
                        data-desc="${series.name}系列产品，共${series.count}个型号">
                    ${series.name}
                </button>
            `;
        });

        container.innerHTML = html;

        // 绑定点击事件
        const mobileBtns = container.querySelectorAll('.mobile-series-btn');
        mobileBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                switchSeries(btn.dataset.series, btn.dataset.name, btn.dataset.desc);
            });
        });

        // 初始化滚动指示器（使用公共模块）
        MobileScrollHints.init(mobileSeriesSelector);
    }

    /**
     * 切换系列（公共函数，同步更新桌面端和移动端状态）
     */
    function switchSeries(series, seriesName, seriesDesc) {
        // 更新桌面端侧边栏按钮状态
        const desktopBtns = seriesContainer?.querySelectorAll('.series-btn');
        desktopBtns?.forEach(b => {
            b.classList.toggle('series-active', b.dataset.series === series);
        });

        // 更新移动端选择器按钮状态
        const mobileBtns = mobileSeriesSelector?.querySelectorAll('.mobile-series-btn');
        mobileBtns?.forEach(b => {
            const isActive = b.dataset.series === series;
            b.classList.toggle('series-active', isActive);
            b.classList.toggle('border-primary', isActive);
            b.classList.toggle('text-primary', isActive);
            b.classList.toggle('border-transparent', !isActive);
            b.classList.toggle('text-gray-500', !isActive);
        });

        // 更新标题和描述
        if (listTitle) listTitle.textContent = `正在查看：${seriesName}`;
        if (listDesc) listDesc.textContent = seriesDesc;

        // 筛选并渲染产品
        currentSeries = series;
        const allProducts = ProductDataLoader.getProductsByBrand('ZNHI');

        if (series === 'all') {
            resetProducts(allProducts, '全部');
        } else {
            const filtered = allProducts.filter(p =>
                p.classification?.seriesEn?.toLowerCase() === series
            );
            const chineseName = seriesName.replace(/[\[\]]/g, '');
            resetProducts(filtered, chineseName);
        }
    }

    /**
     * 初始化筛选面板事件
     */
    function initFilterPanel() {
        if (!filterBtn || !filterPanel) return;

        // 点击筛选按钮，显示/隐藏面板
        filterBtn.addEventListener('click', toggleFilterPanel);

        // 点击关闭按钮
        if (filterCloseBtn) {
            filterCloseBtn.addEventListener('click', hideFilterPanel);
        }

        // ESC 键关闭面板
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !filterPanel.classList.contains('hidden')) {
                hideFilterPanel();
            }
        });

        // 点击遮罩层关闭面板
        if (filterOverlay) {
            filterOverlay.addEventListener('click', hideFilterPanel);
        }

        // 应用筛选按钮
        if (filterApplyBtn) {
            filterApplyBtn.addEventListener('click', applyFilter);
        }

        // 清除筛选按钮
        if (filterClearBtn) {
            filterClearBtn.addEventListener('click', clearFilter);
        }
    }

    /**
     * 切换筛选面板显示状态
     */
    function toggleFilterPanel() {
        if (filterPanel.classList.contains('hidden')) {
            showFilterPanel();
        } else {
            hideFilterPanel();
        }
    }

    /**
     * 显示筛选面板
     */
    function showFilterPanel() {
        // 获取当前分类下的子分类
        const seriesName = currentSeries === 'all' ? null : currentSeries.toUpperCase();
        availableSubcategories = ProductDataLoader.getSubcategoriesByBrandAndSeries('ZNHI', seriesName);

        // 渲染筛选选项
        renderFilterOptions();

        // 显示遮罩层
        if (filterOverlay) {
            filterOverlay.classList.remove('hidden');
            filterOverlay.style.opacity = '0';
            setTimeout(() => {
                filterOverlay.style.opacity = '1';
            }, 10);
        }

        // 显示面板
        filterPanel.classList.remove('hidden');
        filterPanel.style.opacity = '0';
        filterPanel.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            filterPanel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            filterPanel.style.opacity = '1';
            filterPanel.style.transform = 'translateY(0)';
        }, 10);

        // 防止body滚动
        document.body.style.overflow = 'hidden';
    }

    /**
     * 隐藏筛选面板
     */
    function hideFilterPanel() {
        // 隐藏面板
        filterPanel.style.opacity = '0';
        filterPanel.style.transform = 'translateY(-20px)';

        // 隐藏遮罩层
        if (filterOverlay) {
            filterOverlay.style.opacity = '0';
        }

        setTimeout(() => {
            filterPanel.classList.add('hidden');
            if (filterOverlay) {
                filterOverlay.classList.add('hidden');
            }
            // 恢复body滚动
            document.body.style.overflow = '';
        }, 300);
    }

    /**
     * 渲染筛选选项
     */
    function renderFilterOptions() {
        if (!filterOptionsContainer) return;

        if (availableSubcategories.length === 0) {
            filterOptionsContainer.innerHTML = `
                <div class="col-span-full text-center py-8 text-gray-500">
                    该分类下暂无可筛选的类型
                </div>
            `;
            return;
        }

        const html = availableSubcategories.map(sub => `
            <label class="flex items-center gap-3 p-3 border border-white/10 rounded hover:border-primary/30 transition-colors cursor-pointer group">
                <input type="checkbox"
                       class="filter-checkbox w-4 h-4 rounded border-gray-600 bg-transparent text-primary focus:ring-primary focus:ring-offset-0"
                       value="${Renderer.escapeHtml(sub.name)}"
                       ${selectedSubcategories.has(sub.name) ? 'checked' : ''}>
                <span class="flex-grow text-sm text-gray-300 group-hover:text-white transition-colors">
                    ${Renderer.escapeHtml(sub.name)}
                </span>
                <span class="text-xs text-gray-600 font-mono">${sub.count}</span>
            </label>
        `).join('');

        filterOptionsContainer.innerHTML = html;

        // 绑定复选框事件
        const checkboxes = filterOptionsContainer.querySelectorAll('.filter-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const value = e.target.value;
                if (e.target.checked) {
                    selectedSubcategories.add(value);
                } else {
                    selectedSubcategories.delete(value);
                }
            });
        });
    }

    /**
     * 应用筛选
     */
    function applyFilter() {
        // 获取当前系列的所有产品
        const allProducts = ProductDataLoader.getProductsByBrand('ZNHI');
        let filtered;

        if (currentSeries === 'all') {
            filtered = allProducts;
        } else {
            filtered = allProducts.filter(p =>
                p.classification?.seriesEn?.toLowerCase() === currentSeries
            );
        }

        // 如果有选中的子分类，进行筛选
        if (selectedSubcategories.size > 0) {
            filtered = filtered.filter(p =>
                selectedSubcategories.has(p.classification?.subcategory)
            );
        }

        // 更新产品列表
        resetProducts(filtered, currentSeriesName);

        // 更新筛选条件显示
        updateActiveFilters();

        // 更新筛选按钮状态
        updateFilterButtonState();

        // 隐藏面板
        hideFilterPanel();
    }

    /**
     * 清除筛选
     */
    function clearFilter() {
        selectedSubcategories.clear();
        renderFilterOptions();

        // 重新加载当前系列的所有产品
        const allProducts = ProductDataLoader.getProductsByBrand('ZNHI');
        let filtered;

        if (currentSeries === 'all') {
            filtered = allProducts;
        } else {
            filtered = allProducts.filter(p =>
                p.classification?.seriesEn?.toLowerCase() === currentSeries
            );
        }

        resetProducts(filtered, currentSeriesName);

        // 更新筛选条件显示
        updateActiveFilters();

        // 更新筛选按钮状态
        updateFilterButtonState();

        // 隐藏面板
        hideFilterPanel();
    }

    /**
     * 更新当前筛选条件显示
     */
    function updateActiveFilters() {
        if (!activeFiltersContainer) return;

        if (selectedSubcategories.size === 0) {
            activeFiltersContainer.classList.add('hidden');
            return;
        }

        const html = Array.from(selectedSubcategories).map(sub => `
            <div class="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-sm text-sm">
                <span class="text-white">${Renderer.escapeHtml(sub)}</span>
                <button class="text-primary hover:text-white transition-colors" data-remove="${Renderer.escapeHtml(sub)}">
                    <span class="material-symbols-outlined text-sm">close</span>
                </button>
            </div>
        `).join('');

        activeFiltersContainer.innerHTML = html;
        activeFiltersContainer.classList.remove('hidden');

        // 绑定移除按钮事件
        const removeBtns = activeFiltersContainer.querySelectorAll('[data-remove]');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.dataset.remove;
                selectedSubcategories.delete(value);
                applyFilter();
            });
        });
    }

    /**
     * 更新筛选按钮状态
     */
    function updateFilterButtonState() {
        if (!filterBtn) return;

        if (selectedSubcategories.size > 0) {
            filterBtn.classList.add('border-primary', 'text-primary');
            filterBtn.classList.remove('border-white/10', 'text-gray-500');
        } else {
            filterBtn.classList.remove('border-primary', 'text-primary');
            filterBtn.classList.add('border-white/10', 'text-gray-500');
        }
    }
})();
