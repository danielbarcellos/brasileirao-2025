import React, { useEffect, useState } from 'react';
import './ChampionCelebration.css';

const ChampionCelebration = ({ champion, onClose }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Auto fechar após 10 segundos
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 1000);
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!show || !champion) return null;

  return (
    <div className="celebration-overlay">
      {/* Confetes animados */}
      <div className="confetti-container">
        {[...Array(100)].map((_, i) => (
          <div 
            key={i} 
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 12 + 6}px`
            }}
          />
        ))}
      </div>

      {/* Fogos de artifício */}
      <div className="fireworks-container">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="firework"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 5}s`,
              '--color': `hsl(${Math.random() * 360}, 80%, 60%)`
            }}
          />
        ))}
      </div>

      {/* Escudo do campeão animado */}
      <div className="champion-shield animate-shield">
        <div className="shield-content">
          <div className="shield-icon">🏆</div>
          <div className="champion-name">{champion}</div>
          <div className="champion-title">CAMPEÃO BRASILEIRO 2025</div>
          <div className="champion-stars">⭐⭐⭐⭐⭐</div>
        </div>
      </div>

      {/* Botão de fechar */}
      <button className="close-celebration" onClick={() => {
        setShow(false);
        setTimeout(onClose, 1000);
      }}>
        ✕
      </button>
    </div>
  );
};

export default ChampionCelebration;