function App() {
  const [affirmation, setAffirmation] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [counter, setCounter] = React.useState(null);

  const fetchAffirmation = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/affirmation');
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

  React.useEffect(() => {
    fetchAffirmation();
  }, []);

  return (
    <React.Fragment>
      <div className="rose-icon">🌹</div>
      {/* <h1>A Little Something</h1> */}
      <div className="affirmation-box">
        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          <p>"{affirmation}"</p>
        )}
      </div>
      {counter && (
        <div className="counter">{counter.number} of {counter.total}</div>
      )}
      <button onClick={fetchAffirmation}>Get Another Something</button>
      <div className="footer">
        Made with <span className="heart">♥</span> by Karan, just for Khushi
      </div>
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);