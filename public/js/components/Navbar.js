
function Navbar({ user, onLogout, activeTab, setActiveTab }) {
    const [showTooltip, setShowTooltip] = React.useState(false);

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
      {/* <div className="navbar-brand">A Little Something</div> */}
      
      <div className="navbar-tabs">
        <button 
          className={`tab ${activeTab === 'affirmations' ? 'active' : ''}`}
          onClick={() => setActiveTab('affirmations')}
        >
          Affirmations
        </button>
        <button 
          className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
        <button 
          className={`tab ${activeTab === 'tijori' ? 'active' : ''}`}
          onClick={() => setActiveTab('tijori')}
        >
          Tijori
        </button>
      </div>

      <div className="user-section">
        <div 
          className="user-avatar"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <span className="material-icons user-icon">account_circle</span>
          {showTooltip && (
            <div className="user-tooltip">
              <div className="user-info">
                <div className="user-name">{user.displayName || user.username}</div>
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
}
