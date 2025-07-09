import React from 'react';
import '../style/Terms.css';
import { FaRegHandshake, FaUserShield, FaCreditCard, FaCopyright, FaEdit, FaHeadset } from 'react-icons/fa';

export default function TermsOfUse() {
  return (
    <div className="terms-container">
      <div className="terms-header">
        <h1 className="terms-title">📜 شروط الاستخدام</h1>
        <p className="terms-intro">
          باستخدامك لهذا الموقع فإنك توافق على الالتزام بالشروط والأحكام التالية، والتي قد يتم تعديلها من وقت لآخر. نرجو قراءة الشروط بعناية.
        </p>
      </div>

      <div className="terms-content">
        <div className="term-card">
          <div className="term-icon"><FaRegHandshake /></div>
          <h3 className="term-title">1. الاستخدام المقبول</h3>
          <ul className="term-list">
            <li>يُسمح لك باستخدام الموقع لأغراض شخصية وتسويقية مشروعة فقط.</li>
            <li>يُمنع استخدام الموقع بأي طريقة تضر بالموقع أو بالمستخدمين الآخرين.</li>
          </ul>
        </div>

        <div className="term-card">
          <div className="term-icon"><FaUserShield /></div>
          <h3 className="term-title">2. الحسابات والخصوصية</h3>
          <ul className="term-list">
            <li>عند إنشاء حساب، يجب تقديم معلومات صحيحة وكاملة.</li>
            <li>أنت مسؤول عن سرية بيانات الدخول الخاصة بك.</li>
            <li>نحن نحترم خصوصيتك ونلتزم بحماية بياناتك.</li>
          </ul>
        </div>

        <div className="term-card">
          <div className="term-icon"><FaCreditCard /></div>
          <h3 className="term-title">3. الطلبات والدفع</h3>
          <ul className="term-list">
            <li>جميع الطلبات تخضع للتوافر والأسعار الموضحة وقت الشراء.</li>
            <li>نحتفظ بالحق في رفض أو إلغاء أي طلب في حال وجود خطأ في السعر أو المنتج.</li>
          </ul>
        </div>

        <div className="term-card">
          <div className="term-icon"><FaCopyright /></div>
          <h3 className="term-title">4. حقوق الملكية</h3>
          <ul className="term-list">
            <li>جميع محتويات الموقع (صور، نصوص، شعارات، تصاميم) هي ملك حصري للموقع.</li>
            <li>لا يجوز نسخ أو إعادة نشر أي جزء من الموقع دون إذن مكتوب مسبق.</li>
          </ul>
        </div>

        <div className="term-card">
          <div className="term-icon"><FaEdit /></div>
          <h3 className="term-title">5. التعديلات على الشروط</h3>
          <p className="term-text">
            نحتفظ بحقنا في تعديل شروط الاستخدام في أي وقت، وسيتم نشر التعديلات على هذه الصفحة.
          </p>
        </div>

        <div className="term-card">
          <div className="term-icon"><FaHeadset /></div>
          <h3 className="term-title">6. التواصل معنا</h3>
          <p className="term-text">
            لأي استفسار حول الشروط، يمكنك التواصل معنا من خلال صفحة <a href="/contact" className="contact-link">تواصل معنا</a>.
          </p>
        </div>
      </div>
    </div>
  );
}