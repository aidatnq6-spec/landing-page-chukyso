# VI-TECH Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Xây landing page VI-TECH theo hướng A, lưu đăng ký vào Firebase và cung cấp trang quản trị bằng một tài khoản chung.

**Architecture:** Next.js App Router phục vụ nội dung landing page và các API Node.js. Firebase Authentication xác thực quản trị; Firebase Admin SDK truy cập Firestore chỉ ở máy chủ. API công khai chỉ nhận đăng ký, API quản trị xác minh ID token và UID được cấp quyền trước mọi truy vấn.

**Tech Stack:** Next.js, React, TypeScript, CSS, Zod, Firebase JS SDK, Firebase Admin SDK; Vitest cho logic/API, Playwright cho luồng trình duyệt, Firebase Emulator Suite cho tích hợp.

---

## Cơ sở, giới hạn và cách thực hiện

- Thiết kế đã duyệt: `docs/superpowers/specs/2026-10-21-vitech-landing-page-design.md`.
- Kho mã hiện chỉ có tài liệu và `.gitignore`; chưa có ứng dụng, Firebase hoặc tài khoản hosting.
- Đây là kế hoạch; không scaffold, cài dependencies hoặc tạo dự án cloud trong bước lập kế hoạch.
- Không chọn hosting thay người dùng. Chuẩn bị ứng dụng chạy trên môi trường Next.js Node.js server; không dùng static export cho các API.
- Khi thực hiện, kiểm tra phiên bản ổn định và tương thích Node/Next/React/Firebase qua tài liệu chính thức, ghi phiên bản cụ thể trong `package.json` và lockfile. Kế hoạch không giả định một phiên bản hiện hành chưa kiểm chứng.
- Đọc @frontend-design và @vercel-react-best-practices khi bắt đầu xây UI; dùng @ui-ux-pro-max cho responsive/accessibility. Giữ bố cục A đã duyệt, không khám phá lại hướng thiết kế.
- Header trên giữ theo mẫu skill. `superpowers:executing-plans` và `superpowers:subagent-driven-development` chưa có trong danh mục skill hiện tại; không tuyên bố đã dùng chúng. Nếu người dùng yêu cầu thực thi và chúng vẫn không có, thực hiện trực tiếp từng nhiệm vụ theo kế hoạch và báo kết quả.
- Các bước bên dưới là các hành động nhỏ, thực hiện tuần tự. Test tập trung vào lỗi dữ liệu, bảo mật và luồng nghiệp vụ; không viết test chỉ lặp lại CSS hoặc nội dung tĩnh. Mỗi nhiệm vụ kết thúc bằng một commit chỉ gồm file của nhiệm vụ đó.

## Hợp đồng chung

### Dữ liệu và mã định danh

```ts
type PlanId = 'ica-1y' | 'ica-2y' | 'ica-3y' | 'consultation';
type LeadStatus = 'new' | 'contacted' | 'consulting' | 'completed' | 'not-interested';
type RegistrationInput = {
  requestId: string; // UUID; giữ nguyên khi thử lại cùng payload
  fullName: string;
  email: string;
  phone: string;
  address: string;
  planId: PlanId;
  website: string; // honeypot, phải rỗng
};
type RegistrationRecord = {
  fullName: string; email: string; phone: string; address: string;
  planId: PlanId; status: LeadStatus; notes: string;
  nameKey: string; emailKey: string; phoneKey: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
};
```

Firestore: `registrations/{requestId}`, metadata riêng tại `registrationRequests/{requestId}` chứa hash payload để phát hiện retry khác dữ liệu. Không trả dữ liệu khách hàng hoặc kết quả tồn tại của ID cho người chưa xác thực khi payload không trùng. Hash dùng HMAC với bí mật máy chủ; không log nội dung form/token.

### API

| Route | Quyền | Hợp đồng |
| --- | --- | --- |
| `POST /api/registrations` | Công khai | JSON `RegistrationInput`; 201 khi tạo, 200 khi retry trùng; chỉ trả `{ok:true}` |
| `GET /api/admin/registrations` | Token + UID quản lý | `status?`, `searchBy=name|email|phone`, `q?`, `cursor?`; trả `{items,nextCursor}` |
| `GET /api/admin/registrations/[id]` | Token + UID quản lý | Trả một bản ghi hoặc 404 |
| `PATCH /api/admin/registrations/[id]` | Token + UID quản lý | Chỉ `{status,notes}`; trả bản ghi đã cập nhật |

Lỗi thống nhất `{error:{code,message,fields?}}`: 400 dữ liệu sai, 401 token thiếu/sai/hết hạn, 403 UID sai, 404 bản ghi không tồn tại, 409 mã yêu cầu khác payload, 413 body quá lớn, 415 sai content type, 429 quá tần suất, 503 cấu hình/dịch vụ chưa sẵn sàng. Lỗi nội bộ không trả stack hoặc thông tin bí mật.

Admin response đặt `Cache-Control: no-store`; không cache dữ liệu khách. Mọi PATCH xác thực trước khi đọc hoặc ghi. ID chỉ chấp nhận UUID. Dữ liệu timestamp trả client dạng ISO; UI hiển thị múi giờ `Asia/Ho_Chi_Minh`.

## Task 1: Khởi tạo ứng dụng và công cụ kiểm tra

**Files:** Create `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`; modify `.gitignore`.

1. Kiểm tra `node --version`, `npm --version`, `java -version`; ghi yêu cầu runtime tương thích SDK/Emulator vào README ở Task 11. Nếu Java thiếu, ghi rõ cần cài cho emulator.
2. Tạo package và cấu hình bằng file trong repo hiện tại, không chạy scaffold vào một thư mục dự án con. Cài `next react react-dom firebase firebase-admin zod server-only`; cài dev dependencies TypeScript, ESLint, Vitest, Playwright và Firebase CLI với phiên bản đã xác minh. Commit lockfile.
3. Khai báo scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:integration`, `test:e2e`, `verify:emulators`. Tách unit tests khỏi integration tests cần emulator. `verify:emulators` sẽ được hoàn thiện ở Task 10.
4. Thêm `.next/`, `node_modules/`, `.env*` ngoại trừ `.env.example`, `playwright-report/`, `test-results/`, Firebase logs và credential JSON cụ thể vào `.gitignore`; giữ `.superpowers/` đã có. Không ignore mọi file JSON.
5. Chạy `npm run lint`, `npm run typecheck`, `npm run build`; mong đợi exit 0 với trang cơ bản, không yêu cầu Firebase để build.
6. Commit: `chore: initialize Next.js application and verification tools`.

## Task 2: Cấu hình nghiệp vụ, kiểu dữ liệu và validation

**Files:** Create `src/lib/business.ts`, `src/lib/registrations/schema.ts`, `src/lib/registrations/search.ts`, `src/lib/registrations/types.ts`, `tests/unit/registration-schema.test.ts`, `tests/unit/search.test.ts`.

1. Viết tests cho email sai, trường rỗng, số điện thoại sai, payload chứa `status/notes`, mã gói không hợp lệ, số điện thoại dạng `+84`, khoảng trắng và giới hạn độ dài. Viết test tìm tên tiếng Việt có dấu, `đ`, email chữ hoa và số điện thoại đã chuẩn hóa.
2. Chạy `npm run test -- tests/unit/registration-schema.test.ts tests/unit/search.test.ts`; mong đợi FAIL do module chưa có.
3. Tạo nguồn giá và nội dung tập trung: `ica-1y=1792800`, `ica-2y=2690000`, `ica-3y=3080000`, bonus tương ứng `0/0/6`. Giá dùng `Intl.NumberFormat('vi-VN')`. Thêm nguyên văn thông tin công ty và sáu nhu cầu từ thiết kế.
4. Tạo schema strict: UUID; tên 2–120 ký tự, email tối đa 254, địa chỉ 5–500, phone tối đa 30 ký tự thô, notes quản trị tối đa 2000. Trim dữ liệu; phone bỏ dấu cách/chấm/gạch/ngoặc, đổi tiền tố `+84` hoặc `84` thành `0`, rồi chấp nhận số nội địa 10–11 chữ số bắt đầu `0`. Đây là kiểm tra định dạng, không cam kết xác minh chủ thuê bao.
5. Dùng hàm chuẩn hóa tên `normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d')` sau khi chuyển chữ thường; email lower-case, phone dùng số nội địa chuẩn. Dùng cùng hàm khi ghi và tìm.
6. Chạy lại tests, mong đợi PASS. Commit: `feat: define VI-TECH offers and registration contracts`.

## Task 3: Firebase server, cấu hình và quyền quản trị

**Files:** Create `.env.example`, `src/lib/firebase/admin.ts`, `src/lib/firebase/client.ts`, `src/lib/server/config.ts`, `src/lib/server/admin-auth.ts`, `src/lib/server/http.ts`, `firestore.rules`, `firebase.json`, `tests/unit/admin-auth.test.ts`.

1. Viết tests với auth verifier được inject: thiếu Bearer token → 401; token bị thu hồi/hết hạn → 401; UID khác → 403; đúng UID → tiếp tục. Chạy `npm run test -- tests/unit/admin-auth.test.ts`, xác nhận FAIL ban đầu.
2. Server dùng `import 'server-only'`, khởi tạo Firebase Admin singleton theo nhu cầu, không lúc import/build. Khi thiếu cấu hình trả 503, không tạo adapter giả. Firebase client chỉ được import trong component đăng nhập/admin.
3. Khai báo env mẫu: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`; server: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_ADMIN_UID`, `REGISTRATION_HMAC_SECRET`, `SITE_ORIGIN`, `TRUSTED_CLIENT_IP_HEADER`. Không đặt giá trị bí mật thật trong mẫu.
4. `requireAdmin` gọi `verifyIdToken(token, true)` và so sánh UID cấu hình; fail closed nếu cấu hình thiếu. Error helper không tiết lộ exception Firebase.
5. Rules dùng `match /{document=**} { allow read, write: if false; }`. Mọi truy cập web qua API Admin đã kiểm quyền; Console vẫn quản lý theo IAM.
6. Cấu hình Auth emulator cổng 9099, Firestore 8080. Chỉ cho emulator khi server có cờ local rõ ràng và project ID `demo-vitech`; không chấp nhận emulator host khi `NODE_ENV=production`. Không đưa emulator vào production bundle/config.
7. Chạy unit tests và `npm run build` không có env thật, mong đợi PASS. Commit: `feat: configure Firebase and restrict admin API access`.

## Task 4: Nhận đăng ký an toàn và chống gửi trùng

**Files:** Create `src/app/api/registrations/route.ts`, `src/lib/server/registration-service.ts`, `src/lib/server/rate-limit.ts`, `src/lib/server/request-body.ts`, `tests/unit/registration-api.test.ts`, `tests/integration/registration-create.test.ts`.

1. Viết unit tests cho schema lỗi, honeypot, sai Origin, body quá lớn, content type sai, thiếu Firebase và throttling. Chạy `npm run test -- tests/unit/registration-api.test.ts`; mong đợi FAIL ban đầu.
2. Đọc body tối đa 8 KiB theo luồng byte thực tế, không chỉ tin `Content-Length`. Chỉ nhận JSON và origin cấu hình; không bật CORS wildcard. Honeypot có dữ liệu trả lỗi chung, không ghi lead.
3. Chống abuse bằng transaction Firestore `rateLimits/{HMAC(source + timeWindow)}`: giới hạn đề xuất 5 lần/10 phút/IP và 5 lần/10 phút/số điện thoại, có `expiresAt` cho TTL. Chỉ tin IP header khi hosting đảm bảo ghi đè header đó; không lấy tùy tiện phần tử đầu `x-forwarded-for`. Khi chưa cấu hình header tin cậy dùng bucket `unknown` giới hạn chặt và ghi hướng dẫn cấu hình. Lỗi limiter không cho phép bỏ qua kiểm tra.
4. Service transaction đọc bản ghi metadata trước mọi write; cùng requestId và payload hash → trả thành công cũ, khác hash → 409. Tạo metadata, lead và cập nhật limiter atomically cho lần tạo mới; transaction retry không tạo lead thứ hai. `status='new'`, `notes=''`, timestamps máy chủ, không lưu honeypot hoặc IP thô.
5. Integration tests: hai POST đồng thời cùng payload chỉ tạo một lead; cùng UUID khác payload bị từ chối; sau retry không reset trạng thái/notes; ghi sai bị từ chối. Test helpers dùng project demo và xóa dữ liệu demo giữa test, tuyệt đối không nối project thật.
6. Chạy unit tests; integration tests được chạy đầy đủ sau bộ điều phối Task 10. Commit: `feat: save registrations with idempotency and abuse controls`.

## Task 5: Xây landing page theo hướng A

**Files:** Modify `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`; create `src/components/site-header.tsx`, `src/components/hero.tsx`, `src/components/use-cases.tsx`, `src/components/pricing.tsx`, `src/components/support-process.tsx`, `src/components/site-footer.tsx`, `public/brand/vitech-logo.png`.

1. Lấy đúng logo đính kèm và lưu `public/brand/vitech-logo.png`; nếu chưa truy cập được tệp, tiếp tục các phần độc lập, ghi rõ thiếu asset và đề nghị người dùng đặt tệp vào đường dẫn này. Không chế logo thay thế hoặc tuyên bố hoàn tất logo.
2. Định nghĩa CSS tokens xanh dương/trắng/xám, độ rộng nội dung khoảng 1120px, font hệ thống hỗ trợ tiếng Việt, khoảng cách và focus visible. Dùng nền sáng, không thêm hiệu ứng che nội dung.
3. Tạo header, hero và sáu nhóm nhu cầu theo thứ tự thiết kế; phần tĩnh render ở server. Liên kết anchor có scroll margin để tránh header che tiêu đề.
4. Render ba thẻ từ `business.ts`; chỉ gói 3 năm ghi tặng 6 tháng. CTA dùng `?plan=ica-3y#dang-ky` tương ứng từng gói, CTA chung về `#dang-ky`; giữ thay đổi gói phía client mà không tải lại trang khi thuận tiện.
5. Thêm cam kết hỗ trợ, quy trình ba bước, thương hiệu khác dạng chữ và footer nguyên văn; `tel:0968273868`, Zalo theo số đã cho. Không tự bổ sung chứng nhận, số liệu hoặc lời khách hàng.
6. Tạo title/description tiếng Việt, `lang='vi'`, một h1; không cấu hình canonical bằng tên miền giả. Thêm viewport và reduced-motion; kiểm tra bằng mắt ở 375px, 768px, 1440px.
7. Chạy lint/typecheck/build, mong đợi PASS. Commit: `feat: build VI-TECH landing page in approved layout`.

## Task 6: Form đăng ký và phản hồi người dùng

**Files:** Create `src/components/registration-form.tsx`, `src/lib/registrations/client-request.ts`, `tests/e2e/registration-form.spec.ts`; modify `src/app/page.tsx`.

1. Viết Playwright scenarios: CTA ba gói chọn đúng gói; CTA chung không áp gói; nhập sai hiện lỗi; response 503 giữ dữ liệu; response thành công chỉ xuất hiện sau API. Trong test UI có thể stub response nhưng phải ghi rõ đây không phải kiểm tra Firebase thật.
2. Tạo form có label, required/autocomplete, email/tel input, textarea địa chỉ và dropdown gói với lựa chọn tư vấn khác. Thông báo mục đích thu thập sát nút gửi. Honeypot ẩn với assistive technology và không nhận tab focus.
3. Dùng schema chung cho lỗi tại trường; gửi cùng JSON contract Task 4. UUID mới khi bắt đầu payload mới; giữ UUID khi retry payload không đổi, tạo UUID khác nếu người dùng sửa payload sau lỗi. Khóa nút khi đang gửi.
4. Hiển thị `aria-live` khi đang gửi/thành công và `role=alert` khi lỗi. Không xóa dữ liệu khi lỗi. Khi thành công, xóa PII khỏi form state và giữ lời xác nhận; cho phép bắt đầu lượt đăng ký mới rõ ràng.
5. Khi Firebase chưa sẵn sàng, server truyền trạng thái cấu hình dạng boolean; thông báo ngắn rằng form tạm chưa sẵn sàng, vẫn cung cấp hotline. Không hiển thị tên env hoặc stack trong luồng khách hàng.
6. Chạy `npx playwright test tests/e2e/registration-form.spec.ts`, mong đợi PASS; kiểm tra bàn phím và layout mobile. Commit: `feat: connect registration form with clear submission states`.

## Task 7: API quản trị, tìm kiếm và phân trang

**Files:** Create `src/app/api/admin/registrations/route.ts`, `src/app/api/admin/registrations/[id]/route.ts`, `src/lib/server/admin-registrations.ts`, `src/lib/server/cursor.ts`, `firestore.indexes.json`, `tests/integration/admin-registrations.test.ts`.

1. Viết integration tests cho 401/403; xem chi tiết; PATCH hợp lệ; cố sửa email/PII bị từ chối; ID sai/không tồn tại; 45 bản ghi cùng thời điểm phân trang không trùng/mất; lọc kết hợp tìm kiếm và ghi chú còn sau đọc lại.
2. Mọi handler gọi `requireAdmin` trước truy vấn; GET trả tối đa 20 bản ghi và đọc thêm một bản để biết có trang tiếp. PATCH strict chỉ cho status enum và notes <=2000; update `updatedAt` máy chủ.
3. Không tìm kiếm: sort `createdAt desc, documentId desc`. Có tìm kiếm: UI chọn trường tên/email/điện thoại, chuẩn hóa `q`, query prefix bằng `>=q` và `<q+'\uf8ff'`, order theo trường đó rồi `createdAt desc, documentId desc`. Ghi rõ kết quả tìm kiếm sắp theo khóa tìm; chỉ danh sách thường mới nhất trước.
4. Cursor chứa giá trị order cuối, document ID và fingerprint bộ lọc, được ký HMAC và kiểm tra kích thước/kiểu. Dùng `startAfter` cùng order; reset cursor khi đổi bộ lọc. Không dùng offset hoặc tải toàn bộ collection.
5. Khai báo indexes cho `status + createdAt desc`, và mỗi `nameKey/emailKey/phoneKey asc + createdAt desc` có/không status, cùng document ID direction theo truy vấn. Tạo Firebase config trỏ đúng rules/indexes; xác minh index trên project thật vì emulator không đảm bảo phát hiện mọi index thiếu.
6. Auth errors không bị đổi thành lỗi 500; `no-store` cho mọi response admin. Chạy integration tests khi emulator sẵn sàng. Commit: `feat: add protected registration management APIs`.

## Task 8: Đăng nhập tài khoản quản lý chung

**Files:** Create `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/components/admin/auth-provider.tsx`, `src/components/admin/login-form.tsx`, `src/lib/admin/api-client.ts`, `tests/e2e/admin-auth.spec.ts`.

1. Viết tests: chưa đăng nhập chỉ thấy login; sai mật khẩu có thông báo chung; đúng tài khoản được vào; tài khoản Auth khác không xem được dữ liệu; đăng xuất xóa dữ liệu đang hiển thị.
2. Dùng Firebase email/password với session persistence cho trình duyệt; không có nút tạo tài khoản. Theo dõi `onAuthStateChanged`, không render dashboard trong lúc đang kiểm tra auth.
3. API client lấy ID token hiện hành, gắn `Authorization: Bearer ...`; gặp 401 refresh token và thử lại một lần. 403 hiển thị không có quyền, không tiếp tục gọi danh sách. Không đưa token vào URL/log/localStorage thủ công.
4. Mỗi thay đổi auth phải hủy request đang chạy và xóa cache/state danh sách để tránh response cũ hiển thị sau logout. Nút đăng xuất gọi Firebase signOut.
5. `/admin` metadata `robots: {index:false,follow:false}`, `robots.txt` disallow `/admin`; đây không thay thế xác thực API. Không cache HTML admin chứa dữ liệu cá nhân.
6. Chạy auth scenarios trong emulator ở Task 10. Commit: `feat: add shared administrator login`.

## Task 9: Danh sách khách và cập nhật trạng thái

**Files:** Create `src/components/admin/registrations-dashboard.tsx`, `src/components/admin/registration-detail.tsx`, `src/components/admin/registration-filters.tsx`, `src/components/admin/admin.css`, `tests/e2e/admin-workflow.spec.ts`; modify `src/app/admin/page.tsx`.

1. Viết scenarios cho load/rỗng/lỗi, mở chi tiết, lưu trạng thái và notes, reload giữ kết quả, tìm kiếm từng trường và reset phân trang khi đổi filter.
2. Tạo danh sách desktop và layout đọc được trên mobile: tên, phone/email, gói, ngày, trạng thái. Tất cả text khách hàng render như văn bản, không dùng HTML injection.
3. Filter năm trạng thái và selector trường tìm kiếm; label giải thích tìm từ đầu tên/email/số điện thoại, hỗ trợ tên không dấu. Debounce 300ms, hủy request cũ; nút tiếp và về trang trước dựa trên stack cursor, không giả tổng số bản ghi.
4. Chi tiết hiển thị toàn bộ thông tin, chọn bất kỳ trạng thái đã duyệt và sửa notes. Có đang lưu/thành công/lỗi; lỗi không mất ghi chú; không thêm nút sửa PII hoặc xóa. Nếu bản ghi đang xem rời khỏi filter sau cập nhật, refresh danh sách từ trang đầu.
5. Kiểm tra labels, focus, tab, thông báo lỗi; modal nếu dùng phải quản lý focus và Escape, hoặc dùng trang/panel chi tiết để giảm độ phức tạp.
6. Chạy browser scenarios ở Task 10. Commit: `feat: build registration follow-up dashboard`.

## Task 10: Chạy kiểm tra tích hợp đầy đủ bằng emulator

**Files:** Create `scripts/verify-emulators.mjs`, `scripts/seed-emulator.mjs`, `tests/helpers/emulator.ts`, `tests/integration/firestore-rules.test.ts`, `tests/e2e/full-flow.spec.ts`; modify `package.json`, `playwright.config.ts`, `firebase.json`.

1. Hoàn thiện `npm run verify:emulators` để gọi Firebase CLI `emulators:exec --only auth,firestore --project demo-vitech` và runner Node đa nền tảng. Runner đặt server env `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`, `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`, UID test, secret test và origin localhost; bật cờ emulator local. Không set global environment hoặc dùng credentials thật.
2. Runner seed tài khoản quản lý với UID cố định và một tài khoản không có quyền; password/email chỉ là fixture demo. Tạo bộ dữ liệu phân trang có timestamp trùng. Fixtures tuyệt đối từ chối project ID không bắt đầu `demo-` hoặc host không local.
3. Runner chạy unit/integration tests, start Next dev server local cho E2E, chờ HTTP ready với deadline rồi chạy Playwright; luôn dừng child processes trong finally. Test UI stubs và full-flow thật tách file, không dùng stub trong `full-flow.spec.ts`.
4. Rules tests dùng Firebase client emulator: anonymous và tài khoản Auth đăng nhập đều bị từ chối direct read/write collection; API quản trị đúng UID vẫn hoạt động qua Admin SDK.
5. Full flow: browser gửi form → Firestore có đúng một lead → login quản lý → thấy lead → đổi trạng thái, thêm notes → reload vẫn giữ → logout không xem được dữ liệu. Test sai UID, token hết hạn/bị thu hồi, retry và giới hạn tần suất bằng nguồn test kiểm soát.
6. Chạy `npm run verify:emulators`; mong đợi toàn bộ PASS và exit 0. Chạy `npm run lint`, `npm run typecheck`, `npm run build` trong môi trường không có emulator flag; mong đợi PASS. Không khởi động production với kết nối emulator.
7. Commit: `test: verify registration and admin flows with Firebase emulators`.

## Task 11: Hướng dẫn tạo Firebase và vận hành

**Files:** Create `README.md`, `docs/setup/firebase.md`, `docs/setup/deployment.md`; modify `.env.example` nếu cần.

1. Viết hướng dẫn tiếng Việt: cài runtime, `npm ci`, copy env mẫu, `npm run dev`, cách chạy kiểm tra và giới hạn khi thiếu Firebase/logo. Tách hướng dẫn emulator khỏi cấu hình thật.
2. Firebase: chủ tài khoản tạo project, tạo Firestore ở region cân nhắc gần người dùng, đăng ký web app, bật email/password Auth và tạo một tài khoản chung. Lấy UID vào `FIREBASE_ADMIN_UID`; không yêu cầu người dùng gửi mật khẩu vào chat.
3. Hướng dẫn cấp service account phù hợp Firestore/Auth verification và lưu credential phía máy chủ; dùng secret manager/env của hosting, không đặt private key trong `NEXT_PUBLIC_*`. Giải thích xử lý newline PEM và cách xoay khóa.
4. Hướng dẫn triển khai rules/indexes bằng CLI đã đăng nhập và project ID đã xác minh: `npx firebase deploy --only firestore:rules,firestore:indexes --project <PROJECT_ID>`. Không thực thi deploy vào project thật như một phần test cục bộ. Bật TTL cho `rateLimits.expiresAt`; metadata idempotency được giữ cùng vòng đời lead, không tự TTL độc lập.
5. Hosting: build/start, HTTPS, `SITE_ORIGIN`, header IP đáng tin từ reverse proxy, Auth authorized domains; không giả định Vercel hay Firebase Hosting hỗ trợ sẵn API này. Ghi phần cần xác minh về plan/quota/chi phí của dịch vụ khi chọn hosting thực tế, không hứa miễn phí.
6. Vận hành: đăng nhập `/admin`, sử dụng năm trạng thái, lọc/tìm kiếm, ghi chú; phân biệt tài khoản web với quyền IAM vào Firebase Console. Reset password trong Firebase khi cần; không xây reset flow mới ngoài phạm vi.
7. Commit: `docs: explain Firebase setup and production configuration`.

## Task 12: Kiểm tra giao diện và bàn giao

**Files:** Create `docs/verification/acceptance.md`; sửa các file sản phẩm chỉ khi phát hiện lỗi.

1. Chạy bộ kiểm tra Task 10 một lần sau thay đổi cuối cùng; chỉ chạy lại nếu sửa lỗi ảnh hưởng kết quả. Ghi lệnh, kết quả và môi trường trong tài liệu nghiệm thu.
2. Xem desktop 1440px và mobile 375px: giá không vỡ dòng khó đọc, form không bị nút nổi che, header/anchor/focus hoạt động, tương phản chữ dễ đọc, không cuộn ngang; kiểm tra một màn hình tablet. Dùng công cụ browser khả dụng; nếu công cụ lỗi, báo rõ phần chưa xác minh bằng mắt.
3. Đối chiếu bảng giá, VAT/USB Token, bonus chỉ ICA 3 năm, tên công ty/MST/địa chỉ, sáu nghiệp vụ, hotline và logo thật. Kiểm tra liên kết Zalo mở đúng tài khoản trong môi trường có thể truy cập.
4. Kiểm tra cấu hình production không chứa emulator hosts hoặc secret client; không có console log PII/token; admin không cache, API từ chối anonymous/sai UID.
5. Nếu Firebase thật đã được người dùng cấu hình, gửi một đăng ký thử do người dùng cho phép, xác minh Console và admin rồi đánh dấu dữ liệu thử. Nếu chưa có, ghi “đã kiểm chứng emulator, chưa kiểm chứng production”; không ghi hoàn thành triển khai thực tế.
6. Commit: `docs: record VI-TECH acceptance verification` (kèm sửa lỗi liên quan nếu có). Bàn giao đường dẫn chạy/xem, kết quả test và việc còn cần: logo gốc nếu thiếu, cấu hình Firebase thật, hosting/tên miền.

## Thứ tự và các mốc có thể xem

### Ghi nhận thực hiện

Đã triển khai mã ứng dụng, kiểm thử và tài liệu trong phiên hiện tại. Kết quả: lint/typecheck/build thành công; 29 unit/integration tests và 4 browser tests qua với project emulator `demo-vitech`. Logo gốc đã được tích hợp. Chi tiết, ảnh chụp và các bước Firebase/hosting thật còn lại tại `docs/verification/acceptance.md`. Không coi kiểm chứng emulator là đã xuất bản hoặc cấu hình Firebase production.

- Task 1–4: nền tảng và API nhận đăng ký.
- Task 5–6: xem và dùng thử landing page; chưa coi là hoàn tất Firebase thật.
- Task 7–9: xem và dùng thử trang quản trị.
- Task 10–12: kiểm chứng luồng hoàn chỉnh, hướng dẫn cấu hình và bàn giao.

Chỉ cấu hình Firebase cloud, triển khai hosting và gắn tên miền khi đã có tài khoản/quyền/cấu hình thực tế. Không trì hoãn phần code, emulator hoặc tài liệu có thể làm độc lập vì chưa có các đầu vào này.
