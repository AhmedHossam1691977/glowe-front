import React, { useState, useEffect, useContext, useRef } from 'react';
import { FaShoppingCart, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import toast from 'react-hot-toast';
import { CartContext } from '../context/CartContext.jsx';
// تم إزالة استيراد axios لأنه لن يتم استخدامه مباشرة هنا للدفع

export default function Cart() {
    const { pathname } = useLocation();
    useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  let nav = useNavigate();
  const {
    getAllCartData,
    deletCartData,
    updateProductQuantany,
    setCartCount,
    CartCoupon,
    deletAllCartData
  } = useContext(CartContext);

  const [cartItems, setCartItems] = useState([]);
  const [totalCartPrice, setTotalCartPrice] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [cartId, setCartId] = useState(null);

  const hasShownEmptyCartToast = useRef(false);

  function calculateTotal(items) {
    return items.reduce((acc, item) => {
      const product = item.product || {};
      const itemPrice = product.priceAfterDiscount || product.price;
      return acc + (itemPrice || 0) * item.quantity;
    }, 0);
  }

  async function fetchCartData() {
    try {
      const { data } = await getAllCartData();
      console.log("Cart Data:", data);
      
      if (data && data.cart && data.cart.cartItems && data.cart.cartItems.length > 0) {
        setCartItems(data.cart.cartItems);
        const total = calculateTotal(data.cart.cartItems);
        setTotalCartPrice(total);
        setCartId(data.cart._id);

        if (data.cart.discount) {
          setDiscountPercentage(data.cart.discount);
          setIsCouponApplied(true);
        } else {
          setDiscountPercentage(0);
          setIsCouponApplied(false);
        }

        setCartCount(data.cart.cartItems.length);
        hasShownEmptyCartToast.current = false;
      } else {
        setCartItems([]);
        setTotalCartPrice(0);
        setDiscountPercentage(0);
        setIsCouponApplied(false);
        setCartCount(0);
        setCartId(null);

        if (!hasShownEmptyCartToast.current) {
          toast.error("ليس لديك أي منتجات في عربة التسوق بعد.", {
            position: 'top-center',
            className: 'border border-danger notefection p-3 bg-white text-danger w-100 fw-bolder fs-4',
            duration: 800,
          });
          hasShownEmptyCartToast.current = true;
        }
      }
    } catch (error) {
      setCartItems([]);
      setTotalCartPrice(0);
      setDiscountPercentage(0);
      setIsCouponApplied(false);
      setCartCount(0);
      setCartId(null);

      if (!hasShownEmptyCartToast.current) {
        toast.error("ليس لديك أي منتجات في عربة التسوق بعد.", {
          position: 'top-center',
          className: 'border border-danger notefection p-3 bg-white text-danger w-100 fw-bolder fs-4',
          duration: 800,
        });
        hasShownEmptyCartToast.current = true;
      }
    }
  }

  async function handleQuantityChange(id, quantity) {
    if (quantity < 1) {
      try {
        const { data } = await deletCartData(id);
        if (data.message === "success") {
          toast.success("تم حذف المنتج من السلة", {
            position: 'top-center',
            className: 'border border-danger p-3 bg-white text-danger fw-bolder notefection fs-4 error',
            duration: 800,
            icon: '👏'
          });
          fetchCartData();
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("حدث خطأ أثناء حذف المنتج.", {
          position: 'bottom-right',
          className: 'border border-danger p-3 bg-white text-danger fw-bolder notefection fs-4',
          duration: 800,
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
          duration: 800,
        });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("حدث خطأ أثناء تحديث الكمية.", {
        position: 'bottom-right',
        className: 'border border-danger p-3 bg-white text-danger fw-bolder notefection fs-4',
        duration: 800,
      });
    }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      toast.error("الرجاء إدخال كود الكوبون", {
        position: 'top-center',
        className: 'border border-danger p-3 bg-white text-danger fw-bolder fs-4',
        duration: 800,
      });
      return;
    }

    try {
      const { data } = await CartCoupon(couponCode);

      if (data.message === 'Coupon applied successfully') {
        setDiscountPercentage(data.discount);
        setIsCouponApplied(true);

        fetchCartData(); // Re-fetch cart data to apply discount visually

        toast.success("تم تطبيق الكوبون بنجاح", {
          position: 'top-center',
          className: 'border border-success p-3 bg-white text-success fw-bolder notefection fs-4',
          duration: 800,
        });
      } else {
        toast.error(data.message || "قسيمة غير صالحة أو منتهية الصلاحية", {
          position: 'top-center',
          className: 'border border-danger p-3 bg-white text-danger fw-bolder notefection fs-4',
          duration: 800,
        });
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("قسيمة غير صالحة أو منتهية الصلاحية", {
        position: 'top-center',
        className: 'border border-danger p-3 bg-white text-danger fw-bolder notefection fs-4',
        duration: 800,
      });
    }
  }

  async function clearEntireCart() {
    try {
      const { data } = await deletAllCartData();

      if (data.message === "success") {
        toast.success("تم مسح سلة التسوق بالكامل بنجاح!", {
          position: 'top-center',
          className: 'border border-danger p-3 bg-white text-success fw-bolder notefection fs-4',
          duration: 1500,
        });
        setCartItems([]);
        setTotalCartPrice(0);
        setDiscountPercentage(0);
        setIsCouponApplied(false);
        setCartCount(0);
        setCartId(null);
        nav("/products");
      } else {
        toast.error("فشل في مسح سلة التسوق. الرجاء المحاولة مرة أخرى.", {
          position: 'top-center',
          className: 'border border-danger p-3 bg-white text-danger fw-bolder notefection fs-4',
          duration: 1500,
        });
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("حدث خطأ أثناء محاولة مسح سلة التسوق.", {
        position: 'top-center',
        className: 'border border-danger p-3 bg-white text-danger fw-bolder notefection fs-4',
        duration: 1500,
      });
    }
  }

  useEffect(() => {
    fetchCartData();
  }, []);

  const currentDiscount = isCouponApplied ? (totalCartPrice * (discountPercentage / 100)) : 0;
  const totalAfterDiscount = totalCartPrice - currentDiscount;

  // دالة التوجيه لصفحة الدفع
  function handleProceedToCheckout() {
    if (!cartId) {
      toast.error("لا يمكن المتابعة للدفع: لم يتم العثور على معرف سلة التسوق.", {
        position: 'top-center',
        className: 'border border-danger p-3 bg-white text-danger fw-bolder fs-4',
        duration: 800,
      });
      return;
    }
    // التوجيه إلى صفحة الدفع مع تمرير cartId في المسار
    nav(`/checkout/${cartId}`);
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
            {/* Display for PC (stacked vertically) - Hidden on small screens */}
            <div className="d-none d-lg-flex flex-column gap-3">
              {cartItems.map(item => (
                <div key={item._id} className="card mb-3 shadow-sm border-0">
                  <div className="row g-0 align-items-center">
                    <div className="col-md-3 col-sm-4">
                      <div className="position-relative">
                        <Link to={`/productDetel/${item.product?._id}`}>
                          <img
                            src={item.image || item.product?.images?.[0] || item.product?.imgCover}
                            className="img-fluid rounded-start w-100"
                            alt={item.product?.title || "Product Image"}
                            style={{ objectFit: 'cover', height: '150px' }}
                          />
                        </Link>
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
                        <div className="d-flex justify-content-end align-items-center mb-2">
                          {item.product?.priceAfterDiscount ? (
                            <>
                              <span className="fw-bold text-primary fs-5 me-2 mx-2 ">ج.م {item.product.priceAfterDiscount.toFixed(2)}</span>
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

            {/* Display for Mobile (two items side-by-side) - Hidden on large screens */}
            <div className="d-lg-none row g-3">
              {cartItems.map(item => (
                <div key={item._id} className="col-6">
                  <div className="card shadow-sm border-0">
                    <div className="position-relative">
                      <Link to={`/productDetel/${item.product?._id}`}>
                        <img
                          src={item.image || item.product?.images?.[0] || item.product?.imgCover}
                          className="card-img-top rounded-top w-100"
                          alt={item.product?.title || "Product Image"}
                          style={{ objectFit: 'cover', height: '150px' }}
                        />
                      </Link>
                      <button
                        className="btn btn-danger btn-sm position-absolute top-0 start-0 m-1 rounded-circle"
                        onClick={() => handleQuantityChange(item._id, 0)}
                        style={{ width: '28px', height: '28px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FaTimes style={{ fontSize: '0.7em' }} />
                      </button>
                    </div>
                    <div className="card-body text-end p-2">
                      <h6 className="card-title mb-1 text-truncate">{item.product?.title}</h6>
                      <div className="d-flex justify-content-end align-items-center mb-2">
                        {item.product?.priceAfterDiscount ? (
                          <>
                            <span className="fw-bold text-primary fs-6 me-1">ج.م {item.product.priceAfterDiscount.toFixed(2)}</span>
                            <span className="text-muted text-decoration-line-through" style={{ fontSize: '0.8em' }}>ج.م {item.product.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="fw-bold text-primary fs-6 me-1">ج.م {item.product?.price.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="d-flex justify-content-end align-items-center">
                        <div className="btn-group btn-group-sm" role="group" aria-label="Quantity controls">
                          <button
                            type="button"
                            className="btn btn-outline-secondary py-1 px-2"
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          >
                            <FaMinus style={{ fontSize: '0.7em' }} />
                          </button>
                          <span className="btn btn-light px-2 disabled" style={{ fontSize: '0.8em' }}>{item.quantity}</span>
                          <button
                            type="button"
                            className="btn btn-outline-secondary py-1 px-2"
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          >
                            <FaPlus style={{ fontSize: '0.7em' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center text-lg-end mt-4">
              <button
                onClick={clearEntireCart}
                className="btn btn-outline-danger btn-lg"
                disabled={cartItems.length === 0}
              >
                مسح السلة بالكامل <FaTimes className="ms-2" />
              </button>
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
                  </>
                )}

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
                    ج.م {totalAfterDiscount.toFixed(2)}
                  </span>
                </div>
                <button onClick={handleProceedToCheckout} className="btn btn-success w-100 btn-lg mb-2">المتابعة للدفع</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}