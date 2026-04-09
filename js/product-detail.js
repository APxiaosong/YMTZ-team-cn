/**
 * 产品详情页逻辑
 * 负责加载产品数据并渲染详情页
 */

(async function() {
    'use strict';

    const container = document.getElementById('product-detail-container');
    if (!container) {
        console.error('[ProductDetail] 找不到容器 #product-detail-container');
        return;
    }

    // 显示加载状态
    container.innerHTML = Renderer.renderLoading();

    try {
        // 初始化数据加载器
        await ProductDataLoader.init();

        // 获取产品 ID
        const productId = UrlUtils.getParam('id');
        if (!productId) {
            container.innerHTML = Renderer.renderError('缺少产品 ID 参数');
            return;
        }

        // 加载产品数据
        const product = ProductDataLoader.getProductById(productId);
        if (!product) {
            container.innerHTML = Renderer.render404(productId);
            return;
        }

        // 根据品牌应用主题色
        applyBrandTheme(product);

        // 渲染详情页
        container.innerHTML = Renderer.renderProductDetail(product);

        // 更新页面标题
        document.title = `${product.name} 详情概览 | 监狱重工`;

        // 更新导航栏高亮
        updateNavHighlight(product);

        // 重新初始化图片画廊（在 DOM 更新后）
        setTimeout(() => {
            if (typeof initGallery === 'function') {
                initGallery('product-gallery');
            }

            // 初始化画廊缩略图切换
            if (typeof Gallery !== 'undefined') {
                Gallery.init();
            }

            // 初始化图片查看器
            if (typeof ImageViewer !== 'undefined') {
                ImageViewer.init();
            }
        }, 100);

        console.log(`[ProductDetail] 成功加载产品: ${product.name} (${product.id})`);

    } catch (error) {
        console.error('[ProductDetail] 加载失败:', error);
        container.innerHTML = Renderer.renderError('数据加载失败，请稍后重试');
    }

    /**
     * 根据品牌应用主题色
     */
    function applyBrandTheme(product) {
        const brand = product.classification?.brand;
        const html = document.documentElement;

        html.classList.remove('theme-zntp', 'theme-znef');

        if (brand === 'ZNTP') {
            html.classList.add('theme-zntp');
        } else if (brand === 'ZNEF') {
            html.classList.add('theme-znef');
        }
    }

    /**
     * 更新导航栏高亮状态
     */
    function updateNavHighlight(product) {
        const brand = product.classification?.brand;
        const navLinks = document.querySelectorAll('nav a');

        navLinks.forEach(link => {
            link.classList.remove('text-white', 'border-b', 'border-primary', 'pb-1');
            link.classList.add('text-gray-400');

            // 根据品牌高亮对应的导航项
            if (brand === 'ZNHI' && link.href.includes('products.html')) {
                link.classList.remove('text-gray-400');
                link.classList.add('text-white', 'border-b', 'border-primary', 'pb-1');
            } else if (brand === 'ZNTP' && link.href.includes('transport.html')) {
                link.classList.remove('text-gray-400');
                link.classList.add('text-white', 'border-b', 'border-primary', 'pb-1');
            } else if (brand === 'ZNEF' && link.href.includes('emergency.html')) {
                link.classList.remove('text-gray-400');
                link.classList.add('text-white', 'border-b', 'border-primary', 'pb-1');
            }
        });
    }
})();
