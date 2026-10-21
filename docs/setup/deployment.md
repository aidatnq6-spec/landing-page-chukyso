# Triển khai và vận hành

## Lỗi Firebase Auth khi khởi động trên Vercel

Nếu log có `ERR_REQUIRE_ESM` từ `jwks-rsa/src/utils.js` khi nạp `firebase-admin/auth`, nguyên nhân là `jwks-rsa` gọi `require('jose')` nhưng `jose` v6 chỉ cung cấp ESM. Bản vá dự án giới hạn `jose@5.10.0` riêng dưới `jwks-rsa` bằng npm overrides; các thư viện khác vẫn dùng phiên bản jose của chúng. Cần commit cả `package.json` và `package-lock.json`, sau đó triển khai lại từ commit mới; redeploy commit cũ không nhận bản vá.

Test `tests/unit/firebase-module-loading.test.ts` tắt hỗ trợ `require(ESM)` để tái hiện môi trường lỗi và kiểm tra Firebase Auth nạp được cùng khả năng chuyển JWKS thành public key PEM. Không gỡ override trước khi đã có bản upstream tương thích và test này vẫn qua.

## Môi trường

Ứng dụng dùng Next.js Node.js server và Firebase Admin SDK. Không triển khai dưới dạng static export. Chưa chọn nhà cung cấp hosting hoặc tên miền. Chọn dịch vụ hỗ trợ Next.js server/API, HTTPS và secret env; kiểm tra plan, hạn mức, chi phí Firebase và hosting tại lúc triển khai.

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd run start
```

Script `start` mặc định bind `127.0.0.1` cho máy cá nhân/reverse proxy cùng máy. Container/hosting cần bind mạng có thể chạy `node node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port 3000` theo yêu cầu nền tảng; đặt sau HTTPS reverse proxy.

Đặt `SITE_ORIGIN` là origin HTTPS chính xác, ví dụ `https://<ten-mien-cong-ty>`, không có đường dẫn. Các domain phụ redirect về origin này trước khi gửi form. Public Firebase env được nhúng lúc build, vì vậy đổi web config phải build lại. Server secrets chỉ tồn tại ở server runtime. Không đưa emulator flags/hosts vào bản production.

## Giới hạn tần suất và proxy

Form sử dụng Firestore transaction giới hạn 5 lần tạo mới trong 10 phút trên mỗi nguồn IP và mỗi số điện thoại. Retry cùng requestId/payload không tạo mới và không tăng counter. Honeypot, giới hạn body 8 KiB và validation cũng áp dụng tại server.

`TRUSTED_CLIENT_IP_HEADER` chỉ cấu hình khi nhà cung cấp proxy bảo đảm xóa giá trị khách tự gửi và ghi đè bằng một IP thật duy nhất. Ví dụ triển khai Nginx cùng máy có thể tự đặt một header nội bộ bằng địa chỉ socket khách; cần cấu hình đúng chuỗi proxy nếu phía trước còn CDN. Không đặt tùy tiện `x-forwarded-for` hoặc tin phần tử đầu do khách kiểm soát.

Nếu chưa cấu hình hoặc header không hợp lệ, mọi yêu cầu vào bucket `unknown`: an toàn theo hướng giới hạn chặt nhưng có thể chặn khách hợp lệ sau 5 yêu cầu/10 phút. Vì vậy phải xác minh IP header trước khi mở cho khách thật. Hạn mức ứng dụng không thay thế bảo vệ lưu lượng lớn tại reverse proxy; chưa thêm dịch vụ CAPTCHA trả phí.

## Sử dụng trang quản trị

- Mở `/admin`, đăng nhập tài khoản chung đã tạo trong Firebase Auth.
- Danh sách thường hiển thị mới nhất trước, tối đa 20 đăng ký/trang; dùng Trước/Tiếp để xem thêm.
- Chọn trường tìm: tên, điện thoại hoặc email. Tìm theo phần đầu; tên không phân biệt dấu/chữ hoa, số `+84` được chuẩn hóa về `0`. Khi có từ khóa, kết quả sắp theo khóa tìm kiếm rồi thời điểm; bộ lọc trạng thái kết hợp được.
- Xem chi tiết để gọi điện/email, đổi trạng thái và lưu ghi chú. Năm trạng thái có thể chuyển qua lại khi sửa nhầm. Không có xóa hoặc sửa thông tin liên hệ khách.
- Đăng xuất sau ca làm. Persistence theo phiên trình duyệt; thay đổi mật khẩu/reset thực hiện qua Firebase Console. Chia sẻ tài khoản không ghi nhận được ai đã thực hiện từng thay đổi.

## Trước khi mở thật

- Có tệp logo gốc, xác nhận hotline/Zalo và nội dung giá/ưu đãi.
- Rules đóng, indexes sẵn sàng, đúng UID quản lý; account khác bị 403.
- Khóa server nằm trong secret env, không có token/PII trong log.
- Firebase Auth authorized domain đúng, HTTPS hoạt động, cấu hình IP proxy đã kiểm tra.
- Gửi thử với Firebase thật và xác minh đầy đủ Console → trang quản trị → lưu trạng thái.

Tài liệu phiên bản và nền tảng tham khảo: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Firestore Emulator](https://firebase.google.com/docs/emulator-suite/connect_firestore), [Firebase Admin setup](https://firebase.google.com/docs/admin/setup). Quy trình đã chuẩn bị cho project này; giao diện Console có thể thay đổi.
