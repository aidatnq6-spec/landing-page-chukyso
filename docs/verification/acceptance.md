# Kết quả kiểm chứng VI-TECH

Ngày kiểm tra: 21/10/2026, múi giờ Việt Nam.

## Phạm vi đã hoàn thành

Landing page theo hướng A, logo gốc từ workspace, thông tin công ty/hotline, sáu nghiệp vụ, bảng giá ICA và điều kiện ưu đãi. Form bốn trường bắt buộc, kèm gói quan tâm; API lưu Firestore, chống retry trùng và giới hạn tần suất. Trang quản trị dùng một UID được cấp quyền, xem/lọc/tìm/phân trang, cập nhật năm trạng thái và ghi chú. Có hướng dẫn Firebase và deployment.

Luồng kiểm chứng: trình duyệt gửi form → API → Firestore Emulator có một lead → đăng nhập quản trị → thấy lead → lưu trạng thái/ghi chú → reload vẫn giữ → đăng xuất không còn hiển thị dữ liệu.

## Kết quả

| Kiểm tra                          | Kết quả                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| `npm.cmd run lint`                | PASS                                                               |
| `npm.cmd run typecheck`           | PASS                                                               |
| `npm.cmd run build`               | PASS — Next.js 16.4.2                                              |
| `npm.cmd run verify:emulators`    | PASS — 29 unit/integration tests, 4 browser tests                  |
| `npm.cmd audit --omit=dev --json` | Không có cảnh báo dependency production sau override gRPC 1.14.6   |
| Giao diện 1440px / 768px / 375px  | Không cuộn ngang, không có page errors                             |
| Ảnh chụp desktop và mobile        | Đã xem trực tiếp, logo gốc đúng, sửa ngắt dòng VI-TECH trên mobile |

Môi trường: Windows, Node.js 25.9.0, npm 11.12.1, Java portable Temurin 21, Auth/Firestore emulator chỉ project `demo-vitech`, Chromium headless. Khuyến nghị Node.js 24 LTS cho chạy lâu dài vì một dependency Firebase CLI khai báo hỗ trợ 20/22/24.

Kiểm tra có ý nghĩa đã chạy: validation và chuẩn hóa tiếng Việt, body size/content type, bảo vệ UID, cấm emulator ở production, tạo đồng thời cùng mã chỉ sinh một lead, retry không reset trạng thái, từ chối mã trùng khác payload, hạn mức 5 lượt, cursor bị sửa, phân trang timestamp trùng, tìm kiếm/lọc ba trường, ngăn cập nhật PII, rules chặn truy cập client kể cả tài khoản đăng nhập, tài khoản Auth khác bị 403, chọn đúng gói, giữ dữ liệu khi lỗi và hoàn tất luồng quản trị.

Test UI phản hồi lỗi dùng API stub được tách riêng. Test luồng hoàn chỉnh dùng Auth/Firestore emulator thật, không stub API sản phẩm. Truy cập REST emulator để kiểm tra dữ liệu sử dụng token `owner` chỉ trong test; token này không được dùng trong ứng dụng.

Ảnh chụp tham khảo: [desktop](desktop.png), [mobile](mobile.png). Có thể tạo lại bằng `node scripts/capture-preview.mjs` khi production server local đang chạy trên cổng 3000; file đầu ra nằm trong `.tools/qa/`.

## Giới hạn còn lại trước vận hành thật

- Chưa tạo/kết nối project Firebase thật; chưa xác minh indexes, quyền IAM, hạn mức hoặc UID trên production.
- Chưa chọn hosting/tên miền, chưa xuất bản website. Cần cấu hình HTTPS, đúng origin và IP header đáng tin để không gom mọi khách vào bucket giới hạn `unknown`.
- Đường dẫn Zalo được tạo theo số công ty đã cung cấp; chưa xác minh tài khoản Zalo đích bằng đăng nhập thực tế.
- Chưa kiểm tra trên thiết bị iOS/Android vật lý hoặc với trình đọc màn hình. Kiểm tra responsive dùng Chromium viewport.
- `npm audit` toàn bộ còn 11 cảnh báo trong chuỗi công cụ phát triển (4 moderate, 7 high), liên quan Firebase CLI/lint dependencies; không tự hạ phiên bản lớn theo `audit fix --force`. Dependencies production không có cảnh báo ở lần kiểm tra này.

Xem [hướng dẫn Firebase](../setup/firebase.md) và [hướng dẫn triển khai](../setup/deployment.md) để hoàn tất môi trường thật.
