// src/components/LoginPopup.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { whichlistContext } from "../context/WhichListcontext.jsx";
import { BsCartCheckFill } from "react-icons/bs";
import { AiOutlineEye } from "react-icons/ai";
import { CartContext } from "../context/CartContext.jsx";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import axios from "axios";
import toast from "react-hot-toast";
import { FaChevronLeft } from "react-icons/fa6";
// import LoginPopup from "./LoginPopup.jsx"; // <--- تم إزالة هذا الاستيراد

export default function OffersMini() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const [discountedProducts, setDiscountedProducts] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [activeSlideIndices, setActiveSlideIndices] = useState({});
    // const [showLoginPopup, setShowLoginPopup] = useState(false); // <--- تم إزالة هذه الحالة

    // حالة تسجيل الدخول المحلية لهذا المكون
    const [isLoggedIn, setIsLoggedIn] = useState(false); // <--- تم تعريف isLoggedIn هنا

    const basUrl = "https://final-pro-api-j1v7.onrender.com";
    const { addWishlist, deletWhichData, getAllWhichlistData } = useContext(whichlistContext);
    const { addCart, setCartCount } = useContext(CartContext);

    // دالة للتحقق من وجود التوكن في localStorage
    const checkLoginStatus = () => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    };

    useEffect(() => {
        // تحقق من حالة تسجيل الدخول عند تحميل المكون
        checkLoginStatus();
        // أضف مستمع لحدث التخزين لتحديث الحالة إذا تغير التوكن في tab آخر
        window.addEventListener('storage', checkLoginStatus);
        return () => {
            window.removeEventListener('storage', checkLoginStatus);
        };
    }, []); // تشغيل مرة واحدة عند التحميل


    useEffect(() => {
        fetchDiscountedProducts();
        // عندما تتغير حالة تسجيل الدخول، أعد جلب قائمة الأمنيات
        if (isLoggedIn) {
            fetchWishlist();
        } else {
            setWishlistItems([]); // مسح قائمة الأمنيات إذا لم يكن المستخدم مسجلاً للدخول
        }
    }, [isLoggedIn]); // <--- إضافة isLoggedIn هنا

    async function fetchDiscountedProducts() {
        try {
            const { data } = await axios.get(`${basUrl}/api/v1/product`);
            const productsWithDiscount = data.product
                .filter(product => product.priceAfterDiscount)
                .slice(0, 7);
            setDiscountedProducts(productsWithDiscount);
            const initialActiveSlides = {};
            productsWithDiscount.forEach(p => {
                initialActiveSlides[p._id] = 0;
            });
            setActiveSlideIndices(initialActiveSlides);
        } catch (error) {
            console.error("Error fetching discounted products:", error);
        }
    }

    async function fetchWishlist() {
        try {
            // تحقق إضافي هنا قبل محاولة جلب البيانات الحساسة
            if (!isLoggedIn) return; // لا تجلب قائمة الأمنيات إذا لم يكن هناك توكن

            const { data } = await getAllWhichlistData();
            setWishlistItems(data?.wishlist || []);
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            // قد ترغب في مسح الـ wishlistItems هنا أيضًا في حالة وجود خطأ
            setWishlistItems([]);
        }
    }

    async function toggleWishlist(id) {
        if (!isLoggedIn) {
            toast.error("يرجى تسجيل الدخول أولاً لإدارة قائمة المفضلة.", { duration: 2000 });
            // setShowLoginPopup(true); // <--- تم إزالة هذا السطر
            return;
        }
        try {
            if (isInWishlist(id)) {
                const { data } = await deletWhichData(id);
                if (data.message === "success") {
                    toast.success("تم الإزالة من المفضلة", { duration: 1000 });
                }
            } else {
                const { data } = await addWishlist(id);
                if (data.message === "success") {
                    toast.success("تم الإضافة إلى المفضلة", { duration: 1000 });
                }
            }
            fetchWishlist();
        } catch (error) {
            console.error("Error updating wishlist:", error);
            toast.error("حدث خطأ أثناء تحديث قائمة المفضلة.");
        }
    }

    const isInWishlist = (productId) =>
        wishlistItems.some((item) => item._id === productId);

    async function handleAddToCart(id, productImages, slideIndex) {
        if (!isLoggedIn) {
            toast.error("يرجى تسجيل الدخول أولاً لإضافة المنتج إلى السلة.", { duration: 2000 });
            // setShowLoginPopup(true); // <--- تم إزالة هذا السطر
            return;
        }

        try {
            const imageToUse = productImages[slideIndex];
            const { data } = await addCart(id, imageToUse);
            if (data.message === "success") {
                setCartCount(data.cartItems);
                toast.success("تمت الإضافة إلى السلة", { duration: 1000 });
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error("حدث خطأ أثناء الإضافة إلى السلة");
        }
    }

    const productSwiperSettings = (productId) => ({
        modules: [Pagination],
        spaceBetween: 0,
        slidesPerView: 1,
        pagination: { clickable: true },
        onSlideChange: (swiper) => {
            setActiveSlideIndices(prev => ({
                ...prev,
                [productId]: swiper.activeIndex
            }));
        },
    });

    return (
        <section className="discounted-products py-5 bg-light">
            <div className="container">
                <div className="section-header d-flex flex-column flex-sm-row justify-content-between align-items-center mb-4">
                    <h2 className="section-title fw-bold text-center text-sm-start">أفضل العروض والخصومات</h2>
                    <Link to="/ProductOffer" className="view-more-btn mt-3 mt-sm-0">
                        عرض الكل<FaChevronLeft />
                    </Link>
                </div>

                {discountedProducts.length === 0 ? (
                    <div className="alert alert-info text-center">
                        لا توجد عروض متاحة حالياً
                    </div>
                ) : (
                    <div className="row g-4">
                        {discountedProducts.map((product) => {
                            const allProductImages = product.images?.length > 0
                                ? [product.imgCover, ...product.images]
                                : [product.imgCover];

                            const currentSlideIndex = activeSlideIndices[product._id] || 0;
                            const discountPercentage = Math.round(
                                ((product.price - product.priceAfterDiscount) / product.price) * 100
                            );

                            return (
                                <div key={product._id} className="col-6 col-md-4 col-lg-3">
                                    <div className="product-card card h-100 border-0 shadow-sm">
                                        <div className="product-image-container position-relative">
                                            <div className="product-actions position-absolute top-0 start-0 p-2 z-3 w-100 d-flex justify-content-between align-items-start">
                                                <div className="d-flex flex-column gap-1">
                                                    <button
                                                        onClick={() => toggleWishlist(product._id)}
                                                        className="btn btn-icon p-0 border-0 bg-transparent"
                                                    >
                                                        {isInWishlist(product._id) ? (
                                                            <FaHeart className="text-danger fs-3" />
                                                        ) : (
                                                            <FaRegHeart className="text-white fs-3" />
                                                        )}
                                                    </button>
                                                    <Link
                                                        to={`/productDetel/${product._id}`}
                                                        className="btn btn-icon p-0 border-0 bg-transparent"
                                                    >
                                                        <AiOutlineEye className="text-white fs-3" />
                                                    </Link>
                                                </div>
                                                <span className="badge text-white px-2 py-1">
                                                    {discountPercentage}% خصم
                                                </span>
                                            </div>

                                            <Swiper {...productSwiperSettings(product._id)}>
                                                {allProductImages.map((img, idx) => (
                                                    <SwiperSlide key={idx}>
                                                        <img
                                                            src={img}
                                                            className="product-image img-fluid"
                                                            alt={product.title}
                                                        />
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                        </div>

                                        <div className="card-body">
                                            <h3 className="h6 mb-1 text-truncate product-name">
                                                {product.title.split(" ").slice(0, 2).join(" ")}
                                            </h3>

                                            <div className="product-price d-flex align-items-center mb-2">
                                                <span className="current-price text-danger fw-bold">
                                                    {product.priceAfterDiscount} ج.م
                                                </span>
                                                <span className="original-price text-muted text-decoration-line-through ms-2">
                                                    {product.price} ج.م
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handleAddToCart(product._id, allProductImages, currentSlideIndex)}
                                                className="btn btn-dark w-100 add-to-cart-btn"
                                            >
                                                <BsCartCheckFill className="me-2" />
                                                أضف إلى السلة
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* <--- تم إزالة تضمين الـ Login Pop-up هنا ---> */}
            {/* {showLoginPopup && <LoginPopup onClose={() => setShowLoginPopup(false)} />} */}
        </section>
    );
}
