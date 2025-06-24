import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function SignUp() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const baseUrl = "https://final-pro-api-j1v7.onrender.com";
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("الاسم مطلوب")
      .min(3, "يجب أن يكون الاسم على الأقل 3 أحرف")
      .max(20, "يجب ألا يزيد الاسم عن 20 حرفًا"),

    email: Yup.string()
      .email("يرجى إدخال بريد إلكتروني صالح")
      .required("البريد الإلكتروني مطلوب")
      .min(3, "يجب أن يكون البريد الإلكتروني على الأقل 3 أحرف"),

    password: Yup.string()
      .required("كلمة المرور مطلوبة")
      .matches(/^[a-zA-Z0-9]{6,}$/, "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل، وتشمل أحرفًا وأرقامًا"),

    confirmPassword: Yup.string()
      .required("تأكيد كلمة المرور مطلوب")
      .oneOf([Yup.ref("password")], "كلمتا المرور غير متطابقتين"),

    phoneNumber: Yup.string()
      .required("رقم الهاتف مطلوب")
      .matches(/^01[0125][0-9]{8}$/, "يرجى إدخال رقم هاتف مصري صحيح"),
  });

  const registerForm = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    },
    validationSchema,
    onSubmit,
  });

  async function onSubmit(values) {
    setLoading(true);
    setErrorMessage("");

    try {
      let { data } = await axios.post(`${baseUrl}/api/v1/auth/signup`, values);

      if (data.message === "success") {
        toast.success("تم التسجيل بنجاح! راجع بريدك الإلكتروني لتفعيل الحساب");
        navigate("/resetEmail");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "حدث خطأ أثناء التسجيل");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "30px auto", padding: 20, border: "1px solid #ccc", borderRadius: 20 }}>
       <Toaster position="top-center" /> {/* ✅ عرض التوست */}
      <h2 className="mb-4 text-center">إنشاء حساب جديد</h2>

      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <form noValidate onSubmit={registerForm.handleSubmit}>
        <div className="mb-3">
          <label>الاسم:</label>
          <input
            type="text"
            name="name"
            className="form-control"
            onChange={registerForm.handleChange}
            onBlur={registerForm.handleBlur}
            value={registerForm.values.name}
          />
          {registerForm.touched.name && registerForm.errors.name && (
            <p className="text-danger">{registerForm.errors.name}</p>
          )}
        </div>

        <div className="mb-3">
          <label>البريد الإلكتروني:</label>
          <input
            type="email"
            name="email"
            className="form-control"
            onChange={registerForm.handleChange}
            onBlur={registerForm.handleBlur}
            value={registerForm.values.email}
          />
          {registerForm.touched.email && registerForm.errors.email && (
            <p className="text-danger">{registerForm.errors.email}</p>
          )}
        </div>

        <div className="mb-3">
          <label>رقم الهاتف:</label>
          <input
            type="tel"
            name="phoneNumber"
            className="form-control"
            onChange={registerForm.handleChange}
            onBlur={registerForm.handleBlur}
            value={registerForm.values.phoneNumber}
          />
          {registerForm.touched.phoneNumber && registerForm.errors.phoneNumber && (
            <p className="text-danger">{registerForm.errors.phoneNumber}</p>
          )}
        </div>

        <div className="mb-3">
          <label>كلمة المرور:</label>
          <input
            type="password"
            name="password"
            className="form-control"
            onChange={registerForm.handleChange}
            onBlur={registerForm.handleBlur}
            value={registerForm.values.password}
          />
          {registerForm.touched.password && registerForm.errors.password && (
            <p className="text-danger">{registerForm.errors.password}</p>
          )}
        </div>

        <div className="mb-3">
          <label>تأكيد كلمة المرور:</label>
          <input
            type="password"
            name="confirmPassword"
            className="form-control"
            onChange={registerForm.handleChange}
            onBlur={registerForm.handleBlur}
            value={registerForm.values.confirmPassword}
          />
          {registerForm.touched.confirmPassword && registerForm.errors.confirmPassword && (
            <p className="text-danger">{registerForm.errors.confirmPassword}</p>
          )}
        </div>

        {loading ? (
          <button type="button" className="btn btn-danger w-100 my-3 d-block" disabled>
            <i className="fa-solid fa-spinner fa-spin"></i>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!(registerForm.isValid && registerForm.dirty)}
            className="btn btn-primary w-100"
          >
            إنشاء الحساب
          </button>
        )}
      </form>
    </div>
  );
}
