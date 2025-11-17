// src/components/ui/MedievalAlert.jsx
import "./MedievalAlert.css";

export default function MedievalAlert({ message, onClose }) {
  // Handle click on the overlay or the button to close
  const handleClose = (e) => {
    // Prevent closing if clicking inside the content area
    if (e.target === e.currentTarget || e.target.tagName === 'BUTTON') {
      onClose();
    }
  };

  return (
    <div className="medieval-alert-overlay" onClick={handleClose}>
      <div className="medieval-alert-content">
        <div className="medieval-alert-icon">✦</div>
        <h2 className="medieval-alert-title">Success</h2>
        <p className="medieval-alert-message">{message}</p>
        <button className="medieval-alert-button" onClick={onClose}>
          Forsooth
        </button>
      </div>
    </div>
  );
}