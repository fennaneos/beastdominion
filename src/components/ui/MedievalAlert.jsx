// src/components/ui/MedievalAlert.jsx
import "./MedievalAlert.css";

export default function MedievalAlert({ message, children, onClose }) {
  return (
    <div className="medieval-alert-overlay" onClick={onClose}>
      <div className="medieval-alert-content" onClick={(e) => e.stopPropagation()}>
        
        {message && (
          <div className="medieval-alert-message">{message}</div>
        )}

        {children && (
          <div className="medieval-alert-children">{children}</div>
        )}

        <button className="medieval-alert-button" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
