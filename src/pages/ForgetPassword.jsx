import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import * as Yup from "yup";
import toast, { Toaster } from "react-hot-toast";

export default function ForgetPassword() { // Removed savedata prop
  const [loading, setLoading] = useState(false);
  const baseUrl = "https://final-pro-api-j1v7.onrender.com";
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("يرجى إدخال بريد إلكتروني صالح")
      .required("البريد الإلكتروني مطلوب")
      .min(3, "يجب أن يكون البريد الإلكتروني على الأقل 3 أحرف"),
  });

  const forgetPasswordForm = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit,
  });

  async function onSubmit(values) {
    setLoading(true);

    try {
      // Changed endpoint and payload to send email for password reset
      const { data } = await axios.post(`${baseUrl}/api/v1/auth/forgetPassword`, { email: values.email });

      if (data.message === "success") {
        toast.success("تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني!");
        // Navigate to the component where the user can enter the received code
        navigate("/verefyCode"); // Assuming /resetEmail is the route for entering the code
      } else {
        toast.error(data.error || "حدث خطأ: لا يمكن إرسال رمز إعادة التعيين.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "حدث خطأ أثناء طلب إعادة تعيين كلمة المرور");
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
        minHeight: "100vh", // Center vertically in the viewport
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%", // Make it responsive
          padding: 20,
          border: "1px solid #ccc",
          borderRadius: 20,
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Optional: Subtle shadow
          backgroundColor: "#fff", // Optional: White background for the form container
        }}
      >
        <Toaster position="top-center" />
        <h2 className="mb-4 text-center">إعادة تعيين كلمة المرور</h2> {/* Updated heading */}

        <form noValidate onSubmit={forgetPasswordForm.handleSubmit}>
          <div className="mb-3">
            <label>أدخل بريدك الإلكتروني:</label> {/* Updated label */}
            <input
              type="email" // Changed type to email
              name="email" // Changed name to email
              className="form-control"
              onChange={forgetPasswordForm.handleChange}
              onBlur={forgetPasswordForm.handleBlur}
              value={forgetPasswordForm.values.email}
            />
            {forgetPasswordForm.touched.email && forgetPasswordForm.errors.email && (
              <p className="text-danger">{forgetPasswordForm.errors.email}</p>
            )}
          </div>

          {loading ? (
            <button type="button" className="btn btn-danger w-100 my-3" disabled>
              <i className="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={!(forgetPasswordForm.isValid && forgetPasswordForm.dirty)}
            >
              إرسال رمز إعادة التعيين
            </button>
          )}

          <div className="text-center mt-3">
            <Link to="/login" className="text-primary text-decoration-none">
              العودة لتسجيل الدخول
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}