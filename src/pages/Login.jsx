import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

export default function Login({savedata}) {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const baseUrl = "https://final-pro-api-j1v7.onrender.com";
const navigate = useNavigate();

  // ✅ Schema: identifier = email OR phone
  const validationSchema = Yup.object({
    identifier: Yup.string().required("البريد الإلكتروني أو رقم الهاتف مطلوب").test("is-email-or-phone", "يرجى إدخال بريد إلكتروني أو رقم هاتف صحيح", function (value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^01[0125][0-9]{8}$/;
        return emailRegex.test(value) || phoneRegex.test(value);
      }),
    password: Yup.string()
      .required("كلمة المرور مطلوبة")
      .matches(/^[a-zA-Z0-9]{6,}$/, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
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
  savedata(data.token)
  navigate("/"); // Redirect without page refresh
}

    } catch (error) {
      setErrorMessage(error.response?.data?.error || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  }

 


  return (
    <div style={{ maxWidth: 400, margin: "30px auto", padding: 20, border: "1px solid #ccc", borderRadius: 20 }}>
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
          />
          {loginForm.touched.password && loginForm.errors.password && (
            <p className="text-danger">{loginForm.errors.password}</p>
          )}
        </div>

        {loading ? (
          <button type="button" className="btn btn-danger w-100 my-3">
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
      </form>
    </div>
  );
}
