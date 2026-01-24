/**
 * 全屏图片查看器
 * 负责处理产品详情页的图片全屏查看功能
 */

const ImageViewer = (function() {
    'use strict';

    // DOM 元素引用
    let viewer = null;
    let viewerImage = null;
    let viewerCounter = null;
    let viewerLoading = null;
    let closeBtn = null;
    let prevBtn = null;
    let nextBtn = null;
    let expandBtn = null;
    let galleryMain = null;
    let zoomIndicator = null;

    // 状态
    let images = [];
    let currentIndex = 0;
    let isOpen = false;

    // 缩放和平移状态
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let lastTranslateX = 0;
    let lastTranslateY = 0;

    // 缩放配置
    const MIN_SCALE = 1;      // 最小100%（原图大小）
    const MAX_SCALE = 4;      // 最大400%
    const SCALE_STEP = 0.2;   // 缩放步长20%

    /**
     * 初始化图片查看器
     */
    function init() {
        // 获取 DOM 元素
        viewer = document.getElementById('image-viewer');
        viewerImage = document.getElementById('viewer-image');
        viewerCounter = document.getElementById('viewer-counter');
        viewerLoading = document.getElementById('viewer-loading');
        closeBtn = document.getElementById('viewer-close-btn');
        prevBtn = document.getElementById('viewer-prev-btn');
        nextBtn = document.getElementById('viewer-next-btn');
        expandBtn = document.getElementById('gallery-expand-btn');
        galleryMain = document.getElementById('gallery-main');

        // 检查必要元素是否存在
        if (!viewer || !expandBtn || !galleryMain) {
            return;
        }

        // 从 data 属性读取图片列表
        try {
            const imagesData = galleryMain.getAttribute('data-images');
            images = JSON.parse(imagesData);
            currentIndex = parseInt(galleryMain.getAttribute('data-current-index')) || 0;
        } catch (error) {
            images = [];
        }

        if (images.length === 0) {
            return;
        }

        // 创建缩放指示器
        createZoomIndicator();

        // 绑定事件
        bindEvents();
    }

    /**
     * 创建缩放指示器
     */
    function createZoomIndicator() {
        zoomIndicator = document.createElement('div');
        zoomIndicator.id = 'viewer-zoom-indicator';
        zoomIndicator.className = 'absolute top-6 left-6 z-10 px-3 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-sm text-white text-xs font-mono tracking-wider opacity-0 transition-opacity';
        zoomIndicator.textContent = '100%';
        viewer.appendChild(zoomIndicator);
    }

    /**
     * 绑定事件监听器
     */
    function bindEvents() {
        // 打开查看器
        expandBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openViewer();
        });

        // 关闭查看器
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeViewer();
        });

        // 背景点击关闭
        viewer.addEventListener('click', (e) => {
            if (e.target === viewer) {
                closeViewer();
            }
        });

        // 切换图片
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showPrevImage();
        });

        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showNextImage();
        });

        // 键盘操作
        document.addEventListener('keydown', handleKeyPress);

        // 鼠标滚轮缩放
        viewerImage.addEventListener('wheel', handleWheel, { passive: false });

        // 双击重置缩放
        viewerImage.addEventListener('dblclick', resetZoom);

        // 拖拽移动（仅在缩放时）
        viewerImage.addEventListener('mousedown', handleDragStart);
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
    }

    /**
     * 打开图片查看器
     */
    function openViewer() {
        if (!viewer || images.length === 0) {
            return;
        }

        // 读取当前显示的图片索引
        currentIndex = parseInt(galleryMain.getAttribute('data-current-index')) || 0;

        isOpen = true;
        viewer.classList.remove('hidden');
        viewer.classList.add('animate-fade-in');

        // 禁止背景滚动
        document.body.style.overflow = 'hidden';

        // 重置缩放和平移
        resetZoom();

        // 加载并显示图片
        loadImage(currentIndex);
    }

    /**
     * 关闭图片查看器
     */
    function closeViewer() {
        if (!viewer) return;

        isOpen = false;
        viewer.classList.add('animate-fade-out');

        // 恢复背景滚动
        document.body.style.overflow = '';

        // 动画结束后隐藏
        setTimeout(() => {
            viewer.classList.remove('animate-fade-in', 'animate-fade-out');
            viewer.classList.add('hidden');
        }, 300);
    }

    /**
     * 加载并显示指定索引的图片
     */
    function loadImage(index) {
        if (index < 0 || index >= images.length) {
            return;
        }

        currentIndex = index;

        // 重置缩放和平移
        resetZoom();

        // 显示加载指示器
        viewerLoading.classList.remove('hidden');
        viewerImage.style.opacity = '0';

        // 创建新图片对象预加载
        const img = new Image();
        img.onload = () => {
            viewerImage.src = images[currentIndex];
            viewerImage.style.opacity = '1';
            viewerLoading.classList.add('hidden');
            updateUI();
        };
        img.onerror = () => {
            viewerLoading.classList.add('hidden');
            viewerImage.style.opacity = '1';
            updateUI();
        };
        img.src = images[currentIndex];
    }

    /**
     * 显示上一张图片
     */
    function showPrevImage() {
        if (currentIndex > 0) {
            loadImage(currentIndex - 1);
        }
    }

    /**
     * 显示下一张图片
     */
    function showNextImage() {
        if (currentIndex < images.length - 1) {
            loadImage(currentIndex + 1);
        }
    }

    /**
     * 更新 UI 状态（计数器、按钮禁用状态）
     */
    function updateUI() {
        // 更新计数器
        if (viewerCounter) {
            viewerCounter.textContent = `${currentIndex + 1} / ${images.length}`;
        }

        // 更新按钮禁用状态
        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = currentIndex === images.length - 1;
        }
    }

    /**
     * 处理键盘按键
     */
    function handleKeyPress(e) {
        if (!isOpen) return;

        switch (e.key) {
            case 'Escape':
                closeViewer();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                showPrevImage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                showNextImage();
                break;
            case '=':
            case '+':
                e.preventDefault();
                zoomIn();
                break;
            case '-':
            case '_':
                e.preventDefault();
                zoomOut();
                break;
            case '0':
                e.preventDefault();
                resetZoom();
                break;
        }
    }

    /**
     * 处理鼠标滚轮缩放
     */
    function handleWheel(e) {
        e.preventDefault();

        const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));

        if (newScale !== scale) {
            scale = newScale;
            applyTransform();
            showZoomIndicator();
        }
    }

    /**
     * 放大
     */
    function zoomIn() {
        const newScale = Math.min(MAX_SCALE, scale + SCALE_STEP);
        if (newScale !== scale) {
            scale = newScale;
            applyTransform();
            showZoomIndicator();
        }
    }

    /**
     * 缩小
     */
    function zoomOut() {
        const newScale = Math.max(MIN_SCALE, scale - SCALE_STEP);
        if (newScale !== scale) {
            scale = newScale;
            applyTransform();
            showZoomIndicator();
        }
    }

    /**
     * 重置缩放和平移
     */
    function resetZoom() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        lastTranslateX = 0;
        lastTranslateY = 0;
        applyTransform();
    }

    /**
     * 应用变换（缩放和平移）
     */
    function applyTransform() {
        if (viewerImage) {
            viewerImage.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
            viewerImage.style.cursor = scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default';
        }
    }

    /**
     * 显示缩放指示器
     */
    function showZoomIndicator() {
        if (!zoomIndicator) return;

        zoomIndicator.textContent = Math.round(scale * 100) + '%';
        zoomIndicator.style.opacity = '1';

        // 2秒后自动隐藏
        clearTimeout(zoomIndicator.hideTimer);
        zoomIndicator.hideTimer = setTimeout(() => {
            zoomIndicator.style.opacity = '0';
        }, 2000);
    }

    /**
     * 开始拖拽
     */
    function handleDragStart(e) {
        if (scale <= 1) return;

        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        lastTranslateX = translateX;
        lastTranslateY = translateY;

        viewerImage.style.cursor = 'grabbing';
        e.preventDefault();
    }

    /**
     * 拖拽移动
     */
    function handleDragMove(e) {
        if (!isDragging) return;

        const deltaX = (e.clientX - dragStartX) / scale;
        const deltaY = (e.clientY - dragStartY) / scale;

        translateX = lastTranslateX + deltaX;
        translateY = lastTranslateY + deltaY;

        applyTransform();
    }

    /**
     * 结束拖拽
     */
    function handleDragEnd() {
        if (!isDragging) return;

        isDragging = false;
        viewerImage.style.cursor = scale > 1 ? 'grab' : 'default';
    }

    // 公开 API
    return {
        init,
        openViewer,
        closeViewer
    };
})();

// 当 DOM 加载完成后初始化（需要等待产品详情页渲染完成）
// 这个初始化会在 product-detail.js 渲染完成后被调用
