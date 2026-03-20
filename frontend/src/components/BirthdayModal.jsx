import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import '../styles/BirthdayModal.css';

export default function BirthdayModal({ isOpen, onClose, userName }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`birthday-overlay ${isAnimating ? 'show' : ''}`} onClick={handleClose}>
      <div className="birthday-modal" onClick={(e) => e.stopPropagation()}>
        <button className="birthday-close" onClick={handleClose}>
          <X size={24} />
        </button>

        <div className="birthday-content">
          <div className="confetti"></div>

          <h1 className="birthday-title">¡Feliz Cumpleaños!</h1>

          <p className="birthday-subtitle">
            {userName}
          </p>

          <div className="birthday-message">
            <p>
              Esta aplicación fue hecha especialmente para ti.
            </p>
            <p>
              Un espacio simple para que ordenes tus finanzas sin complicaciones.
            </p>
            <p className="birthday-closing">
              Que disfrutes cada momento de este día
              <br />
              y muchos más.
            </p>
          </div>

          <button
            className="birthday-btn"
            onClick={handleClose}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
