// src/components/LoginPopup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import toast from 'react-hot-toast';
import { useFormik } from 'formik'; // Import useFormik
import * as Yup from 'yup'; // Import Yup

export default function LoginPopup({ onClose }) { // Add savedata prop
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  // Base URL for the API
  const baseUrl = "https://final-pro-api-j1v7.onrender.com";

  // Define the validation schema using Yup
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
      .matches(/^[a-zA-Z0-9]{6,}$/, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  });

  // Initialize Formik
  const loginForm = useFormik({
    initialValues: {
      identifier: "", // Changed from email to identifier
      password: "",
    },
    validationSchema, // Apply the validation schema
    onSubmit
  });



   async function onSubmit (values)  { // Define the onSubmit function
      setIsLoading(true);
    console.log("Form submitted with values:", values);
    
      try {
        // Make the API call to sign in
        const { data } = await axios.post(`${baseUrl}/api/v1/auth/signin`, values);

        if (data.message === "successful") { // Check for "successful" message as per your Login component
          localStorage.setItem("token", data.token); // Changed from userToken to token
          toast.success("تم تسجيل الدخول بنجاح!", { duration: 1500 });
          onClose(); // Close the Pop-up on successful login
          console.log("Login successful, token:", data.token);

          // savedata(data.token); 
          navigate("/");
        } else {
          // Display error message from the API if available, otherwise a generic one
          toast.error(data.message || "فشل تسجيل الدخول", { duration: 2000 });
        }
      } catch (error) {
        console.error("Login error:", error);
        if (error.response && error.response.data && error.response.data.error) { // Check for 'error' field as per your Login component
          toast.error(error.response.data.error, { duration: 2000 });
        } else {
          toast.error("حدث خطأ أثناء تسجيل الدخول، حاول مرة أخرى.", { duration: 2000 });
        }
      } finally {
        setIsLoading(false);
      }
    }




  return (
    <div className="login-popup-overlay position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}>
      <div className="login-popup-content bg-white p-4 rounded shadow-lg" style={{ maxWidth: '400px', width: '90%' }}>
        <h3 className="text-center mb-4">تسجيل الدخول</h3>
        {/* Use loginForm.handleSubmit for the form's onSubmit */}
        <form noValidate onSubmit={loginForm.handleSubmit}>
          <div className="mb-3">
            <label htmlFor="identifier" className="form-label">البريد الإلكتروني أو رقم الهاتف:</label> {/* Updated label */}
            <input
              type="text" // Changed type to text for identifier
              className="form-control"
              id="identifier" // Updated id
              name="identifier" // Important: name attribute must match Formik's initialValues key
              onChange={loginForm.handleChange} // Formik's change handler
              onBlur={loginForm.handleBlur}   // Formik's blur handler for touch state
              value={loginForm.values.identifier} // Bind value to Formik's state
            />
            {/* Display validation error for identifier */}
            {loginForm.touched.identifier && loginForm.errors.identifier && (
              <p className="text-danger">{loginForm.errors.identifier}</p>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="passwordInput" className="form-label">كلمة المرور:</label>
            <input
              type="password"
              className="form-control"
              id="passwordInput"
              name="password" // Important: name attribute must match Formik's initialValues key
              onChange={loginForm.handleChange} // Formik's change handler
              onBlur={loginForm.handleBlur}   // Formik's blur handler for touch state
              value={loginForm.values.password} // Bind value to Formik's state
            />
            {/* Display validation error for password */}
            {loginForm.touched.password && loginForm.errors.password && (
              <p className="text-danger">{loginForm.errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-dark w-100"
            // Disable button if form is not valid or not dirty, or if loading
            disabled={!(loginForm.isValid && loginForm.dirty) || isLoading}
          >
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
        <p className="text-center mt-3 mb-0">
          ليس لديك حساب؟{' '}
          <Link to="/signup" onClick={onClose} className="text-decoration-none">
            إنشاء حساب جديد
          </Link>
        </p>
        <button
          className="btn-close position-absolute top-0 end-0 m-3"
          aria-label="Close"
          onClick={onClose} // Close button
        ></button>
      </div>
    </div>
  );
}
