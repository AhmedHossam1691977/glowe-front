import { Toaster } from "react-hot-toast";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation
} from "react-router-dom";
import {
  useEffect,
  useState,
  lazy,
  Suspense
} from "react";
import { jwtDecode } from "jwt-decode";

// Context Providers
import WhichlistContextProvider from "./context/WhichListcontext.jsx";
import CartContextProvider from "./context/CartContext.jsx";
import ProductContextProvider from "./context/Product.Contextt.jsx";
import SubCatigoryContextProvider from "./context/SubcatigoruContext.jsx";

// Components
import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRouter from "./components/ProtectedData.jsx";
import Loader from "../src/components/Loader.jsx";

// صفحات عادية
import WhichList from "./pages/WhichList.jsx";
import ProductDetel from "./pages/ProductDetel.jsx";
import ProductOfSubCarigory from "./pages/ProductOfSubCarigory.jsx";
import ForgetPassword from "./pages/ForgetPassword.jsx";
import VerefyCode from "./pages/VerefyCode.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ProductOffer from "./pages/ProductOffer.jsx";
import CreatCashOrder from "./pages/CreatCashOrder.jsx";
import CatigoryContextProvider from "./context/CarigruContext.jsx";
import ProductOfCatigory from "./pages/ProductOfCatigory.jsx";
import UserOrder from "./pages/UserOrder.jsx";
import ImformationOrders from "./pages/ImformationOrders.jsx";
import Blog from "./pages/Blog.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import SiteMap from "./pages/SiteMap.jsx";
import ShippingAndReturns from "./pages/ShippingAndReturns.jsx";
import SafeShopping from "./pages/SafeShopping.jsx";
import MarketingPrograms from "./pages/MarketingPrograms.jsx";
import TermsOfUse from "./pages/Terms.jsx";
import PaymentMethods from "./pages/PaymentMethods.jsx";
import ShippingGuide from "./pages/ShippingGuide.jsx";
import ShippingLocations from "./pages/ShippingLocation.jsx";
import DeliveryTime from "./pages/DeliveryTime.jsx";
import UserSetting from "./pages/UserSetting.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import LoginPopup from "./pages/LoginPopup.jsx";

// Lazy-loaded صفحات
const Home = lazy(() => import("./pages/Home.jsx"));
const Products = lazy(() => import("./pages/Products.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const SignUp = lazy(() => import("./pages/SignUp.jsx"));
const ResetEmail = lazy(() => import("./pages/ResetEmail.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));

function AppContent() {
  const [userdata, setuserdata] = useState(null);
  const [loadingPage, setLoadingPage] = useState(false);
  const location = useLocation();
 

  
  
  function savedata(data) {
    setuserdata(data);
  }

  // ✅ جلب بيانات المستخدم من التوكن أول ما يدخل الموقع
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const data = jwtDecode(token);
        savedata(data);
      } catch (err) {
        console.error("❌ فشل في قراءة التوكن:", err);
      }
    }
  }, []);

  // ✅ Animation بسيطة أثناء التنقل بين الصفحات
  useEffect(() => {
    setLoadingPage(true);
    const timer = setTimeout(() => setLoadingPage(false), 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="app" dir="rtl">
      <Toaster position="top-center" />

      {/* ✅ تمرير بيانات المستخدم إلى الـ NavBar */}
      <NavBar userdata={userdata} />

      <main className="main-content container-fluide">
        {loadingPage ? (
          <Loader />
        ) : (
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/contact" element={<div>Contact</div>} />
              <Route path="/services" element={<div>Services</div>} />
              <Route path="/blog" element={<div>Blog</div>} />
              <Route path="/faq" element={<div>FAQ</div>} />

              {/* ✅ صفحات تسجيل الدخول */}
              <Route path="/login" element={<Login savedata={savedata} />} />
              <Route path="/signUp" element={<SignUp />} />
              <Route path="/resetEmail" element={<ResetEmail savedata={savedata} />} />
              <Route path="/forgetpass" element={<ForgetPassword />} />
              <Route path="/verefyCode" element={<VerefyCode />} />
              <Route path="/resetPassword" element={<ResetPassword />} />
              <Route path="/loginPopup" element={<Login savedata={savedata} onClose={() => {}} />} />

              {/* ✅ صفحات محمية */}
              <Route path="/productOffer" element={<ProductOffer />} />
              <Route path="/cart" element={<ProtectedRouter><Cart /></ProtectedRouter>} />
              <Route path="/checkout/:id" element={<ProtectedRouter><CreatCashOrder /></ProtectedRouter>} />
              <Route path="/whichList" element={<ProtectedRouter><WhichList /></ProtectedRouter>} />
              <Route path="/myOrder" element={<ProtectedRouter><UserOrder /></ProtectedRouter>} />
              <Route path="/my-setting" element={<ProtectedRouter><UserSetting  /></ProtectedRouter>} />

              {/* ✅ الصفحات العامة */}
              <Route path="/delivery-information" element={<ImformationOrders />} />
              <Route path="/blogs" element={<Blog />} />
              <Route path="/contactUs" element={<ContactUs />} />
              <Route path="/Sitemap" element={<SiteMap />} />
              <Route path="/ShippingAndReturns" element={<ShippingAndReturns />} />
              <Route path="/SafeShopping" element={<SafeShopping />} />
              <Route path="/MarketingPrograms" element={<MarketingPrograms />} />
              <Route path="/TermsOfUse" element={<TermsOfUse />} />
              <Route path="/PaymentMethods" element={<PaymentMethods />} />
              <Route path="/ShippingGuide" element={<ShippingGuide />} />
              <Route path="/Locations" element={<ShippingLocations />} />
              <Route path="/DeliveryTime" element={<DeliveryTime />} />
              <Route path="/productDetel/:id" element={<ProductDetel />} />
              <Route path="/productOfCatigory/:id" element={<ProductOfCatigory />} />
              <Route path="/productOfSubCarigory/:id" element={<ProductOfSubCarigory />} />

              {/* صفحة غير موجودة */}
              <Route path="/*" element={<NotFound />} />
            </Routes>
          </Suspense>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CatigoryContextProvider>
        <SubCatigoryContextProvider>
          <ProductContextProvider>
            <CartContextProvider>
              <WhichlistContextProvider>
                <Router>
                  <AppContent />
                </Router>
              </WhichlistContextProvider>
            </CartContextProvider>
          </ProductContextProvider>
        </SubCatigoryContextProvider>
      </CatigoryContextProvider>
    </AuthProvider>
  );
}
