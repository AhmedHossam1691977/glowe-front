import React from 'react';
import './../style/ImformationOrders.css';
import { FaTruck, FaClock, FaMapMarkerAlt, FaMoneyBillWave, FaSearch, FaBoxOpen, FaGlobe } from 'react-icons/fa';

export default function ImformationOrders() {
  return (
  <div className="container">
      <div className="delivery-info-container my-3" id='delivery-info-container'>
      <h2 className="section-title ">معلومات التوصيل والشحن</h2>
      
      <div className="delivery-cards-container">
        <div className="delivery-card">
          <div className="card-icon"><FaClock /></div>
          <h3 className="card-title">مدة التوصيل</h3>
          <p className="card-content">يتم توصيل الطلبات خلال 2-5 أيام عمل داخل مصر</p>
        </div>

        <div className="delivery-card">
          <div className="card-icon"><FaMapMarkerAlt /></div>
          <h3 className="card-title">مناطق التوصيل</h3>
          <p className="card-content">نوصل لجميع محافظات مصر. بعض المناطق النائية قد تستغرق وقتًا إضافيًا</p>
        </div>

        <div className="delivery-card">
          <div className="card-icon "><FaMoneyBillWave /></div>
          <h3 className="card-title">تكلفة التوصيل</h3>
          <p className="card-content">يتم حساب التكلفه ع حسب العنوان</p>
        </div>

        <div className="delivery-card">
          <div className="card-icon"><FaTruck /></div>
          <h3 className="card-title">شركات الشحن</h3>
          <p className="card-content">نتعامل مع أرامكس، سمسا، وDHL لضمان سرعة التوصيل</p>
        </div>

        <div className="delivery-card">
          <div className="card-icon"><FaSearch /></div>
          <h3 className="card-title">تتبع الشحنة</h3>
          <p className="card-content">سيتم إرسال رقم تتبع عبر البريد الإلكتروني أو واتساب فور الشحن</p>
        </div>

        <div className="delivery-card">
          <div className="card-icon"><FaBoxOpen /></div>
          <h3 className="card-title">استلام الطلبات</h3>
          <p className="card-content">يرجى التأكد من صحة بيانات الهاتف والعنوان لتسهيل التوصيل</p>
        </div>

        <div className="delivery-card">
          <div className="card-icon"><FaGlobe /></div>
          <h3 className="card-title">التوصيل الدولي</h3>
          <p className="card-content">غير متاح في الفتره الحاليه</p>
        </div>
      </div>
    </div>
  </div>
  );
}