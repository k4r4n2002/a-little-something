function Notes({ username }) {
  const [content, setContent] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const isKaran = username === 'karan';

  // Fetch notes once on mount
  React.useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/common/notes');
        if (res.ok) {
          const data = await res.json();
          setContent(data.content || '');
        }
      } catch (err) {
        console.error('Error fetching notes', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleSave = async () => {
    if (!isKaran) return;
    setSaving(true);
    try {
      await fetch('/api/common/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
    } catch (err) {
      console.error('Error saving notes', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="loading">Loading notes...</p>;
  }

  return (
    <div className="notes-container">
      <h2>Notes</h2>
      {isKaran ? (
        <>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onBlur={handleSave}
            placeholder="Write something beautiful..."
            rows={10}
            className="notes-textarea"
          />
          {saving && <p className="saving">Saving...</p>}
        </>
      ) : (
        <p className="notes-display">{content || 'Nothing here yet, but something awesome is on the way! ✨'}</p>
      )}
    </div>
  );
}
