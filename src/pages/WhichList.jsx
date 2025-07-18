import React, { useContext, useEffect, useState, useRef } from 'react';
import { FaHeart, FaRegHeart, FaShoppingCart, FaTimes } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // تأكد من استيراد Bootstrap
import toast from 'react-hot-toast';
import { whichlistContext } from '../context/WhichListcontext.jsx';
import { CartContext } from '../context/CartContext.jsx'; // استيراد CartContext لإضافة للسلة

export default function WhichList() {
    const { pathname } = useLocation();
    useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const nav = useNavigate();
  const { getAllWhichlistData, deletWhichData, setWhichlistProduct } = useContext(whichlistContext);
  const { addToCart, setCartCount } = useContext(CartContext); // جلب دالة addToCart من سياق السلة

  const [wishlistItems, setWishlistItems] = useState([]);
  const hasShownEmptyWishlistToast = useRef(false); // لمنع تكرار الـ toast عند الفراغ

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  async function fetchWishlistItems() {
    try {
      const { data } = await getAllWhichlistData();
      console.log("Wishlist data:", data); // للتحقق من هيكل البيانات

      if (data && data.wishlist && data.wishlist.length > 0) {
        setWishlistItems(data.wishlist);
        setWhichlistProduct(data.wishlist.length); // تحديث عدد المنتجات في السياق
        hasShownEmptyWishlistToast.current = false; // إعادة تعيين الـ toast
      } else {
        setWishlistItems([]);
        setWhichlistProduct(0); // تحديث عدد المنتجات إلى صفر
        if (!hasShownEmptyWishlistToast.current) {
          toast.error("قائمة أمنياتك فارغة.", {
            position: 'top-center',
            className: 'border border-danger notefection p-3 bg-white text-danger w-100 fw-bolder fs-4',
            duration: 800,
          });
          hasShownEmptyWishlistToast.current = true;
        }
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlistItems([]);
      setWhichlistProduct(0); // تحديث عدد المنتجات إلى صفر
      if (!hasShownEmptyWishlistToast.current) {
        toast.error("حدث خطأ أثناء تحميل قائمة أمنياتك.", {
          position: 'top-center',
          className: 'border border-danger notefection p-3 bg-white text-danger w-100 fw-bolder fs-4',
          duration: 800,
        });
        hasShownEmptyWishlistToast.current = true;
      }
    }
  }

  async function handleRemoveItem(productId) { // تغيير الاسم ليوضح أنه معرف المنتج
    try {
      let { data } = await deletWhichData(productId);
      console.log("Remove wishlist item response:", data);
      if (data.message === "success") {
        toast.success("تم حذف المنتج من قائمة الرغبات", {
          position: 'top-center',
          className: 'border border-danger p-3 bg-white text-danger w-100 fw-bolder fs-4',
          duration: 1000,
          icon: '👏'
        });
        fetchWishlistItems(); // إعادة جلب البيانات لتحديث العرض
      } else {
        toast.error("فشل في حذف المنتج من قائمة الرغبات.", {
          position: 'top-center',
          className: 'border border-danger p-3 bg-white text-danger w-100 fw-bolder fs-4',
          duration: 800,
        });
      }
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
      toast.error("حدث خطأ أثناء حذف المنتج.", {
        position: 'top-center',
        className: 'border border-danger p-3 bg-white text-danger w-100 fw-bolder fs-4',
        duration: 800,
      });
    }
  }

  async function handleAddToCart(productId) {
    try {
      const { data } = await addToCart(productId); // استدعاء دالة إضافة المنتج للسلة من السياق
      if (data.message === "success") {
        toast.success("تم إضافة المنتج إلى السلة بنجاح", {
          position: 'top-center',
          className: 'border border-success p-3 bg-white text-success w-100 fw-bolder fs-4',
          duration: 1000,
          icon: '👏'
        });
        setCartCount(data.numOfCartItems); // تحديث عدد المنتجات في السلة
        handleRemoveItem(productId); // إزالة المنتج من قائمة الرغبات بعد إضافته للسلة
      } else {
        toast.error(data.message || "فشل في إضافة المنتج إلى السلة.", {
          position: 'top-center',
          className: 'border border-danger p-3 bg-white text-danger w-100 fw-bolder fs-4',
          duration: 800,
        });
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error("حدث خطأ أثناء إضافة المنتج إلى السلة.", {
        position: 'top-center',
        className: 'border border-danger p-3 bg-white text-danger w-100 fw-bolder fs-4',
        duration: 800,
      });
    }
  }

  return (
    <div className="container py-4" dir="rtl">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">الرئيسية</Link></li>
          <p className='mx-2'>/</p>
          <li className="breadcrumb-item active" aria-current="page">قائمة الرغبات</li>
        </ol>
      </nav>

      <h2 className="mb-4 text-end">قائمة الرغبات</h2>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-5">
          <FaRegHeart className="text-muted mb-3" style={{ fontSize: '4em' }} />
          <h3 className="mb-2">قائمة أمنياتك فارغة</h3>
          <p className="text-muted mb-4">ليس لديك أي منتجات في قائمة أمنياتك بعد.</p>
          {/* زر "تصفح المنتجات" عندما تكون القائمة فارغة */}
          <Link to="/products" className="btn btn-primary">تصفح المنتجات</Link>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            {/* Display for PC (stacked vertically) - Hidden on small screens */}
            <div className="d-none d-lg-flex flex-column gap-3">
              {wishlistItems.map(item => (
                <div key={item._id} className="card mb-3 shadow-sm border-0">
                  <div className="row g-0 align-items-center">
                    <div className="col-md-3 col-sm-4">
                      <div className="position-relative">
                        <Link to={`/productDetel/${item._id}`}>
                          <img
                            src={item.imageCover || item.images?.[0] || 'placeholder.jpg'} // استخدام imageCover أو أول صورة
                            className="img-fluid rounded-start w-100"
                            alt={item.title || "Product Image"}
                            style={{ objectFit: 'cover', height: '150px' }}
                          />
                        </Link>
                        <button
                          className="btn btn-danger btn-sm position-absolute top-0 start-0 m-2 rounded-circle"
                          onClick={() => handleRemoveItem(item._id)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                    <div className="col-md-9 col-sm-8">
                      <div className="card-body text-end">
                        <h5 className="card-title mb-1">{item.title}</h5>
                        <p className="card-text text-muted mb-2 text-truncate" style={{ maxWidth: '400px', display: 'inline-block' }}>
                          {item.description}
                        </p>
                        <div className="d-flex justify-content-end align-items-center mb-3">
                          {item.priceAfterDiscount ? (
                            <>
                              <span className="fw-bold text-primary fs-5 me-2 mx-2 ">ج.م {item.priceAfterDiscount.toFixed(2)}</span>
                              <span className="text-muted text-decoration-line-through fs-6">ج.م {item.price.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="fw-bold text-primary fs-5 me-2">ج.م {item.price.toFixed(2)}</span>
                          )}
                        </div>
                        <div className="d-flex justify-content-end align-items-center gap-2">
                          {/* <button className="btn btn-success" onClick={() => handleAddToCart(item._id)}>
                            <FaShoppingCart className="ms-2" /> إضافة إلى السلة
                          </button> */}
                          <button className="btn btn-outline-danger" onClick={() => handleRemoveItem(item._id)}>
                            <FaHeart className="ms-2" /> إزالة من القائمة
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Display for Mobile (two items side-by-side) - Hidden on large screens */}
            <div className="d-lg-none row g-3">
              {wishlistItems.map(item => (
                <div key={item._id} className="col-6"> {/* Always 2 columns on small screens */}
                  <div className="card shadow-sm border-0 h-100"> {/* h-100 لتساوي ارتفاع البطاقات */}
                    <div className="position-relative">
                      <Link to={`/productDetel/${item._id}`}>
                        <img
                          src={item.imageCover || item.images?.[0] || 'placeholder.jpg'}
                          className="card-img-top rounded-top w-100"
                          alt={item.title || "Product Image"}
                          style={{ objectFit: 'cover', height: '150px' }}
                        />
                      </Link>
                      <button
                        className="btn btn-danger btn-sm position-absolute top-0 start-0 m-1 rounded-circle"
                        onClick={() => handleRemoveItem(item._id)}
                        style={{ width: '28px', height: '28px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FaTimes style={{ fontSize: '0.7em' }} />
                      </button>
                    </div>
                    <div className="card-body text-end p-2 d-flex flex-column">
                      <h6 className="card-title mb-1 text-truncate">{item.title}</h6>
                      {/* الوصف في الموبايل، يمكن حذفه إذا كان يسبب مشكلة في العرض */}
                     
                      <div className="d-flex justify-content-end align-items-center mb-2 mt-auto"> {/* mt-auto لدفع الأسعار والأزرار للأسفل */}
                        {item.priceAfterDiscount ? (
                          <>
                            <span className="fw-bold text-primary fs-6 me-1">ج.م {item.priceAfterDiscount.toFixed(2)}</span>
                            <span className="text-muted text-decoration-line-through" style={{ fontSize: '0.8em' }}>ج.م {item.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="fw-bold text-primary fs-6 me-1">ج.م {item.price.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="d-flex flex-column gap-2 mt-2">
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveItem(item._id)}>
                          <FaHeart className="ms-1" style={{ fontSize: '0.8em' }} /> إزالة
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* زر "أضف المزيد من المنتجات التي تعجبك" عندما تكون القائمة غير فارغة */}
            <div className="text-center text-lg-end mt-4">
              <Link to="/products" className="btn btn-outline-primary btn-lg fs-6">
                أضف المزيد من المنتجات التي تعجبك
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}