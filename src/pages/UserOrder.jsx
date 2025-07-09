import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import '../style/UserOrder.css'; // تأكد من وجود هذا الملف وتضمينه الأنماط اللازمة

export default function UserOrder() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]); // تم تغيير الاسم ليكون أوضح
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState(null); // تم تغيير الاسم ليكون أوضح
  const [isLoading, setIsLoading] = useState(true); // حالة جديدة لتتبع التحميل
  const [error, setError] = useState(null); // حالة جديدة لتتبع الأخطاء

  const socketUrl = 'https://final-pro-api-j1v7.onrender.com';

  useEffect(() => {
    setIsLoading(true); // ابدأ التحميل عند تحميل المكون
    setError(null); // مسح أي أخطاء سابقة

    const socket = io(socketUrl, {
      query: {
        token: localStorage.getItem('token'),
      },
    });

    socket.on('connect', () => {
      console.log('✅ Connected to socket');
    });

    socket.on('orderUser', (data) => {
      console.log('📦 New order data received:', data.orders);

      // 💥 التعديل الرئيسي هنا: تأكد من أنك تستخدم data.order وليس data بالكامل 💥
      if (data && Array.isArray(data.orders)) { // تحقق من أن data.order موجودة وهي مصفوفة
        setOrders(data.orders);
        setFilteredOrders(data.orders); // يتم تحديث الطلبات المفلترة أيضًا
        setIsLoading(false); // توقف التحميل بمجرد استلام البيانات
        console.log('📦 Orders successfully set:', data.orders); // تأكيد أن البيانات تم تعيينها
      } else {
        // حالة إذا كانت البيانات المستلمة ليست بالمصفوفة المتوقعة
        console.error('❌ Received invalid order data format:', data);
        setError('حدث خطأ في تنسيق بيانات الطلبات المستلمة. الرجاء تحديث الصفحة.');
        setIsLoading(false);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket Connection error:', err);
      setError('فشل الاتصال بالخادم. الرجاء التأكد من اتصالك بالإنترنت والمحاولة مرة أخرى.');
      setIsLoading(false);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from socket');
    });

    // تنظيف الاتصال عند إلغاء تحميل المكون
    return () => {
      socket.disconnect();
    };
  }, []); // [] لضمان تشغيل التأثير مرة واحدة فقط عند التحميل الأولي

  // دالة لفلترة الطلبات بناءً على الحالة
  const filterOrders = (state) => {
    if (state === 'ALL') {
      setFilteredOrders(orders);
    } else {
      const result = orders.filter(order => order.state === state);
      setFilteredOrders(result);
    }
    setActiveFilter(state);
    setExpandedOrderId(null); // إغلاق أي طلب مفتوح عند تغيير الفلتر
  };

  // دالة لتبديل عرض تفاصيل الطلب
  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  // دالة لتنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return "تاريخ غير متوفر";
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('ar-EG', options);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "تاريخ غير صالح";
    }
  };

  // دالة لتحديد النص واللون المناسب لحالة الطلب
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'ORDERED': return { text: 'قيد الانتظار', className: 'status-ordered' };
      case 'ACCEPTED': return { text: 'مقبولة', className: 'status-accepted' };
      default: return { text: 'غير معروف', className: 'status-default' };
    }
  };

  return (
   <div className="container">
     <div className="order-container my-5" id="user-orders">
      <h2 className="page-title">طلباتي</h2>

      <div className="filter-buttons">
        <button
          className={`filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => filterOrders('ALL')}
        >
          جميع الطلبات
        </button>
        <button
          className={`filter-btn ${activeFilter === 'ORDERED' ? 'active' : ''}`}
          onClick={() => filterOrders('ORDERED')}
        >
          قيد الانتظار
        </button>
        <button
          className={`filter-btn ${activeFilter === 'ACCEPTED' ? 'active' : ''}`}
          onClick={() => filterOrders('ACCEPTED')}
        >
          مقبولة
        </button>
     
      </div>

      <div className="orders-list">
        {isLoading ? (
          <div className="loading-message">
            <p>جاري تحميل الطلبات...</p>
            {/* يمكنك إضافة أيقونة تحميل (spinner) هنا */}
            {/* مثال: <div className="spinner"></div> */}
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <p>الرجاء تحديث الصفحة أو المحاولة لاحقًا.</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-orders">
            <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No orders" />
            <p>لا توجد طلبات لعرضها في هذا التصنيف.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const statusInfo = getStatusDisplay(order.state); // الحصول على معلومات الحالة

            return (
              <div key={order._id} className="order-card">
                <div className="order-header" onClick={() => toggleOrderDetails(order._id)}>
                  <div className="order-info">
                    <span className="order-id">طلب # {order._id?.slice(-6).toUpperCase() || 'N/A'}</span>
                    <span className={`order-status ${statusInfo.className}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                  <div className="order-date-price">
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                    <span className="order-total">{order.totalOrderPrice || '0'} ج.م</span>
                  </div>
                  <div className="toggle-icon">
                    {expandedOrderId === order._id ? '▲' : '▼'}
                  </div>
                </div>

                {expandedOrderId === order._id && (
                  <div className="order-details">
                    <div className="details-section">
  <div className="shipping-address">
    <div className="shipping-address-header">
      <div className="shipping-address-icon">
        <i className="fas fa-map-marker-alt"></i>
      </div>
      <h4 className="shipping-address-title">عنوان الشحن</h4>
    </div>
    
    <div className="address-grid">
      <div className="address-field">
        <span className="address-label">الاسم الكامل</span>
        <p className="address-value">
          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
        </p>
      </div>
      
      <div className="address-field">
        <span className="address-label">العنوان</span>
        <p className="address-value">{order.shippingAddress.streetAddress}</p>
      </div>
      
      <div className="address-field">
        <span className="address-label">المنطقة/المدينة</span>
        <p className="address-value">
          {order.shippingAddress.area}, {order.shippingAddress.city}
        </p>
      </div>
      
      <div className="address-field">
        <span className="address-label">المحافظة/الدولة</span>
        <p className="address-value">
          {order.shippingAddress.state}, {order.shippingAddress.country}
        </p>
      </div>
      
      <div className="address-field">
        <span className="address-label">الرمز البريدي</span>
        <p className="address-value">{order.shippingAddress.postcode}</p>
      </div>
    </div>
    
    <div className="address-contact">
      <i className="fas fa-phone-alt contact-icon"></i>
      <p className="address-value">{order.shippingAddress.phone}</p>
    </div>
  </div>
</div>

                    <div className="details-section">
                      <h4>المنتجات</h4>
                      <div className="products-list">
                        {order.orderItems && order.orderItems.length > 0 ? (
                          order.orderItems.map((item, index) => (
                            <div key={item._id || index} className="product-item"> {/* استخدم item._id إذا كان متاحًا كمفتاح فريد */}
                              <img
                                src={item.image || 'https://via.placeholder.com/100'} // صورة افتراضية
                                alt={item.product?.title || 'Product Image'}
                                className="product-image"
                              />
                              <div className="product-info">
                                <h5>{item.product?.title || 'اسم المنتج غير متوفر'}</h5>
                                <p>الكمية: {item.quantity || 1}</p>
                                <p>السعر: {item.price || '0'} ج.م</p>
                                {item.product?.priceAfterDiscount && (
                                  <p className="discounted-price">السعر بعد الخصم: {item.product.priceAfterDiscount} ج.م</p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p>لا توجد منتجات في هذا الطلب.</p>
                        )}
                      </div>
                    </div>

                    <div className="order-summary">
                      <div className="summary-row"><span>إجمالي المنتجات:</span><span>{order.orderPrice || '0'} ج.م</span></div>
                      <div className="summary-row"><span>تكلفة التوصيل:</span><span>{order.delevary || '0'} ج.م</span></div>
                      <div className="summary-row total"><span>المبلغ الإجمالي:</span><span>{order.totalOrderPrice || '0'} ج.م</span></div>
                      <div className="summary-row"><span>طريقة الدفع:</span><span>{order.paymentType === 'cash' ? 'الدفع عند الاستلام' : order.paymentType === 'card' ? 'بطاقة ائتمانية' : 'غير محددة'}</span></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
   </div>
  );
}