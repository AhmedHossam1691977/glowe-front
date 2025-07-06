import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext.jsx';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { io } from "socket.io-client";
import axios from 'axios';

export default function CreatCashOrder() {
  const { id } = useParams();
  const basUrl = "https://final-pro-api-j1v7.onrender.com";
  const nav =useNavigate();
  const {
    getAllCartData,
    setCartCount
  } = useContext(CartContext);

  const [cartDetails, setCartDetails] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [errorCart, setErrorCart] = useState(null);
  const [deliveryCost, setDeliveryCost] = useState(0);

  const [governoratesList, setGovernoratesList] = useState([]);
  const [loadingGovernorates, setLoadingGovernorates] = useState(true);
  // حالة جديدة لتخزين مناطق المحافظة المختارة
  const [selectedGovernorateAreas, setSelectedGovernorateAreas] = useState([]);


  const socketRef = useRef(null);

  async function fetchCartData() {
    setLoadingCart(true);
    try {
      const { data } = await getAllCartData();
      
      if (data && data.cart && data.cart.cartItems && data.cart.cartItems.length > 0) {
        setCartDetails(data.cart);
        if (data.cart.deliveryCost !== undefined && data.cart.deliveryCost !== null) {
            setDeliveryCost(data.cart.deliveryCost);
        }
      } else {
        setCartDetails(null);
        setErrorCart("عربة التسوق فارغة أو لا يمكن العثور عليها.");
        toast.error("عربة التسوق فارغة، لا يمكن إتمام الطلب.", { position: 'top-center' });
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
      setErrorCart("حدث خطأ أثناء جلب بيانات عربة التسوق.");
      toast.error("فشل في جلب بيانات سلة التسوق.", { position: 'top-center' });
    } finally {
      setLoadingCart(false);
    }
  }

  async function fetchGovernorates() {
    setLoadingGovernorates(true);
    try {
      const { data } = await axios.get(`${basUrl}/api/v1/counties`);
      if (data && data.governorates) {
        setGovernoratesList(data.governorates);
      } else {
        console.error("لم يتم العثور على بيانات المحافظات.");
        setGovernoratesList([]);
      }
    } catch (error) {
      console.error("خطأ في جلب المحافظات:", error);
      toast.error("فشل في جلب قائمة المحافظات.", { position: 'top-center' });
      setGovernoratesList([]);
    } finally {
      setLoadingGovernorates(false);
    }
  }

  useEffect(() => {
    fetchCartData();
    fetchGovernorates();

    const socket = io(basUrl, {
      auth: {
        token: localStorage.getItem("token")
      },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to server via socket for delivery price.");
    });

    socket.on("delivery_price_calculated", (data) => {
      
      if (data.success) {
        setDeliveryCost(data.deliveryCost);
        toast.success(`تم حساب تكلفة التوصيل: ج.م ${data.deliveryCost.toFixed(2)}`, { position: 'top-center' });
      } else {
        setDeliveryCost(0);
        toast.error(data.message || "حدث خطأ أثناء حساب تكلفة التوصيل.", { position: 'top-center' });
      }
    });

    socket.on("error", (data) => {
      console.error("Socket error:", data.message);
      toast.error(`خطأ من السيرفر: ${data.message}`, { position: 'top-center' });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected for delivery price.");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [basUrl]);

  const calculateSubtotal = () => {
    if (!cartDetails || !cartDetails.cartItems) return 0;
    return cartDetails.cartItems.reduce((acc, item) => {
      const productPrice = item.product?.priceAfterDiscount || item.product?.price || 0;
      return acc + (productPrice * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discountAmount = cartDetails && cartDetails.discount
    ? (subtotal * (cartDetails.discount / 100))
    : 0;
  const totalAfterDiscount = subtotal - discountAmount;
  const grandTotal = totalAfterDiscount + deliveryCost;

  const validationSchema = Yup.object({
    firstName: Yup.string().required("الاسم الأول مطلوب"),
    lastName: Yup.string().required("اسم العائلة مطلوب"),
    streetAddress: Yup.string().required("عنوان الشارع مطلوب"),
    townCity: Yup.string().required("المدينة مطلوبة"),
    stateCounty: Yup.string().required("المحافظة مطلوبة").notOneOf([""], "الرجاء اختيار محافظة"),
    areaOptional: Yup.string(),
    postcodeZip: Yup.string(),
    phone: Yup.string()
      .required("رقم الهاتف مطلوب")
      .matches(/^01[0125][0-9]{8}$/, "يرجى إدخال رقم هاتف مصري صحيح (يبدأ بـ 01 ويليه 9 أرقام)"),
  });

  async function creatCashOrder(shippingAddress, cartInfo, finalDeliveryCost) {
    console.log("Creating cash order with cart ID:", id);
    console.log("Shipping Address:", shippingAddress);
    console.log("Cart Information:", cartInfo);
    console.log("Final Delivery Cost:", finalDeliveryCost);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("الرجاء تسجيل الدخول لإتمام الطلب.", { position: 'top-center' });
        return;
      }

     const orderData = {
    shippingAddress: {
        streetAddress: shippingAddress.streetAddress, // تم تغيير details إلى address
        city: shippingAddress.townCity,
        phone: shippingAddress.phone,
        postcode: shippingAddress.postcodeZip,
        country: "مصر",
        state: shippingAddress.stateCounty, // تم تغيير governorate إلى gov
        area: shippingAddress.areaOptional, // تم تغيير area إلى region
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
    },
   
    // totalOrderPrice: grandTotal, 
    delevary: finalDeliveryCost, 
};
      console.log("Order Data to be sent:", orderData);
      
      const { data } = await axios.post(
        `${basUrl}/api/v1/order/${id}`, 
        orderData,
        {
          headers: {
            token: token,
          },
        }
      );
      console.log("Response from create cash order:", data);
      
      if (data.message === 'success') {
        setCartCount(0)
        nav("/products");
        toast.success("تم إنشاء طلب الدفع النقدي بنجاح!", { position: 'top-center' });
        // يمكنك هنا إعادة توجيه المستخدم لصفحة تأكيد الطلب أو مسح السلة
      } else {
        toast.error(data.message || "فشل في إنشاء طلب الدفع النقدي.", { position: 'top-center' });
      }

    } catch (error) {
      console.error("Error creating cash order:", error.response ? error.response.data : error.message);
      toast.error(error.response?.data?.message || "حدث خطأ أثناء محاولة إنشاء الطلب النقدي.", { position: 'top-center' });
    }
  }

  async function onSubmit(values) {
    await creatCashOrder(values, cartDetails, deliveryCost);
  }

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      streetAddress: '',
      townCity: '',
      stateCounty: '',
      areaOptional: '',
      postcodeZip: '',
      phone: '',
    },
    validationSchema,
    onSubmit,
  });

  // دالة مخصصة لمعالجة تغيير المحافظة وتحديث قائمة المناطق
  const handleStateCountyChange = (e) => {
    formik.handleChange(e); // تحديث Formik state أولاً
    const selectedGovernorateName = e.target.value;
    
    // البحث عن المحافظة المختارة في قائمة المحافظات الكاملة
    const selectedGov = governoratesList.find(
      (governorate) => governorate.name === selectedGovernorateName
    );

    if (selectedGov) {
      setSelectedGovernorateAreas(selectedGov.areas); // تحديث المناطق المتاحة
      if (socketRef.current) {
        socketRef.current.emit("request_delivery_price", { governorateName: selectedGovernorateName });
        console.log("Emitting request_delivery_price for:", selectedGovernorateName);
      }
    } else {
      setSelectedGovernorateAreas([]); // مسح المناطق إذا لم يتم اختيار محافظة
      setDeliveryCost(0); // إعادة تعيين تكلفة التوصيل
    }
    // إعادة تعيين قيمة المنطقة الاختيارية عند تغيير المحافظة
    formik.setFieldValue('areaOptional', ''); 
  };


  return (
    <div className="container py-5" dir="rtl">
      <h2 className="mb-4 text-end">تفاصيل الشحن والدفع</h2>

      <form onSubmit={formik.handleSubmit}>
        <div className="row">
          <div className="col-lg-7">
            <h4 className="mb-3 text-end">تفاصيل الشحن</h4>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label htmlFor="firstName" className="form-label text-end w-100">
                  الاسم الأول <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control text-end"
                  id="firstName"
                  name="firstName"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.firstName}
                  required
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <p className="text-danger my-1">{formik.errors.firstName}</p>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="lastName" className="form-label text-end w-100">
                  اسم العائلة <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control text-end"
                  id="lastName"
                  name="lastName"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.lastName}
                  required
                />
                {formik.touched.lastName && formik.errors.lastName && (
                  <p className="text-danger my-1">{formik.errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="countryRegion" className="form-label text-end w-100">
                الدولة / المنطقة <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control text-end"
                id="countryRegion"
                value="مصر"
                readOnly
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="streetAddress" className="form-label text-end w-100">
                عنوان الشارع <span className="text-danger">*</span>
                <small className="form-text text-muted d-block">(رقم المنزل واسم الشارع)</small>
              </label>
              <input
                type="text"
                className="form-control text-end"
                id="streetAddress"
                name="streetAddress"
                placeholder="رقم المنزل واسم الشارع"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.streetAddress}
                required
              />
              {formik.touched.streetAddress && formik.errors.streetAddress && (
                <p className="text-danger my-1">{formik.errors.streetAddress}</p>
              )}
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label htmlFor="townCity" className="form-label text-end w-100">
                  المدينة / البلدة <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control text-end"
                  id="townCity"
                  name="townCity"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.townCity}
                  required
                />
                {formik.touched.townCity && formik.errors.townCity && (
                  <p className="text-danger my-1">{formik.errors.townCity}</p>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="stateCounty" className="form-label text-end w-100">
                  المحافظة / المقاطعة <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select text-end"
                  id="stateCounty"
                  name="stateCounty"
                  onChange={handleStateCountyChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.stateCounty}
                  required
                >
                  <option value="">اختر خيار...</option>
                  {loadingGovernorates ? (
                    <option disabled>جارٍ تحميل المحافظات...</option>
                  ) : (
                    governoratesList.map((governorate) => (
                      <option key={governorate._id} value={governorate.name}>
                        {governorate.name}
                      </option>
                    ))
                  )}
                </select>
                {formik.touched.stateCounty && formik.errors.stateCounty && (
                  <p className="text-danger my-1">{formik.errors.stateCounty}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="areaOptional" className="form-label text-end w-100">
                المنطقة (اختياري)
              </label>
              <select
                className="form-select text-end"
                id="areaOptional"
                name="areaOptional"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.areaOptional}
                // تعطيل القائمة إذا لم يتم اختيار محافظة أو لا توجد مناطق
                disabled={selectedGovernorateAreas.length === 0} 
              >
                <option value="">اختر خيار...</option>
                {/* عرض المناطق بناءً على المحافظة المختارة */}
                {selectedGovernorateAreas.map((area, index) => (
                  <option key={index} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              {formik.touched.areaOptional && formik.errors.areaOptional && (
                <p className="text-danger my-1">{formik.errors.areaOptional}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="postcodeZip" className="form-label text-end w-100">
                الرمز البريدي (اختياري)
              </label>
              <input
                type="text"
                className="form-control text-end"
                id="postcodeZip"
                name="postcodeZip"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.postcodeZip}
              />
              {formik.touched.postcodeZip && formik.errors.postcodeZip && (
                <p className="text-danger my-1">{formik.errors.postcodeZip}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="form-label text-end w-100">
                رقم الهاتف <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                className="form-control text-end"
                id="phone"
                name="phone"
                placeholder="مثال: 01XXXXXXXXX"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.phone}
                required
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-danger my-1">{formik.errors.phone}</p>
              )}
            </div>
          </div>

          <div className="col-lg-5 mt-5 mt-lg-0">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h4 className="card-title mb-4 pb-2 border-bottom text-end">طلبك</h4>

                {loadingCart ? (
                  <div className="text-center">جارٍ تحميل تفاصيل السلة...</div>
                ) : errorCart ? (
                  <div className="alert alert-danger text-center">{errorCart}</div>
                ) : (
                  <table className="table table-borderless text-end">
                    <thead>
                      <tr>
                        <th className="text-end">المنتج</th>
                        <th className="text-end">المجموع الفرعي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartDetails && cartDetails.cartItems.map((item) => (
                        <tr key={item._id}>
                          <td>
                            {item.product?.title} <span className="text-muted">× {item.quantity}</span>
                          </td>
                          <td>
                            ج.م {((item.product?.priceAfterDiscount || item.product?.price) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td><strong className="text-primary">المجموع الفرعي</strong></td>
                        <td><strong className="text-primary">ج.م {subtotal.toFixed(2)}</strong></td>
                      </tr>
                      {cartDetails && cartDetails.discount > 0 && (
                        <tr>
                          <td>الخصم ({cartDetails.discount}%)</td>
                          <td>- ج.م {discountAmount.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr>
                        <td>الشحن</td>
                        <td>
                          {deliveryCost > 0
                            ? `ج.م ${deliveryCost.toFixed(2)}`
                            : 'أدخل عنوانك لعرض خيارات الشحن'}
                        </td>
                      </tr>
                      <tr className="border-top fw-bold fs-5">
                        <td>الإجمالي:</td>
                        <td>ج.م {grandTotal.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={!(formik.isValid && formik.dirty)}
          >
            إتمام الطلب
          </button>
        </div>
      </form>
    </div>
  );
}