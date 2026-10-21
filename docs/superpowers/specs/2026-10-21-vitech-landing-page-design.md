# Thiết kế landing page và trang quản trị VI-TECH

Ngày: 21/10/2026. Trạng thái: người dùng đã duyệt toàn bộ thiết kế và yêu cầu lập kế hoạch triển khai trong cuộc trò chuyện.

## Mục đích và phạm vi đã thống nhất

Website tiếng Việt hướng đến kế toán và chủ doanh nghiệp tại Việt Nam. Mục tiêu chính là khách gửi thông tin đăng ký mua chữ ký số; nhân viên liên hệ tư vấn và hoàn tất đơn hàng ngoài website. Bao gồm landing page, form đăng ký, trang quản trị có đăng nhập và hướng dẫn tạo Firebase mới khi triển khai.

Không có thanh toán trực tuyến, tự cấp chứng thư số, tích hợp hệ thống nghiệp vụ thuế hoặc tự động gửi tin nhắn. Không xây hệ thống phân công nhân viên hoặc nhiều vai trò. Không cần trang quản trị khác cho Firebase Console.

## Thông tin và nội dung do người dùng cung cấp

- CÔNG TY TNHH DỊCH VỤ GIẢI PHÁP VI-TECH.
- Mã số thuế: 0402346583.
- Địa chỉ: 24 Thành Vinh 1, Phường Sơn Trà, Thành Phố Đà Nẵng, Việt Nam.
- Hotline/Zalo: 0968.273.868.
- Logo: ảnh VI-TECH do người dùng đính kèm trong cuộc trò chuyện. Cần đưa đúng tệp ảnh vào dự án khi triển khai; không tự vẽ lại hoặc tự nhận là đã có tệp gốc.
- Các thương hiệu cung cấp: Viettel, VNPT, ICA, WINCA, FPT.
- Nhu cầu: ký tờ khai thuế điện tử, BHXH điện tử, hóa đơn điện tử, dịch vụ công kho bạc nhà nước, đấu thầu qua mạng và hải quan điện tử.
- Cam kết: hỗ trợ và đồng hành trong suốt thời gian sử dụng.

### Giá ICA

| Gói | Giá VNĐ | Thời gian và ưu đãi |
| --- | ---: | --- |
| 1 năm | 1.792.800 | 12 tháng, không tặng thêm |
| 2 năm | 2.690.000 | 24 tháng, không tặng thêm |
| 3 năm | 3.080.000 | 36 tháng, tặng thêm 6 tháng |

Toàn bộ bảng giá trên áp dụng cho ICA, cả mua mới và gia hạn, đã bao gồm VAT cùng USB Token. Không áp dụng giá hoặc ưu đãi ICA cho các thương hiệu khác. Không thêm thời hạn ưu đãi, đồng hồ đếm ngược, lời chứng thực, chứng nhận đại lý, số lượng khách hàng hoặc cam kết tốc độ xử lý chưa được cung cấp.

## Bố cục và hình thức

Người dùng chọn hướng A trong bản phác thảo: giới thiệu dịch vụ trước, trình bày nhu cầu sử dụng, so sánh ba gói rồi dẫn về form. Bản phác thảo tham chiếu tại `.superpowers/brainstorm/553-1792546528/content/layout-options.html`; đây là tài liệu khám phá, không phải mã sản phẩm.

Màu xanh dương, trắng và xám theo logo là đề xuất thiết kế của người thực hiện. Giao diện sáng, chữ dễ đọc, khoảng cách thoáng; hỗ trợ điện thoại và máy tính. Không dùng ảnh giả của công ty hoặc logo thương hiệu tự chế.

Thứ tự đề xuất chi tiết:

1. Header: logo, liên kết nhu cầu sử dụng, bảng giá, đăng ký và hotline.
2. Đầu trang: thông điệp chữ ký số cho doanh nghiệp, cam kết đồng hành và nút “Đăng ký mua chữ ký số”, nút phụ xem bảng giá.
3. Sáu nhóm nhu cầu sử dụng đã cung cấp.
4. Ba thẻ giá ICA, làm nổi bật gói 3 năm kèm 6 tháng. Mỗi nút chọn gói đưa đến form và chọn sẵn đúng gói.
5. Nội dung hỗ trợ trong suốt thời gian sử dụng và quy trình gửi đăng ký → nhân viên liên hệ → hoàn tất đơn hàng. Không công bố SLA chưa xác nhận.
6. Form đăng ký.
7. Viettel, VNPT, WINCA và FPT: giới thiệu dạng chữ và mời liên hệ tư vấn giá.
8. Footer với tên pháp nhân, MST, địa chỉ, điện thoại và liên hệ Zalo.

Liên hệ điện thoại dùng `tel:0968273868`; liên hệ Zalo mở đường dẫn theo số điện thoại được cung cấp, cần kiểm tra hoạt động thực tế khi triển khai. Có nút liên hệ dễ tìm trên mobile, không che form hoặc nội dung.

## Form đăng ký

Thông tin người dùng yêu cầu: họ và tên, email, số điện thoại, địa chỉ. Quyết định đề xuất của người thực hiện: cả bốn trường bắt buộc; địa chỉ là một ô văn bản, không yêu cầu API danh mục địa giới.

Thêm lựa chọn gói quan tâm để giữ ngữ cảnh tư vấn: ICA 1 năm, ICA 2 năm, ICA 3 năm + 6 tháng, hoặc “Cần tư vấn gói/nhà cung cấp khác”. Nút CTA chung không tự gán gói; nút ở thẻ giá chọn đúng gói. Không bắt khách khai mã số thuế hoặc tạo tài khoản. Mua mới hay gia hạn được nhân viên xác nhận khi liên hệ; không thêm trường bắt buộc này.

Kiểm tra tên và địa chỉ không rỗng, email hợp lệ, số điện thoại có định dạng hợp lý với số Việt Nam; giới hạn độ dài và kiểm tra lại phía máy chủ. Có thông báo mục đích thu thập ngay cạnh nút gửi: thông tin dùng để liên hệ tư vấn về yêu cầu đăng ký.

Khi gửi: có trạng thái đang gửi, chặn bấm lặp trong cùng lượt; chỉ báo thành công sau khi Firebase xác nhận lưu. Thành công hiển thị lời xác nhận nhân viên sẽ liên hệ; lỗi hiển thị thông báo dễ hiểu và giữ dữ liệu để thử lại. Không mô phỏng thành công khi Firebase chưa được cấu hình. Chống gửi lặp do retry bằng mã yêu cầu duy nhất.

## Firebase và dữ liệu

Người dùng chưa có dự án Firebase và muốn được hướng dẫn tạo mới khi triển khai. Dữ liệu lưu bằng Cloud Firestore; tài khoản quản trị dùng Firebase Authentication với email/mật khẩu. Nhân viên xem được dữ liệu trong Firebase Console và trang quản trị riêng.

Đề xuất của người thực hiện: collection `registrations` gồm tên, email, điện thoại, địa chỉ, mã gói quan tâm, trạng thái, ghi chú, thời điểm tạo và thời điểm cập nhật. Ngày giờ được lưu theo timestamp máy chủ và hiển thị theo Asia/Ho_Chi_Minh. Trạng thái khi tạo luôn là “Mới đăng ký”, ghi chú ban đầu rỗng.

Trình duyệt công khai gửi form đến API máy chủ. API xác thực đầu vào, chỉ cho phép các trường đăng ký hợp lệ và tạo dữ liệu bằng Firebase Admin SDK. Khách ẩn danh không được đọc danh sách hoặc cập nhật dữ liệu Firestore. Khóa máy chủ chỉ nằm trong biến môi trường phía máy chủ và không được commit. Firebase Console hoạt động theo quyền của dự án, độc lập với quyền đăng nhập website.

Đề xuất bảo vệ form: giới hạn tần suất theo nguồn yêu cầu bằng bộ đếm có thời hạn phía máy chủ, trường bẫy bot và giới hạn kích thước yêu cầu. Chọn cơ chế phù hợp môi trường triển khai; không dựa vào bộ đếm RAM của một tiến trình để bảo vệ môi trường nhiều phiên bản. Không thêm dịch vụ CAPTCHA trả phí nếu chưa cần.

Chưa có Firebase: có thể xem giao diện cục bộ; form báo chưa sẵn sàng và hướng dẫn cấu hình trong tài liệu phát triển. Không cho phép vận hành công khai với rules mở hoặc chế độ đăng nhập giả.

## Trang quản trị

Cập nhật theo yêu cầu ngày 21/10/2026: “Xem chi tiết” dùng Sheet theo shadcn UI/Radix, mở từ cạnh phải, toàn chiều rộng trên điện thoại. Giữ thông tin khách hàng, trạng thái và ghi chú; nội dung cuộn riêng với nút lưu ở footer, có hỗ trợ Escape và trả focus về nút mở.

Người dùng chọn một tài khoản quản lý chung. Tài khoản do chủ dự án tạo trong Firebase Authentication khi thiết lập; không cung cấp đăng ký công khai. API quản trị kiểm tra Firebase ID token và đối chiếu đúng UID được cấu hình cho tài khoản quản lý; không cấp quyền cho mọi tài khoản đã đăng nhập. Firestore rules không cho truy cập dữ liệu từ client công khai; quản trị thao tác qua API đã kiểm tra quyền.

Trang `/admin` gồm đăng nhập và đăng xuất, danh sách đăng ký mới nhất trước, thông tin chi tiết, lọc trạng thái và tìm theo tên/điện thoại/email. Đề xuất phân trang 20 lượt đăng ký, tìm kiếm dữ liệu phía máy chủ bằng khóa chuẩn hóa phù hợp Firestore, không tải toàn bộ tập dữ liệu về trình duyệt. Phạm vi tìm kiếm tối thiểu là theo tiền tố tên/email và tiền tố số điện thoại đã chuẩn hóa; ghi rõ cách tìm trên UI.

Mỗi đăng ký hiển thị bốn trường liên hệ, gói quan tâm, thời điểm đăng ký, trạng thái và ghi chú. Cho phép đổi trạng thái và sửa ghi chú, báo lưu thành công/thất bại rõ ràng. Không chỉnh sửa thông tin khách hoặc xóa đăng ký trong phiên bản đầu.

Các trạng thái được người dùng xác nhận:

- Mới đăng ký.
- Đã liên hệ.
- Đang tư vấn.
- Đã hoàn tất.
- Không có nhu cầu.

Cho phép chuyển giữa các trạng thái để sửa thao tác nhầm; không yêu cầu tuần tự. Ghi chú là văn bản thuần, giới hạn độ dài. Không cần lịch sử thay đổi đầy đủ hoặc phân công nhân viên. Tài khoản chung không cho biết ai đã thay đổi; đây là giới hạn của phạm vi đã chọn.

## Lựa chọn kỹ thuật đề xuất, chưa phải lựa chọn do người dùng chỉ định

Kho mã hiện trống. Đề xuất Next.js với TypeScript, CSS responsive và route handlers cho API; Firebase JS SDK cho đăng nhập, Firebase Admin SDK cho lưu/đọc/cập nhật dữ liệu máy chủ. Website có metadata tiếng Việt và nội dung có thể lập chỉ mục; trang quản trị không được lập chỉ mục. Giá và thông tin doanh nghiệp lưu tập trung trong mã cấu hình để tránh lệch giữa các phần.

Chưa có yêu cầu tên miền hoặc nhà cung cấp hosting. Hướng dẫn chạy cục bộ và cấu hình deploy cho môi trường hỗ trợ Next.js server; việc xuất bản công khai và gắn tên miền được thực hiện sau khi đã có tài khoản/cấu hình thực tế. Không coi giao diện chạy cục bộ là đã triển khai Firebase hoặc xuất bản thành công.

Người triển khai được chọn thư viện giao diện nhỏ gọn, font hỗ trợ tiếng Việt, chi tiết khoảng cách, cơ chế truy vấn và index Firestore, cấu trúc module và công cụ kiểm thử. Không thay đổi mục tiêu chuyển đổi hoặc thêm chức năng kinh doanh ngoài phạm vi.

## Điều kiện hoàn thành

- Landing page hiển thị đúng nội dung, giá, điều kiện ưu đãi và logo; sử dụng được trên mobile và desktop.
- CTA chọn đúng gói và đi tới form; form xử lý nhập sai, gửi thành công, lỗi và gửi lặp.
- Với Firebase đã cấu hình, lượt đăng ký lưu đúng và xuất hiện trong Console cùng trang quản trị.
- Đăng nhập đúng tài khoản quản lý mới được xem/sửa trạng thái và ghi chú; API từ chối khách ẩn danh và tài khoản khác.
- Danh sách, chi tiết, lọc, tìm kiếm và phân trang hoạt động; trạng thái và ghi chú còn sau tải lại.
- Có tài liệu tạo Firebase, bật Auth, tạo tài khoản chung, cấu hình UID/biến môi trường/rules/index, chạy cục bộ và triển khai. Không đưa bí mật vào kho mã.
- Kiểm tra build và các luồng chính; nếu chưa có tài khoản Firebase thật, kiểm tra tích hợp bằng emulator và ghi rõ phần cần xác minh khi cấu hình thật.

## Việc cần khi triển khai

Lấy tệp logo sử dụng được từ ảnh người dùng đã cung cấp; nếu không có khả năng truy cập tệp đính kèm, đề nghị gửi tệp logo vào workspace. Tạo dự án Firebase dưới tài khoản của người dùng theo hướng dẫn; lấy cấu hình bằng kênh phù hợp, không yêu cầu gửi mật khẩu quản trị vào chat. Thiết lập hosting và tên miền theo lựa chọn thực tế của người dùng.
