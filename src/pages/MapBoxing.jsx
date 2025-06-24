import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZHJpdmVyLTAwMSIsImEiOiJjbWFhNTIyZGkwMDRpMmtzY2ViajhjNWxxIn0.S1n00AYof_e15Q_RMGQc1A";

export default function MapBoxUserLocation() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const popup = useRef(null);
  const [lngLat, setLngLat] = useState(null);
  const [address, setAddress] = useState("");
  const baseUrl = "https://final-pro-api-j1v7.onrender.com";
  const navigate = useNavigate();

  const fetchAddress = async (coords) => {
    const [lng, lat] = coords;
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      const place = data.features?.[0]?.place_name || "لم يتم العثور على عنوان";
      setAddress(place);

      // Remove old popup before creating new one
      if (popup.current) popup.current.remove();

      const newPopup = new mapboxgl.Popup({ offset: 25 })
        .setLngLat(coords)
        .setText(place)
        .addTo(map.current);

      popup.current = newPopup;
      marker.current.setPopup(popup.current);
    } catch (error) {
      console.error("❌ فشل في جلب العنوان:", error);
      alert("فشل في جلب العنوان.");
    }
  };

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = [
          position.coords.longitude,
          position.coords.latitude,
        ];

        setLngLat(userCoords);

        if (!map.current) {
          initMap(userCoords);
        } else {
          marker.current.setLngLat(userCoords);
          map.current.setCenter(userCoords);
          fetchAddress(userCoords);
        }
      },
      (error) => {
        console.error("❌ خطأ في الحصول على الموقع:", error);
        alert("يجب السماح بالوصول للموقع لاستخدام هذه الميزة.");
      }
    );
  };

  useEffect(() => {
    if (!navigator.permissions) {
      requestLocation();
      return;
    }

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (result.state === "granted" || result.state === "prompt") {
          requestLocation();
        } else {
          alert("تم رفض الوصول للموقع. الرجاء السماح بالوصول لاستخدام هذه الميزة.");
        }
      })
      .catch(() => {
        requestLocation();
      });
  }, []);

  const initMap = (coords) => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: coords,
      zoom: 14,
    });

    marker.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat(coords)
      .addTo(map.current);

    marker.current.on("dragend", () => {
      const newCoords = marker.current.getLngLat();
      const updated = [newCoords.lng, newCoords.lat];
      setLngLat(updated);
      fetchAddress(updated);
    });

    map.current.on("load", () => {
      map.current.resize();
    });

    fetchAddress(coords);
  };

  const saveLocation = async () => {
    if (!lngLat || !address) {
      alert("الرجاء تحديد الموقع والعنوان أولاً.");
      return;
    }

    const payload = {
      location: {
        type: "Point",
        coordinates: [lngLat[1], lngLat[0]], // [lat, lng]
      },
      addresses: address,
    };

    try {
      const { data } = await axios.put(
        `${baseUrl}/api/v1/auth/updateUser`,
        payload,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      console.log("📍 بيانات الموقع:", data);
      
      if (data.message === "success") {

        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        alert("فشل حفظ الموقع.");
      }
    } catch (error) {
      console.error("❌ فشل التحديث:", error);
      alert("حدث خطأ أثناء حفظ الموقع.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>تحديد موقعك الحالي</h3>

      {!lngLat && <p>⏳ جاري تحديد موقعك...</p>}

      <div
        ref={mapContainer}
        style={{
          height: "600px",
          width: "100%",
          display: lngLat ? "block" : "none",
          borderRadius: "10px",
          marginBottom: "15px",
        }}
      />

      <div style={{ marginBottom: "15px" }}>
        <button
          onClick={requestLocation}
          className="btn btn-outline-primary me-2 m-2"
          style={{ marginRight: "10px" }}
        >
          🔄 تحديث موقعي
        </button>

        <button
          onClick={saveLocation}
          className="btn btn-success  me-2 m-2"
        >
          💾 حفظ الموقع
        </button>
      </div>

      {address && (
        <div style={{ direction: "rtl" }}>
          <strong>🏠 العنوان:</strong> {address}
        </div>
      )}

      {/* {lngLat && (
        <div style={{ marginTop: "10px", direction: "rtl" }}>
          <strong>📍 الإحداثيات:</strong> {lngLat[1].toFixed(6)}, {lngLat[0].toFixed(6)}
        </div>
      )} */}
    </div>
  );
}
