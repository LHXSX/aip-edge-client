// 性能优化模块 - 提升响应速度和流畅度

// ========== 1. 防抖函数 ==========
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========== 2. 节流函数 ==========
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========== 3. 即时响应优化 ==========
// 为按钮添加即时视觉反馈
document.addEventListener('DOMContentLoaded', () => {
    // 所有按钮添加即时反馈
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
            this.style.opacity = '0.9';
        });
        
        btn.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
            this.style.opacity = '1';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.opacity = '1';
        });
    });
    
    // 输入框即时反馈
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', function() {
            this.style.transform = 'scale(1.01)';
            this.style.transition = 'all 0.15s ease';
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    });
});

// ========== 4. 虚拟滚动优化 ==========
class VirtualScroller {
    constructor(container, items, renderItem, itemHeight = 60) {
        this.container = container;
        this.items = items;
        this.renderItem = renderItem;
        this.itemHeight = itemHeight;
        this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
        this.startIndex = 0;
    }
    
    render() {
        const visibleItems = this.items.slice(
            this.startIndex,
            this.startIndex + this.visibleCount
        );
        
        this.container.innerHTML = visibleItems.map(this.renderItem).join('');
        
        // 设置容器高度
        this.container.style.height = `${this.items.length * this.itemHeight}px`;
    }
    
    onScroll() {
        this.startIndex = Math.floor(this.container.scrollTop / this.itemHeight);
        this.render();
    }
}

// ========== 5. 动画优化 ==========
// 使用 CSS Transform 而不是改变 position
function optimizeAnimation(element) {
    element.style.willChange = 'transform, opacity';
    element.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease';
}

// ========== 6. 批量DOM更新 ==========
class DOMBatchUpdater {
    constructor() {
        this.updates = [];
        this.scheduled = false;
    }
    
    add(update) {
        this.updates.push(update);
        if (!this.scheduled) {
            this.scheduled = true;
            requestAnimationFrame(() => this.flush());
        }
    }
    
    flush() {
        this.updates.forEach(update => update());
        this.updates = [];
        this.scheduled = false;
    }
}

const domUpdater = new DOMBatchUpdater();

// 导出优化工具
window.PerformanceOptimizer = {
    debounce,
    throttle,
    optimizeAnimation,
    VirtualScroller,
    domUpdater
};

