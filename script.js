// 简单交互示例
document.addEventListener("DOMContentLoaded", () => {
    console.log("博客加载完成 ✅");

    // 点击阅读全文提示
    document.querySelectorAll(".read-more").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            alert("这里是文章详情页（可扩展为单独 HTML 页面）");
        });
    });
});