import React from 'react';

export default class ErrorBander extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // هذا يحدث عند حصول خطأ في أحد الـ components
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // يمكنك تسجيل الخطأ هنا أو إرساله لسيرفر
    console.error('Error caught by ErrorBander:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red' }}>حدث خطأ ما، يرجى المحاولة لاحقًا.</div>;
    }

    return this.props.children;
  }
}
