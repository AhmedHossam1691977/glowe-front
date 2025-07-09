import React from 'react';
import '../style/ContactUs.css';

export default function ContactUs() {
  return (
    <div className="contact-container my-5">
      <h2>📬 تواصل معنا</h2>
      <p>هل عندك سؤال أو استفسار؟ احنا في خدمتك!</p>

      <div className="contact-info">
        <p><strong>📞 الهاتف:</strong> 01286928107</p>
        <p><strong>📧 البريد الإلكتروني:</strong> support@yourstore.com</p>
        <p><strong>📍 العنوان:</strong> الزقازيق شرقيه مصر </p>
        <p><strong>🕒 مواعيد العمل:</strong> 10 صباحًا - 10 مساءً</p>
      </div>

      <div className="social-links">
        <a href="https://wa.me/01286928107" target="_blank">💬 واتساب</a>
        <a href="https://facebook.com" target="_blank">📘 فيسبوك</a>
        <a href="https://instagram.com" target="_blank">📸 إنستجرام</a>
      </div>
    </div>
  );
}
