import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar, FaStarHalfAlt, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { whichlistContext } from "../context/WhichListcontext.jsx";
import { BsCartCheckFill } from "react-icons/bs";
import { AiOutlineEye } from "react-icons/ai";
import { CartContext } from "../context/CartContext.jsx";
// import { AuthContext } from "../context/AuthContext.jsx"; // <--- تم إزالة هذا الاستيراد
// import LoginPopup from "./LoginPopup.jsx"; // <--- تم إزالة استيراد LoginPopup

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import axios from "axios";
import toast from "react-hot-toast";

export default function TopRatedProducts() {
    const [topRatedProducts, setTopRatedProducts] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [activeSlideIndices, setActiveSlideIndices] = useState({});
    // const [showLoginPopup, setShowLoginPopup] = useState(false); // <--- تم إزالة هذه الحالة

    // حالة تسجيل الدخول المحلية لهذا المكون
    const [isLoggedIn, setIsLoggedIn] = useState(false); // <--- تم تعريف isLoggedIn هنا

    const basUrl = "https://final-pro-api-j1v7.onrender.com";
    const { addWishlist, deletWhichData, getAllWhichlistData } = useContext(whichlistContext);
    const { addCart, setCartCount } = useContext(CartContext);
    // const { isLoggedIn } = useContext(AuthContext); // <--- تم إزالة هذا السطر

    // دالة للتحقق من وجود التوكن في localStorage
    const checkLoginStatus = () => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token); // تحديث حالة isLoggedIn بناءً على وجود التوكن
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
        fetchTopRatedProducts();
        // فقط جلب قائمة الأمنيات إذا كان المستخدم مسجلاً للدخول
        if (isLoggedIn) {
            fetchWishlist();
        } else {
            setWishlistItems([]); // مسح قائمة الأمنيات إذا لم يكن المستخدم مسجلاً للدخول
        }
    }, [isLoggedIn]); // أضف isLoggedIn كـ dependency لجلب قائمة الأمنيات عند تغيير حالة الدخول

    async function fetchTopRatedProducts() {
        try {
            const { data } = await axios.get(`${basUrl}/api/v1/product?sort=-rateAvg`);
            setTopRatedProducts(data.product);

            const initialActiveSlides = {};
            data.product.forEach(p => {
                initialActiveSlides[p._id] = 0;
            });
            setActiveSlideIndices(initialActiveSlides);
        } catch (error) {
            console.error("Error fetching top rated products:", error);
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
        // <--- التحقق من تسجيل الدخول قبل أي إجراء
        if (!isLoggedIn) {
            toast.error("يرجى تسجيل الدخول أولاً لإدارة قائمة المفضلة.", { duration: 2000 });
            // setShowLoginPopup(true); // <--- تم إزالة هذا السطر
            return; // إيقاف تنفيذ الدالة
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
                                   toast.success("تمت الإضافة إلى السلة", { duration: 1000 });

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
        // <--- التحقق من تسجيل الدخول قبل أي إجراء
        if (!isLoggedIn) {
            toast.error("يرجى تسجيل الدخول أولاً لإضافة المنتج إلى السلة.", { duration: 2000 });
            // setShowLoginPopup(true); // <--- تم إزالة هذا السطر
            return; // إيقاف تنفيذ الدالة
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

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={`full-${i}`} className="text-warning" />);
        }
        if (hasHalfStar) {
            stars.push(<FaStarHalfAlt key="half" className="text-warning" />);
        }
        const remainingStars = 5 - stars.length;
        for (let i = 0; i < remainingStars; i++) {
            stars.push(<FaStar key={`empty-${i}`} className="text-muted" style={{ opacity: 0.5 }} />);
        }
        return stars;
    };

    const mainSwiperSettings = {
        modules: [Navigation, Pagination],
        spaceBetween: 15,
        slidesPerView: 2,
        navigation: {
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
        },
        pagination: {
            el: '.swiper-pagination-custom',
            clickable: true,
        },
        breakpoints: {
            400: { slidesPerView: 2 },
            576: { slidesPerView: 2 },
            768: { slidesPerView: 4 },
            992: { slidesPerView: 5 },
        }
    };

    return (
        <section className="top-rated-section py-5 bg-light">
            <div className="container">
                <div className="section-header d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <h2 className="section-title fw-bold mb-0">الأعلى تقييماً</h2>
                    </div>
                    <div className="swiper-navigation d-flex gap-2">
                        <button className="swiper-button-prev-custom btn btn-sm btn-outline-primary p-2 rounded-circle">
                            <FaChevronLeft />
                        </button>
                        <button className="swiper-button-next-custom btn btn-sm btn-outline-primary p-2 rounded-circle">
                            <FaChevronRight />
                        </button>
                    </div>
                </div>

                {topRatedProducts.length === 0 ? (
                    <div className="alert alert-info text-center">لا توجد منتجات حالياً</div>
                ) : (
                    <>
                        <Swiper {...mainSwiperSettings} className="top-rated-swiper">
                            {topRatedProducts.map((product) => {
                                const allProductImages = product.images?.length > 0
                                    ? [product.imgCover, ...product.images]
                                    : [product.imgCover];

                                const currentSlideIndex = activeSlideIndices[product._id] || 0;
                                const hasDiscount = product.priceAfterDiscount && product.priceAfterDiscount < product.price;

                                return (
                                    <SwiperSlide key={product._id}>
                                        <div className="product-card h-100 px-1">
                                            <div className="card h-100 border-0 shadow-sm">
                                                <div className="product-image-container position-relative">
                                                    <Swiper {...productSwiperSettings(product._id)}>
                                                        {allProductImages.map((img, idx) => (
                                                            <SwiperSlide key={idx}>
                                                                <img
                                                                    src={img}
                                                                    className="product-image img-fluid w-100"
                                                                    alt={product.title}
                                                                    style={{ height: "180px", objectFit: "cover" }}
                                                                />
                                                            </SwiperSlide>
                                                        ))}
                                                    </Swiper>

                                                    <div className="product-actions position-absolute top-0 start-0 p-2 z-3 w-100 d-flex justify-content-between align-items-start">
                                                        <div className="d-flex flex-column gap-1">
                                                            <button
                                                                onClick={() => toggleWishlist(product._id)}
                                                                className="btn btn-icon p-0 border-0 bg-transparent"
                                                            >
                                                                {isInWishlist(product._id) ? (
                                                                    <FaHeart className="text-danger fs-5" />
                                                                ) : (
                                                                    <FaRegHeart className="text-white fs-5" />
                                                                )}
                                                            </button>
                                                            <Link
                                                                to={`/productDetel/${product._id}`}
                                                                className="btn btn-icon p-0 border-0 bg-transparent"
                                                            >
                                                                <AiOutlineEye className="text-white fs-5" />
                                                            </Link>
                                                        </div>
                                                        {hasDiscount ? (
                                                            <span className="badge text-white px-2 py-1" style={{ fontSize: '0.75rem' }}>
                                                                {Math.round((1 - product.priceAfterDiscount / product.price) * 100)}% خصم
                                                            </span>
                                                        ) : ""}
                                                    </div>
                                                </div>

                                                <div className="card-body ">
                                                    <h3 className="h6 text-truncate product-name" >
                                                        {product.title.split(" ").slice(0, 2).join(" ")}
                                                    </h3>

                                                    <div className="product-price d-flex align-items-center ">
                                                        <span className="current-price text-danger fw-bold" style={{ fontSize: '0.9rem' }}>
                                                            {hasDiscount ? product.priceAfterDiscount : product.price} ج.م
                                                        </span>
                                                        {hasDiscount ? (
                                                            <span className="original-price text-muted text-decoration-line-through ms-1" style={{ fontSize: '0.8rem' }}>
                                                                {product.price} ج.م
                                                            </span>
                                                        ) : ""}
                                                    </div>

                                                    <div className="product-rating d-flex align-items-center ">
                                                        <div className="stars d-flex me-1" style={{ fontSize: '0.8rem' }}>
                                                            {renderStars(product.rateAvg || 0)}
                                                        </div>
                                                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                            ({product.rateAvg?.toFixed(1) || 0})
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={() => handleAddToCart(product._id, allProductImages, currentSlideIndex)}
                                                        className="btn btn-dark w-100 add-to-cart-btn py-1"
                                                        style={{ fontSize: '0.8rem' }}
                                                    >
                                                        <BsCartCheckFill className="me-1" />
                                                        أضف إلى السلة
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                        <div className="swiper-pagination-custom text-center mt-2"></div>
                    </>
                )}
            </div>

            {/* <--- تم إزالة تضمين الـ Login Pop-up هنا ---> */}
            {/* {showLoginPopup && <LoginPopup onClose={() => setShowLoginPopup(false)} />} */}

            <style jsx>{`
                .swiper-button-prev-custom:after,
                .swiper-button-next-custom:after {
                    display: none;
                }
                .swiper-button-prev-custom.swiper-button-disabled,
                .swiper-button-next-custom.swiper-button-disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .product-image {
                    transition: transform 0.3s ease;
                }
                .product-card:hover .product-image {
                    transform: scale(1.03);
                }
                .add-to-cart-btn {
                    transition: all 0.3s ease;
                }
                .add-to-cart-btn:hover {
                    background-color: #333 !important;
                }
                @media (max-width: 400px) {
                    .product-card {
                        padding-left: 0.25rem;
                        padding-right: 0.25rem;
                    }
                    .card-body {
                        padding: 0.5rem;
                    }
                }
            `}</style>
        </section>
    );
}
