// components/Loader.jsx
export default function Loader() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="loading-spinner text-danger fs-1" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
