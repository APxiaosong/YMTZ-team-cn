/**
 * URL 参数处理工具
 * 提供 URL 查询参数的读取和设置功能
 */

const UrlUtils = (function() {
    /**
     * 获取 URL 查询参数
     * @param {string} key - 参数名
     * @returns {string|null} - 参数值，不存在时返回 null
     */
    function getParam(key) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(key);
    }

    /**
     * 设置 URL 查询参数（不刷新页面）
     * @param {string} key - 参数名
     * @param {string} value - 参数值
     */
    function setParam(key, value) {
        const url = new URL(window.location.href);
        url.searchParams.set(key, value);
        window.history.replaceState({}, '', url.toString());
    }

    /**
     * 移除 URL 查询参数（不刷新页面）
     * @param {string} key - 参数名
     */
    function removeParam(key) {
        const url = new URL(window.location.href);
        url.searchParams.delete(key);
        window.history.replaceState({}, '', url.toString());
    }

    /**
     * 获取所有 URL 查询参数
     * @returns {Object} - 所有参数的键值对
     */
    function getAllParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        for (const [key, value] of urlParams.entries()) {
            params[key] = value;
        }
        return params;
    }

    /**
     * 构建带参数的 URL
     * @param {string} basePath - 基础路径
     * @param {Object} params - 参数对象
     * @returns {string} - 完整 URL
     */
    function buildUrl(basePath, params) {
        const url = new URL(basePath, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });
        return url.toString();
    }

    return {
        getParam,
        setParam,
        removeParam,
        getAllParams,
        buildUrl
    };
})();
