import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import "./../style/product-of-subcategory.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { whichlistContext } from "../context/WhichListcontext.jsx";
import toast from "react-hot-toast";
import { BsCartCheckFill } from "react-icons/bs";
import { AiOutlineEye } from "react-icons/ai";
import { CartContext } from "../context/CartContext.jsx";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import axios from "axios";
import { productContext } from "../context/Product.Contextt.jsx";

export default function ProductOfSubCarigory() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    const [wishlistItems, setWishlistItems] = useState([]);
    const [activeSlideIndices, setActiveSlideIndices] = useState({});
    const [activeSort, setActiveSort] = useState("title");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    // Pagination states
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true); // Indicates if there are more products to load

    // Local login state
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const baseUrl = "https://final-pro-api-j1v7.onrender.com";
    const { product: searchTerm } = useContext(productContext);

    const {
        addWishlist,
        deletWhichData,
        getAllWhichlistData,
    } = useContext(whichlistContext);
    const { addCart, setCartCount } = useContext(CartContext);

    // Sort options
    const sortOptions = [
        { label: "الاسم", value: "title" },
        { label: "التاريخ", value: "date" },
        { label: "التقييم", value: "-rateAvg" },
        { label: "السعر", value: "price" },
    ];

    // Function to check login status
    const checkLoginStatus = () => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    };

    useEffect(() => {
        checkLoginStatus();
        window.addEventListener('storage', checkLoginStatus);
        return () => {
            window.removeEventListener('storage', checkLoginStatus);
        };
    }, []);

    // Memoize getSubCatigory to avoid unnecessary re-creations
    const getSubCatigory = useCallback(async (pageNumber = 1, isNewCategory = false) => {
        setLoading(true);
        try {
            const limit = 8; // Number of products per page
            let url = `${baseUrl}/api/v1/subCategory/${id}?page=${pageNumber}&limit=${limit}`;

            // Add sorting and filtering parameters to the API request
            if (activeSort) {
                url += `&sort=${activeSort}`;
            }
            if (activeSort === "price") {
                if (minPrice) url += `&price[gte]=${minPrice}`;
                if (maxPrice) url += `&price[lte]=${maxPrice}`;
            }
            if (searchTerm) {
                url += `&keyword=${searchTerm}`; // Assuming API supports 'keyword' for search
            }

            let { data } = await axios.get(url);
            console.log("Fetched data:", data);

            // Append new products if not a new category load, otherwise replace
            if (isNewCategory) {
                setProducts(data.allProduct);
                setFilteredProducts(data.allProduct);
            } else {
                setProducts(prevProducts => [...prevProducts, ...data.allProduct]);
                setFilteredProducts(prevFilteredProducts => [...prevFilteredProducts, ...data.allProduct]);
            }

            // Update hasMore based on the number of products received
            setHasMore(data.allProduct.length === limit);

            const initialActiveSlides = {};
            data.allProduct.forEach(p => {
                initialActiveSlides[p._id] = 0;
            });
            setActiveSlideIndices(prev => ({ ...prev, ...initialActiveSlides }));
        } catch (error) {
            console.error("Error fetching subcategory products:", error);
            setHasMore(false); // Stop loading more if an error occurs
        } finally {
            setLoading(false);
        }
    }, [id, activeSort, minPrice, maxPrice, searchTerm]); // Dependencies for useCallback

    useEffect(() => {
        // Reset pagination when subcategory ID, sort, or price filters change
        setProducts([]);
        setFilteredProducts([]);
        setPage(1);
        setHasMore(true);
        getSubCatigory(1, true); // Fetch first page for the new filter/sort
        if (isLoggedIn) {
            fetchWishlist();
        } else {
            setWishlistItems([]);
        }
    }, [id, isLoggedIn, activeSort, minPrice, maxPrice, searchTerm, getSubCatigory]);


    // Lazy loading implementation (already well-implemented)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const lazyLoadImages = () => {
                const lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

                if ("IntersectionObserver" in window) {
                    const lazyImageObserver = new IntersectionObserver(function(entries) {
                        entries.forEach(function(entry) {
                            if (entry.isIntersecting) {
                                const lazyImage = entry.target;
                                lazyImage.src = lazyImage.dataset.src;
                                lazyImage.classList.remove("lazy");
                                lazyImageObserver.unobserve(lazyImage);
                            }
                        });
                    });

                    lazyImages.forEach(function(lazyImage) {
                        lazyImageObserver.observe(lazyImage);
                    });
                } else {
                    lazyImages.forEach(function(lazyImage) {
                        lazyImage.src = lazyImage.dataset.src;
                    });
                }
            };

            lazyLoadImages();

            const observer = new MutationObserver(lazyLoadImages);
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            return () => observer.disconnect();
        }
    }, [filteredProducts]);

    async function fetchWishlist() {
        try {
            if (!isLoggedIn) return;
            const { data } = await getAllWhichlistData();
            setWishlistItems(data?.wishlist || []);
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            setWishlistItems([]);
        }
    }

  useEffect(() => {
 }, [activeSort, minPrice, maxPrice, searchTerm]); // Dependencies for this useEffect

    function sortProducts(productsToSort, sortBy) {

        const sorted = [...productsToSort];
        switch (sortBy) {
            case "title":
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "date":
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case "-rateAvg":
                sorted.sort((a, b) => (b.rateAvg || 0) - (a.rateAvg || 0));
                break;
            case "price":
                sorted.sort((a, b) => a.price - b.price);
                break;
            default:
                break;
        }
        return sorted;
    }

    async function toggleWishlist(productId) {
        if (!isLoggedIn) {
            toast.error("يرجى تسجيل الدخول أولاً لإدارة قائمة المفضلة.", { duration: 2000 });
            return;
        }

        try {
            if (isInWishlist(productId)) {
                const { data } = await deletWhichData(productId);
                if (data.message === "success") {
                    toast.success("تم الإزالة من المفضلة", { duration: 1000 });
                }
            } else {
                const { data } = await addWishlist(productId);
                if (data.message === "success") {
                                    toast.success("تمت الإضافة إلى السلة", { duration: 1000 });

                }
            }
            fetchWishlist();
        } catch (error) {
            console.error("Error updating wishlist:", error);
            toast.error("حدث خطأ أثناء تعديل قائمة الرغبات");
        }
    }

    const isInWishlist = (productId) =>
        wishlistItems.some((item) => item._id === productId);

    async function addToChart(id, productImages, slideIndex) {
        if (!isLoggedIn) {
            toast.error("يرجى تسجيل الدخول أولاً لإضافة المنتج إلى السلة.", { duration: 2000 });
            return;
        }

        try {
            const imageToUse = productImages[slideIndex];
            console.log(`جارٍ إضافة المنتج ID: ${id} إلى السلة. الصورة المختارة:`, imageToUse);

            let { data } = await addCart(id, imageToUse);
            if (data.message === "success") {
                setCartCount(data.cartItems);
                 toast.success("تمت الإضافة إلى السلة", { duration: 1000 });
            } else {
                throw new Error("Error adding to cart");
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
                        toast.error("حدث خطأ أثناء الإضافة إلى السلة");

        }
    }

    const productSwiperSettings = (productId) => ({
        modules: [Pagination, Navigation],
        spaceBetween: 0,
        slidesPerView: 1,
        pagination: { clickable: true },
        navigation: false,
        onSlideChange: (swiper) => {
            setActiveSlideIndices(prev => ({
                ...prev,
                [productId]: swiper.activeIndex
            }));
        },
    });

    // Infinite scroll observer
    const observer = useRef();
    const lastProductElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]); // Dependencies for useCallback

    // Fetch more data when page changes
    useEffect(() => {
        if (page > 1) { // Only fetch on page change if it's not the initial load
            getSubCatigory(page);
        }
    }, [page, getSubCatigory]);


    return (
        <div className="container my-3" id="product-of-subcategory">
            <div className="row">
                <div className="col-md-12 ">
                    <div className="sort-section mb-4">
                        <span className="fs-5 me-2 fw-bold">ترتيب حسب</span>
                        <div className="d-flex flex-wrap align-items-center sort-options">
                            {sortOptions.map(({ label, value }) => (
                                <button
                                    key={value}
                                    className={`sort-option-btn ${activeSort === value ? "active" : ""}`}
                                    onClick={() => {
                                        setActiveSort(value);
                                        setMinPrice("");
                                        setMaxPrice("");
                                        // Reset pagination and fetch new data
                                        setProducts([]);
                                        setFilteredProducts([]);
                                        setPage(1);
                                        setHasMore(true);
                                        getSubCatigory(1, true);
                                    }}
                                >
                                    {label}
                                </button>
                            ))}

                            {activeSort === "price" && (
                                <div className="d-flex align-items-center mx-3 gap-2">
                                    <input
                                        type="number"
                                        placeholder="من"
                                        value={minPrice}
                                        onChange={(e) => {
                                            setMinPrice(e.target.value);
                                            // Reset pagination and fetch new data
                                            setProducts([]);
                                            setFilteredProducts([]);
                                            setPage(1);
                                            setHasMore(true);
                                            getSubCatigory(1, true);
                                        }}
                                        className="form-control"
                                    />
                                    <input
                                        type="number"
                                        placeholder="إلى"
                                        value={maxPrice}
                                        onChange={(e) => {
                                            setMaxPrice(e.target.value);
                                            // Reset pagination and fetch new data
                                            setProducts([]);
                                            setFilteredProducts([]);
                                            setPage(1);
                                            setHasMore(true);
                                            getSubCatigory(1, true);
                                        }}
                                        className="form-control"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {searchTerm && filteredProducts.length === 0 && !loading && (
                        <div className="alert alert-danger text-center fs-4">
                            لا توجد منتجات تطابق بحثك: "{searchTerm}"
                        </div>
                    )}
                    {!searchTerm && filteredProducts.length === 0 && !loading && (
                        <div className="alert alert-info text-center fs-4">
                            لا توجد منتجات في هذه الفئة الفرعية حاليًا.
                        </div>
                    )}


                    <div className="row">
                        {filteredProducts.map((product, index) => {
                            const allProductImages = product.images && product.images.length > 0
                                ? [product.imgCover, ...product.images]
                                : [product.imgCover];

                            const currentSlideIndex = activeSlideIndices[product._id] || 0;

                            // Attach ref to the last product element for intersection observer
                            if (filteredProducts.length === index + 1) {
                                return (
                                    <div ref={lastProductElementRef} key={product._id} className="col-6 col-md-6 col-lg-3 mb-4">
                                        <div className="card product-card h-100 position-relative">
                                            <div className="position-relative product-image-wrapper">
                                                <Swiper {...productSwiperSettings(product._id)}>
                                                    {allProductImages.map((imgSrc, imgIndex) => (
                                                        <SwiperSlide key={imgIndex}>
                                                            <img src={imgSrc} className="card-img-top product-image img-fluid lazy" data-src={imgSrc} alt={`${product.title} - ${imgIndex + 1}`} />
                                                        </SwiperSlide>
                                                    ))}
                                                </Swiper>

                                                <div className="which-sp w-100 position-absolute top-0 start-0 p-2 d-flex flex-column align-items-start z-3">
                                                    <span className="cursor-pointer mb-1" onClick={() => toggleWishlist(product._id)}>
                                                        {isInWishlist(product._id) ? (
                                                            <FaHeart className="fs-4 text-danger cursor-pointer" />
                                                        ) : (
                                                            <FaRegHeart className="fs-4 text-white cursor-pointer" />
                                                        )}
                                                    </span>
                                                    <Link to={`/productDetel/${product._id}`}>
                                                        <span className="cursor-pointer">
                                                            <AiOutlineEye className="fs-4 text-white" />
                                                        </span>
                                                    </Link>
                                                </div>
                                                {product.priceAfterDiscount ?
                                                    <>
                                                        <span className="discount-badge" style={{ fontSize: '0.75rem' }}>
                                                            خصم {Math.round(100 - (product.priceAfterDiscount / product.price) * 100)}%
                                                        </span>
                                                    </>
                                                    : ""}
                                            </div>

                                            <div className="card-body py-2">
                                                <h6 className="card-subtitle mb-1 text-muted fs-6 fw-bold">{product.title?.split(" ").slice(0, 2).join(" ")}</h6>
                                                <h5 className="card-title fs-6 mb-1">
                                                    {product.description?.split(" ").slice(0, 2).join(" ")}
                                                </h5>

                                                <div className="product-price mb-1 d-flex align-items-center">
                                                    <span className="text-danger fs-6 fw-bold">
                                                        {product.priceAfterDiscount ? `${product.priceAfterDiscount} ج.م` : `${product.price} ج.م`}
                                                    </span>
                                                    {product.priceAfterDiscount ?
                                                        <>
                                                            <span className="text-decoration-line-through mx-1 text-muted ms-1 fs-7">
                                                                {product.price} ج.م
                                                            </span>
                                                        </> : ""}
                                                </div>

                                                <div className="product-rating mb-2 fs-6 d-flex align-items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span
                                                            key={i}
                                                            style={{
                                                                color: i < Math.round(product.rateAvg || 0) ? "#ffc107" : "#e4e5e9",
                                                                fontSize: "16px",
                                                            }}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                    <span className="ms-1 text-muted fs-7">({product.rateCount || 0})</span>
                                                </div>

                                                <button onClick={() => addToChart(product._id, allProductImages, currentSlideIndex)} className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-1 bnt-cart" >
                                                    <BsCartCheckFill className="fs-6" />
                                                    <span className="text">أضف إلى السلة</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={product._id} className="col-6 col-md-6 col-lg-3 mb-4">
                                        <div className="card product-card h-100 position-relative">
                                            <div className="position-relative product-image-wrapper">
                                                <Swiper {...productSwiperSettings(product._id)}>
                                                    {allProductImages.map((imgSrc, imgIndex) => (
                                                        <SwiperSlide key={imgIndex}>
                                                            <img src={imgSrc} className="card-img-top product-image img-fluid lazy" data-src={imgSrc} alt={`${product.title} - ${imgIndex + 1}`} />
                                                        </SwiperSlide>
                                                    ))}
                                                </Swiper>

                                                <div className="which-sp w-100 position-absolute top-0 start-0 p-2 d-flex flex-column align-items-start z-3">
                                                    <span className="cursor-pointer mb-1" onClick={() => toggleWishlist(product._id)}>
                                                        {isInWishlist(product._id) ? (
                                                            <FaHeart className="fs-4 text-danger cursor-pointer" />
                                                        ) : (
                                                            <FaRegHeart className="fs-4 text-white cursor-pointer" />
                                                        )}
                                                    </span>
                                                    <Link to={`/productDetel/${product._id}`}>
                                                        <span className="cursor-pointer">
                                                            <AiOutlineEye className="fs-4 text-white" />
                                                        </span>
                                                    </Link>
                                                </div>
                                                {product.priceAfterDiscount ?
                                                    <>
                                                        <span className="discount-badge" style={{ fontSize: '0.75rem' }}>
                                                            خصم {Math.round(100 - (product.priceAfterDiscount / product.price) * 100)}%
                                                        </span>
                                                    </>
                                                    : ""}
                                            </div>

                                            <div className="card-body py-2">
                                                <h6 className="card-subtitle mb-1 text-muted fs-6 fw-bold">{product.title?.split(" ").slice(0, 2).join(" ")}</h6>
                                                <h5 className="card-title fs-6 mb-1">
                                                    {product.description?.split(" ").slice(0, 2).join(" ")}
                                                </h5>

                                                <div className="product-price mb-1 d-flex align-items-center">
                                                    <span className="text-danger fs-6 fw-bold">
                                                        {product.priceAfterDiscount ? `${product.priceAfterDiscount} ج.م` : `${product.price} ج.م`}
                                                    </span>
                                                    {product.priceAfterDiscount ?
                                                        <>
                                                            <span className="text-decoration-line-through mx-1 text-muted ms-1 fs-7">
                                                                {product.price} ج.م
                                                            </span>
                                                        </> : ""}
                                                </div>

                                                <div className="product-rating mb-2 fs-6 d-flex align-items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span
                                                            key={i}
                                                            style={{
                                                                color: i < Math.round(product.rateAvg || 0) ? "#ffc107" : "#e4e5e9",
                                                                fontSize: "16px",
                                                            }}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                    <span className="ms-1 text-muted fs-7">({product.rateCount || 0})</span>
                                                </div>

                                                <button onClick={() => addToChart(product._id, allProductImages, currentSlideIndex)} className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-1 bnt-cart" >
                                                    <BsCartCheckFill className="fs-6" />
                                                    <span className="text">أضف إلى السلة</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>
                    {loading && (
                        <div className="text-center my-3">
                            <div className="spinner-border text-danger" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted">جاري تحميل المزيد من المنتجات...</p>
                        </div>
                    )}
                    {!hasMore && !loading && filteredProducts.length > 0 && (
                        <div className="text-center my-3 text-muted">
                            لقد وصلت إلى نهاية قائمة المنتجات.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}