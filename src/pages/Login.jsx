import axios from "axios";
import { useFormik } from "formik";
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link for navigation
import * as Yup from "yup";
import toast, { Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Login({ savedata }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const baseUrl = "https://final-pro-api-j1v7.onrender.com";
  const navigate = useNavigate();
 let { setUserName } = useContext(AuthContext);
  // ✅ Schema: identifier = email OR phone
  const validationSchema = Yup.object({
    identifier: Yup.string()
      .required("البريد الإلكتروني أو رقم الهاتف مطلوب")
      .test(
        "is-email-or-phone",
        "يرجى إدخال بريد إلكتروني أو رقم هاتف صحيح",
        function (value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const phoneRegex = /^01[0125][0-9]{8}$/;
          return emailRegex.test(value) || phoneRegex.test(value);
        }
      ),
    password: Yup.string()
      .required("كلمة المرور مطلوبة")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, "كلمة المرور يجب أن تكون 6 أحرف على الأقل و تحتوي علي احرف كبيره و علامه علي الاقل "),
  });

  const loginForm = useFormik({
    initialValues: {
      identifier: "",
      password: "",
    },
    validationSchema,
    onSubmit,
  });

  
  async function onSubmit(values) {
    setLoading(true);
    setErrorMessage("");
    console.log("Form submitted with values:", values);

    try {
      const { data } = await axios.post(`${baseUrl}/api/v1/auth/signin`, values);
      if (data.message === "successful") {
        localStorage.setItem("token", data.token);
        savedata(data.token);
        
        
        setUserName(jwtDecode(data.token)); // Set the username in state
        navigate("/"); // Redirect without page refresh
         toast.success('تم تسجيل الدخول بنجاح');
      }else {
        setErrorMessage("فشل تسجيل الدخول، يرجى التحقق من بيانات الاعتماد الخاصة بك");
      }
    } catch (error) {
      console.log("Error during login:", error.response?.data.message);
      if(error.response?.data.message==='The activation code has been sent again to your email'){
         toast.success('تم إرسال كود التفعيل مرة أخرى إلى بريدك الإلكتروني');
         navigate("/resetEmail");
      }
      setErrorMessage(error.response?.data?.error || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh", // Use minHeight to center vertically in the viewport
        backgroundColor: "#f8f9fa", // Optional: Add a light background color
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%", // Make it responsive
          padding: 20,
          border: "1px solid #ccc",
          borderRadius: 20,
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Optional: Add a subtle shadow
          backgroundColor: "#fff", // Optional: White background for the form container
        }}
      >
        <h2 className="mb-4 text-center">تسجيل الدخول</h2>

        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        <form noValidate onSubmit={loginForm.handleSubmit}>
          <div className="mb-3">
            <label>البريد الإلكتروني أو رقم الهاتف:</label>
            <input
              type="text"
              name="identifier"
              className="form-control"
              onChange={loginForm.handleChange}
              onBlur={loginForm.handleBlur}
              value={loginForm.values.identifier} // Ensure input reflects formik state
            />
            {loginForm.touched.identifier && loginForm.errors.identifier && (
              <p className="text-danger">{loginForm.errors.identifier}</p>
            )}
          </div>

          <div className="mb-3">
            <label>كلمة المرور:</label>
            <input
              type="password"
              name="password"
              className="form-control"
              onChange={loginForm.handleChange}
              onBlur={loginForm.handleBlur}
              value={loginForm.values.password} // Ensure input reflects formik state
            />
            {loginForm.touched.password && loginForm.errors.password && (
              <p className="text-danger">{loginForm.errors.password}</p>
            )}
          </div>

          {loading ? (
            <button type="button" className="btn btn-danger w-100 my-3" disabled>
              <i className="fa-solid fa-spinner fa-spin"></i>
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={!(loginForm.isValid && loginForm.dirty)}
            >
              تسجيل الدخول
            </button>
          )}

          <div className="d-flex justify-content-between align-items-center mt-3">
            <Link to="/forgetpass" className="text-primary text-decoration-none">
              نسيت كلمة السر؟
            </Link>
            <Link to="/signUp" className="text-primary text-decoration-none">
              ليس لدي حساب
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}