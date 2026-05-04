# Anita XU Portfolio

这是许尔文 Anita XU 的个人介绍网页，已整理为可直接部署到 GitHub Pages 的静态网站仓库结构。

## 文件结构

```text
.
├── index.html
├── portfolio-assets/
│   ├── hero.png
│   ├── project-ecommerce.png
│   ├── project-voiceprint.png
│   ├── project-hpo.png
│   ├── project-emd.png
│   └── project-xiangyu.png
├── .nojekyll
└── README.md
```

## 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库，例如 `anita-xu-portfolio`。
2. 上传本文件夹内的所有文件和文件夹，确保 `index.html` 位于仓库根目录。
3. 进入仓库的 `Settings` → `Pages`。
4. 在 `Build and deployment` 中选择 `Deploy from a branch`。
5. Branch 选择 `main`，Folder 选择 `/root`，点击 `Save`。
6. 等待 1-3 分钟，GitHub 会生成访问链接。

## 说明

- `index.html` 是 GitHub Pages 默认首页，由原来的 `个人介绍网页.html` 复制并改名而来。
- 页面使用 Tailwind CDN、Vue CDN 和 Google Fonts，部署后需要联网加载这些外部资源。
- 页面中的“下载简历”按钮当前调用浏览器打印功能，不依赖单独的 PDF 文件。
