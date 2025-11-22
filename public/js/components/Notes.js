function Notes({ username }) {
  const [notes, setNotes] = React.useState([]);
  const [newNote, setNewNote] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // Fetch all notes on mount
  React.useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/common/notes');
        if (res.ok) {
          const data = await res.json();
          setNotes(data.notes || []);
        }
      } catch (err) {
        console.error('Error fetching notes', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/common/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote.trim() })
      });
      
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
        setNewNote('');
      }
    } catch (err) {
      console.error('Error saving note', err);
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
      
      <div className="note-input-section">
        <textarea
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          placeholder="Write something beautiful..."
          rows={4}
          className="notes-textarea"
        />
        <button 
          onClick={handleAddNote} 
          disabled={saving || !newNote.trim()}
          className="add-note-btn"
        >
          {saving ? 'Adding...' : 'Add Note'}
        </button>
      </div>

      <div className="notes-list">
        {notes.length === 0 ? (
          <p className="notes-display">Nothing here yet, but something awesome is on the way! ✨</p>
        ) : (
          notes.map((note, idx) => (
            <div 
              key={idx} 
              className={`note-item ${note.author === 'karan' ? 'note-karan' : 'note-khushi'}`}
            >
              <div className="note-header">
                <span className="note-author">{note.author === 'karan' ? 'Karan' : 'Khushi'}</span>
                {note.timestamp && (
                  <span className="note-timestamp">
                    {new Date(note.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
              <p className="note-content">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}