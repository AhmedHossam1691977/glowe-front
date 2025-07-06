import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import * as Yup from "yup";
import toast, { Toaster } from "react-hot-toast";

export default function VerefyCode() { // New component name
  const [loading, setLoading] = useState(false);
  const baseUrl = "https://final-pro-api-j1v7.onrender.com";
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    code: Yup.string()
      .required("الكود مطلوب")
      .matches(/^\d{6}$/, "الكود يجب أن يكون 6 أرقام"), // Validation for a 6-digit code
  });

  const verifyCodeForm = useFormik({
    initialValues: {
      code: "",
    },
    validationSchema,
    onSubmit,
  });

  async function onSubmit(values) {
    setLoading(true);

    try {
      // New endpoint for verifying the reset code
      const { data } = await axios.post(`${baseUrl}/api/v1/auth/verifyResetCode`, { code: values.code });

      if (data.message === "success") {
        toast.success("تم التحقق من الكود بنجاح! يمكنك الآن تعيين كلمة مرور جديدة.");
        // After successful code verification, navigate to the new password page
        navigate("/resetPassword"); // You'll need to create a /resetPassword route and component
      } else {
        toast.error(data.error || "الكود غير صحيح، يرجى المحاولة مرة أخرى.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "حدث خطأ أثناء التحقق من الكود.");
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
        <h2 className="mb-4 text-center">التحقق من رمز إعادة التعيين</h2>

        <form noValidate onSubmit={verifyCodeForm.handleSubmit}>
          <div className="mb-3">
            <label>أدخل رمز إعادة التعيين الذي وصلك على بريدك الإلكتروني:</label>
            <input
              type="text"
              name="code"
              className="form-control"
              onChange={verifyCodeForm.handleChange}
              onBlur={verifyCodeForm.handleBlur}
              value={verifyCodeForm.values.code}
            />
            {verifyCodeForm.touched.code && verifyCodeForm.errors.code && (
              <p className="text-danger">{verifyCodeForm.errors.code}</p>
            )}
          </div>

          {loading ? (
            <button type="button" className="btn btn-danger w-100 my-3" disabled>
              <i className="fa-solid fa-spinner fa-spin"></i> جاري التحقق...
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={!(verifyCodeForm.isValid && verifyCodeForm.dirty)}
            >
              تحقق من الرمز
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