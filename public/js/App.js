function App() {
  const [affirmation, setAffirmation] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('affirmations');
  const [loading, setLoading] = React.useState(true);
  const [counter, setCounter] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [checking, setChecking] = React.useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        return true;
      } else {
        window.location.href = '/login';
        return false;
      }
    } catch (err) {
      window.location.href = '/login';
      return false;
    } finally {
      setChecking(false);
    }
  };

  const fetchAffirmation = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/affirmation');

      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      setAffirmation(data.text);
      setCounter({ number: data.number, total: data.total });
    } catch (err) {
      setAffirmation('Oops! Unable to fetch affirmation. Please try again.');
      setCounter(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  React.useEffect(() => {
    checkAuth().then(isAuth => {
      if (isAuth) {
        fetchAffirmation();
      }
    });
  }, []);

  if (checking) {
    return (
      <>
        <div className="rose-icon">🌹</div>
        <p className="loading">Loading...</p>
      </>
    );
  }

  return (
    <>
      <h1 className="page-title">A Little Something</h1>
      <Navbar 
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === 'affirmations' && (
        <AffirmationBox
          affirmation={affirmation}
          loading={loading}
          counter={counter}
          onGetAnother={fetchAffirmation}
        />
      )}

      {activeTab === 'notes' && <Notes username={user.username} />}
      {activeTab === 'tijori' && <Tijori username={user.username} />}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);