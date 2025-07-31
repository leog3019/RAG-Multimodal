import React from 'react';
import './Header.css'; // Usaremos estilos externos

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <img src="/logo_epn.png" alt="Logo EPN" className="logo" />
        <h1 className='rag-title'>Retrieval Augmented Generation</h1>
      </div>
    </header>
  );
};

export default Header;
