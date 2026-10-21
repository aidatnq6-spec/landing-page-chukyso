# Tạo Firebase mới cho VI-TECH

Thực hiện dưới tài khoản Google sở hữu dự án của công ty. Không gửi mật khẩu quản trị hoặc service-account private key vào chat hoặc commit vào Git.

## 1. Tạo project và Firestore

1. Mở [Firebase Console](https://console.firebase.google.com/), tạo một project và ghi lại project ID thật.
2. Tạo Cloud Firestore ở chế độ production, chọn vị trí phù hợp người dùng Việt Nam và hạ tầng dự kiến. Vị trí database cần cân nhắc trước khi tạo.
3. Trong Project settings, đăng ký một Web app. Sao chép web config vào `.env.local` bằng editor trên máy của bạn:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=<web-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<web-app-id>
FIREBASE_PROJECT_ID=<project-id>
SITE_ORIGIN=http://127.0.0.1:3000
USE_FIREBASE_EMULATORS=false
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
```

Web config không phải khóa server; quyền dữ liệu vẫn được bảo vệ bằng API và Firestore rules. Không đặt service-account credentials trong biến `NEXT_PUBLIC_*`.

## 2. Bật đăng nhập và tạo tài khoản chung

1. Trong Authentication → Sign-in method, bật Email/Password.
2. Trong Users, tạo một người dùng với email quản lý và mật khẩu mạnh do công ty giữ.
3. Sao chép đúng UID người dùng vào `FIREBASE_ADMIN_UID` ở máy chủ. Không dùng email để thay UID.
4. Không có trang đăng ký tài khoản công khai. Một tài khoản Auth khác dù đăng nhập thành công vẫn không có quyền xem khách.
5. Thêm domain thật trong Authentication → Settings → Authorized domains. Kiểm tra cả tên miền phát triển nếu cần.

Tài khoản web này khác tài khoản Google/IAM truy cập Firebase Console. Chỉ cấp quyền Console cho người thực sự cần xem dữ liệu. Với tài khoản quản lý chung, không xác định được nhân viên cụ thể đã cập nhật ghi chú.

## 3. Cấu hình máy chủ

Trong môi trường hỗ trợ danh tính workload, ưu tiên quản lý credentials bằng hạ tầng phù hợp. Bản ứng dụng này nhận service-account certificate từ ba biến env; nếu dùng managed identity cần điều chỉnh adapter `src/lib/firebase/admin.ts` tương ứng trước khi chuyển đổi.

Tạo service account dành cho ứng dụng, cấp quyền tối thiểu để đọc/ghi Firestore và đọc người dùng Firebase Authentication (để kiểm tra ID token bị thu hồi); không dùng quyền Owner cho runtime. Lưu các trường sau trong env/secret manager của máy chủ:

```dotenv
FIREBASE_PROJECT_ID=<project-id>
FIREBASE_CLIENT_EMAIL=<service-account-email>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_UID=<uid-tai-khoan-quan-ly>
REGISTRATION_HMAC_SECRET=<chuoi-ngau-nhien-it-nhat-32-ky-tu>
```

Ứng dụng chuyển chuỗi `\n` trong private key thành xuống dòng PEM. Dùng trình quản lý bí mật của hosting khi deploy; không đưa tệp JSON service account vào `public/` hoặc kho mã. Khi xoay khóa, cập nhật secret, khởi động lại ứng dụng và vô hiệu hóa khóa cũ.

`REGISTRATION_HMAC_SECRET` ký cursor, hash payload và nguồn giới hạn tần suất. Giữ ổn định secret để retry của yêu cầu cũ vẫn hoạt động; xoay secret sẽ làm cursor cũ hết hiệu lực và retry cũ có thể nhận 409, khi đó khách gửi lại lượt mới.

## 4. Rules, indexes và TTL

Đăng nhập Firebase CLI bằng tài khoản có quyền và kiểm tra đúng project trước lệnh deploy:

```powershell
npx.cmd firebase login
npx.cmd firebase projects:list
npx.cmd firebase deploy --only firestore:rules,firestore:indexes --project <PROJECT_ID_THAT>
```

Rules trong repo chặn toàn bộ truy cập Firestore từ client, kể cả tài khoản đăng nhập. Các API máy chủ dùng Admin SDK và tự kiểm tra quyền. Không mở rules để sửa lỗi đăng nhập.

Chờ indexes build xong trước kiểm tra tìm kiếm và lọc. `firestore.indexes.json` khai báo composite indexes và TTL cho `rateLimits.expiresAt`; nếu CLI yêu cầu thiết lập TTL riêng, bật TTL tại Firestore → Time-to-live cho collection group `rateLimits`, trường `expiresAt`. TTL không xóa ngay lập tức; logic hạn mức dùng cửa sổ thời gian, không phụ thuộc thời điểm xóa.

Không TTL `registrationRequests` riêng khỏi `registrations`: metadata giữ khóa chống gửi trùng. Dữ liệu khách không tự động xóa trong phiên bản đầu; công ty cần quản lý vòng đời dữ liệu theo quy trình của mình.

## 5. Xác minh với Firebase thật

1. Tắt emulator flags và xóa emulator host env khỏi runtime.
2. Đăng ký một yêu cầu thử có đánh dấu rõ, dùng thông tin thử của công ty.
3. Kiểm tra collection `registrations` có đúng một bản ghi và `status=new`.
4. Đăng nhập `/admin`, mở chi tiết, lưu trạng thái/ghi chú và tải lại để kiểm tra.
5. Kiểm tra tài khoản khác không được xem dữ liệu; kiểm tra bộ lọc và tìm kiếm với indexes production.
6. Đánh dấu yêu cầu thử trong ghi chú; chỉ người có quyền Console xử lý dữ liệu thử khi cần.

Không xem kết quả emulator là bằng chứng đã cấu hình project cloud thành công.
