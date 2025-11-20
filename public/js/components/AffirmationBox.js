function AffirmationBox({ affirmation, loading, counter, onGetAnother }) {
  return (
    <>
      <div className="affirmation-box">
        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          <p className="affirmation-text">"{affirmation}"</p>
        )}
      </div>
      {counter && (
        <div className="counter">{counter.number} of {counter.total}</div>
      )}
      <button onClick={onGetAnother} disabled={loading}>
        Get Another Something
      </button>
    </>
  );
}