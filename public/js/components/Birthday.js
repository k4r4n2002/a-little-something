function Birthday() {
  const [timeLeft, setTimeLeft] = React.useState({});
  const [isBirthday, setIsBirthday] = React.useState(false);
  const [customMessage, setCustomMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Fetch custom message from server
    const fetchMessage = async () => {
      try {
        const res = await fetch('/api/birthday/message');
        if (res.ok) {
          const data = await res.json();
          setCustomMessage(data.message || 'Happy Birthday, my love! 🎉💕');
        }
      } catch (err) {
        console.error('Error fetching birthday message:', err);
        setCustomMessage('Happy Birthday, my love! 🎉💕');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();

    const calculateTimeLeft = () => {
      // Birthday date: December 29, 2025 in IST (UTC+5:30)
      const birthdayDate = new Date('2025-12-29T00:00:00+05:30');
      const now = new Date();

      // Convert current time to IST
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istTime = new Date(utcTime + istOffset);

      const difference = birthdayDate - istTime;

      // Check if it's the birthday (same day in IST)
      const birthdayDay = new Date(istTime);
      birthdayDay.setHours(0, 0, 0, 0);
      const targetDay = new Date(birthdayDate);
      targetDay.setHours(0, 0, 0, 0);

      if (birthdayDay.getTime() === targetDay.getTime()) {
        setIsBirthday(true);
        return {};
      }

      if (difference > 0) {
        setIsBirthday(false);
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      } else if (difference > -86400000) { // Still birthday day
        setIsBirthday(true);
        return {};
      }

      // Birthday has fully passed
      setIsBirthday(false);
      return {};
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return <p className="loading">Loading...</p>;
  }

  if (isBirthday) {
    return (
      <div className="birthday-container">
        <div className="countdown-box">
          <div className="celebration-emoji">🎂🎉🎈</div>
          <h2 className="countdown-title">It's Your Special Day!</h2>
          <div className="birthday-message">
            {customMessage}
          </div>
          <div className="celebration-emoji">🌹💕❄️</div>
        </div>
      </div>
    );
  }

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    timerComponents.push(
      <div className="time-unit" key={interval}>
        <span className="time-value">{timeLeft[interval]}</span>
        <span className="time-label">{interval}</span>
      </div>
    );
  });

  return (
    <div className="birthday-container">
      <div className="countdown-box">
        <h2 className="countdown-title">Countdown to Your Birthday 🎂</h2>
        {timerComponents.length ? (
          <>
            <div className="countdown-timer">
              {timerComponents}
            </div>
            <div className="birthday-message">
              Can't wait to celebrate you on December 29th! 🌹💕
            </div>
          </>
        ) : (
          <div className="birthday-message">
            Your special day has passed, but my love for you never will! 💕
          </div>
        )}
      </div>
    </div>
  );
}