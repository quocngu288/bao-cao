# 📊 Báo Cáo Doanh Thu Homestay

Dự án báo cáo doanh thu homestay với giao diện đẹp, responsive và tính năng tương tác.

## 🚀 Deploy Methods

### 1. GitHub Pages (Khuyến nghị - Miễn phí)

1. **Tạo repository trên GitHub:**
   - Vào [github.com](https://github.com) → New repository
   - Đặt tên: `bao-cao-homestay` (hoặc tên khác)
   - Chọn Public
   - Không tích "Add README"

2. **Push code lên GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/bao-cao-homestay.git
   git branch -M main
   git push -u origin main
   ```

3. **Kích hoạt GitHub Pages:**
   - Vào repository → Settings → Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
   - Save

4. **Truy cập website:**
   - URL: `https://YOUR_USERNAME.github.io/bao-cao-homestay`

### 2. Netlify (Miễn phí - Dễ dàng)

1. **Drag & Drop:**
   - Vào [netlify.com](https://netlify.com)
   - Kéo thả folder dự án vào "Deploy manually"
   - Nhận URL ngay lập tức

2. **Git Integration:**
   - Connect GitHub repository
   - Auto-deploy khi có thay đổi

### 3. Vercel (Miễn phí - Nhanh)

1. **Từ GitHub:**
   - Vào [vercel.com](https://vercel.com)
   - Import project từ GitHub
   - Auto-deploy

2. **CLI:**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

### 4. Firebase Hosting (Miễn phí)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 📁 Cấu trúc dự án

```
bao-cao/
├── index.html          # Trang chính
├── style.css          # CSS styling
├── script.js          # JavaScript logic
├── img/               # Hình ảnh hóa đơn
│   ├── Quy-nhon/
│   ├── Quang-ngai/
│   └── Kontum/
└── README.md          # Hướng dẫn
```

## ✨ Tính năng

- 📊 **Biểu đồ tương tác** với Chart.js
- 📱 **Responsive design** cho mobile
- 🖼️ **Popup hình ảnh** hóa đơn
- 🎨 **Giao diện đẹp** với gradient
- ⚡ **Animation mượt mà**
- 📈 **Thống kê tổng quan**

## 🛠️ Cài đặt local

1. Clone repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/bao-cao-homestay.git
   cd bao-cao-homestay
   ```

2. Mở file `index.html` trong browser

## 📝 Cập nhật dữ liệu

Để cập nhật dữ liệu doanh thu:
1. Sửa file `script.js` → `revenueData`
2. Thay đổi hình ảnh trong folder `img/`
3. Commit và push lên GitHub

## 🌐 Demo

Sau khi deploy, website sẽ có:
- URL công khai
- HTTPS tự động
- CDN toàn cầu
- Auto-update khi push code

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy tạo issue trên GitHub repository.
