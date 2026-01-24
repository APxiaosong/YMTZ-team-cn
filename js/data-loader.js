/**
 * 产品数据加载器
 * 单例模式，负责加载、缓存和查询产品数据
 */

const ProductDataLoader = (function() {
    // 内部状态
    let productsData = null;
    let isLoading = false;
    let loadPromise = null;

    /**
     * 初始化并加载产品数据
     * 支持两种模式：
     * - 本地 file:// 协议：使用预转换的 PRODUCTS_DATA 全局变量
     * - HTTP 协议：fetch 加载 JSON 文件
     * @returns {Promise<Array>} - 产品数据数组
     */
    async function init() {
        // 已加载，直接返回
        if (productsData) {
            return productsData;
        }

        // 正在加载中，返回现有 Promise
        if (isLoading) {
            return loadPromise;
        }

        // 模式 1：检查是否有预加载的 JS 数据（本地 file:// 模式）
        if (typeof PRODUCTS_DATA !== 'undefined') {
            productsData = PRODUCTS_DATA;
            console.log(`[DataLoader] 从 JS 模块加载 ${productsData.length} 个产品`);
            return Promise.resolve(productsData);
        }

        // 模式 2：fetch 加载 JSON（HTTP 模式，如 GitHub Pages）
        isLoading = true;
        loadPromise = fetch('data/products.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                productsData = data;
                isLoading = false;
                console.log(`[DataLoader] 从 JSON 加载 ${data.length} 个产品`);
                return data;
            })
            .catch(error => {
                isLoading = false;
                console.error('[DataLoader] 加载失败:', error);
                console.error('[DataLoader] 本地预览请先运行 convert-json-to-js.bat');
                throw error;
            });

        return loadPromise;
    }

    /**
     * 检查数据是否已加载
     * @returns {boolean}
     */
    function isLoaded() {
        return productsData !== null;
    }

    /**
     * 获取所有产品
     * @returns {Array}
     */
    function getAllProducts() {
        return productsData || [];
    }

    /**
     * 按 ID 获取单个产品
     * @param {string} id - 产品 ID
     * @returns {Object|null}
     */
    function getProductById(id) {
        if (!productsData) return null;
        return productsData.find(p => p.id === id) || null;
    }

    /**
     * 获取精选产品（featured.enabled === true）
     * @returns {Array} - 按 order 排序的精选产品
     */
    function getFeaturedProducts() {
        if (!productsData) return [];
        return productsData
            .filter(p => p.featured && p.featured.enabled === true)
            .sort((a, b) => (a.featured.order || 999) - (b.featured.order || 999));
    }

    /**
     * 按系列筛选产品
     * @param {string} series - 系列名（中文或英文）
     * @returns {Array}
     */
    function getProductsBySeries(series) {
        if (!productsData) return [];
        const lowerSeries = series.toLowerCase();
        return productsData.filter(p => {
            const cls = p.classification;
            if (!cls) return false;
            const matchSeries = cls.series && cls.series.toLowerCase() === lowerSeries;
            const matchSeriesEn = cls.seriesEn && cls.seriesEn.toLowerCase() === lowerSeries;
            return matchSeries || matchSeriesEn;
        });
    }

    /**
     * 按分类筛选产品
     * @param {string} category - 分类名
     * @returns {Array}
     */
    function getProductsByCategory(category) {
        if (!productsData) return [];
        return productsData.filter(p => {
            const cls = p.classification;
            if (!cls) return false;
            return cls.category === category || cls.subcategory === category;
        });
    }

    /**
     * 按品牌筛选产品
     * @param {string} brand - 品牌名（ZNHI/ZNTP）
     * @returns {Array}
     */
    function getProductsByBrand(brand) {
        if (!productsData) return [];
        return productsData.filter(p => {
            const cls = p.classification;
            return cls && cls.brand === brand;
        });
    }

    /**
     * 按标签筛选产品
     * @param {string} tag - 标签
     * @returns {Array}
     */
    function getProductsByTag(tag) {
        if (!productsData) return [];
        return productsData.filter(p => {
            const cls = p.classification;
            return cls && cls.tags && cls.tags.includes(tag);
        });
    }

    /**
     * 按安全等级筛选产品
     * @param {string} level - 安全等级（A/B/C）
     * @returns {Array}
     */
    function getProductsBySecurityLevel(level) {
        if (!productsData) return [];
        return productsData.filter(p => {
            return p.status && p.status.securityLevel === level;
        });
    }

    /**
     * 获取所有系列列表
     * @returns {Array<Object>} - 系列信息数组
     */
    function getAllSeries() {
        if (!productsData) return [];
        const seriesMap = new Map();

        productsData.forEach(p => {
            const cls = p.classification;
            if (cls && cls.series) {
                if (!seriesMap.has(cls.series)) {
                    seriesMap.set(cls.series, {
                        name: cls.series,
                        nameEn: cls.seriesEn || '',
                        count: 0,
                        products: []
                    });
                }
                const seriesInfo = seriesMap.get(cls.series);
                seriesInfo.count++;
                seriesInfo.products.push(p);
            }
        });

        return Array.from(seriesMap.values());
    }

    /**
     * 按品牌获取系列列表
     * @param {string} brand - 品牌（ZNHI/ZNTP）
     * @returns {Array<Object>} - 系列信息数组
     */
    function getSeriesByBrand(brand) {
        if (!productsData) return [];
        const seriesMap = new Map();

        // 筛选指定品牌的产品（使用 classification.brand）
        const brandProducts = productsData.filter(p => p.classification?.brand === brand);

        brandProducts.forEach(p => {
            const cls = p.classification;
            if (cls && cls.series) {
                if (!seriesMap.has(cls.series)) {
                    seriesMap.set(cls.series, {
                        series: cls.series,
                        seriesEn: cls.seriesEn || '',
                        description: '',
                        thumbnail: p.media?.thumbnail || '',
                        count: 0,
                        products: []
                    });
                }
                const seriesInfo = seriesMap.get(cls.series);
                seriesInfo.count++;
                seriesInfo.products.push(p);
                // 用第一个产品的描述作为系列描述
                if (!seriesInfo.description && p.description?.tagline) {
                    seriesInfo.description = p.description.tagline;
                }
            }
        });

        return Array.from(seriesMap.values());
    }

    /**
     * 获取所有分类列表
     * @returns {Array<Object>} - 分类信息数组
     */
    function getAllCategories() {
        if (!productsData) return [];
        const categoryMap = new Map();

        productsData.forEach(p => {
            const cls = p.classification;
            if (cls && cls.category) {
                if (!categoryMap.has(cls.category)) {
                    categoryMap.set(cls.category, {
                        name: cls.category,
                        count: 0,
                        subcategories: new Set()
                    });
                }
                const catInfo = categoryMap.get(cls.category);
                catInfo.count++;
                if (cls.subcategory) {
                    catInfo.subcategories.add(cls.subcategory);
                }
            }
        });

        return Array.from(categoryMap.values()).map(cat => ({
            ...cat,
            subcategories: Array.from(cat.subcategories)
        }));
    }

    /**
     * 搜索产品（按名称、型号、描述）
     * @param {string} query - 搜索关键词
     * @returns {Array}
     */
    function searchProducts(query) {
        if (!productsData || !query) return [];
        const lowerQuery = query.toLowerCase();

        return productsData.filter(p => {
            const searchFields = [
                p.name,
                p.nameEn,
                p.modelId,
                p.nickname,
                p.description?.tagline,
                p.description?.summary
            ];

            return searchFields.some(field =>
                field && field.toLowerCase().includes(lowerQuery)
            );
        });
    }

    /**
     * 获取相关产品
     * @param {string} productId - 当前产品 ID
     * @param {number} limit - 返回数量限制
     * @returns {Array}
     */
    function getRelatedProducts(productId, limit = 3) {
        const product = getProductById(productId);
        if (!product || !productsData) return [];

        const cls = product.classification;

        // 优先同系列，其次同分类
        const related = productsData.filter(p => {
            if (p.id === productId) return false;
            const pCls = p.classification;
            if (!pCls) return false;
            return pCls.series === cls.series || pCls.category === cls.category;
        });

        // 同系列排前面
        related.sort((a, b) => {
            const aIsSameSeries = a.classification.series === cls.series ? 0 : 1;
            const bIsSameSeries = b.classification.series === cls.series ? 0 : 1;
            return aIsSameSeries - bIsSameSeries;
        });

        return related.slice(0, limit);
    }

    /**
     * 获取指定品牌和系列下的所有子分类列表（用于筛选）
     * @param {string} brand - 品牌（ZNHI/ZNTP）
     * @param {string|null} series - 系列名（可选，null表示获取该品牌下所有子分类）
     * @returns {Array<Object>} - 子分类信息数组，包含 { name, count }
     */
    function getSubcategoriesByBrandAndSeries(brand, series = null) {
        if (!productsData) return [];

        // 筛选产品：先按品牌，再按系列（如果指定）
        let filteredProducts = productsData.filter(p => {
            const cls = p.classification;
            if (!cls || cls.brand !== brand) return false;

            // 如果指定了系列，需要匹配系列
            if (series !== null) {
                return cls.series === series || cls.seriesEn === series;
            }

            return true;
        });

        // 统计子分类
        const subcategoryMap = new Map();
        filteredProducts.forEach(p => {
            const subcategory = p.classification?.subcategory;
            if (subcategory) {
                if (!subcategoryMap.has(subcategory)) {
                    subcategoryMap.set(subcategory, {
                        name: subcategory,
                        count: 0
                    });
                }
                subcategoryMap.get(subcategory).count++;
            }
        });

        // 转换为数组并按计数降序排序
        return Array.from(subcategoryMap.values())
            .sort((a, b) => b.count - a.count);
    }

    // 公开 API
    return {
        init,
        isLoaded,
        getAllProducts,
        getProductById,
        getFeaturedProducts,
        getProductsBySeries,
        getProductsByCategory,
        getProductsByBrand,
        getProductsByTag,
        getProductsBySecurityLevel,
        getAllSeries,
        getSeriesByBrand,
        getAllCategories,
        searchProducts,
        getRelatedProducts,
        getSubcategoriesByBrandAndSeries
    };
})();
