import React, { useContext, useRef, useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { IoCartSharp } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { FaWhatsapp, FaInstagram, FaTwitter, FaFacebookF } from "react-icons/fa";
import { CartContext } from '../context/CartContext.jsx';
import { productContext } from '../context/Product.Contextt.jsx';
import { FaHome } from "react-icons/fa";
import { FaThLarge, FaShoppingCart, FaUserAlt, FaBoxes } from "react-icons/fa";
import { catigoryContext } from '../context/CarigruContext.jsx';
import "../style/nav.css"
import { BiLogOut } from "react-icons/bi";
import { IoIosSettings } from "react-icons/io";
import { AuthContext } from '../context/AuthContext.jsx';


export default function NavBar({ userdata }) {
    const { userName } = useContext(AuthContext);
   
    console.log('userName in NavBar:', userName);
    
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    // New state for user account offcanvas
    const [isUserOffcanvasOpen, setIsUserOffcanvasOpen] = useState(false);

    let { cartCount } = useContext(CartContext);
    let { setProduct, product } = useContext(productContext);
    let { allCatigory, getSingleCatigories } = useContext(catigoryContext);


    const navbarRef = useRef(null);
    const offcanvasRef = useRef(null); // Ref for categories offcanvas
    const userOffcanvasRef = useRef(null); // New ref for user offcanvas
    const location = useLocation();

    // State for clicked category and its subcategories (desktop)
    const [clickedCategory, setClickedCategory] = useState(null);
    const [currentCategorySubcategories, setCurrentCategorySubcategories] = useState([]);
    const [img, setImg] = useState(null); // Image for desktop category dropdown

    // State for mobile subcategories
    const [mobileSubcategories, setMobileSubcategories] = useState([]);
    const [selectedMobileCategoryId, setSelectedMobileCategoryId] = useState(null);

    // State for user dropdown (desktop)
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    // Fetch subcategories for mobile
    const fetchSubcategoriesForMobile = useCallback(async (categoryId) => {
        if (!categoryId) {
            setMobileSubcategories([]);
            return;
        }
        try {
            const { data } = await getSingleCatigories(categoryId);
            setMobileSubcategories(data.category.allSubCatigory || []);
        } catch (error) {
            console.error("Error fetching subcategories for mobile:", error);
            setMobileSubcategories([]);
        }
    }, [getSingleCatigories]);

    // Handle category click (desktop)
    const handleCategoryClick = async (categoryId) => {
        if (clickedCategory === categoryId) {
            // If the same category is clicked again, close the dropdown
            setClickedCategory(null);
            setCurrentCategorySubcategories([]);
        } else {
            // Close user dropdown/offcanvas if open when a category is clicked
            setIsUserDropdownOpen(false);
            setIsUserOffcanvasOpen(false);

            setClickedCategory(categoryId);
            try {
                const { data } = await getSingleCatigories(categoryId);
                setImg(data.category.image);
                setCurrentCategorySubcategories(data.category.allSubCatigory || []);
            } catch (error) {
                console.error("Error fetching subcategories on click:", error);
                setCurrentCategorySubcategories([]); // Clear on error
            }
        }
    };

    // Close user dropdown, mobile nav, category dropdown, and user offcanvas when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close mobile categories offcanvas
            if (offcanvasRef.current && !offcanvasRef.current.contains(event.target) && isMobileNavOpen) {
                if (event.target.id !== 'toggleOffcanvasButton' && !event.target.closest('#toggleOffcanvasButton')) {
                    setIsMobileNavOpen(false);
                }
            }
            // Close user dropdown (desktop)
            if (navbarRef.current && !navbarRef.current.contains(event.target) && isUserDropdownOpen) {
                if (!event.target.closest('.dropdown-toggle') && !event.target.closest('.dropdown-menu')) {
                    setIsUserDropdownOpen(false);
                }
            }
            // Close desktop category dropdown
            if (clickedCategory && !event.target.closest('.category-dropdown-container')) {
                setClickedCategory(null);
                setCurrentCategorySubcategories([]);
            }
            // Close user offcanvas (mobile)
            if (userOffcanvasRef.current && !userOffcanvasRef.current.contains(event.target) && isUserOffcanvasOpen) {
                if (event.target.id !== 'toggleUserOffcanvasButton' && !event.target.closest('#toggleUserOffcanvasButton')) {
                    setIsUserOffcanvasOpen(false);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMobileNavOpen, isUserDropdownOpen, clickedCategory, isUserOffcanvasOpen]);


    // Prevent scrolling when any dropdown/offcanvas is open
    useEffect(() => {
        if (clickedCategory || isUserDropdownOpen || isMobileNavOpen || isUserOffcanvasOpen) {
            document.body.classList.add('dropdown-open');
        } else {
            document.body.classList.remove('dropdown-open');
        }

        return () => {
            document.body.classList.remove('dropdown-open');
        };
    }, [clickedCategory, isUserDropdownOpen, isMobileNavOpen, isUserOffcanvasOpen]);

    // Mobile categories nav functions
    const toggleMobileNav = () => {
        setIsMobileNavOpen(!isMobileNavOpen);
        // Close other dropdowns/offcanvas when this one opens
        setClickedCategory(null);
        setCurrentCategorySubcategories([]);
        setIsUserDropdownOpen(false);
        setIsUserOffcanvasOpen(false);
    };

    const closeMobileNav = () => {
        setIsMobileNavOpen(false);
        // Reset mobile category selection when closing offcanvas
        setSelectedMobileCategoryId(null);
        setMobileSubcategories([]);
    };

    // Mobile user offcanvas functions
    const toggleUserOffcanvas = () => {
        setIsUserOffcanvasOpen(!isUserOffcanvasOpen);
        // Close other dropdowns/offcanvas when this one opens
        setIsMobileNavOpen(false);
        setIsUserDropdownOpen(false);
        setClickedCategory(null);
        setCurrentCategorySubcategories([]);
    };

    const closeUserOffcanvas = () => {
        setIsUserOffcanvasOpen(false);
    };


    const logout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    const handleSearch = (event) => {
        const term = event.target.value;
        setProduct(term);
    };

    const handleNavLinkClick = () => {
        closeMobileNav();
        closeUserOffcanvas(); // Close user offcanvas
        setClickedCategory(null);
        setCurrentCategorySubcategories([]);
        setIsUserDropdownOpen(false);
    };

    const isActiveLink = (path) => {
        return location.pathname === path;
    };

    const isDropdownActive = () => {
        return location.pathname.startsWith('/productOfSubCarigory/');
    };

    const handleMobileCategoryClick = async (categoryId) => {
        setSelectedMobileCategoryId(categoryId);
        await fetchSubcategoriesForMobile(categoryId);
    };

    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
        // Close category dropdown and user offcanvas if user dropdown opens
        setClickedCategory(null);
        setCurrentCategorySubcategories([]);
        setIsUserOffcanvasOpen(false);
    };

    return (
        <>
            {/* Top Strip (Desktop Only) */}
            <div id='nav'>
                <div className="d-none d-lg-block nav-conection-detel text-white" dir="rtl">
                    <div className="container py-1 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <span>نحتاج لمساعدة؟ </span>
                            <a href="tel:012044444495" className="text-white text-decoration-none">012044444495</a>
                        </div>
                        <div className="d-flex gap-3">
                            <a href="#" className="text-white"><FaWhatsapp className="fs-5" /></a>
                            <a href="#" className="text-white"><FaInstagram className="fs-5" /></a>
                            <a href="#" className="text-white"><FaTwitter className="fs-5" /></a>
                            <a href="#" className="text-white"><FaFacebookF className="fs-5" /></a>
                        </div>
                        <div className="d-flex gap-3">
                            <Link className={`text-white text-decoration-none ${isActiveLink('/about') ? 'active-link' : ''}`} to="/about">من نحن</Link>
                            <Link className={`text-white text-decoration-none ${isActiveLink('/ShippingAndReturns') ? 'active-link' : ''}`} to="/ShippingAndReturns">سياسية الاسترجاع</Link>
                        </div>
                    </div>
                </div>

                {/* Desktop Navbar */}
                <nav className="d-none d-lg-block bg-white shadow-sm my-2 " dir="rtl" ref={navbarRef}>
                    <div className="container py-2 d-flex justify-content-between align-items-center">
                        <Link className="navbar-brand fw-bold fs-4" to="/">لميع</Link>
                        <div className="input-group mx-5">
                            <input
                                type="search"
                                className="form-control"
                                placeholder="قولي بتدور علي ايه ؟"
                                onChange={handleSearch}
                                value={product}
                                style={{ maxWidth: '800px', maxHeight: '40px' }}
                            />
                            <button className="btn btn-outline-secondary" type="button">
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                        {userdata ? (
                            <div className="d-flex align-items-center gap-3">
                                <div className={`dropdown ${isUserDropdownOpen ? 'show' : ''}`}>
                                    <button
                                        className={`btn bg-white btn-outline-secondary d-flex align-items-center text-dark text-decoration-none dropdown-toggle ${isActiveLink('/my-account') ? 'active-link-desktop-user-actions' : ''}`}
                                        type="button"
                                        id="userDropdown"
                                        onClick={toggleUserDropdown}
                                        aria-expanded={isUserDropdownOpen}
                                    >
                                        <CgProfile className='fs-4' />
                                        <span className='fw-bold'>أهلاً {userName.name || 'مستخدم'}</span>
                                    </button>
                                    <ul className={`dropdown-menu ${isUserDropdownOpen ? 'show' : ''}`} aria-labelledby="userDropdown" dir="rtl">
                                        <li>
                                            <Link className="dropdown-item" to="/my-setting" onClick={handleNavLinkClick}>
                                                <IoIosSettings className='me-2' /> الإعدادات الشخصية
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/myOrder" onClick={handleNavLinkClick}>
                                                <FaBoxes className='me-2' /> طلباتي
                                            </Link>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button className="dropdown-item text-danger" onClick={logout}>
                                                تسجيل الخروج
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                                <Link to="/whichList" className={`btn-outline-secondary d-flex align-items-center gap-1 text-dark text-decoration-none ${isActiveLink('/whichList') ? 'active-link-desktop-user-actions' : ''}`}>
                                    <FaHeart className='fs-4 text-danger' />
                                    <span className='fw-bold'>قائمة الأمنيات</span>
                                </Link>
                                <Link to="/cart" className={`btn-outline-secondary position-relative d-flex align-items-center gap-1 text-dark text-decoration-none ${isActiveLink('/cart') ? 'active-link-desktop-user-actions' : ''}`}>
                                    <IoCartSharp className='fs-4' />
                                    <span className='fw-bold'>سلة المشتريات</span>
                                    <p className='position-absolute top-0 start-100 translate-middle badge rounded-3 bg-danger cart-count'>
                                        {cartCount ? `${cartCount}` : "0"}
                                    </p>
                                </Link>
                            </div>
                        ) : (
                            <div className="d-flex gap-3 align-items-center">
                                <p className="mb-0"><CgProfile className='fs-5' /></p>
                                <Link to="/login" className={`btn-outline-secondary fw-bold ${isActiveLink('/login') ? 'active-link' : ''}`}>تسجيل الدخول</Link>
                                <p className="mb-0">/</p>
                                <Link to="/signUp" className={`btn-outline-secondary fw-bold ${isActiveLink('/signUp') ? 'active-link' : ''}`}>انشاء حساب</Link>
                            </div>
                        )}
                    </div>

                    <div className="border">
                        <div className="container d-flex justify-content-between align-items-center">
                            <div className="d-flex gap-2">
                                <Link className={`nav-link ${isActiveLink('/') ? 'active-link' : ''}`} to="/">الرئيسية</Link>

                                {allCatigory && allCatigory.length > 0 ? (
                                    allCatigory.map((category) => (
                                        <li
                                            className={`nav-item dropdown category-dropdown-container ${clickedCategory === category._id ? 'show' : ''}`}
                                            key={category._id}
                                        >
                                            <a
                                                className={`nav-link dropdown-toggle ${clickedCategory === category._id ? 'active-link' : ''}`}
                                                href="#"
                                                id={`navbarDropdown-${category._id}`}
                                                role="button"
                                                data-bs-toggle="dropdown"
                                                aria-expanded={clickedCategory === category._id}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleCategoryClick(category._id);
                                                }}
                                            >
                                                <span className="fw-bold text-dark">{category.name}</span>
                                            </a>

                                            <div
                                                className={`dropdown-menu ${clickedCategory === category._id ? 'show' : ''} full-width-dropdown`}
                                                aria-labelledby={`navbarDropdown-${category._id}`}
                                            >
                                                <div className="container">
                                                    <div className="row">
                                                        <div className="col-lg-9 col-md-8">
                                                            <div className="row">
                                                                {currentCategorySubcategories.length > 0 ? (
                                                                    currentCategorySubcategories.map((subCategory) => (
                                                                        <div className="col-6 col-md-4 col-lg-3 mb-4" key={subCategory._id}>
                                                                            <Link
                                                                                to={`/productOfSubCarigory/${subCategory._id}`}
                                                                                className="d-flex flex-column align-items-center text-decoration-none text-dark subcategory-item"
                                                                                onClick={handleNavLinkClick}
                                                                            >
                                                                                <div className="subcategory-image-container">
                                                                                    {subCategory.image ? (
                                                                                        <img
                                                                                            src={subCategory.image}
                                                                                            alt={subCategory.name}
                                                                                        />
                                                                                    ) : (
                                                                                        <span className="fw-bold " style={{ fontSize: '18px' }}>
                                                                                            {subCategory.name ? subCategory.name.charAt(0) : ''}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <span className="text-center mt-2" style={{ fontSize: '0.9rem' }}>
                                                                                    {subCategory.name}
                                                                                </span>
                                                                            </Link>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="col-12 text-center py-4">
                                                                        <p>لا توجد أقسام فرعية لهذه الفئة</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className='col-lg-3 col-md-4 d-flex justify-content-center align-items-center'>
                                                            {img && (
                                                                <img src={img} alt="Category" className="img-fluid catigory-image-container " style={{ maxHeight: '300px', objectFit: 'contain', }} />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <span className="fw-bold text-muted nav-link">لا توجد أقسام رئيسية.</span>
                                )}
                            </div>
                        </div>
                    </div>

                </nav>

                {/* Mobile Navbar (Top) */}
                <nav className="navbar d-lg-none bg-white shadow-sm custom-mobile-navbar" dir="rtl">
                    <div className="container-fluid ">
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <div className="d-flex align-items-center">
                                <Link className="navbar-brand m-0" to="/">
                                    <p>لميع</p>
                                </Link>
                            </div>
                            <div className="d-flex align-items-center">
                                {userdata ? (
                                    <>
                                        <Link to="/whichList" className={`ms-2 mx-3 ${isActiveLink('/whichList') ? 'active-mobile-icon' : ''}`}>
                                            <FaHeart className="fs-5 text-danger" />
                                        </Link>
                                    </>
                                ) : (
                                    <div className="d-flex align-items-center">
                                        <Link to="/login" className={`ms-2 ${isActiveLink('/login') ? 'active-link' : ''}`}>
                                            <CgProfile className="fs-5 me-1" />
                                            <span className="small-text-login">تسجيل الدخول</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className=" w-100">
                            <div className="input-group ">
                                <button className="btn btn-outline-secondary-serch custom-search-btn" type="button">
                                    <i className="fas fa-search"></i>
                                </button>
                                <input
                                    type="search"
                                    onChange={handleSearch}
                                    value={product}
                                    className="form-control custom-search-input"
                                    placeholder="قولي بتدور علي ايه ؟"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Offcanvas/Sidebar for mobile CATEGORIES navigation */}
                    <div
                        className={`offcanvas offcanvas-end ${isMobileNavOpen ? 'show' : ''}`}
                        tabIndex="-1"
                        id="offcanvasNavbar"
                        aria-labelledby="offcanvasNavbarLabel"
                        dir="rtl"
                        ref={offcanvasRef}
                    >
                        <div className="offcanvas-header d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
                                    الأقسام
                                </h5>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeMobileNav}
                                    aria-label="Close"
                                    data-bs-dismiss="offcanvas"
                                ></button>
                            </div>
                        </div>
                        <div className="offcanvas-body d-flex p-0">
                            <div className="mobile-categories-list" style={{ width: '50%', borderLeft: '1px solid #eee', overflowY: 'auto' }}>
                                <ul className="navbar-nav flex-column pe-0">
                                    {allCatigory && allCatigory.length > 0 ? (
                                        allCatigory.map((category) => (
                                            <li className="nav-item" key={category._id}>
                                                <button
                                                    className={`nav-link text-end py-2 px-3 w-100 border-0 bg-transparent ${selectedMobileCategoryId === category._id ? 'active-mobile-category' : ''}`}
                                                    onClick={() => handleMobileCategoryClick(category._id)}
                                                >
                                                    {category.name}
                                                </button>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="nav-item">
                                            <span className="nav-link text-muted">لا توجد أقسام رئيسية.</span>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div className="mobile-subcategories-grid" style={{ width: '70%', overflowY: 'auto', padding: '10px' }}>
                                {mobileSubcategories.length > 0 ? (
                                    <div className="row row-cols-2 g-2">
                                        {mobileSubcategories.map((subCategory) => (
                                            <div className="col text-center" key={subCategory._id}>
                                                <Link
                                                    to={`/productOfSubCarigory/${subCategory._id}`}
                                                    onClick={handleNavLinkClick}
                                                    className="d-block text-decoration-none text-dark subcategory-item"
                                                >
                                                    <div className="d-flex justify-content-center align-items-center mb-1" style={{ width: '60px', height: '60px', border: '1px solid #ddd', borderRadius: '8px', margin: 'auto', overflow: 'hidden' }}>
                                                        {subCategory.image ? (
                                                            <img
                                                                src={subCategory.image}
                                                                alt={subCategory.name}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <span className="fw-bold fs-5">{subCategory.name ? subCategory.name.charAt(0) : ''}</span>
                                                        )}
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem' }}>{subCategory.name}</span>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted text-center mt-3">اختر قسمًا رئيسيًا لعرض أقسامه الفرعية.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Offcanvas/Sidebar for mobile USER ACCOUNT */}
                    <div
                        className={`offcanvas offcanvas-end ${isUserOffcanvasOpen ? 'show' : ''}`}
                        tabIndex="-1"
                        id="offcanvasUserAccount"
                        aria-labelledby="offcanvasUserAccountLabel"
                        dir="rtl"
                        ref={userOffcanvasRef} // Assign the new ref here
                    >
                        <div className="offcanvas-header d-flex justify-content-between align-items-center">
                             <div>
                                <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
                                    حسابي
                                </h5>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeUserOffcanvas}
                                    aria-label="Close"
                                    data-bs-dismiss="offcanvas"
                                ></button>
                            </div>
                        </div>
                        <div className="offcanvas-body">
                             <ul className="list-group list-group-flush">
                                {userdata ? (
                                    <>
                                        <li className="list-group-item">
                                            <Link to="/myOrder" className="d-flex align-items-center text-decoration-none text-dark" onClick={handleNavLinkClick}>
                                                <FaBoxes className='me-2 mx-2' /> طلباتي
                                            </Link>
                                        </li>
                                        <li className="list-group-item">
                                            <Link to="/whichList" className="d-flex align-items-center text-decoration-none text-dark" onClick={handleNavLinkClick}>
                                                <FaHeart className='me-2 text-danger mx-2' /> قائمة الأمنيات
                                            </Link>
                                        </li>
                                        <li className="list-group-item">
                                            <Link to="/my-setting" className="d-flex align-items-center text-decoration-none text-dark" onClick={handleNavLinkClick}>
                                                <IoIosSettings className='me-2 mx-2' /> الإعدادات الشخصية
                                            </Link>
                                        </li>
                                        <li className="list-group-item">
                                            <button className="d-flex align-items-center text-decoration-none text-danger btn btn-link p-0" onClick={logout} style={{ border: 'none', background: 'none' }}>
                                                <BiLogOut className='me-2 mx-2' /> تسجيل الخروج
                                            </button>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="list-group-item">
                                            <Link to="/login" className="d-flex align-items-center text-decoration-none text-dark" onClick={handleNavLinkClick}>
                                                <CgProfile className='me-2 mx-2' /> تسجيل الدخول
                                            </Link>
                                        </li>
                                        <li className="list-group-item">
                                            <Link to="/signUp" className="d-flex align-items-center text-decoration-none text-dark" onClick={handleNavLinkClick}>
                                                <FaUserAlt className='me-2 mx-2' /> إنشاء حساب جديد
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>

                </nav>

                {/* Bottom Navbar for Mobile */}
                <nav className="navbar fixed-bottom d-lg-none bg-white shadow-lg" dir="rtl">
                    <div className="container-fluid d-flex justify-content-around align-items-center py-2">
                        <Link to="/" className={`text-center d-flex flex-column align-items-center text-decoration-none ${isActiveLink('/') ? 'active-mobile-bottom-nav' : 'text-dark'}`}>
                            <FaHome className="fs-5 mb-1" />
                            <span style={{ fontSize: '0.7rem' }}>الرئيسية</span>
                        </Link>

                        <button
                            className={`text-center d-flex flex-column align-items-center text-decoration-none btn p-0 border-0 bg-transparent ${isDropdownActive() || isMobileNavOpen ? 'active-mobile-bottom-nav' : 'text-dark'}`}
                            onClick={toggleMobileNav}
                            id="toggleOffcanvasButton"
                        >
                            <FaThLarge className="fs-5 mb-1" />
                            <span style={{ fontSize: '0.7rem' }}>الأقسام</span>
                        </button>

                        <Link to="/cart" className={`text-center d-flex flex-column align-items-center text-decoration-none ${isActiveLink('/cart') ? 'active-mobile-bottom-nav' : 'text-dark'} position-relative`}>
                            <FaShoppingCart className="fs-5 mb-1" />
                            <span style={{ fontSize: '0.7rem' }}>السلة</span>
                            {cartCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger" style={{ fontSize: '0.6rem' }}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <Link to="/products" className={`text-center d-flex flex-column align-items-center text-decoration-none ${isActiveLink('/products') ? 'active-mobile-bottom-nav' : 'text-dark'}`}>
                            <FaBoxes className="fs-5 mb-1" />
                            <span style={{ fontSize: '0.7rem' }}>المنتجات</span>
                        </Link>

                        {/* Changed this to a button to trigger the user offcanvas */}
                        <button
                            className={`text-center d-flex flex-column align-items-center text-decoration-none btn p-0 border-0 bg-transparent ${isUserOffcanvasOpen ? 'active-mobile-bottom-nav' : 'text-dark'}`}
                            onClick={toggleUserOffcanvas}
                            id="toggleUserOffcanvasButton" // Added an ID for potential use in handleClickOutside
                        >
                            <FaUserAlt className="fs-5 mb-1" />
                            <span style={{ fontSize: '0.7rem' }}>حسابي</span>
                        </button>
                    </div>
                </nav>
            </div>
        </>
    );
}