/**
 * 产品详情页图片画廊交互
 * 负责处理缩略图切换主图
 */

const Gallery = (function() {
    'use strict';

    let galleryMain = null;
    let thumbs = [];
    let images = [];

    /**
     * 初始化画廊
     */
    function init() {
        galleryMain = document.getElementById('gallery-main');
        if (!galleryMain) {
            return;
        }

        // 从data属性读取图片数组
        try {
            const imagesData = galleryMain.getAttribute('data-images');
            images = JSON.parse(imagesData);
        } catch (error) {
            images = [];
        }

        thumbs = Array.from(document.querySelectorAll('.gallery-thumb'));
        if (thumbs.length === 0) {
            return;
        }

        // 绑定缩略图点击事件
        thumbs.forEach((thumb) => {
            thumb.addEventListener('click', () => {
                const thumbIndex = parseInt(thumb.getAttribute('data-index')) || 0;
                switchToImage(thumbIndex);
            });
        });
    }

    /**
     * 切换到指定索引的图片
     */
    function switchToImage(imageIndex) {
        if (!galleryMain || imageIndex < 0 || imageIndex >= images.length) return;

        const imageUrl = images[imageIndex];

        // 更新主图
        galleryMain.style.backgroundImage = `url('${imageUrl}')`;
        galleryMain.setAttribute('data-current-index', imageIndex);

        // 更新所有缩略图的状态
        thumbs.forEach((thumb) => {
            const thumbIndex = parseInt(thumb.getAttribute('data-index')) || 0;
            const isActive = thumbIndex === imageIndex;

            // 更新ring样式
            if (isActive) {
                thumb.classList.add('ring-2', 'ring-primary');
            } else {
                thumb.classList.remove('ring-2', 'ring-primary');
            }

            // 更新内部div的不透明度
            const innerDiv = thumb.querySelector('div');
            if (innerDiv) {
                if (isActive) {
                    innerDiv.classList.remove('opacity-60');
                    innerDiv.classList.add('opacity-100');
                } else {
                    innerDiv.classList.remove('opacity-100');
                    innerDiv.classList.add('opacity-60');
                }
            }
        });
    }

    // 公开 API
    return {
        init
    };
})();
