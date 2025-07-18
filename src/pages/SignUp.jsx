import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import toast, { Toaster } from "react-hot-toast";

export default function SignUp() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const baseUrl = "https://final-pro-api-j1v7.onrender.com";
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required("الاسم مطلوب")
      .min(3, "يجب أن يكون الاسم على الأقل 3 أحرف")
      .max(20, "يجب ألا يزيد الاسم عن 20 حرفًا"),

       lastName: Yup.string()
      .required("الاسم مطلوب")
      .min(3, "يجب أن يكون الاسم على الأقل 3 أحرف")
      .max(20, "يجب ألا يزيد الاسم عن 20 حرفًا"),

   email: Yup.string()
    .email("يرجى إدخال بريد إلكتروني صالح")
    .required("البريد الإلكتروني مطلوب")
    .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, "يجب أن يكون البريد الإلكتروني على Gmail فقط")
    .min(3, "يجب أن يكون البريد الإلكتروني على الأقل 3 أحرف"),

    password: Yup.string()
      .required("كلمة المرور مطلوبة")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, "كلمة المرور يجب أن تكون 6 أحرف على الأقل و تحتوي علي احرف كبيره و علامه علي الاقل "),

    confirmPassword: Yup.string()
      .required("تأكيد كلمة المرور مطلوب")
      .oneOf([Yup.ref("password")], "كلمتا المرور غير متطابقتين"),

    phoneNumber: Yup.string()
      .required("رقم الهاتف مطلوب")
      .matches(/^01[0125][0-9]{8}$/, "يرجى إدخال رقم هاتف مصري صحيح"),
  });

  const registerForm = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
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
         navigate("/resetEmail", { state: { email: values.email } });
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "حدث خطأ أثناء التسجيل");
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
        <h2 className="mb-4 text-center">إنشاء حساب جديد</h2>

        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        <form noValidate onSubmit={registerForm.handleSubmit}>
          <div className="mb-3">
            <label>الاسم الاول:</label>
            <input
              type="text"
              name="firstName"
              className="form-control"
              onChange={registerForm.handleChange}
              onBlur={registerForm.handleBlur}
              value={registerForm.values.firstName}
            />
            {registerForm.touched.firstName && registerForm.errors.firstName && (
              <p firstName="text-danger">{registerForm.errors.firstName}</p>
            )}
          </div>
           <div className="mb-3">
            <label>الاسم الثاني:</label>
            <input
              type="text"
              name="lastName"
              className="form-control"
              onChange={registerForm.handleChange}
              onBlur={registerForm.handleBlur}
              value={registerForm.values.lastName}
            />
            {registerForm.touched.lastName && registerForm.errors.lastName && (
              <p lastName="text-danger">{registerForm.errors.lastName}</p>
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

          <div className="text-center mt-3">
            <Link to="/login" className="text-primary text-decoration-none">
              لدي حساب بالفعل
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 