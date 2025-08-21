import React from 'react';

function Header() {
  const currentTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <header style={{
      textAlign: 'center',
      color: 'white',
      marginBottom: '30px'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '300',
        margin: '0 0 8px 0',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}>
        Emerald Hills Weather
      </h1>
      <p style={{
        fontSize: '1.1rem',
        margin: '0 0 4px 0',
        opacity: '0.9'
      }}>
        363 Lakeview Way • 440 ft elevation
      </p>
      <p style={{
        fontSize: '0.95rem',
        margin: '0',
        opacity: '0.8'
      }}>
        {currentTime}
      </p>
    </header>
  );
}

export default Header;