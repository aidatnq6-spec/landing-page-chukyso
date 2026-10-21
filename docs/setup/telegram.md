# Thông báo đăng ký mới qua Telegram

Sau khi lưu đăng ký mới vào Firestore, máy chủ gửi thông báo đến nhóm Telegram
qua [Bot API sendMessage](https://core.telegram.org/bots/api#sendmessage).
Tin nhắn gồm họ tên, điện thoại, email, địa chỉ, gói quan tâm, thời gian Việt Nam,
mã đăng ký và liên kết `/admin`. Chỉ thêm bot vào nhóm nội bộ được phép xem thông
tin khách hàng.

## Cấu hình

1. Thêm bot vào nhóm và cho phép bot gửi tin nhắn.
2. Điền các biến sau vào `.env.local` khi chạy cục bộ:

   ```dotenv
   TELEGRAM_BOT_TOKEN=<token của bot>
   TELEGRAM_CHAT_ID=<ID nhóm, ví dụ -1001234567890>
   ```

3. Trên Vercel → dự án `landing-page-chukyso` → Environment Variables, thêm
   `TELEGRAM_BOT_TOKEN` dạng Sensitive và `TELEGRAM_CHAT_ID` cho Production.
   Dùng nhóm thử nghiệm riêng nếu bật ở Preview/Development.
4. `SITE_ORIGIN` phải là địa chỉ website chính thức để liên kết quản trị chính xác.
5. Khởi động lại dev server, hoặc triển khai lại Vercel sau khi đổi biến môi trường.

Không dùng tiền tố `NEXT_PUBLIC_` cho token và không commit token vào Git.
Nếu chưa có group ID, để trống `TELEGRAM_CHAT_ID`: đăng ký vẫn hoạt động và chưa
gửi thông báo. Việc sửa file `.env.vercel.production.local` không tự cập nhật
cấu hình trên Vercel.

## Cách gửi và giới hạn

- Chỉ gửi sau lần tạo đăng ký thành công đầu tiên. Gửi lại cùng `requestId`
  không gửi thêm tin; cập nhật trạng thái khách hàng không gửi tin.
- Dùng `after` của Next.js để không chặn phản hồi thành công cho khách hàng.
- Mỗi lần gửi giới hạn 5 giây. Telegram lỗi không làm mất hoặc hủy đăng ký.
- Đây là thông báo best effort: chưa có hàng đợi bền vững hay gửi lại tự động.
  Firebase và trang quản trị vẫn là nguồn dữ liệu chính khi Telegram gián đoạn.
- Log chỉ có mã đăng ký và trạng thái HTTP nếu có; không ghi token, nội dung tin
  hay phản hồi chi tiết từ Telegram.

Kiểm thử tự động dùng HTTP giả lập, không gửi đến nhóm thật. Khi đã có group ID,
có thể kiểm tra bằng một đăng ký thử được chủ website cho phép.
