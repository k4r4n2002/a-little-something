function Header({ user }) {
  return (
    <>
      <div className="rose-icon">🌹</div>
      <h1>A Little Something</h1>
      {user && (
        <p className="greeting">Hello, {user.displayName}! 💕</p>
      )}
    </>
  );
}