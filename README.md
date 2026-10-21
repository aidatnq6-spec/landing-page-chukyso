# VI-TECH — Website chữ ký số

Landing page tiếng Việt theo hướng A đã duyệt, form đăng ký và trang quản trị tại `/admin`. Dữ liệu lưu trên Cloud Firestore; quản trị đăng nhập bằng một tài khoản Firebase Authentication được cấp quyền theo UID.

## Chạy trên máy

Khuyến nghị Node.js 24 LTS và npm. Đã build/test trên Node.js 25.9.0; một dependency của Firebase CLI khai báo chỉ hỗ trợ Node 20/22/24, nên dùng Node 24 cho môi trường vận hành và CI. Firestore Emulator cần Java 21 trở lên.

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
```

Mở `http://127.0.0.1:3000`. Đặt `SITE_ORIGIN=http://127.0.0.1:3000` nếu dùng đúng địa chỉ này; không trộn với `localhost` khi gửi form. Khi chưa cấu hình Firebase, có thể xem landing page nhưng form hiển thị chưa sẵn sàng; không báo lưu giả.

Logo gốc đã được đưa vào `public/brand/vitech-logo.png` từ tệp `logo vitech.png` do người dùng cung cấp. Khi thay logo, giữ đường dẫn này và build lại.

## Kiểm tra

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
node node_modules/@playwright/test/cli.js install chromium
npm.cmd run verify:emulators
```

`verify:emulators` chỉ dùng `demo-vitech`, khởi động Auth/Firestore emulator, tạo hai tài khoản thử, chạy unit/integration và kiểm thử trình duyệt. Dữ liệu thử được xóa giữa các test. Không chạy lệnh này với project thật. Java portable có thể đặt dưới `.tools/java21/<runtime>/bin/java.exe`; script tự tìm và chỉ thay PATH cho tiến trình test, không đổi Java hệ thống.

## Cấu hình và sử dụng

- [Tạo Firebase và tài khoản quản trị](docs/setup/firebase.md).
- [Triển khai, cấu hình proxy và vận hành](docs/setup/deployment.md).
- [Thiết kế đã duyệt](docs/superpowers/specs/2026-10-21-vitech-landing-page-design.md).
- [Kế hoạch triển khai](docs/plans/2026-10-21-vitech-landing-page.md).
- [Kết quả kiểm chứng](docs/verification/acceptance.md).

Không có thanh toán trực tuyến, tự cấp chứng thư số, phân công nhân viên, xóa đăng ký hoặc chỉnh sửa thông tin khách. Nhân viên xác nhận mua mới/gia hạn và hoàn tất đơn hàng khi liên hệ. Giá và ưu đãi tập trung tại `src/lib/business.ts`.
