import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import {
  FiSettings, FiUser, FiLock, FiMail, FiPhone, FiKey
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../components/Loader.jsx'; // استدعاء اللودر الموحد
import '../style/UserSetting.css';
import { useFormik } from 'formik'; // استيراد useFormik
import * as Yup from 'yup'; // استيراد Yup
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../context/AuthContext.jsx';

export default function UserSetting() {
  const { userName } = useContext(AuthContext);
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const token = localStorage.getItem('token');
 
  const userId = jwtDecode(token)?.userId || userName?._id; // استخدام userName من AuthContext إذا كان موجودًا
  const baseUrl = 'https://final-pro-api-j1v7.onrender.com';



  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {data} = await axios.get(`${baseUrl}/api/v1/user/${userId}`, {
          headers: {'token': localStorage.getItem("token")}
        });
        console.log(data);
        
        setUser (data);
      } catch (err) {
        console.log(err);
        
        toast.error('فشل في تحميل بيانات المستخدم');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && token) { // تأكد من وجود userId و token قبل جلب البيانات
      fetchUserData();
    } else {
      setIsLoading(false);
      toast.warn('بيانات المستخدم غير متوفرة لطلب إعدادات الحساب.');
    }
  }, [token, userId, baseUrl]);

  // تعريف مخطط التحقق باستخدام Yup
  const passwordValidationSchema = Yup.object({
    password: Yup.string().required('كلمة المرور الحالية مطلوبة'),
    newPassword: Yup.string()
      .min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
      .required('كلمة المرور الجديدة مطلوبة'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'كلمة المرور الجديدة غير متطابقة')
      .required('تأكيد كلمة المرور مطلوب'),
  });

  // استخدام useFormik
  const formik = useFormik({
    initialValues: {
      password: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setIsUpdating(true); // بدء عملية التحديث
      try {
        await axios.patch(`${baseUrl}/api/v1/auth/changePassword`, values, {
          headers: {
            token: localStorage.getItem("token")
          }
        });
        toast.success('تم تحديث كلمة المرور بنجاح');
        resetForm(); // إعادة تعيين النموذج بعد النجاح
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'حدث خطأ أثناء التحديث');
      } finally {
        setIsUpdating(false); // انتهاء عملية التحديث
        setSubmitting(false); // إشارة لـ Formik بأن عملية الإرسال انتهت
      }
    },
  });

  if (isLoading) return <Loader text="جاري تحميل البيانات..." />;

  return (
    <div className="settings-container">
      <ToastContainer position="top-left" rtl={true} />

      <div className="settings-header">
        <FiSettings className="settings-icon" />
        <h2>إعدادات الحساب</h2>
      </div>

      <div className="settings-content">
        {/* معلومات المستخدم */}
        <div className="profile-card">
          <div className="card-header">
            <FiUser className="card-icon" />
            <h3>معلومات الملف الشخصي</h3>
          </div>
          <div className="profile-details">
            <div className="detail-item">
              <FiUser className="detail-icon" />
              <div>
                <span className="detail-label">الاسم الكامل</span>
                <p className="detail-value">{user?.userName || 'غير محدد'}</p>
              </div>
            </div>

            <div className="detail-item">
              <FiMail className="detail-icon" />
              <div>
                <span className="detail-label">البريد الإلكتروني</span>
                <p className="detail-value">{user?.email || 'غير محدد'}</p>
              </div>
            </div>

            <div className="detail-item">
              <FiPhone className="detail-icon" />
              <div>
                <span className="detail-label">رقم الهاتف</span>
                <p className="detail-value">{user?.phoneNumber || 'غير محدد'}</p>
              </div>
            </div>

            <div className="detail-item">
              <FiKey className="detail-icon" />
              <div>
                <span className="detail-label">صلاحية المستخدم</span>
                <p className="detail-value">
                  {user?.role === 'user' ? 'مستخدم عادي' : 'مدير النظام'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* تغيير كلمة المرور */}
        <div className="password-card">
          <div className="card-header">
            <FiLock className="card-icon" />
            <h3>تغيير كلمة المرور</h3>
          </div>

          <form onSubmit={formik.handleSubmit}> {/* استخدام formik.handleSubmit */}
            <div className="form-group">
              <label htmlFor="password">
                <FiKey className="input-icon" />
                كلمة المرور الحالية
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur} // لمعالجة حالة touched
                placeholder="أدخل كلمة المرور الحالية"
              />
              {formik.touched.password && formik.errors.password ? (
                <div className="error-message">{formik.errors.password}</div>
              ) : null}
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">
                <FiKey className="input-icon" />
                كلمة المرور الجديدة
              </label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                minLength="6"
                placeholder="أدخل كلمة المرور الجديدة"
              />
              {formik.touched.newPassword && formik.errors.newPassword ? (
                <div className="error-message">{formik.errors.newPassword}</div>
              ) : null}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <FiKey className="input-icon" />
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="أعد إدخال كلمة المرور الجديدة"
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                <div className="error-message">{formik.errors.confirmPassword}</div>
              ) : null}
            </div>

            <button type="submit" disabled={isUpdating || !formik.isValid || formik.isSubmitting}>
              {isUpdating ? (
                <>
                  <span className="spinner"></span>
                  جاري الحفظ...
                </>
              ) : (
                'حفظ التغييرات'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}