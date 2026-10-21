import {
  ArrowRight,
  Check,
  Phone,
  ShieldCheck,
  FileCheck2,
  ReceiptText,
  Landmark,
  BriefcaseBusiness,
  PackageCheck,
  HeartHandshake,
  Headset,
  Mail,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import Brand from "@/components/brand";
import PlanLink from "@/components/plan-link";
import RegistrationForm from "@/components/registration-form";
import FloatingContact from "@/components/floating-contact";
import { company, plans, money } from "@/lib/business";
import { isConfigured } from "@/lib/server/config";
export const dynamic = "force-dynamic";
const uses = [
  {
    icon: FileCheck2,
    title: "Thuế điện tử",
    text: "Ký và nộp tờ khai thuế điện tử.",
  },
  {
    icon: ShieldCheck,
    title: "BHXH điện tử",
    text: "Ký hồ sơ bảo hiểm xã hội điện tử.",
  },
  {
    icon: ReceiptText,
    title: "Hóa đơn điện tử",
    text: "Ký hóa đơn trong hoạt động kinh doanh.",
  },
  {
    icon: Landmark,
    title: "Kho bạc nhà nước",
    text: "Thực hiện giao dịch dịch vụ công kho bạc.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Đấu thầu qua mạng",
    text: "Ký hồ sơ trong quá trình đấu thầu trực tuyến.",
  },
  {
    icon: PackageCheck,
    title: "Hải quan điện tử",
    text: "Ký hồ sơ khai báo hải quan điện tử.",
  },
];
export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Đến nội dung chính
      </a>
      <div className="topbar">
        <div className="container">
          <span>Chữ ký số cho doanh nghiệp Việt Nam</span>
          <a href={`tel:${company.tel}`}>
            <Phone size={13} /> Tư vấn: {company.phone}
          </a>
        </div>
      </div>
      <header className="site-header">
        <div className="container nav">
          <Link href="/" aria-label="VI-TECH trang chủ">
            <Brand />
          </Link>
          <nav aria-label="Điều hướng chính">
            <a href="#nhu-cau">Ứng dụng</a>
            <a href="#bang-gia">Bảng giá ICA</a>
            <a href="#dong-hanh">Hỗ trợ</a>
          </nav>
          <PlanLink className="button compact">
            Đăng ký tư vấn <ArrowRight size={16} />
          </PlanLink>
        </div>
      </header>
      <main id="main">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="pill">
                <span />
                Mua mới & gia hạn chữ ký số
              </div>
              <h1>
                Ký số thuận tiện.
                <br />
                Luôn có <span className="no-break">VI-TECH</span>
                <br />
                đồng hành.
              </h1>
              <p>
                Giải pháp chữ ký số cho công việc của kế toán và doanh nghiệp.
                Từ kê khai thuế đến giao dịch điện tử, VI-TECH hỗ trợ bạn trong
                suốt thời gian sử dụng.
              </p>
              <div className="hero-actions">
                <PlanLink>
                  Đăng ký mua chữ ký số <ArrowRight size={19} />
                </PlanLink>
                <a href="#bang-gia" className="text-link">
                  Xem bảng giá ICA
                </a>
              </div>
              <div className="hero-note">
                <ShieldCheck size={19} />
                <span>Hỗ trợ xuyên suốt thời gian sử dụng</span>
              </div>
            </div>
            <div
              className="document-visual"
              aria-label="Minh họa hồ sơ điện tử được ký số"
            >
              <div className="visual-grid" />
              <div className="document">
                <div className="document-top">
                  <span>Hồ sơ điện tử</span>
                  <FileCheck2 size={23} />
                </div>
                <div className="document-title">
                  Sẵn sàng cho
                  <br />
                  giao dịch của bạn.
                </div>
                <div className="document-lines">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="signature">
                  <ShieldCheck size={31} />
                  <div>
                    <strong>Chữ ký số doanh nghiệp</strong>
                    <small>Thuế · BHXH · Hóa đơn điện tử</small>
                  </div>
                </div>
                <div className="document-footer">
                  <span>VI-TECH</span>
                  <span>Đồng hành cùng doanh nghiệp</span>
                </div>
              </div>
              <div className="visual-support">
                <Headset size={23} />
                <div>
                  <strong>Có VI-TECH hỗ trợ</strong>
                  <small>Trong suốt thời gian sử dụng</small>
                </div>
              </div>
              <span className="illustration-note">
                Minh họa ứng dụng chữ ký số
              </span>
            </div>
          </div>
        </section>
        <div className="provider-strip">
          <div className="container">
            <span>
              Các thương hiệu
              <br />
              VI-TECH cung cấp
            </span>
            <div>Viettel</div>
            <div>VNPT</div>
            <div>ICA</div>
            <div>WINCA</div>
            <div>FPT</div>
          </div>
        </div>
        <section id="nhu-cau" className="section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="kicker">Gắn với công việc hằng ngày</span>
                <h2>
                  Một dịch vụ,
                  <br />
                  nhiều nhu cầu ký số.
                </h2>
              </div>
              <p>
                Hỗ trợ doanh nghiệp thực hiện các nghiệp vụ điện tử quen thuộc.
                VI-TECH tư vấn lựa chọn phù hợp với nhu cầu sử dụng của bạn.
              </p>
            </div>
            <div className="uses-grid">
              {uses.map(({ icon: Icon, title, text }) => (
                <article className="use-item" key={title}>
                  <span className="icon-box">
                    <Icon size={25} strokeWidth={1.6} />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="bang-gia" className="section pricing-section">
          <div className="container">
            <div className="center-heading">
              <span className="kicker">Bảng giá chữ ký số ICA</span>
              <h2>
                Chọn thời hạn.
                <br />
                VI-TECH đồng hành cùng bạn.
              </h2>
              <p>
                Áp dụng cho cả mua mới và gia hạn. Giá đã bao gồm VAT và USB
                Token.
              </p>
            </div>
            <div className="pricing-grid">
              {plans.map((plan) => (
                <article
                  key={plan.id}
                  className={`price-card ${plan.bonus ? "featured" : ""}`}
                >
                  {plan.bonus ? (
                    <div className="bonus-banner">
                      Tặng thêm 6 tháng sử dụng
                    </div>
                  ) : null}
                  <div className="plan-duration">
                    ICA <strong>{plan.years} năm</strong>
                  </div>
                  <p className="plan-sub">Mua mới & gia hạn</p>
                  <div className="price">{money(plan.price)}</div>
                  <p className="price-caption">Đã gồm VAT và USB Token</p>
                  <hr />
                  <ul>
                    <li>
                      <Check size={17} />
                      {plan.years * 12}
                      {plan.bonus ? " + 6" : ""} tháng sử dụng
                    </li>
                    <li>
                      <Check size={17} />
                      Tư vấn theo nhu cầu
                    </li>
                    <li>
                      <Check size={17} />
                      Hỗ trợ suốt thời gian sử dụng
                    </li>
                  </ul>
                  <PlanLink
                    plan={plan.id}
                    className={`button ${plan.bonus ? "" : "outline"}`}
                  >
                    Chọn gói {plan.years} năm <ArrowRight size={16} />
                  </PlanLink>
                </article>
              ))}
            </div>
            <p className="pricing-footnote">
              Ưu đãi thêm 6 tháng chỉ áp dụng cho gói ICA 3 năm, với cả mua mới
              và gia hạn.
            </p>
          </div>
        </section>
        <section id="dong-hanh" className="section">
          <div className="container support-grid">
            <div>
              <span className="kicker">Đăng ký đơn giản</span>
              <h2>
                Từ lần tư vấn đầu tiên
                <br />
                đến suốt quá trình sử dụng.
              </h2>
              <p className="support-copy">
                Bạn tập trung vào công việc. VI-TECH luôn sẵn sàng hỗ trợ và
                đồng hành với doanh nghiệp khi sử dụng chữ ký số.
              </p>
              <a href={`tel:${company.tel}`} className="support-phone">
                <Headset size={28} />
                <span>
                  Trao đổi cùng VI-TECH<strong>{company.phone}</strong>
                </span>
              </a>
            </div>
            <ol className="steps">
              <li>
                <span>1</span>
                <div>
                  <h3>Gửi thông tin đăng ký</h3>
                  <p>Chọn gói quan tâm và để lại thông tin liên hệ.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <h3>Nhận tư vấn phù hợp</h3>
                  <p>
                    Nhân viên liên hệ, xác nhận nhu cầu mua mới hoặc gia hạn.
                  </p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <h3>Hoàn tất đơn hàng</h3>
                  <p>
                    VI-TECH hướng dẫn các bước tiếp theo và đồng hành trong thời
                    gian sử dụng.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>
        <section id="dang-ky" className="registration-section">
          <div className="container registration-grid">
            <div className="registration-copy">
              <span className="kicker">Bắt đầu cùng VI-TECH</span>
              <h2>
                Chọn chữ ký số.
                <br />
                Kết nối công việc.
              </h2>
              <p>
                Để lại thông tin để nhận tư vấn và đăng ký gói chữ ký số phù hợp
                với doanh nghiệp.
              </p>
              <div className="registration-benefit">
                <HeartHandshake size={25} />
                <span>
                  Hỗ trợ và đồng hành
                  <br />
                  suốt thời gian sử dụng
                </span>
              </div>
              <div className="contact-block">
                <span>Bạn muốn trao đổi trực tiếp?</span>
                <a href={`tel:${company.tel}`}>{company.phone}</a>
                <a
                  className="zalo-link"
                  href={company.zalo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Liên hệ qua Zalo <ArrowRight size={15} />
                </a>
              </div>
            </div>
            <RegistrationForm ready={isConfigured()} />
          </div>
        </section>
        <section className="other-providers">
          <div className="container">
            <div>
              <h2>Bạn cần chữ ký số của thương hiệu khác?</h2>
              <p>
                VI-TECH cũng cung cấp Viettel, VNPT, WINCA và FPT. Liên hệ để
                được tư vấn gói và giá phù hợp.
              </p>
            </div>
            <PlanLink className="button outline">
              Nhận tư vấn <ArrowRight size={16} />
            </PlanLink>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">VI-TECH</div>
              <p>
                Giải pháp chữ ký số.
                <br />
                Đồng hành cùng doanh nghiệp Việt.
              </p>
            </div>
            <div>
              <h3>{company.name}</h3>
              <p>Mã số thuế: {company.taxId}</p>
              <p className="contact-line">
                <MapPin size={18} />
                {company.address}
              </p>
            </div>
            <div>
              <h3>Kết nối với VI-TECH</h3>
              <a className="contact-line" href={`tel:${company.tel}`}>
                <Phone size={17} />
                {company.phone}
              </a>
              <a
                className="contact-line"
                href={company.zalo}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Mail size={17} />
                Tư vấn qua Zalo
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} VI-TECH.</span>
            <span>Hỗ trợ trong suốt thời gian sử dụng</span>
          </div>
        </div>
      </footer>
      <FloatingContact />
    </>
  );
}
