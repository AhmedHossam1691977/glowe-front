import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaPhoneAlt, FaEnvelope } from 'react-icons/fa'; // أيقونات الهاتف والبريد
import { FaCcMastercard, FaCcVisa, FaPaypal, FaApplePay, FaGooglePay } from 'react-icons/fa'; // أيقونات وسائل الدفع (بعضها افتراضي لعدم وجودها في الصورة بالضبط)

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5" dir="rtl">
      <div className="container">
        <div className="row pb-4">
          {/* قسم: حسابي */}
          <div className="col-lg-2 col-md-4 col-sm-6 mb-4">
            <h5 className="text-uppercase mb-4 text-white footer-title-custom">حسابي</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/login" className="text-decoration-none footer-link-custom">تسجيل الدخول</Link>
              </li>
              <li className="mb-2">
                <Link to="/signUp" className="text-decoration-none footer-link-custom">حساب جديد</Link>
              </li>
              <li className="mb-2">
                <Link to="/whichList" className="text-decoration-none footer-link-custom">قائمة أمنياتي</Link>
              </li>
              <li className="mb-2">
                <Link to="/myOrder" className="text-decoration-none footer-link-custom">تتبع طلبي</Link>
              </li>
              {/* <li className="mb-2">
                <Link to="/help" className="text-decoration-none footer-link-custom">المساعدة</Link>
              </li> */}
            </ul>
          </div>

          {/* قسم: معلومات */}
          <div className="col-lg-2 col-md-4 col-sm-6 mb-4">
            <h5 className="text-uppercase mb-4 text-white footer-title-custom">معلومات</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/delivery-information" className="text-decoration-none footer-link-custom">معلومات التوصيل</Link>
              </li>
              <li className="mb-2">
                <Link to="/blogs" className="text-decoration-none footer-link-custom">المدونة</Link>
              </li>
              {/* <li className="mb-2">
                <Link to="/faq" className="text-decoration-none footer-link-custom">الأسئلة الشائعة</Link>
              </li> */}
              <li className="mb-2">
                <Link to="/contactUs" className="text-decoration-none footer-link-custom">تواصل معنا</Link>
              </li>
              <li className="mb-2">
                <Link to="/Sitemap" className="text-decoration-none footer-link-custom">خريطة الموقع</Link>
              </li>
            </ul>
          </div>

          {/* قسم: خدمات العملاء */}
          <div className="col-lg-2 col-md-4 col-sm-6 mb-4">
            <h5 className="text-uppercase mb-4 text-white footer-title-custom">خدمات العملاء</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/ShippingAndReturns" className="text-decoration-none footer-link-custom">الشحن والإرجاع</Link>
              </li>
              <li className="mb-2">
                <Link to="/SafeShopping" className="text-decoration-none footer-link-custom">التسوق الآمن</Link>
              </li>
              {/* <li className="mb-2">
                <Link to="/international-shipping" className="text-decoration-none footer-link-custom">الشحن الدولي</Link>
              </li> */}
              <li className="mb-2">
                <Link to="/MarketingPrograms" className="text-decoration-none footer-link-custom">البرامج التسويقية</Link>
              </li>
              {/* <li className="mb-2">
                <Link to="/contact-us-2" className="text-decoration-none footer-link-custom">الاتصال بنا</Link> 
              </li> */}
            </ul>
          </div>

          {/* قسم: الدفع والشحن */}
          <div className="col-lg-3 col-md-6 col-sm-6 mb-4">
            <h5 className="text-uppercase mb-4 text-white footer-title-custom">الدفع والشحن</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/TermsOfUse" className="text-decoration-none footer-link-custom">شروط الاستخدام</Link>
              </li>
              <li className="mb-2">
                <Link to="/PaymentMethods" className="text-decoration-none footer-link-custom">طرق الدفع</Link>
              </li>
              <li className="mb-2">
                <Link to="/ShippingGuide" className="text-decoration-none footer-link-custom">دليل الشحن</Link>
              </li>
              <li className="mb-2">
                <Link to="/Locations" className="text-decoration-none footer-link-custom">المواقع التي نشحن إليها</Link>
              </li>
              <li className="mb-2">
                <Link to="/DeliveryTime" className="text-decoration-none footer-link-custom">وقت التسليم المتوقع</Link>
              </li>
            </ul>
          </div>

          {/* قسم: الدفع ومعلومات الاتصال */}
          <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
            {/* طرق الدفع */}

            {/* معلومات الاتصال */}
            <h5 className="text-uppercase mb-4 text-white footer-title-custom">معلومات الاتصال</h5>
            <p className="mb-2 text-white d-flex align-items-center justify-content-lg-start justify-content-md-start justify-content-center">
              <FaPhoneAlt className="ms-2 footer-contact-icon-custom" /> +1 (555) 123-4567
            </p>
            <p className="mb-2 text-white d-flex align-items-center justify-content-lg-start justify-content-md-start justify-content-center">
              <FaEnvelope className="ms-2 footer-contact-icon-custom" /> cs@glowify.com
            </p>
          </div>
        </div>

        {/* الخط الفاصل */}
        <div className="divider-line my-4"></div>

        {/* حقوق النشر والسياسات */}
        <div className="row pb-3">
          <div className="col-md-6 text-md-end text-center mb-2 mb-md-0">
            <p className="mb-0 copyright-text-custom">
              <Link to="/privacy-policy" className="text-decoration-none copyright-link-custom">سياسة الخصوصية</Link>
              <span className="mx-2 text-muted">|</span>
              <Link to="/terms-conditions" className="text-decoration-none copyright-link-custom">الشروط والأحكام</Link>
            </p>
          </div>
          <div className="col-md-6 text-md-start text-center">
            <p className="mb-0 copyright-text-custom">
              © 2025 لاميع. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .bg-dark {
          background-color: #212529 !important; /* لون خلفية غامق */
        }
        .footer-title-custom {
          color: #fff; /* لون العناوين أبيض */
          font-size: 1.1rem; /* حجم الخط */
          font-weight: 600; /* سمك الخط */
          border-bottom: 2px solid transparent; /* إطار سفلي */
          padding-bottom: 8px; /* مسافة داخلية سفلية */
        }
        .footer-link-custom {
          color: #adb5bd; /* لون الروابط رصاصي فاتح */
          font-size: 0.95rem; /* حجم خط الروابط */
          transition: color 0.3s ease; /* تأثير الانتقال عند التحويم */
        }
        .footer-link-custom:hover {
          color: #e9ecef; /* لون أفتح عند التحويم */
        }
        .payment-icon-custom {
          font-size: 2.5rem; /* حجم أيقونات الدفع */
          color: #adb5bd; /* لون أيقونات الدفع */
        }
        .footer-contact-icon-custom {
          font-size: 1.1rem; /* حجم أيقونات الاتصال */
          color: #adb5bd; /* لون أيقونات الاتصال */
        }
        .divider-line {
          height: 1px;
          background: linear-gradient(to right, transparent, #868e96, transparent); /* خط متدرج */
          opacity: 0.3;
        }
        .copyright-text-custom {
          color: #868e96; /* لون نص حقوق النشر */
          font-size: 0.85rem; /* حجم خط حقوق النشر */
        }
        .copyright-link-custom {
          color: #868e96; /* لون روابط حقوق النشر */
          transition: color 0.3s ease;
        }
        .copyright-link-custom:hover {
          color: #e9ecef; /* لون أفتح عند التحويم */
        }
        /* لتغيير لون الخط السفلي الأرجواني في التصميم الأصلي */
        .footer-title-custom {
          border-bottom: 2px solid #a32258; /* لون وردي داكن/بنفسجي */
        }
      `}</style>
    </footer>
  );
};

export default Footer;