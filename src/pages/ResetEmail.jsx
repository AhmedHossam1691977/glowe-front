import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import toast, { Toaster } from "react-hot-toast";

export default function VerifyEmailCode({ savedata }) {
  const [loading, setLoading] = useState(false);
  const baseUrl = "https://final-pro-api-j1v7.onrender.com";
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    code: Yup.string()
      .required("الكود مطلوب")
      .matches(/^\d{6}$/, "الكود يجب أن يكون 6 أرقام"),
  });

  const verifyForm = useFormik({
    initialValues: {
      code: "",
    },
    validationSchema,
    onSubmit,
  });

  async function onSubmit(values) {
    setLoading(true);

    try {
      const { data } = await axios.post(`${baseUrl}/api/v1/auth/resetEmail`, values);

      if (data.message === "success") {
        toast.success("تم التحقق من البريد الإلكتروني بنجاح!");
        localStorage.setItem("token", data.token);
        savedata(data.token);
        navigate("/mapBox"); // Redirect to the map page
      } else {
        toast.error("الكود غير صحيح، حاول مرة أخرى.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "حدث خطأ أثناء التحقق من الكود");
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
        <h2 className="mb-4 text-center">التحقق من البريد الإلكتروني</h2>

        <form noValidate onSubmit={verifyForm.handleSubmit}>
          <div className="mb-3">
            <label>أدخل الكود المرسل إلى بريدك الإلكتروني:</label>
            <input
              type="text"
              name="code"
              className="form-control"
              onChange={verifyForm.handleChange}
              onBlur={verifyForm.handleBlur}
              value={verifyForm.values.code}
            />
            {verifyForm.touched.code && verifyForm.errors.code && (
              <p className="text-danger">{verifyForm.errors.code}</p>
            )}
          </div>

          {loading ? (
            <button type="button" className="btn btn-danger w-100 my-3" disabled>
              <i className="fa-solid fa-spinner fa-spin"></i> جاري التحقق
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={!(verifyForm.isValid && verifyForm.dirty)}
            >
              تحقق من الكود
            </button>
          )}
        </form>
      </div>
    </div>
  );
}