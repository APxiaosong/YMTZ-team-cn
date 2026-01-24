/**
 * 渲染器工具函数集合
 * 负责将产品数据渲染为 HTML
 */

const Renderer = (function() {
    // 图片基础路径
    const IMAGE_BASE = 'assets/images/';

    // 占位图
    const PLACEHOLDER_IMAGE = 'assets/images/placeholder.webp';

    /**
     * 辅助函数：HTML 转义（防 XSS）
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 辅助函数：条件渲染
     */
    function renderIf(condition, content) {
        return condition ? content : '';
    }

    /**
     * 辅助函数：获取图片路径
     */
    function getImageUrl(path) {
        if (!path) return PLACEHOLDER_IMAGE;
        if (path.startsWith('http')) return path;
        return IMAGE_BASE + path;
    }

    /**
     * 辅助函数：构建内联滤镜样式
     */
    function buildFilterStyle(filters) {
        if (!filters) return '';
        const parts = [];
        if (filters.opacity !== undefined) parts.push(`opacity: ${filters.opacity}`);
        if (filters.saturate !== undefined) parts.push(`filter: saturate(${filters.saturate})`);
        if (filters.contrast !== undefined) parts.push(`filter: contrast(${filters.contrast})`);
        if (filters.brightness !== undefined) parts.push(`filter: brightness(${filters.brightness})`);
        if (filters.scale !== undefined) parts.push(`transform: scale(${filters.scale})`);
        return parts.join('; ');
    }

    // ========================================
    // 基础组件渲染
    // ========================================

    /**
     * 渲染状态标签
     */
    function renderStatusBadge(status, type = 'primary') {
        if (!status) return '';
        const isPrimary = type === 'primary';
        const styleAttr = isPrimary
            ? 'style="background-color: rgba(var(--color-primary-rgb), 0.1); color: var(--color-primary); border-color: rgba(var(--color-primary-rgb), 0.2);"'
            : 'style="background-color: rgba(0, 0, 0, 0.4); color: rgb(156, 163, 175); border-color: rgba(255, 255, 255, 0.1);"';

        return `
            <span class="backdrop-blur-md px-3 py-1 text-[11px] font-bold tracking-widest uppercase rounded-sm border" ${styleAttr}>
                ${escapeHtml(status)}
            </span>
        `;
    }

    /**
     * 渲染面包屑导航
     */
    function renderBreadcrumb(breadcrumb) {
        if (!breadcrumb || breadcrumb.length === 0) return '';

        const items = breadcrumb.map((item, index) => {
            const isLast = index === breadcrumb.length - 1;
            if (isLast) {
                return `<span class="text-white">${escapeHtml(item.text)}</span>`;
            }
            return `
                <a class="hover:text-primary transition-colors" href="${item.href || '#'}">${escapeHtml(item.text)}</a>
                <span class="text-gray-700">/</span>
            `;
        }).join('\n');

        return `
            <div class="flex items-center gap-2 text-[11px] md:text-xs uppercase tracking-widest text-gray-500 font-mono">
                ${items}
            </div>
        `;
    }

    /**
     * 渲染规格参数列表
     */
    function renderSpecs(specs, showHighlight = true) {
        if (!specs || specs.length === 0) return '';

        const items = specs.map(spec => {
            const valueClass = (showHighlight && spec.highlight) ? 'text-primary' : 'text-gray-200';
            return `
                <div class="flex justify-between py-3 tech-grid-line">
                    <span class="text-gray-500 text-xs tracking-wider">${escapeHtml(spec.label)}</span>
                    <span class="${valueClass} text-sm font-medium text-right">${escapeHtml(spec.value)}</span>
                </div>
            `;
        }).join('');

        return `<div class="w-full">${items}</div>`;
    }

    /**
     * 渲染设计师引用
     */
    function renderDesignerQuote(designer) {
        if (!designer || !designer.quote) return '';

        return `
            <div class="bg-surface-highlight/30 border-l-2 p-6 mb-10 rounded-r-sm relative" style="border-left-color: rgba(var(--color-primary-rgb), 0.4);">
                <span class="absolute top-4 left-3 material-symbols-outlined text-4xl -z-10 transform -translate-x-1/2 -translate-y-1/4" style="color: rgba(var(--color-primary-rgb), 0.2);">format_quote</span>
                <p class="text-gray-300 font-display italic text-sm leading-loose">
                    "${escapeHtml(designer.quote)}"
                </p>
                <div class="mt-4 flex items-center gap-3">
                    <div class="size-8 rounded-full bg-gray-700 overflow-hidden">
                        <div class="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
                    </div>
                    <div>
                        <p class="text-xs text-white font-bold tracking-wider">${escapeHtml(designer.author)}</p>
                        <p class="text-[11px] text-gray-500 uppercase tracking-widest">${escapeHtml(designer.title)}</p>
                    </div>
                </div>
            </div>
        `;
    }

    // ========================================
    // 产品卡片渲染
    // ========================================

    /**
     * 渲染产品卡片（紧凑型，用于网格布局）
     */
    function renderProductCard(product) {
        const imageUrl = getImageUrl(product.media?.thumbnail);
        const statusText = product.status?.operational ? 'Operational' : 'Maintenance';
        const statusClass = product.status?.operational ? 'text-primary' : 'text-yellow-500';

        return `
            <a href="product-detail.html?id=${product.id}"
               class="product-card group cursor-pointer block"
               data-series="${product.classification?.seriesEn?.toLowerCase() || ''}"
               data-category="${product.classification?.category || ''}">
                <div class="relative aspect-[4/3] bg-surface-dark overflow-hidden mb-4 shadow-soft rounded-sm">
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 saturate-100 contrast-125 opacity-90 group-hover:opacity-100"
                         style="background-image: url('${imageUrl}');"></div>
                    <div class="absolute top-0 left-0 p-4 w-full flex justify-between items-start">
                        <span class="text-[11px] font-bold tracking-widest text-white/60 uppercase border px-2 py-1 bg-black/40 backdrop-blur-sm" style="border-color: rgba(var(--color-primary-rgb), 0.3);">
                            ${escapeHtml(product.modelId)}
                        </span>
                        <span class="${statusClass} text-[10px] font-bold tracking-widest uppercase">
                            ${statusText}
                        </span>
                    </div>
                </div>
                <h3 class="text-white font-display text-lg tracking-wide group-hover:text-primary transition-colors">
                    ${escapeHtml(product.name)}
                </h3>
                <p class="text-gray-500 text-xs mt-1">${escapeHtml(product.description?.tagline || product.classification?.subcategory || '')}</p>
            </a>
        `;
    }

    /**
     * 渲染产品列表卡片（详细型，用于单列布局）
     * 原版官网的排版风格：左图右信息，包含3列参数
     */
    function renderProductListCard(product) {
        const imageUrl = getImageUrl(product.media?.thumbnail);
        const isOperational = product.status?.operational;
        const statusText = isOperational ? 'Operational' : 'Maintenance';
        const pulseClass = isOperational ? 'animate-pulse' : '';

        // 从产品数据中提取3个主要参数用于展示
        const specs = extractDisplaySpecs(product);

        return `
            <a href="product-detail.html?id=${product.id}"
               class="product-card group grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-surface-dark/30 p-4 rounded hover:bg-surface-dark/50 transition-colors block"
               data-series="${product.classification?.seriesEn?.toLowerCase() || ''}">
                <div class="lg:col-span-5 relative aspect-video overflow-hidden rounded bg-black">
                    <img alt="${escapeHtml(product.name)}"
                         loading="lazy"
                         class="w-full h-full object-cover saturate-100 transition-transform duration-1000 group-hover:scale-105"
                         src="${imageUrl}"/>
                    <div class="absolute top-4 left-4">
                        <span class="flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-sm border rounded-[1px]" style="border-color: rgba(var(--color-primary-rgb), 0.2);">
                            <span class="size-1 rounded-full ${pulseClass}" style="background-color: var(--color-primary);"></span>
                            <span class="text-[11px] font-bold tracking-widest uppercase" style="color: var(--color-primary);">${statusText}</span>
                        </span>
                    </div>
                </div>
                <div class="lg:col-span-7 flex flex-col h-full py-2">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-[11px] font-mono tracking-widest mb-1" style="color: rgba(var(--color-primary-rgb), 0.6);">ID: ${escapeHtml(product.modelId)}</p>
                            <h3 class="text-xl md:text-2xl font-display font-bold text-white group-hover:text-primary transition-colors">${escapeHtml(product.name)}</h3>
                        </div>
                        <span class="material-symbols-outlined text-gray-700 text-4xl">${getProductIcon(product)}</span>
                    </div>
                    <div class="grid grid-cols-3 gap-6 mb-8 border-t border-white/5 pt-6">
                        ${specs.map(spec => `
                            <div>
                                <div class="text-[11px] uppercase tracking-wider text-gray-600 mb-1">${escapeHtml(spec.label)}</div>
                                <div class="text-sm text-gray-300">${escapeHtml(spec.value)}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="mt-auto flex gap-4">
                        <span class="flex-grow bg-white group-hover:bg-gray-200 text-background-dark py-3 text-xs font-bold tracking-[0.2em] uppercase transition-colors text-center">
                            技术参数详单
                        </span>
                        <span class="px-6 border border-white/10 group-hover:border-white/30 text-white transition-colors flex items-center justify-center">
                            <span class="material-symbols-outlined text-lg">bookmark</span>
                        </span>
                    </div>
                </div>
            </a>
        `;
    }

    /**
     * 从产品数据中提取3个主要参数用于列表展示
     */
    function extractDisplaySpecs(product) {
        const specs = [];
        const detail = product.detail?.productInfo?.specs?.items || [];

        // 尝试从详情页规格中提取
        if (detail.length >= 3) {
            return detail.slice(0, 3).map(item => ({
                label: item.label,
                value: item.value
            }));
        }

        // 默认显示：类型、分类、子分类
        const cls = product.classification || {};
        specs.push({
            label: '类型 Type',
            value: cls.subcategory || cls.category || '未分类'
        });

        // 尝试从描述中提取信息
        if (product.description?.tagline) {
            specs.push({
                label: '特性 Feature',
                value: product.description.tagline.slice(0, 10) + (product.description.tagline.length > 10 ? '...' : '')
            });
        } else {
            specs.push({
                label: '系列 Series',
                value: cls.series || '未知'
            });
        }

        specs.push({
            label: '状态 Status',
            value: product.status?.operational ? '运行中' : '维护中'
        });

        return specs;
    }

    /**
     * 根据产品分类获取合适的图标
     */
    function getProductIcon(product) {
        const category = product.classification?.category || '';
        const subcategory = product.classification?.subcategory || '';

        // 图标映射表（从具体到通用，优先匹配更精确的分类）
        const iconMap = {
            // === 二级分类（subcategory）- 优先匹配 ===
            // 航空类
            '战斗机': 'flight',
            '无人机': 'smart_toy',
            '直升机': 'flight',

            // 装甲车辆类
            '主战坦克': 'military_tech',
            '轻型坦克': 'military_tech',
            '步兵战车': 'shield',
            '步兵支援车': 'shield',
            '轻型装甲车': 'shield',
            '空降战车': 'shield',
            '两栖装甲车': 'water',
            '装甲工程车': 'construction',

            // 火力/武器类
            '自行火炮': 'my_location',
            '牵引火炮': 'my_location',
            '导弹发射车': 'rocket_launch',
            '防空导弹车': 'security',
            '防空系统': 'security',
            '防空车辆': 'security',
            '激光武器': 'bolt',
            '电磁武器': 'bolt',

            // 运输类
            '重型卡车': 'local_shipping',
            '中型卡车': 'local_shipping',
            '多用途卡车': 'local_shipping',
            '履带式运输车': 'local_shipping',
            '轮式运输车': 'local_shipping',
            '运兵车': 'local_shipping',
            '城市物流': 'local_shipping',

            // 战术车辆
            '轻型战术车': 'drive_eta',
            '轮式战术车': 'drive_eta',

            // 工程机械类
            '装载机': 'construction',
            '挖掘机': 'construction',
            '起重机': 'construction',
            '叉车': 'forklift',

            // 医疗/支援类
            '医疗支援': 'emergency',
            '支援车辆': 'inventory_2',
            '雷达侦察车': 'radar',

            // 民用交通
            '公共交通': 'directions_bus',
            '客车': 'directions_bus',

            // 铁路类
            '轨道交通': 'train',
            '电力机车': 'train',
            '机车': 'train',
            '货车': 'train',

            // 海军类
            '潜艇': 'sailing',
            '航空母舰': 'sailing',
            '护卫舰': 'sailing',

            // 其他
            '底盘平台': 'precision_manufacturing',

            // === 一级分类（category）- 兜底匹配 ===
            '装甲车辆': 'military_tech',
            '运输车辆': 'local_shipping',
            '工程机械': 'construction',
            '工程车辆': 'construction',
            '航空器': 'flight',
            '空军装备': 'flight',
            '飞行器': 'flight',
            '民用车辆': 'directions_car',
            '民用交通': 'directions_car',
            '火炮系统': 'my_location',
            '铁路车辆': 'train',
            '轨道交通': 'train',
            '海军舰艇': 'sailing',
            '海军装备': 'sailing'
        };

        // 优先匹配子分类（精确匹配），再匹配主分类
        for (const [key, icon] of Object.entries(iconMap)) {
            if (subcategory.includes(key) || category.includes(key)) {
                return icon;
            }
        }

        return 'precision_manufacturing'; // 默认图标
    }

    // ========================================
    // 旗舰序列渲染
    // ========================================

    /**
     * 渲染旗舰序列全屏区块
     */
    function renderFeaturedSection(product) {
        const { featured } = product;
        if (!featured || !featured.enabled) return '';

        const bgUrl = getImageUrl(featured.background?.imageUrl || product.media?.hero);
        const filters = featured.background?.filters || {};
        const layout = featured.layout || {};
        const categories = (featured.categories || []).join(' ');

        // 根据布局类型选择渲染方式
        switch (layout.type) {
            case 'center':
                return renderFeaturedCenter(product, featured, bgUrl, filters, categories);
            case 'right':
                return renderFeaturedRight(product, featured, bgUrl, filters, categories);
            case 'left-cards':
                return renderFeaturedLeftCards(product, featured, bgUrl, filters, categories);
            case 'split':
                return renderFeaturedSplit(product, featured, bgUrl, filters, categories);
            case 'center-icon':
                return renderFeaturedCenterIcon(product, featured, bgUrl, filters, categories);
            case 'left':
            default:
                return renderFeaturedLeft(product, featured, bgUrl, filters, categories);
        }
    }

    /**
     * 左侧布局（默认）
     */
    function renderFeaturedLeft(product, featured, bgUrl, filters, categories) {
        const seriesTag = featured.seriesTag?.enabled ? `
            <span class="px-3 py-1 border text-[11px] font-bold tracking-[0.2em] uppercase" style="background-color: rgba(var(--color-primary-rgb), 0.1); border-color: rgba(var(--color-primary-rgb), 0.3); color: var(--color-primary);">
                ${escapeHtml(featured.seriesTag.text)}
            </span>
        ` : '';

        const productIdHtml = featured.productId?.enabled ? `
            <span class="text-gray-500 text-[11px] font-mono tracking-widest">${escapeHtml(featured.productId.text)}</span>
        ` : '';

        const descHtml = featured.descriptionBlock?.enabled ? `
            <p class="text-text-muted text-sm ${featured.descriptionBlock.maxWidth || 'max-w-lg'} leading-relaxed">
                ${escapeHtml(featured.descriptionBlock.text)}
            </p>
        ` : '';

        const specsHtml = featured.specsBlock?.enabled ? renderFeaturedSpecs(featured.specsBlock) : '';
        const statusBadgeHtml = featured.statusBadge?.enabled ? renderFeaturedStatusBadge(featured.statusBadge) : '';

        return `
            <section class="product-item relative min-h-screen w-full flex items-center justify-center overflow-hidden border-b border-white/5"
                     data-categories="${categories}"
                     data-product-id="${product.id}">
                <a href="product-detail.html?id=${product.id}" class="absolute inset-0 z-20"></a>
                <div class="absolute inset-0 z-0">
                    <img alt="${escapeHtml(product.name)}"
                         loading="lazy"
                         class="w-full h-full object-cover"
                         style="opacity: ${filters.opacity || 0.6}; filter: saturate(${filters.saturate || 0}) contrast(${filters.contrast || 1.25}); transform: scale(${filters.scale || 1.05});"
                         src="${bgUrl}"/>
                    <div class="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-black/40"></div>
                </div>
                <div class="relative z-10 w-full max-w-[1400px] px-6 md:px-16 grid grid-cols-1 md:grid-cols-12 items-end pb-32 pointer-events-none">
                    <div class="md:col-span-8 flex flex-col gap-4">
                        <div class="flex items-center gap-3">
                            ${seriesTag}
                            ${productIdHtml}
                        </div>
                        <h2 class="text-4xl md:text-${featured.title?.fontSize || '6xl'} font-display font-bold text-white tracking-wide">
                            ${escapeHtml(featured.title?.text || product.name)}
                        </h2>
                        ${descHtml}
                    </div>
                    <div class="md:col-span-4 flex flex-col gap-6 md:items-end mt-8 md:mt-0">
                        ${specsHtml}
                        ${statusBadgeHtml}
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 居中布局
     */
    function renderFeaturedCenter(product, featured, bgUrl, filters, categories) {
        const seriesTag = featured.seriesTag?.enabled ? `
            <span class="px-3 py-1 border text-[11px] font-bold tracking-[0.2em] uppercase" style="background-color: rgba(var(--color-primary-rgb), 0.1); border-color: rgba(var(--color-primary-rgb), 0.3); color: var(--color-primary);">
                ${escapeHtml(featured.seriesTag.text)}
            </span>
        ` : '';

        const specCardsHtml = featured.specCards?.enabled ? renderFeaturedSpecCards(featured.specCards) : '';
        const decorativeIconHtml = featured.decorativeIcon?.enabled ? `
            <div class="flex justify-center mb-8">
                <span class="material-symbols-outlined text-6xl" style="color: var(--color-primary); opacity: ${featured.decorativeIcon.opacity || 0.4};">${featured.decorativeIcon.iconName}</span>
            </div>
        ` : '';

        return `
            <section class="product-item relative min-h-screen w-full flex items-center justify-center overflow-hidden border-b border-white/5"
                     data-categories="${categories}"
                     data-product-id="${product.id}">
                <a href="product-detail.html?id=${product.id}" class="absolute inset-0 z-20"></a>
                <div class="absolute inset-0 z-0">
                    <img alt="${escapeHtml(product.name)}"
                         loading="lazy"
                         class="w-full h-full object-cover"
                         style="opacity: ${filters.opacity || 0.5}; filter: saturate(${filters.saturate || 0}) contrast(${filters.contrast || 1.25}); transform: scale(${filters.scale || 1});"
                         src="${bgUrl}"/>
                    <div class="absolute inset-0 bg-gradient-to-r from-background-dark via-transparent to-background-dark opacity-80"></div>
                </div>
                <div class="relative z-10 w-full max-w-[1400px] px-6 md:px-16 flex flex-col items-center text-center pointer-events-none">
                    ${decorativeIconHtml}
                    <div class="flex flex-col gap-6 items-center">
                        ${seriesTag}
                        <h2 class="text-5xl md:text-${featured.title?.fontSize || '7xl'} font-display font-bold text-white tracking-wide">
                            ${escapeHtml(featured.title?.text || product.name)}
                        </h2>
                        <div class="h-px w-24 bg-white/20"></div>
                        ${specCardsHtml}
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 右侧布局
     */
    function renderFeaturedRight(product, featured, bgUrl, filters, categories) {
        const productIdHtml = featured.productId?.enabled ? `
            <span class="text-primary font-bold text-[11px] tracking-widest uppercase">${escapeHtml(featured.seriesTag?.text || '')} // ${escapeHtml(featured.productId.text)}</span>
        ` : '';

        const descHtml = featured.descriptionBlock?.enabled ? `
            <p class="text-text-muted text-base leading-relaxed">${escapeHtml(featured.descriptionBlock.text)}</p>
        ` : '';

        const specsHtml = featured.specsBlock?.enabled ? renderFeaturedSpecsGrid(featured.specsBlock) : '';

        return `
            <section class="product-item relative min-h-screen w-full flex items-center justify-center overflow-hidden border-b border-white/5"
                     data-categories="${categories}"
                     data-product-id="${product.id}">
                <a href="product-detail.html?id=${product.id}" class="absolute inset-0 z-20"></a>
                <div class="absolute inset-0 z-0">
                    <img alt="${escapeHtml(product.name)}"
                         loading="lazy"
                         class="w-full h-full object-cover"
                         style="opacity: ${filters.opacity || 0.6}; filter: saturate(${filters.saturate || 0}); transform: scale(${filters.scale || 1});"
                         src="${bgUrl}"/>
                    <div class="absolute inset-0 bg-gradient-to-l from-background-dark via-transparent to-transparent opacity-90"></div>
                </div>
                <div class="relative z-10 w-full max-w-[1400px] px-6 md:px-16 flex justify-end pointer-events-none">
                    <div class="max-w-xl flex flex-col gap-8 text-right items-end">
                        <div class="flex flex-col gap-2">
                            ${productIdHtml}
                            <h2 class="text-4xl md:text-${featured.title?.fontSize || '6xl'} font-display font-bold text-white tracking-wide leading-tight">
                                ${escapeHtml(featured.title?.text || product.name)}
                            </h2>
                        </div>
                        ${descHtml}
                        ${specsHtml}
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 左下角 + 参数卡片布局（第4种）
     * 适用于：维护状态产品、需要展示多个参数卡片的产品
     */
    function renderFeaturedLeftCards(product, featured, bgUrl, filters, categories) {
        // 状态标签（支持维护状态等）
        const statusColor = featured.statusBadge?.color || 'primary';
        const isWarning = statusColor === 'yellow' || statusColor === 'warning';
        const badgeStyle = isWarning
            ? 'background-color: rgba(234, 179, 8, 0.1); border-color: rgba(234, 179, 8, 0.3); color: rgb(234, 179, 8);'
            : 'background-color: rgba(var(--color-primary-rgb), 0.1); border-color: rgba(var(--color-primary-rgb), 0.3); color: var(--color-primary);';
        const dotStyle = isWarning ? 'background-color: rgb(234, 179, 8);' : 'background-color: var(--color-primary);';

        const statusBadgeHtml = featured.statusBadge?.enabled ? `
            <div class="inline-flex items-center gap-4 border px-3 py-1 mb-6" style="${badgeStyle}">
                <span class="size-1.5 rounded-full" style="${dotStyle}"></span>
                <span class="text-[10px] font-bold tracking-widest uppercase">${escapeHtml(featured.statusBadge.text)}</span>
            </div>
        ` : '';

        // 参数卡片
        const specCardsHtml = featured.specCards?.enabled && featured.specCards.cards?.length > 0 ? `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
                ${featured.specCards.cards.map(card => `
                    <div class="bg-surface-dark/60 backdrop-blur p-6 border border-white/5">
                        <span class="text-[11px] text-gray-500 uppercase tracking-widest block mb-2">${escapeHtml(card.label)}</span>
                        <span class="text-white font-mono font-medium">${escapeHtml(card.value)}</span>
                    </div>
                `).join('')}
                ${featured.specCards.showIcon ? `
                    <div class="bg-surface-dark/60 backdrop-blur p-6 border border-white/5 flex items-center justify-center">
                        <span class="material-symbols-outlined text-primary text-3xl">${featured.specCards.iconName || 'precision_manufacturing'}</span>
                    </div>
                ` : ''}
            </div>
        ` : '';

        return `
            <section class="product-item relative min-h-screen w-full flex items-center justify-center overflow-hidden border-b border-white/5"
                     data-categories="${categories}"
                     data-product-id="${product.id}">
                <a href="product-detail.html?id=${product.id}" class="absolute inset-0 z-20"></a>
                <div class="absolute inset-0 z-0">
                    <img alt="${escapeHtml(product.name)}"
                         loading="lazy"
                         class="w-full h-full object-cover"
                         style="opacity: ${filters.opacity || 0.5}; filter: saturate(${filters.saturate || 0}) contrast(${filters.contrast || 1.25}); ${filters.flipX ? 'transform: scaleX(-1);' : ''}"
                         src="${bgUrl}"/>
                    <div class="absolute inset-0 bg-black/40"></div>
                    <div class="absolute inset-0 bg-gradient-to-b from-background-dark via-transparent to-background-dark opacity-60"></div>
                </div>
                <div class="relative z-10 w-full max-w-[1400px] px-6 md:px-16 pointer-events-none">
                    ${statusBadgeHtml}
                    <h2 class="text-4xl md:text-${featured.title?.fontSize || '6xl'} font-display font-bold text-white tracking-wide mb-8">
                        ${escapeHtml(featured.title?.text || product.name)}
                    </h2>
                    ${specCardsHtml}
                </div>
            </section>
        `;
    }

    /**
     * 左右两列布局（第5种）
     * 适用于：需要详细描述 + 参数列表的产品
     */
    function renderFeaturedSplit(product, featured, bgUrl, filters, categories) {
        const tagHtml = featured.seriesTag?.enabled ? `
            <span class="text-primary font-bold text-[11px] tracking-[0.3em] uppercase block mb-4">${escapeHtml(featured.seriesTag.text)}</span>
        ` : '';

        const descHtml = featured.descriptionBlock?.enabled ? `
            <p class="text-text-muted text-base leading-relaxed mb-8">${escapeHtml(featured.descriptionBlock.text)}</p>
        ` : '';

        const ctaHtml = featured.ctaButton?.enabled ? `
            <a href="product-detail.html?id=${product.id}" class="inline-block px-8 py-3 bg-white text-background-dark text-xs font-bold tracking-[0.2em] uppercase hover:bg-primary hover:text-white transition-colors pointer-events-auto">
                ${escapeHtml(featured.ctaButton.text || '技术规格说明')}
            </a>
        ` : '';

        // 右侧参数列表
        const specsListHtml = featured.specsList?.enabled && featured.specsList.items?.length > 0 ? `
            <div class="flex flex-col justify-center gap-1">
                ${featured.specsList.items.map((item, index, arr) => `
                    <div class="flex items-center gap-6 py-4 ${index < arr.length - 1 ? 'border-b border-white/10' : ''}">
                        <span class="text-[11px] text-gray-500 w-24 tracking-widest uppercase">${escapeHtml(item.label)}</span>
                        <span class="text-2xl font-display text-white">${escapeHtml(item.value)}</span>
                    </div>
                `).join('')}
            </div>
        ` : '';

        return `
            <section class="product-item relative min-h-screen w-full flex items-center justify-center overflow-hidden border-b border-white/5"
                     data-categories="${categories}"
                     data-product-id="${product.id}">
                <a href="product-detail.html?id=${product.id}" class="absolute inset-0 z-20"></a>
                <div class="absolute inset-0 z-0">
                    <img alt="${escapeHtml(product.name)}"
                         loading="lazy"
                         class="w-full h-full object-cover"
                         style="opacity: ${filters.opacity || 0.6}; filter: saturate(${filters.saturate || 0});"
                         src="${bgUrl}"/>
                    <div class="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-80"></div>
                </div>
                <div class="relative z-10 w-full max-w-[1400px] px-6 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-20 pointer-events-none">
                    <div>
                        ${tagHtml}
                        <h2 class="text-4xl md:text-${featured.title?.fontSize || '6xl'} font-display font-bold text-white tracking-wide leading-tight mb-6">
                            ${escapeHtml(featured.title?.text || product.name)}
                        </h2>
                        ${descHtml}
                        ${ctaHtml}
                    </div>
                    ${specsListHtml}
                </div>
            </section>
        `;
    }

    /**
     * 居中大图标布局（第6种）
     * 适用于：高端/概念产品、需要强调视觉冲击的产品
     */
    function renderFeaturedCenterIcon(product, featured, bgUrl, filters, categories) {
        const iconHtml = featured.decorativeIcon?.enabled ? `
            <div class="flex justify-center mb-8">
                <span class="material-symbols-outlined text-6xl" style="color: var(--color-primary); opacity: ${featured.decorativeIcon.opacity || 0.4};">${featured.decorativeIcon.iconName || 'precision_manufacturing'}</span>
            </div>
        ` : '';

        const subtitleHtml = featured.subtitle?.enabled ? `
            <span class="text-text-muted text-sm font-mono tracking-[0.5em] block mb-12">${escapeHtml(featured.subtitle.text)}</span>
        ` : '';

        // 横排大参数
        const statsHtml = featured.statsRow?.enabled && featured.statsRow.items?.length > 0 ? `
            <div class="flex flex-wrap justify-center gap-16">
                ${featured.statsRow.items.map(item => `
                    <div class="text-center">
                        <div class="text-4xl font-display text-white mb-1">${escapeHtml(item.value)}${item.unit ? ` <span class="text-sm">${escapeHtml(item.unit)}</span>` : ''}</div>
                        <div class="text-[11px] text-gray-500 uppercase tracking-[0.2em]">${escapeHtml(item.label)}</div>
                    </div>
                `).join('')}
            </div>
        ` : '';

        return `
            <section class="product-item relative min-h-screen w-full flex items-center justify-center overflow-hidden border-b border-white/5"
                     data-categories="${categories}"
                     data-product-id="${product.id}">
                <a href="product-detail.html?id=${product.id}" class="absolute inset-0 z-20"></a>
                <div class="absolute inset-0 z-0">
                    <img alt="${escapeHtml(product.name)}"
                         loading="lazy"
                         class="w-full h-full object-cover"
                         style="opacity: ${filters.opacity || 0.4}; filter: saturate(${filters.saturate || 0}) brightness(${filters.brightness || 1.25}); ${filters.flipX ? 'transform: scaleX(-1);' : ''}"
                         src="${bgUrl}"/>
                    <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-background-dark"></div>
                </div>
                <div class="relative z-10 w-full max-w-[1400px] px-6 md:px-16 text-center pointer-events-none">
                    ${iconHtml}
                    <h2 class="text-5xl md:text-${featured.title?.fontSize || '7xl'} font-display font-bold text-white tracking-tight mb-4">
                        ${escapeHtml(featured.title?.text || product.name)}
                    </h2>
                    ${subtitleHtml}
                    ${statsHtml}
                </div>
            </section>
        `;
    }

    /**
     * 渲染旗舰规格（flex布局）
     */
    function renderFeaturedSpecs(specsBlock) {
        if (!specsBlock.items || specsBlock.items.length === 0) return '';

        const items = specsBlock.items.map(item => `
            <div>
                <div class="text-[11px] uppercase tracking-widest text-gray-500 mb-1">${escapeHtml(item.label)}</div>
                <div class="text-lg text-white font-medium">${escapeHtml(item.value)}</div>
            </div>
        `).join('');

        return `<div class="flex gap-10 md:text-right">${items}</div>`;
    }

    /**
     * 渲染旗舰规格（grid布局）
     */
    function renderFeaturedSpecsGrid(specsBlock) {
        if (!specsBlock.items || specsBlock.items.length === 0) return '';

        const items = specsBlock.items.map(item => `
            <div class="border-r border-white/10 pr-8 last:border-r-0">
                <div class="text-[11px] uppercase tracking-widest text-gray-500 mb-1">${escapeHtml(item.label)}</div>
                <div class="text-3xl text-white font-display">${escapeHtml(item.value)}</div>
            </div>
        `).join('');

        return `<div class="grid grid-cols-2 gap-8 w-full">${items}</div>`;
    }

    /**
     * 渲染旗舰规格卡片（居中布局）
     */
    function renderFeaturedSpecCards(specCards) {
        if (!specCards.cards || specCards.cards.length === 0) return '';

        const cards = specCards.cards.map(card => `
            <div class="flex flex-col gap-1">
                <span class="text-[11px] uppercase tracking-widest text-gray-500">${escapeHtml(card.label)}</span>
                <span class="text-2xl text-white font-display">${escapeHtml(card.value)}</span>
            </div>
        `).join('');

        return `<div class="grid grid-cols-2 md:grid-cols-3 gap-12 mt-4">${cards}</div>`;
    }

    /**
     * 渲染旗舰状态标签
     */
    function renderFeaturedStatusBadge(statusBadge) {
        const dotHtml = statusBadge.hasDot ? `
            <span class="size-2 bg-${statusBadge.color || 'primary'} rounded-full animate-pulse shadow-[0_0_8px_rgba(77,184,255,0.8)]"></span>
        ` : '';

        return `
            <div class="flex items-center gap-4 bg-black/40 backdrop-blur px-4 py-2 border border-white/5">
                ${dotHtml}
                <span class="text-[10px] font-bold text-white tracking-widest uppercase">${escapeHtml(statusBadge.text)}</span>
            </div>
        `;
    }

    // ========================================
    // 产品详情页渲染
    // ========================================

    /**
     * 渲染产品详情页完整内容
     */
    function renderProductDetail(product) {
        const { detail } = product;
        if (!detail) return renderError('产品详情数据缺失');

        return `
            <!-- 面包屑导航 -->
            <div class="max-w-[1600px] mx-auto px-6 md:px-12 mb-8">
                ${renderBreadcrumb(detail.breadcrumb)}
            </div>

            <!-- 产品详情区 -->
            <section class="max-w-[1600px] mx-auto px-6 md:px-12 mb-24">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
                    <!-- 左侧：图片画廊 -->
                    <div class="lg:col-span-8 flex flex-col gap-4" id="product-gallery">
                        ${renderDetailGallery(detail.gallery, product)}
                    </div>

                    <!-- 右侧：产品信息 -->
                    <div class="lg:col-span-4 flex flex-col pt-2">
                        ${renderDetailProductInfo(detail.productInfo, product)}
                    </div>
                </div>
            </section>

            <!-- 故事章节 -->
            ${renderStoryChapters(detail.storyChapters, product)}

            <!-- 技术规格摘要 -->
            ${renderTechSummary(detail.techSummary)}

            <!-- 相关产品 -->
            ${renderRelatedProducts(detail.relatedProducts)}
        `;
    }

    /**
     * 渲染详情页图片画廊
     * 如果 gallery 数据缺失，自动从 product.media 生成默认内容
     */
    function renderDetailGallery(gallery, product) {
        // 如果没有 gallery 数据，从 product.media 生成默认值
        const effectiveGallery = gallery || {};
        const mainUrl = getImageUrl(effectiveGallery.mainImage?.url || product.media?.hero || product.media?.thumbnail);
        const thumbnails = effectiveGallery.thumbnails || [];
        const statusBadges = effectiveGallery.statusBadges || [];

        // 构建图片数组：直接使用缩略图数组，如果没有则用主图
        // 索引从0开始，与缩略图一一对应
        const allImages = thumbnails.length > 0
            ? thumbnails.map(t => getImageUrl(t.url))
            : [mainUrl];
        const allImagesJson = JSON.stringify(allImages).replace(/"/g, '&quot;');

        // 找到初始激活的图片索引
        const initialIndex = thumbnails.findIndex(t => t.isActive);
        const activeIndex = initialIndex >= 0 ? initialIndex : 0;
        const initialImageUrl = allImages[activeIndex] || mainUrl;

        const badgesHtml = statusBadges.map(badge =>
            renderStatusBadge(badge.text, badge.type)
        ).join('\n');

        const thumbsHtml = thumbnails.map((thumb, index) => {
            const thumbUrl = getImageUrl(thumb.url);
            const isActive = index === activeIndex;
            const activeClass = isActive ? 'ring-2 ring-primary' : '';
            const opacityClass = isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100';
            return `
                <button class="gallery-thumb relative aspect-video bg-surface-dark border border-white/10 overflow-hidden hover:border-white/40 transition-colors rounded-sm group ${activeClass}"
                        data-src="${thumbUrl}"
                        data-index="${index}">
                    <div class="absolute inset-0 bg-cover bg-center ${opacityClass} transition-opacity saturate-100"
                         style="background-image: url('${thumbUrl}');"></div>
                </button>
            `;
        }).join('');

        const videoButtonHtml = effectiveGallery.videoButton?.enabled ? `
            <button class="relative aspect-video bg-surface-dark border border-white/10 overflow-hidden hover:border-white/40 transition-colors rounded-sm flex items-center justify-center group">
                <span class="material-symbols-outlined text-gray-600 group-hover:text-white transition-colors">play_circle</span>
            </button>
        ` : '';

        return `
            <!-- 主图 -->
            <div class="relative w-full aspect-[${effectiveGallery.mainImage?.aspectRatio || '16/9'}] bg-surface-dark rounded overflow-hidden shadow-soft group">
                <div id="gallery-main" class="gallery-main absolute inset-0 bg-cover bg-center transition-all duration-500"
                     style="background-image: url('${initialImageUrl}');"
                     data-current-index="${activeIndex}"
                     data-images="${allImagesJson}"></div>

                <!-- 状态标签 -->
                <div class="absolute top-6 left-6 flex items-center gap-3">
                    ${badgesHtml}
                </div>

                <!-- 操作按钮 -->
                <div class="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button id="gallery-expand-btn" class="size-10 bg-black/60 backdrop-blur border border-white/10 text-white flex items-center justify-center hover:bg-primary hover:border-primary transition-colors rounded-sm"
                            title="全屏查看">
                        <span class="material-symbols-outlined text-sm">open_in_full</span>
                    </button>
                </div>
            </div>

            <!-- 缩略图 -->
            <div class="grid grid-cols-4 gap-4">
                ${thumbsHtml}
                ${videoButtonHtml}
            </div>

            <!-- 全屏图片查看器 -->
            <div id="image-viewer" class="image-viewer hidden fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl">
                <!-- 关闭按钮 -->
                <button id="viewer-close-btn" class="absolute top-6 right-6 z-10 size-12 bg-white/10 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors rounded-sm group"
                        title="关闭 (ESC)">
                    <span class="material-symbols-outlined">close</span>
                </button>

                <!-- 图片容器 -->
                <div class="absolute inset-0 flex items-center justify-center p-4 md:p-12">
                    <!-- 左侧切换按钮 -->
                    <button id="viewer-prev-btn" class="absolute left-4 md:left-8 z-10 size-12 md:size-14 bg-white/10 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all rounded-sm disabled:opacity-30 disabled:cursor-not-allowed"
                            title="上一张 (←)">
                        <span class="material-symbols-outlined text-2xl">chevron_left</span>
                    </button>

                    <!-- 图片显示区域 -->
                    <div class="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center">
                        <img id="viewer-image" src="" alt="产品图片" class="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded shadow-2xl">
                        <!-- 加载指示器 -->
                        <div id="viewer-loading" class="absolute inset-0 flex items-center justify-center bg-black/50 rounded hidden">
                            <div class="w-12 h-12 border-2 rounded-full animate-spin" style="border-color: rgba(var(--color-primary-rgb), 0.3); border-top-color: var(--color-primary);"></div>
                        </div>
                    </div>

                    <!-- 右侧切换按钮 -->
                    <button id="viewer-next-btn" class="absolute right-4 md:right-8 z-10 size-12 md:size-14 bg-white/10 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all rounded-sm disabled:opacity-30 disabled:cursor-not-allowed"
                            title="下一张 (→)">
                        <span class="material-symbols-outlined text-2xl">chevron_right</span>
                    </button>
                </div>

                <!-- 图片计数器 -->
                <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-sm">
                    <span id="viewer-counter" class="text-white text-sm font-mono tracking-wider">1 / ${allImages.length}</span>
                </div>
            </div>
        `;
    }

    /**
     * 渲染详情页产品信息
     * 如果 productInfo 数据缺失，自动从 product 的基础字段生成默认内容
     */
    function renderDetailProductInfo(productInfo, product) {
        // 如果没有 productInfo，从 product 基础数据生成默认值
        const info = productInfo || {};

        // 标题和产品代码
        const title = info.title || product.name;
        const productCode = info.productCode || product.modelId;

        // 限制标签
        const restrictionHtml = info.restriction?.enabled ? `
            <span class="text-xs text-text-muted tracking-wide">${escapeHtml(info.restriction.text)}</span>
        ` : (product.status?.restricted ? `
            <span class="text-xs text-text-muted tracking-wide">受限产品</span>
        ` : '');

        // 描述文本 - 优先使用 productInfo，否则回退到 product.description
        const descText = info.description?.enabled
            ? info.description.text
            : (product.description?.summary || product.description?.full || '');
        const descHtml = descText ? `
            <div class="mb-10">
                <p class="text-gray-400 text-sm leading-relaxed font-light">
                    ${escapeHtml(descText)}
                </p>
            </div>
        ` : '';

        // 规格参数 - 优先使用 productInfo.specs，否则回退到 product.specs
        const specsItems = info.specs?.enabled
            ? info.specs.items
            : (product.specs?.slice(0, 6) || []);
        const specsHtml = specsItems.length > 0 ? `
            <div class="flex flex-col mb-10">
                <h3 class="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span class="w-2 h-2 bg-primary rounded-full"></span>
                    ${escapeHtml(info.specs?.title || '规格参数')}
                </h3>
                ${renderDetailSpecs(specsItems)}
            </div>
        ` : '';

        // 设计师引用 - 优先使用 productInfo，否则回退到 product.designer
        const quote = info.designerQuote?.enabled
            ? info.designerQuote
            : (product.designer?.quote ? { text: product.designer.quote, author: product.designer.author, title: product.designer.title } : null);
        const quoteHtml = quote ? `
            <div class="bg-surface-highlight/30 border-l-2 p-6 mb-10 rounded-r-sm relative" style="border-left-color: rgba(var(--color-primary-rgb), 0.4);">
                <span class="absolute top-4 left-3 material-symbols-outlined text-4xl -z-10 transform -translate-x-1/2 -translate-y-1/4" style="color: rgba(var(--color-primary-rgb), 0.2);">format_quote</span>
                <p class="text-gray-300 font-display italic text-sm leading-loose">
                    "${escapeHtml(quote.text)}"
                </p>
                <div class="mt-4 flex items-center gap-3">
                    <div class="size-8 rounded-full bg-gray-700 overflow-hidden">
                        <div class="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
                    </div>
                    <div>
                        <p class="text-xs text-white font-bold tracking-wider">${escapeHtml(quote.author || '')}</p>
                        <p class="text-[11px] text-gray-500 uppercase tracking-widest">${escapeHtml(quote.title || '')}</p>
                    </div>
                </div>
            </div>
        ` : '';

        const ctaHtml = info.ctaButton?.enabled ? `
            <div class="mt-auto">
                <button class="w-full group relative px-8 py-5 border border-white/20 bg-transparent hover:bg-white text-white hover:text-background-dark transition-all duration-300 overflow-hidden">
                    <div class="absolute inset-0 w-0 bg-white transition-all duration-[250ms] ease-out group-hover:w-full"></div>
                    <div class="relative flex items-center justify-between">
                        <span class="font-bold tracking-[0.25em] uppercase text-sm">${escapeHtml(info.ctaButton.text)}</span>
                        <span class="material-symbols-outlined text-lg">${info.ctaButton.icon || 'download'}</span>
                    </div>
                </button>
                ${info.ctaButton.subtitle ? `<p class="text-[11px] text-gray-600 mt-3 text-center tracking-wide">${escapeHtml(info.ctaButton.subtitle)}</p>` : ''}
            </div>
        ` : '';

        return `
            <!-- 标题区 -->
            <div class="mb-8 border-b border-white/10 pb-6">
                <h1 class="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">${escapeHtml(title)}</h1>
                <div class="flex justify-between items-end">
                    <p class="text-primary font-mono text-sm tracking-widest uppercase">${escapeHtml(productCode)}</p>
                    ${restrictionHtml}
                </div>
            </div>

            ${descHtml}
            ${specsHtml}
            ${quoteHtml}
            ${ctaHtml}
        `;
    }
    /**
     * 渲染详情页规格参数
     */
    function renderDetailSpecs(items) {
        if (!items || items.length === 0) return '';

        const rows = items.map(item => `
            <div class="flex justify-between py-3 tech-grid-line">
                <span class="text-gray-500 text-xs tracking-wider">${escapeHtml(item.label)}</span>
                <span class="text-gray-200 text-sm font-medium text-right">${escapeHtml(item.value)}</span>
            </div>
        `).join('');

        return `<div class="w-full">${rows}</div>`;
    }

    // ========================================
    // 故事章节渲染
    // ========================================

    /**
     * 渲染所有故事章节
     */
    function renderStoryChapters(chapters, product) {
        if (!chapters || chapters.length === 0) return '';
        return chapters.map(chapter => renderStoryChapter(chapter, product)).join('');
    }

    /**
     * 渲染单个故事章节
     */
    function renderStoryChapter(chapter, product) {
        const bgUrl = getImageUrl(chapter.background?.imageUrl || product.media?.hero);
        const filters = chapter.background?.filters || {};

        switch (chapter.style) {
            case 'center-ambient':
                return renderChapterCenterAmbient(chapter, bgUrl, filters);
            case 'left-technical':
                return renderChapterLeftTechnical(chapter, bgUrl, filters);
            case 'right-narrative':
                return renderChapterRightNarrative(chapter, bgUrl, filters);
            default:
                return renderChapterCenterAmbient(chapter, bgUrl, filters);
        }
    }

    /**
     * 居中氛围风格章节
     */
    function renderChapterCenterAmbient(chapter, bgUrl, filters) {
        const content = chapter.centerContent || {};
        const gradient = chapter.gradient || {};
        const overlay = chapter.overlayColor || {};

        const decorativeLineHtml = content.decorativeLine?.enabled ? `
            <div class="mb-6">
                <span class="inline-block w-px ${content.decorativeLine.height || 'h-20'}" style="background: linear-gradient(to bottom, transparent, var(--color-primary), transparent);"></span>
            </div>
        ` : '';

        const statusHtml = content.statusText?.enabled ? `
            <div class="mt-12">
                <p class="font-mono text-[10px] uppercase tracking-[0.4em]" style="color: rgba(var(--color-primary-rgb), 0.6);">${escapeHtml(content.statusText.text)}</p>
            </div>
        ` : '';

        return `
            <section class="story-chapter relative min-h-screen w-full overflow-hidden flex items-center justify-center">
                <div class="absolute inset-0 bg-cover bg-center"
                     style="background-image: url('${bgUrl}'); transform: scale(${filters.scale || 1.05}); filter: brightness(${filters.brightness || 0.9});"></div>
                <div class="absolute inset-0 bg-gradient-${gradient.direction || 'to-b'} from-${gradient.fromColor || 'black/40'} via-${gradient.viaColor || 'transparent'} to-${gradient.toColor || 'background-dark/90'}"></div>
                ${overlay.color ? `<div class="absolute inset-0 bg-${overlay.color} mix-blend-${overlay.mixBlendMode || 'overlay'} pointer-events-none"></div>` : ''}

                <div class="relative z-20 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
                    ${decorativeLineHtml}
                    <h2 class="text-6xl md:text-8xl font-display font-bold text-white mb-8 tracking-[0.15em] drop-shadow-2xl">
                        ${escapeHtml(content.title)}
                    </h2>
                    <p class="text-gray-300 text-lg md:text-xl font-light leading-relaxed tracking-wide max-w-2xl mx-auto font-display">
                        ${content.content || ''}
                    </p>
                    ${statusHtml}
                </div>
            </section>
        `;
    }

    /**
     * 左侧技术风格章节
     */
    function renderChapterLeftTechnical(chapter, bgUrl, filters) {
        const content = chapter.leftContent || {};
        const gradient = chapter.gradient || {};
        const overlay = chapter.overlayColor || {};

        const iconHtml = content.icon ? `
            <div class="flex items-center gap-4 mb-4">
                <span class="material-symbols-outlined text-${content.icon.color || 'primary'} text-xl">${content.icon.name}</span>
                <span class="text-${content.icon.color || 'primary'} text-xs font-mono uppercase tracking-widest">${escapeHtml(content.iconLabel)}</span>
            </div>
        ` : '';

        const dataBlocksHtml = content.dataBlocks ? content.dataBlocks.map(block => `
            <div>
                <span class="block text-2xl font-display text-white">${escapeHtml(block.value)}</span>
                <span class="text-[10px] text-gray-500 uppercase tracking-widest">${escapeHtml(block.label)}</span>
            </div>
        `).join('') : '';

        const borderStyle = content.borderLeft?.enabled
            ? `border-left: 1px solid rgba(var(--color-primary-rgb), 0.3);`
            : '';
        const borderPadding = content.borderLeft?.enabled ? 'pl-8 md:pl-12' : '';

        return `
            <section class="story-chapter relative min-h-screen w-full overflow-hidden flex items-center">
                <div class="absolute inset-0 bg-cover bg-center"
                     style="background-image: url('${bgUrl}'); transform: scale(${filters.scale || 1});"></div>
                ${overlay.color ? `<div class="absolute inset-0 bg-${overlay.color} mix-blend-${overlay.mixBlendMode || 'multiply'}"></div>` : ''}
                <div class="absolute inset-0 bg-gradient-${gradient.direction || 'to-r'} from-${gradient.fromColor || 'background-dark'} via-${gradient.viaColor || 'background-dark/60'} to-${gradient.toColor || 'transparent'}"></div>

                <div class="relative z-20 pl-8 md:pl-24 pr-8 max-w-[1600px] w-full mx-auto">
                    <div class="flex flex-col justify-center ${borderPadding} py-12 backdrop-blur-[2px] max-w-2xl" style="${borderStyle}">
                        ${iconHtml}
                        <h2 class="text-5xl md:text-7xl font-display font-bold text-white mb-8 tracking-widest">
                            ${escapeHtml(content.title)}
                        </h2>
                        <p class="text-gray-300 text-lg font-light leading-loose tracking-wide mb-8">
                            ${content.content || ''}
                        </p>
                        ${dataBlocksHtml ? `<div class="flex gap-8">${dataBlocksHtml}</div>` : ''}
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 右侧叙事风格章节
     */
    function renderChapterRightNarrative(chapter, bgUrl, filters) {
        const content = chapter.rightContent || {};
        const gradient = chapter.gradient || {};
        const gridTexture = chapter.gridTexture || {};

        const statusHtml = content.statusIndicator?.enabled ? `
            <div class="mb-4">
                <span class="inline-flex items-center gap-2 px-3 py-1 border text-[10px] tracking-widest uppercase rounded-full" style="border-color: rgba(var(--color-primary-rgb), 0.2); background-color: rgba(var(--color-primary-rgb), 0.05); color: var(--color-primary);">
                    ${content.statusIndicator.isAnimated ? '<span class="w-1.5 h-1.5 rounded-full animate-ping" style="background-color: var(--color-primary);"></span>' : ''}
                    ${escapeHtml(content.statusIndicator.text)}
                </span>
            </div>
        ` : '';

        const quoteCardHtml = content.quoteCard?.enabled ? `
            <div class="quote-card mt-16 w-full max-w-md bg-surface-dark/80 backdrop-blur-md border border-white/10 p-8 relative border-l-4">
                <span class="absolute top-4 right-4 material-symbols-outlined text-gray-600">format_quote</span>
                <p class="text-gray-400 font-display italic text-sm leading-relaxed mb-4">
                    "${escapeHtml(content.quoteCard.text)}"
                </p>
                <div class="flex items-center justify-end gap-3">
                    <div class="text-right">
                        <p class="text-xs text-white font-bold tracking-wider">${escapeHtml(content.quoteCard.author)}</p>
                        <p class="text-[11px] text-gray-500 uppercase tracking-widest">${escapeHtml(content.quoteCard.title)}</p>
                    </div>
                    <div class="size-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border border-white/10"></div>
                </div>
            </div>
        ` : '';

        const gridTextureHtml = gridTexture.enabled ? `
            <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-${Math.round((gridTexture.opacity || 0.3) * 100)}"></div>
        ` : '';

        const filterStyle = filters.grayscale ? 'grayscale' : '';

        return `
            <section class="story-chapter relative min-h-screen w-full overflow-hidden flex items-center justify-end">
                <div class="absolute inset-0 bg-cover bg-center ${filterStyle}"
                     style="background-image: url('${bgUrl}'); filter: contrast(${filters.contrast || 1.25});"></div>
                <div class="absolute inset-0 bg-gradient-${gradient.direction || 'to-l'} from-${gradient.fromColor || 'background-dark'} via-${gradient.viaColor || 'background-dark/80'} to-${gradient.toColor || 'transparent'}"></div>
                ${gridTextureHtml}

                <div class="relative z-20 pr-8 md:pr-24 pl-8 max-w-[1600px] w-full mx-auto flex flex-col items-end text-right">
                    ${statusHtml}
                    <h2 class="text-5xl md:text-7xl font-display font-bold text-white mb-8 tracking-widest">
                        ${escapeHtml(content.title)}
                    </h2>
                    <p class="text-gray-300 text-lg md:text-xl font-light leading-loose tracking-wide max-w-xl">
                        ${content.content || ''}
                    </p>
                    ${quoteCardHtml}
                </div>
            </section>
        `;
    }

    // ========================================
    // 技术摘要和相关产品
    // ========================================

    /**
     * 渲染技术规格摘要
     */
    function renderTechSummary(techSummary) {
        if (!techSummary || !techSummary.enabled) return '';

        const specsHtml = techSummary.specs?.map(spec => `
            <div class="flex justify-between py-4 border-b border-white/10">
                <span class="text-gray-500 text-xs tracking-widest uppercase">${escapeHtml(spec.label)}</span>
                <span class="text-gray-200 text-sm font-mono">${escapeHtml(spec.value)}</span>
            </div>
        `).join('') || '';

        const ctaHtml = techSummary.ctaButton?.enabled ? `
            <button class="w-full group relative px-8 py-6 border border-white/20 bg-transparent hover:bg-white text-white hover:text-background-dark transition-all duration-500 overflow-hidden">
                <div class="absolute inset-0 w-0 bg-white transition-all duration-[400ms] ease-out group-hover:w-full"></div>
                <div class="relative flex items-center justify-between">
                    <span class="font-bold tracking-[0.25em] uppercase text-sm">${escapeHtml(techSummary.ctaButton.text)}</span>
                    <span class="material-symbols-outlined text-lg">download</span>
                </div>
            </button>
            ${techSummary.ctaButton.subtitle ? `<p class="text-[11px] text-gray-600 text-center tracking-wide">${escapeHtml(techSummary.ctaButton.subtitle)}</p>` : ''}
        ` : '';

        return `
            <section class="bg-background-dark py-24 px-6 relative border-t border-white/5">
                <div class="max-w-7xl mx-auto">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h3 class="text-2xl font-display text-white mb-8">${escapeHtml(techSummary.title)}</h3>
                            <div class="space-y-4">
                                ${specsHtml}
                            </div>
                        </div>
                        <div class="flex flex-col gap-6">
                            <p class="text-gray-400 text-sm leading-relaxed">
                                ${escapeHtml(techSummary.description)}
                            </p>
                            ${ctaHtml}
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 渲染相关产品
     */
    function renderRelatedProducts(relatedProducts) {
        if (!relatedProducts || !relatedProducts.enabled) return '';

        const productsHtml = relatedProducts.products?.map(product => {
            // 尝试通过 ID 获取完整产品数据以获取正确的图片路径
            let imageUrl = product.imageUrl;

            if (product.id && typeof ProductDataLoader !== 'undefined' && ProductDataLoader.isLoaded()) {
                try {
                    const fullProduct = ProductDataLoader.getProductById(product.id);
                    if (fullProduct && fullProduct.media) {
                        // 优先使用 thumbnail，其次 hero，最后才用配置的 imageUrl
                        const newUrl = fullProduct.media.thumbnail || fullProduct.media.hero;
                        if (newUrl) {
                            imageUrl = newUrl;
                        }
                    }
                } catch (e) {
                    // 静默处理错误，使用原配置的 imageUrl
                }
            }

            return `
            <a href="${product.href || `product-detail.html?id=${product.id}`}" class="group cursor-pointer block">
                <div class="relative aspect-[4/3] bg-background-dark overflow-hidden mb-4 shadow-soft rounded-sm">
                    <div class="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-105 saturate-50 group-hover:saturate-100 contrast-125 opacity-90 group-hover:opacity-100"
                         style="background-image: url('${getImageUrl(imageUrl)}');"></div>
                    <div class="absolute top-0 left-0 p-4 w-full flex justify-between items-start">
                        <span class="text-[11px] font-bold tracking-widest text-white/60 uppercase border px-2 py-1 bg-black/40 backdrop-blur-sm" style="border-color: rgba(var(--color-primary-rgb), 0.3);">${escapeHtml(product.productCode)}</span>
                    </div>
                </div>
                <h3 class="text-white font-display text-lg tracking-wide group-hover:text-primary transition-colors">${escapeHtml(product.productName)}</h3>
                <p class="text-gray-500 text-xs mt-1">${escapeHtml(product.productDesc)}</p>
            </a>
        `;
        }).join('') || '';

        return `
            <section class="border-t border-white/5 bg-surface-dark py-24 px-6 md:px-12">
                <div class="max-w-[1600px] mx-auto">
                    <div class="flex justify-between items-end mb-12">
                        <div>
                            <h2 class="text-2xl md:text-3xl font-display text-white mb-2">${escapeHtml(relatedProducts.title)}</h2>
                            <p class="text-gray-500 text-xs tracking-[0.2em] uppercase">${escapeHtml(relatedProducts.subtitle)}</p>
                        </div>
                        <a class="hidden md:flex items-center gap-2 text-xs text-primary hover:text-white transition-colors uppercase tracking-widest" href="products.html">
                            查看全系列 <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        ${productsHtml}
                    </div>
                </div>
            </section>
        `;
    }

    // ========================================
    // 错误和加载状态
    // ========================================

    /**
     * 渲染错误提示
     */
    function renderError(message) {
        return `
            <div class="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6">
                <span class="material-symbols-outlined text-6xl text-gray-600">error_outline</span>
                <h2 class="text-3xl font-display text-white">出错了</h2>
                <p class="text-gray-400 text-center max-w-md">${escapeHtml(message)}</p>
                <a href="products.html" class="px-6 py-3 bg-primary text-white text-sm font-bold tracking-wider uppercase hover:bg-primary-dim transition-colors">
                    返回产品列表
                </a>
            </div>
        `;
    }

    /**
     * 渲染 404 页面
     */
    function render404(productId) {
        return `
            <div class="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6">
                <span class="material-symbols-outlined text-6xl text-gray-600">search_off</span>
                <h2 class="text-3xl font-display text-white">产品未找到</h2>
                <p class="text-gray-400 text-center max-w-md">型号 "${escapeHtml(productId)}" 不存在或已下架</p>
                <a href="products.html" class="px-6 py-3 bg-primary text-white text-sm font-bold tracking-wider uppercase hover:bg-primary-dim transition-colors">
                    返回产品列表
                </a>
            </div>
        `;
    }

    /**
     * 渲染加载状态
     */
    function renderLoading() {
        return `
            <div class="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div class="w-12 h-12 border-2 rounded-full animate-spin" style="border-color: rgba(var(--color-primary-rgb), 0.3); border-top-color: var(--color-primary);"></div>
                <p class="text-gray-500 text-sm tracking-wider">加载中...</p>
            </div>
        `;
    }

    // 公开 API
    return {
        // 辅助函数
        escapeHtml,
        renderIf,
        getImageUrl,

        // 基础组件
        renderStatusBadge,
        renderBreadcrumb,
        renderSpecs,
        renderDesignerQuote,

        // 产品卡片
        renderProductCard,
        renderProductListCard,

        // 旗舰序列
        renderFeaturedSection,

        // 产品详情页
        renderProductDetail,
        renderDetailGallery,
        renderDetailProductInfo,

        // 故事章节
        renderStoryChapters,
        renderStoryChapter,

        // 技术摘要和相关产品
        renderTechSummary,
        renderRelatedProducts,

        // 状态
        renderError,
        render404,
        renderLoading
    };
})();
