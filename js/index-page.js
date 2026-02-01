/**
 * 首页逻辑
 * 负责加载精选产品并渲染到首页
 */

(async function() {
    'use strict';

    const container = document.getElementById('featured-products-grid');

    if (!container) {
        console.warn('[IndexPage] 找不到 #featured-products-grid 容器，跳过精选产品加载');
        return;
    }

    // 显示加载状态
    container.innerHTML = `
        <div class="col-span-full flex items-center justify-center py-12">
            <div class="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
    `;

    try {
        // 初始化数据加载器
        await ProductDataLoader.init();

        // 获取精选产品（前6个）
        const featuredProducts = ProductDataLoader.getFeaturedProducts().slice(0, 6);

        if (featuredProducts.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-gray-500">暂无精选产品</p>
                </div>
            `;
            return;
        }

        // 渲染产品卡片
        const html = featuredProducts.map(product => renderFeaturedCard(product)).join('');
        container.innerHTML = html;

        // 添加入场动画
        const cards = container.querySelectorAll('.featured-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.offsetHeight;
            card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });

        console.log(`[IndexPage] 成功加载 ${featuredProducts.length} 个精选产品`);

    } catch (error) {
        console.error('[IndexPage] 加载失败:', error);
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-500">加载失败，请刷新页面重试</p>
            </div>
        `;
    }

    /**
     * 渲染首页精选产品卡片
     */
    function renderFeaturedCard(product) {
        const imageUrl = Renderer.getImageUrl(product.media?.thumbnail || product.media?.hero);
        const seriesTag = product.classification?.seriesEn
            ? `${product.classification.seriesEn} ${product.classification.series}级`
            : product.modelId;

        return `
            <a href="product-detail.html?id=${product.id}" class="featured-card group flex flex-col bg-transparent" data-scroll-highlight>
                <div class="relative aspect-[4/3] w-full overflow-hidden rounded bg-background-dark mb-6 shadow-inner-glow">
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 saturate-50 brightness-75 contrast-125"
                         style="background-image: url('${imageUrl}');">
                    </div>
                    <div class="absolute top-4 left-4">
                        <span class="text-[11px] font-bold tracking-widest text-primary/80 uppercase border border-primary/20 px-2 py-1 bg-black/40 backdrop-blur-sm">
                            ${Renderer.escapeHtml(seriesTag)}
                        </span>
                    </div>
                </div>
                <div class="flex flex-col items-start">
                    <h3 class="text-xl font-display font-medium text-white group-hover:text-primary transition-colors duration-300">
                        ${Renderer.escapeHtml(product.name)}
                    </h3>
                    <p class="text-text-muted text-xs tracking-wider uppercase mb-3 mt-1">
                        ${Renderer.escapeHtml(product.classification?.category || '')} · ${Renderer.escapeHtml(product.classification?.subcategory || '')}
                    </p>
                    <p class="text-gray-500 font-body text-sm leading-relaxed line-clamp-2 mb-6">
                        ${Renderer.escapeHtml(product.description?.tagline || product.description?.summary || '')}
                    </p>
                    <span class="text-xs font-bold text-white border-b border-transparent group-hover:border-white transition-all pb-0.5 uppercase tracking-widest">
                        查看规格
                    </span>
                </div>
            </a>
        `;
    }
})();
