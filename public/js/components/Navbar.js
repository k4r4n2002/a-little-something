import React, { useState } from 'react';

const Navbar = ({ user, onLogout, activeTab, setActiveTab }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      onLogout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">A Little Something</div>
      
      <div className="navbar-tabs">
        <button 
          className={`tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          Home
        </button>
        <button 
          className={`tab ${activeTab === 'tictactoe' ? 'active' : ''}`}
          onClick={() => setActiveTab('tictactoe')}
        >
          Tic Tac Toe
        </button>
      </div>

      <div className="user-section">
        <div 
          className="user-avatar"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          {showTooltip && (
            <div className="user-tooltip">
              <div className="user-info">
                <div className="user-name">{user.displayName || user.username}</div>
                <div className="user-email">{user.username}@example.com</div>
              </div>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
