import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import * as Yup from "yup";
import toast, { Toaster } from "react-hot-toast";

export default function ResetPassword() { // New component for setting the new password
  const [loading, setLoading] = useState(false);
  const baseUrl = "https://final-pro-api-j1v7.onrender.com";
  const navigate = useNavigate();

  // Validation schema for email, new password, and confirm password
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("يرجى إدخال بريد إلكتروني صالح")
      .required("البريد الإلكتروني مطلوب"),
    newPassword: Yup.string()
      .required("كلمة المرور الجديدة مطلوبة")
     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, "كلمة المرور يجب أن تكون 6 أحرف على الأقل و تحتوي علي احرف كبيره و علامه علي الاقل "),
  
    confirmPassword: Yup.string()
      .required("تأكيد كلمة المرور مطلوب")
      .oneOf([Yup.ref("newPassword")], "كلمتا المرور غير متطابقتين"),
  });

  const resetPasswordForm = useFormik({
    initialValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit,
  });

  async function onSubmit(values) {
    setLoading(true);

    try {
      // Send PATCH request to reset the password
      const { data } = await axios.patch(`${baseUrl}/api/v1/auth/resetPassword`, {
        email: values.email,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      if (data.message === "success") {
        toast.success("تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.");
        navigate("/login"); // Navigate to login page after successful password reset
      } else {
        toast.error(data.error || "حدث خطأ أثناء تغيير كلمة المرور.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "حدث خطأ أثناء تغيير كلمة المرور.");
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
        <h2 className="mb-4 text-center">تعيين كلمة مرور جديدة</h2>

        <form noValidate onSubmit={resetPasswordForm.handleSubmit}>
          <div className="mb-3">
            <label>البريد الإلكتروني:</label>
            <input
              type="email"
              name="email"
              className="form-control"
              onChange={resetPasswordForm.handleChange}
              onBlur={resetPasswordForm.handleBlur}
              value={resetPasswordForm.values.email}
            />
            {resetPasswordForm.touched.email && resetPasswordForm.errors.email && (
              <p className="text-danger">{resetPasswordForm.errors.email}</p>
            )}
          </div>

          <div className="mb-3">
            <label>كلمة المرور الجديدة:</label>
            <input
              type="password"
              name="newPassword"
              className="form-control"
              onChange={resetPasswordForm.handleChange}
              onBlur={resetPasswordForm.handleBlur}
              value={resetPasswordForm.values.newPassword}
            />
            {resetPasswordForm.touched.newPassword && resetPasswordForm.errors.newPassword && (
              <p className="text-danger">{resetPasswordForm.errors.newPassword}</p>
            )}
          </div>

          <div className="mb-3">
            <label>تأكيد كلمة المرور الجديدة:</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              onChange={resetPasswordForm.handleChange}
              onBlur={resetPasswordForm.handleBlur}
              value={resetPasswordForm.values.confirmPassword}
            />
            {resetPasswordForm.touched.confirmPassword && resetPasswordForm.errors.confirmPassword && (
              <p className="text-danger">{resetPasswordForm.errors.confirmPassword}</p>
            )}
          </div>

          {loading ? (
            <button type="button" className="btn btn-danger w-100 my-3" disabled>
              <i className="fa-solid fa-spinner fa-spin"></i> جاري تعيين كلمة المرور...
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={!(resetPasswordForm.isValid && resetPasswordForm.dirty)}
            >
              تعيين كلمة المرور
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