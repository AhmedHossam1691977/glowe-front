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
import Loader from "../src/components/Loader.jsx"; // ✅ اللودر الجديد

// صفحات عادية
import WhichList from "./pages/WhichList.jsx";
import ProductDetel from "./pages/ProductDetel.jsx";
import ProductOfSubCarigory from "./pages/ProductOfSubCarigory.jsx";

// Lazy-loaded صفحات
const Home = lazy(() => import("./pages/Home.jsx"));
const Products = lazy(() => import("./pages/Products.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const SignUp = lazy(() => import("./pages/SignUp.jsx"));
const ResetEmail = lazy(() => import("./pages/ResetEmail.jsx"));
const MapBoxing = lazy(() => import("./pages/MapBoxing.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));

function AppContent() {
  const [userdata, setuserdata] = useState(null);
  const [loadingPage, setLoadingPage] = useState(false);
  const location = useLocation();

  function savedata(data) {
    setuserdata(data);
  }

  useEffect(() => {
    if (localStorage.getItem("token")) {
      let token = localStorage.getItem("token");
      let data = jwtDecode(token);
      savedata(data);
    }
  }, []);

  useEffect(() => {
    setLoadingPage(true);
    const timer = setTimeout(() => setLoadingPage(false), 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="app" dir="rtl">
      <Toaster position="top-center" />
      <NavBar userdata={userdata} />

      <main className="main-content container">
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

              <Route
                path="/cart"
                element={
                  <ProtectedRouter>
                    <Cart />
                  </ProtectedRouter>
                }
              />
              <Route
                path="/mapBox"
                element={
                  <ProtectedRouter>
                    <MapBoxing />
                  </ProtectedRouter>
                }
              />
              <Route
                path="/whichList"
                element={
                  <ProtectedRouter>
                    <WhichList />
                  </ProtectedRouter>
                }
              />
              <Route
                path="/productDetel/:id"
                element={
                  <ProtectedRouter>
                    <ProductDetel />
                  </ProtectedRouter>
                }
              />
              <Route
                path="/productOfSubCarigory/:id"
                element={
                  <ProtectedRouter>
                    <ProductOfSubCarigory />
                  </ProtectedRouter>
                }
              />

              <Route path="/login" element={<Login savedata={savedata} />} />
              <Route path="/signUp" element={<SignUp />} />
              <Route path="/resetEmail" element={<ResetEmail savedata={savedata} />} />
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
  );
}
