function App() {
  const [affirmation, setAffirmation] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('affirmations');
  const [loading, setLoading] = React.useState(true);
  const [counter, setCounter] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [checking, setChecking] = React.useState(true);

  // Create snowflakes
  React.useEffect(() => {
    const createSnowflake = () => {
      const snowflake = document.createElement('div');
      snowflake.className = 'snowflake';
      snowflake.innerHTML = '❄️';
      snowflake.style.left = Math.random() * 100 + '%';
      snowflake.style.fontSize = (Math.random() * 10 + 15) + 'px';
      snowflake.style.animationDuration = (Math.random() * 3 + 5) + 's';
      snowflake.style.animationDelay = Math.random() * 5 + 's';
      document.body.appendChild(snowflake);
      
      setTimeout(() => {
        snowflake.remove();
      }, 10000);
    };

    // Create initial snowflakes
    for (let i = 0; i < 15; i++) {
      setTimeout(createSnowflake, i * 300);
    }

    // Create new snowflakes periodically
    const interval = setInterval(createSnowflake, 800);

    return () => clearInterval(interval);
  }, []);

  // Create floating roses in background
  React.useEffect(() => {
    const createRose = () => {
      const rose = document.createElement('div');
      rose.className = 'rose-bg';
      rose.innerHTML = '🌹';
      rose.style.left = Math.random() * 100 + '%';
      rose.style.top = Math.random() * 100 + '%';
      document.body.appendChild(rose);

      setTimeout(() => {
        rose.remove();
      }, 20000);
    };

    // Create roses
    for (let i = 0; i < 5; i++) {
      setTimeout(createRose, i * 1000);
    }

    const interval = setInterval(createRose, 4000);

    return () => clearInterval(interval);
  }, []);

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
          username={user.username}
        />
      )}

      {activeTab === 'notes' && <Notes username={user.username} />}
      {activeTab === 'tijori' && <Tijori username={user.username} />}
      {activeTab === 'birthday' && <Birthday />}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);