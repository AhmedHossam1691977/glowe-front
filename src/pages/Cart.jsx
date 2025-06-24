import React, { useState, useEffect, useContext } from 'react';
import { FaShoppingCart, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import toast from 'react-hot-toast';
import { CartContext } from '../context/CartContext.jsx';
import { io } from "socket.io-client";
import axios from 'axios';

export default function Cart() {
    let nav = useNavigate();
  const {
    getAllCartData,
    deletCartData,
    updateProductQuantany,
    setCartCount,
    CartCoupon
  } = useContext(CartContext);

  const [cartItems, setCartItems] = useState([]);
  const [totalCartPrice, setTotalCartPrice] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [cartId, setCartId] = useState(null); // State to store the cart ID

  // دالة لحساب السعر الإجمالي
  function calculateTotal(items) {
    return items.reduce((acc, item) => {
      // Add a check for item.product to ensure it's not null or undefined
      const product = item.product || {};
      const itemPrice = product.proceAfterDiscount || product.price;
      return acc + (itemPrice || 0) * item.quantity; // Ensure itemPrice is not undefined before multiplication
    }, 0);
  }

  async function fetchCartData() {
    try {
      const { data } = await getAllCartData();
      console.log(data);

      if (data && data.cart && data.cart.cartItems) {
        setCartItems(data.cart.cartItems);
        const total = calculateTotal(data.cart.cartItems);
        setTotalCartPrice(total);
        setCartId(data.cart._id); // Set the cart ID here

        if (data.cart.discount) {
          setDiscountPercentage(data.cart.discount);
          setIsCouponApplied(true);
        } else {
          setDiscountPercentage(0);
          setIsCouponApplied(false);
        }

        setCartCount(data.cart.cartItems.length);
      } else {
        setCartItems([]);
        setTotalCartPrice(0);
        setDiscountPercentage(0);
        setIsCouponApplied(false);
        setCartCount(0);
        setCartId(null); // Clear cart ID if cart is empty
      }
    } catch (error) {
      toast.error("ليس لديك أي منتجات في عربة التسوق بعد.", {
        position: 'top-center',
        className: 'border border-danger notefection  p-3 bg-white text-danger w-100 fw-bolder fs-4',
        duration: 2000,
      });
      setCartItems([]);
      setTotalCartPrice(0);
      setDiscountPercentage(0);
      setIsCouponApplied(false);
      setCartCount(0);
      setCartId(null);
    }
  }

  async function handleQuantityChange(id, quantity) {
    if (quantity < 1) {
      try {
        const { data } = await deletCartData(id);
        if (data.message === "success") {
          toast.success("تم حذف المنتج من السلة", {
              position: 'top-center',
        className: 'border border-danger  p-3 bg-white text-danger fw-bolder notefection fs-4 error',
        duration: 1000,
        icon: '👏'
          });
          fetchCartData();
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("حدث خطأ أثناء حذف المنتج.", {
          position: 'bottom-right',
          className: 'border border-danger p-3 bg-white text-danger fw-bolder notefection fs-4',
          duration: 1500,
        });
      }
      return;
    }

    try {
      const { data } = await updateProductQuantany(id, quantity);
      if (data.message === "success") {
        setCartItems(prevItems => {
          const updatedItems = prevItems.map(item =>
            item._id === id ? { ...item, quantity } : item
          );
          const newTotal = calculateTotal(updatedItems);
          setTotalCartPrice(newTotal);
          return updatedItems;
        });

        toast.success("تم تحديث الكمية بنجاح", {
          position: 'bottom-right',
          className: 'border border-success p-3 bg-white text-success fw-bolder notefection fs-5',
          duration: 1500,
        });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("حدث خطأ أثناء تحديث الكمية.", {
        position: 'bottom-right',
        className: 'border border-danger p-3 bg-white text-danger fw-bolder notefection fs-4',
        duration: 1500,
      });
    }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      toast.error("الرجاء إدخال كود الكوبون", {
        position: 'top-center',
        className: 'border border-danger p-3 bg-white text-danger fw-bolder notefection fs-4',
        duration: 2000,
      });
      return;
    }

    try {
      const { data } = await CartCoupon(couponCode);

      if (data.message === 'Coupon applied successfully') {
        setDiscountPercentage(data.discount);
        setIsCouponApplied(true);

        fetchCartData();

        toast.success("تم تطبيق الكوبون بنجاح", {
          position: 'top-center',
          className: 'border border-success p-3 bg-white text-success fw-bolder notefection fs-4',
          duration: 2000,
        });
      } else {
        console.log("Coupon application failed:", data.message);

        toast.error(data.message || "قسيمة غير صالحة أو منتهية الصلاحية", {
          position: 'top-center',
          className: 'border border-danger p-3 bg-white text-danger fw-bolder notefection fs-4',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("قسيمة غير صالحة أو منتهية الصلاحية", {
        position: 'top-center',
        className: 'border border-danger p-3 bg-white text-danger fw-bolder notefection fs-4',
        duration: 2000,
      });
    }
  }

  useEffect(() => {
    const socket = io("https://final-pro-api-j1v7.onrender.com", {
      auth: {
        token: localStorage.getItem("token")
      },
    });

    socket.on("connect", () => {
      console.log("Connected to server via socket");
    });

    socket.on("distance_calculated", (data) => {
      setDeliveryCost(data.deliveryCost);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchCartData();
  }, []);

  // حساب الخصم الحالي والقيمة بعد الخصم
  const currentDiscount = isCouponApplied ? (totalCartPrice * (discountPercentage / 100)) : 0;
  const totalAfterDiscount = totalCartPrice - currentDiscount;


  async function creatCashOrder() {
    console.log(cartId ,`${deliveryCost + 5}` , localStorage.getItem("token"));
    
    if (!cartId) {
      toast.error("لا يمكن متابعة الدفع: لم يتم العثور على معرف سلة التسوق.", {
        position: 'top-center',
        className: 'border border-danger p-3 bg-white text-danger fw-bolder notefection fs-4',
        duration: 3000,
      });
      return;
    }

    try {
      const { data } = await axios.post(
        `https://final-pro-api-j1v7.onrender.com/api/v1/order/${cartId}`,
        { delevary: Number(deliveryCost) }, // Pass deliveryCost as an object
        {
          headers: {
            'token': localStorage.getItem("token")
          }
        }
      );
      console.log("Order creation response:", data);
      
      console.log(data);
      if (data.message === 'success') {
        toast.success("تم إنشاء طلب الدفع بنجاح!", {
          position: 'top-center',
          className: 'border border-danger  p-3 bg-white text-success fw-bolder notefection fs-4',
          duration: 2000,
        });
         
     
      nav("/products");
      setCartCount(0);
    
      } else {
        toast.error("فشل في إنشاء طلب الدفع. الرجاء المحاولة مرة أخرى.", {
          position: 'top-center',
          className: 'border border-danger p-3 bg-white text-danger fw-bolder notefection fs-4',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error creating cash order:", error);
      toast.error("حدث خطأ أثناء محاولة إنشاء طلب الدفع.", {
        position: 'top-center',
        className: 'border border-danger p-3 bg-white text-danger fw-bolder notefection fs-4',
        duration: 3000,
      });
    }
  }


  return (
    <div className="container py-4" dir="rtl">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">الرئيسية</Link></li>
          <p className='mx-2'>/</p>
          <li className="breadcrumb-item active" aria-current="page">عربة التسوق</li>
        </ol>
      </nav>

      <h2 className="mb-4 text-end">عربة التسوق</h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <FaShoppingCart className="text-muted mb-3" style={{ fontSize: '4em' }} />
          <h3 className="mb-2">عربة التسوق فارغة</h3>
          <p className="text-muted mb-4">ليس لديك أي منتجات في عربة التسوق بعد.</p>
          <Link to="/products" className="btn btn-primary">تصفح المنتجات</Link>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-8">
            <div className="d-flex flex-column gap-3">
              {cartItems.map(item => (
                // استخدام item._id كمفتاح إذا لم يكن item.product موجودًا
                <div key={item._id} className="card mb-3 shadow-sm border-0">
                  <div className="row g-0 align-items-center">
                    <div className="col-md-3 col-sm-4">
                      <div className="position-relative">
                        <img
                          src={item.image || item.product?.images?.[0] || item.product?.imgCover} // التعديل هنا: الأولوية لـ item.image
                          className="img-fluid rounded-start w-100"
                          alt={item.product?.title || "Product Image"} // Fallback for alt text
                          style={{ objectFit: 'cover', height: '150px' }}
                        />
                        <button
                          className="btn btn-danger btn-sm position-absolute top-0 start-0 m-2 rounded-circle"
                          onClick={() => handleQuantityChange(item._id, 0)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                    <div className="col-md-9 col-sm-8">
                      <div className="card-body text-end">
                        <h5 className="card-title mb-1">{item.product?.title}</h5>
                        <p className="card-text text-muted mb-2" style={{ fontSize: '0.9em' }}>{item.product?.description}</p>
                        <div className="d-flex justify-content-end align-items-center mb-2">
                          {item.product?.proceAfterDiscount ? (
                            <>
                              <span className="fw-bold text-primary fs-5 me-2 mx-2 ">ج.م {item.product.proceAfterDiscount.toFixed(2)}</span>
                              <span className="text-muted text-decoration-line-through fs-6">ج.م {item.product.price.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="fw-bold text-primary fs-5 me-2">ج.م {item.product?.price.toFixed(2)}</span>
                          )}
                        </div>
                        <div className="d-flex justify-content-end align-items-center">
                          <div className="btn-group" role="group" aria-label="Quantity controls">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            >
                              <FaMinus />
                            </button>
                            <span className="btn btn-light px-3 disabled">{item.quantity}</span>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            >
                              <FaPlus />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-4 mt-4 mt-lg-0">
            <div className="card shadow-sm border-0">
              <div className="card-body text-end">
                <h4 className="card-title mb-3 pb-2 border-bottom">ملخص الطلب</h4>
                <div className="d-flex justify-content-between mb-2">
                  <span>المجموع الفرعي:</span>
                  <span className="fw-bold">ج.م {totalCartPrice.toFixed(2)}</span>
                </div>

                {isCouponApplied && (
                  <>
                    <div className="d-flex justify-content-between mb-2">
                      <span>الخصم ({discountPercentage}%):</span>
                      <span className="fw-bold text-danger">- ج.م {currentDiscount.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>المجموع بعد الخصم:</span>
                      <span className="fw-bold">ج.م {totalAfterDiscount.toFixed(2)}</span>
                    </div>
                  </>
                )}

                <div className="d-flex justify-content-between mb-2">
                  <span>سعر التوصيل:</span>
                  <span className="fw-bold">ج.م {deliveryCost.toFixed(2)}</span>
                </div>

                <div className="mb-3 my-5">
                  <label htmlFor="couponCode" className="form-label d-block text-end">هل لديك كوبون؟</label>
                  <div className="input-group">
                    <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={handleApplyCoupon}>تطبيق</button>
                    <input
                      type="text"
                      className="form-control text-end mx-3"
                      placeholder="أدخل الكوبون هنا"
                      aria-label="أدخل الكوبون هنا"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                  </div>
                </div>

                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <span className="fs-5 fw-bold">الإجمالي:</span>
                  <span className="fs-5 fw-bold text-primary">
                    ج.م {(totalAfterDiscount + deliveryCost).toFixed(2)}
                  </span>
                </div>
                <button onClick={() => creatCashOrder()} className="btn btn-success w-100 btn-lg mb-2">المتابعة للدفع</button>
                <Link to="/mapBox" className="btn btn-outline-primary w-100 btn-lg">تعديل العنوان</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}