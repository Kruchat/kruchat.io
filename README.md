# ระบบเก็บไฟล์เอกสารคุณครู (Teacher Document Management System)

ระบบจัดการเอกสารสำหรับครูผู้สอน พร้อมฟีเจอร์ครบครันสำหรับการจัดเก็บ จัดระเบียบ และแชร์เอกสาร

## ✨ ฟีเจอร์หลัก

### 📁 การจัดการเอกสาร
- **อัปโหลดไฟล์หลากหลายรูปแบบ**: PDF, Word, Excel, PowerPoint, รูปภาพ, วิดีโอ, เสียง, ไฟล์บีบอัด
- **จัดหมวดหมู่ตามวิชา**: คณิตศาสตร์, ภาษาไทย, ภาษาอังกฤษ, วิทยาศาสตร์, สังคมศึกษา และอื่นๆ
- **ระบบโฟลเดอร์**: สร้างโฟลเดอร์ย่อยเพื่อจัดระเบียบเอกสารอย่างเป็นระบบ
- **ค้นหาเอกสาร**: ค้นหาด้วยคำสำคัญ, วันที่อัปโหลด, ประเภทไฟล์
- **แสดงตัวอย่างไฟล์**: ดูตัวอย่างไฟล์โดยไม่ต้องดาวน์โหลด

### 🔐 ระบบสิทธิ์การเข้าถึง
- **ระดับการเข้าถึง**: ส่วนตัว, แผนก, สาธารณะ
- **ระบบล็อกอิน**: รองรับการสมัครสมาชิกและเข้าสู่ระบบ
- **จัดการผู้ใช้**: สำหรับผู้ดูแลระบบ

### 📊 ฟีเจอร์เสริม
- **ระบบเวอร์ชันไฟล์**: เก็บประวัติการแก้ไขเอกสาร
- **ดาวน์โหลดแบบรวม**: ดาวน์โหลดหลายไฟล์พร้อมกัน (ZIP)
- **สถิติการใช้งาน**: จำนวนการดู, ดาวน์โหลด, หมวดหมู่ยอดนิยม
- **การแจ้งเตือน**: แจ้งเตือนเมื่อมีเอกสารใหม่
- **Responsive Design**: รองรับการใช้งานบนมือถือและแท็บเล็ต

## 🛠️ เทคโนโลยีที่ใช้

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** สำหรับ Authentication
- **Multer** สำหรับ File Upload
- **Sharp** สำหรับ Image Processing
- **Archiver** สำหรับ ZIP files

### Frontend
- **React 18** + **TypeScript**
- **Vite** สำหรับ Build Tool
- **Tailwind CSS** สำหรับ Styling
- **React Router** สำหรับ Navigation
- **Zustand** สำหรับ State Management
- **React Dropzone** สำหรับ File Upload
- **Lucide React** สำหรับ Icons

## 🚀 การติดตั้งและรัน

### ข้อกำหนดระบบ
- Node.js 16+ 
- MongoDB 4.4+
- npm หรือ yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd teacher-document-system
```

### 2. ติดตั้ง Dependencies
```bash
# ติดตั้ง dependencies ทั้งหมด
npm run install-all

# หรือติดตั้งแยก
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. ตั้งค่า Environment Variables
```bash
# คัดลอกไฟล์ตัวอย่าง
cp backend/.env.example backend/.env

# แก้ไขไฟล์ .env
nano backend/.env
```

ตั้งค่าในไฟล์ `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/teacher-documents
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=100MB
NODE_ENV=development
```

### 4. รัน MongoDB
```bash
# เริ่ม MongoDB service
sudo systemctl start mongod

# หรือใช้ Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. รันแอปพลิเคชัน
```bash
# รันทั้ง Backend และ Frontend พร้อมกัน
npm run dev

# หรือรันแยก
npm run server  # Backend only
npm run client  # Frontend only
```

### 6. เข้าถึงแอปพลิเคชัน
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 👤 ข้อมูลทดสอบ

### ครู
- **อีเมล**: teacher@example.com
- **รหัสผ่าน**: password123

### ผู้ดูแลระบบ
- **อีเมล**: admin@example.com
- **รหัสผ่าน**: admin123

## 📁 โครงสร้างโปรเจค

```
teacher-document-system/
├── backend/                 # Backend API
│   ├── config/             # Database configuration
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── uploads/           # File upload directory
│   └── server.js          # Main server file
├── frontend/              # React Frontend
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── store/        # State management
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🔧 การพัฒนา

### Scripts ที่มี
```bash
npm run dev          # รันทั้ง Backend และ Frontend
npm run server       # รัน Backend เท่านั้น
npm run client       # รัน Frontend เท่านั้น
npm run build        # Build Frontend สำหรับ Production
npm run install-all  # ติดตั้ง dependencies ทั้งหมด
```

### การ Build สำหรับ Production
```bash
# Build Frontend
cd frontend
npm run build

# รัน Backend ใน Production
cd backend
NODE_ENV=production npm start
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - สมัครสมาชิก
- `POST /api/auth/login` - เข้าสู่ระบบ
- `GET /api/auth/me` - ข้อมูลผู้ใช้ปัจจุบัน
- `PUT /api/auth/profile` - อัปเดตโปรไฟล์
- `PUT /api/auth/change-password` - เปลี่ยนรหัสผ่าน

### Documents
- `GET /api/documents` - รายการเอกสาร
- `POST /api/documents/upload` - อัปโหลดเอกสาร
- `GET /api/documents/:id` - ข้อมูลเอกสาร
- `GET /api/documents/:id/download` - ดาวน์โหลดเอกสาร
- `PUT /api/documents/:id` - อัปเดตเอกสาร
- `DELETE /api/documents/:id` - ลบเอกสาร
- `POST /api/documents/bulk-download` - ดาวน์โหลดหลายไฟล์

### Folders
- `GET /api/folders` - รายการโฟลเดอร์
- `POST /api/folders` - สร้างโฟลเดอร์
- `GET /api/folders/:id` - ข้อมูลโฟลเดอร์
- `PUT /api/folders/:id` - อัปเดตโฟลเดอร์
- `DELETE /api/folders/:id` - ลบโฟลเดอร์
- `GET /api/folders/tree/structure` - โครงสร้างโฟลเดอร์

## 🎨 UI/UX Design

### สีหลัก
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray (#64748B)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font**: Inter
- **Sizes**: 12px, 14px, 16px, 18px, 20px, 24px, 32px

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Rounded, hover effects
- **Forms**: Clean inputs with icons
- **Navigation**: Sidebar with icons

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt
- **File Type Validation**: Whitelist allowed file types
- **File Size Limits**: 100MB per file
- **Rate Limiting**: API request limits
- **CORS Protection**: Configured for specific origins
- **Helmet**: Security headers

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: 
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **Touch Friendly**: Large touch targets
- **Adaptive Layout**: Grid and list views

## 🚀 Deployment

### Docker (แนะนำ)
```bash
# Build images
docker-compose build

# Run containers
docker-compose up -d
```

### Manual Deployment
1. Build frontend: `npm run build`
2. Set production environment variables
3. Start backend with PM2: `pm2 start server.js`
4. Serve frontend with Nginx

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

หากมีปัญหาหรือข้อสงสัย กรุณาสร้าง Issue ใน GitHub repository หรือติดต่อทีมพัฒนา

---

**พัฒนาโดย**: ทีมพัฒนา Teacher Document System  
**เวอร์ชัน**: 1.0.0  
**อัปเดตล่าสุด**: 2024