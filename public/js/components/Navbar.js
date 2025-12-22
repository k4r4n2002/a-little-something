function Navbar({ user, onLogout, activeTab, setActiveTab }) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const timeoutRef = React.useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 200); // 200ms delay
  };

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
      <div className="navbar-tabs">
        <button
          className={`tab ${activeTab === 'affirmations' ? 'active' : ''}`}
          onClick={() => setActiveTab('affirmations')}
        >
          💕 Affirmations
        </button>
        <button
          className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          📝 Notes
        </button>
        <button
          className={`tab ${activeTab === 'tijori' ? 'active' : ''}`}
          onClick={() => setActiveTab('tijori')}
        >
          📸 Tijori
        </button>
        <button
          className={`tab ${activeTab === 'birthday' ? 'active' : ''}`}
          onClick={() => setActiveTab('birthday')}
        >
          🎂 Birthday
        </button>
        <button
          className={`tab ${activeTab === 'milestones' ? 'active' : ''}`}
          onClick={() => setActiveTab('milestones')}
        >
          ✨ Milestones
        </button>
      </div>

      <div
        className="user-section"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="user-avatar">
          <span className="material-icons user-icon">account_circle</span>
          {showTooltip && (
            <div
              className="user-tooltip"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
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