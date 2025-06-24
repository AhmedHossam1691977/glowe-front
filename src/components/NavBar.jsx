import React, { useContext, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { IoCartSharp } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { CartContext } from '../context/CartContext.jsx';
import { productContext } from '../context/Product.Contextt.jsx';
import { subCatigoryContext } from '../context/SubcatigoruContext.jsx';

export default function NavBar({ userdata }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  let { cartCount } = useContext(CartContext);
  let { setProduct, product } = useContext(productContext);
  let { allSubCatigory } = useContext(subCatigoryContext);
  const navbarRef = useRef(null);

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    // إعادة التحميل لضمان تحديث حالة المستخدم
    window.location.href = "/login";
  };

  const handleSearch = (event) => {
    const term = event.target.value;
    setProduct(term);
  };

  const handleNavLinkClick = () => {
    // إغلاق الناف بار المتنقلة بعد الضغط على لينك
    closeMobileNav();
  };

  return (
    <>
      {/* ✅ Desktop Navbar */}
      <nav className="d-none d-lg-block bg-white shadow-sm" dir="rtl" ref={navbarRef}>
        <div className="container py-2 d-flex justify-content-between align-items-center">
          <Link className="navbar-brand fw-bold fs-4" to="/">جلوي</Link>
          <input
            type="search"
            className="form-control mx-3"
            placeholder="ابحث هنا..."
            onChange={handleSearch}
            value={product}
            style={{ maxWidth: '400px' }}
          />
          {userdata ? (
            <div className="d-flex align-items-center">
              <Link to="/whichList" className="btn-outline-secondary">
                <FaHeart className='fs-3 mx-5 text-danger' />
              </Link>
              <Link to="/cart" className="btn-outline-secondary position-relative">
                <IoCartSharp className='fs-3' />
                <p className='position-absolute top-0 start-100 translate-middle badge rounded-3 bg-danger'>
                  {cartCount ? `${cartCount}` : "0"}
                </p>
              </Link>
            </div>
          ) : (
            <div className="d-flex gap-3 align-items-center">
              <p className="mb-0"><CgProfile className='fs-5' /></p>
              <Link to="/login" className="btn-outline-secondary fw-bold">تسجيل الدخول</Link>
              <p className="mb-0">/</p>
              <Link to="/signUp" className="btn-outline-secondary fw-bold">انشاء حساب</Link>
            </div>
          )}
        </div>

        <div className="border">
          <div className="container d-flex justify-content-between align-items-center">
            <div className="d-flex gap-4">
              <Link className="nav-link" to="/">الرئيسية</Link>
              <Link className="nav-link" to="/products">المنتجات</Link>

              <div className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle"
                  to="#"
                  id="productsDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ cursor: 'pointer' }}
                >
                  الاقسام
                </Link>
                {/* 🔴 التعديل هنا: استخدام dropdown-menu-start و dir="ltr" لتجبره على اليسار */}
                <ul className="dropdown-menu dropdown-menu-start" aria-labelledby="productsDropdown" dir="ltr">
                  {allSubCatigory && allSubCatigory.length > 0 ? (
                    allSubCatigory.map((elm) => (
                      <li key={elm._id}>
                        {/* استخدام justify-content-start لضمان محاذاة النص لليسار */}
                        <Link
                          className="dropdown-item d-flex align-items-center justify-content-start fw-bold px-4" // إضافة px-4
                          to={`/productOfSubCarigory/${elm._id}`}
                          onClick={handleNavLinkClick}
                        >
                          {elm.name}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li><span className="dropdown-item text-muted">لا توجد أقسام فرعية.</span></li>
                  )}
                </ul>
              </div>

              <Link className="nav-link" to="/about">من نحن</Link>
              <Link className="nav-link" to="/contact">اتصل بنا</Link>
            </div>

            {userdata && (
              <p onClick={logout} className="btn-logOut fs-6 mb-0">تسجيل الخروج</p>
            )}
          </div>
        </div>
      </nav>

      {/* ✅ Mobile Navbar */}
      <nav className="navbar d-lg-none bg-white shadow-sm" dir="rtl">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center w-100">
            <Link className="navbar-brand" to="/">جلوي</Link>

            {/* الأيقونات بجانب زر القائمة */}
            <div className="d-flex align-items-center">
              {userdata ? (
                <>
                  <Link to="/whichList" className="btn-outline-secondary mx-2">
                    <FaHeart className='fs-4 text-danger' />
                  </Link>
                  <Link to="/cart" className="btn-outline-secondary mx-3">
                    <div className="position-relative">
                      <IoCartSharp className='fs-4' />
                      <span className='position-absolute top-0 start-100 translate-middle badge rounded-3 bg-danger'>
                        {cartCount ? `${cartCount}` : "0"}
                      </span>
                    </div>
                  </Link>
                </>
              ) : (
                <div className="d-flex align-items-center">
                  <Link to="/login" className="btn-outline-secondary mx-2">
                    <CgProfile className='fs-4' />
                  </Link>
                </div>
              )}

              <button
                className="navbar-toggler"
                type="button"
                onClick={toggleMobileNav}
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>
          </div>

          {/* حقل البحث مع الأيقونات تحته */}
          <div className="mt-3 w-100">
            <div className="input-group">
              <input
                type="search"
                onChange={handleSearch}
                value={product}
                className="form-control"
                placeholder="ابحث هنا..."
              />
            </div>
          </div>

          {/* قائمة التنقل للموبايل */}
          <div className={`mt-2 navbar-collapse ${isMobileNavOpen ? 'show' : 'collapse'}`} id="mobileNav">
            <ul className="navbar-nav w-100">
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={handleNavLinkClick}>الرئيسية</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/products" onClick={handleNavLinkClick}>المنتجات</Link>
              </li>
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle"
                  to="#categories"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  الأقسام
                </Link>
                {/* 🔴 التعديل هنا: استخدام dropdown-menu-start للموبايل أيضاً */}
                <ul className="dropdown-menu dropdown-menu-start" dir="ltr">
                  {allSubCatigory && allSubCatigory.length > 0 ? (
                    allSubCatigory.map((elm) => (
                      <li key={elm._id}>
                        <Link
                          className="dropdown-item d-flex align-items-center justify-content-start fw-bold px-4"
                          to={`/productOfSubCarigory/${elm._id}`}
                          onClick={handleNavLinkClick}
                        >
                          {elm.name}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li><span className="dropdown-item text-muted">لا توجد أقسام فرعية.</span></li>
                  )}
                </ul>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/about" onClick={handleNavLinkClick}>من نحن</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contact" onClick={handleNavLinkClick}>اتصل بنا</Link>
              </li>

              {userdata && (
                <li className="nav-item">
                  <p onClick={logout} className="btn-logOut nav-link mb-0">تسجيل الخروج</p>
                </li>
              )}

              {!userdata && (
                <li className="nav-item d-flex justify-content-center gap-3 mt-2">
                  <Link to="/login" className="btn btn-outline-secondary fw-bold" onClick={handleNavLinkClick}>تسجيل الدخول</Link>
                  <Link to="/signUp" className="btn btn-outline-secondary fw-bold" onClick={handleNavLinkClick}>انشاء حساب</Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}