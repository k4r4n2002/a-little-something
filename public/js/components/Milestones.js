function Milestones({ username }) {
  const [milestones, setMilestones] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedMilestone, setSelectedMilestone] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newMilestone, setNewMilestone] = React.useState({
    title: '',
    date: '',
    icon: '💕',
    message: '',
    unlocked: true
  });
  const [editingId, setEditingId] = React.useState(null);

  React.useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      const res = await fetch('/api/milestones');
      if (res.ok) {
        const data = await res.json();
        setMilestones(data.milestones || []);
      }
    } catch (err) {
      console.error('Error fetching milestones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneClick = (milestone) => {
    setSelectedMilestone(milestone);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedMilestone(null), 300);
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.title.trim() || !newMilestone.message.trim()) {
      alert('Please fill in title and message');
      return;
    }

    try {
      const res = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMilestone)
      });

      if (res.ok) {
        const data = await res.json();
        setMilestones(data.milestones || []);
        setNewMilestone({
          title: '',
          date: '',
          icon: '💕',
          message: '',
          unlocked: true
        });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Error adding milestone:', err);
    }
  };

  const handleDeleteMilestone = async (id) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;

    try {
      const res = await fetch(`/api/milestones/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        const data = await res.json();
        setMilestones(data.milestones || []);
      }
    } catch (err) {
      console.error('Error deleting milestone:', err);
    }
  };

  const handleEditMilestone = async (id) => {
    const milestone = milestones.find(m => m.id === id);
    if (!milestone) return;

    setNewMilestone({
      title: milestone.title,
      date: milestone.date,
      icon: milestone.icon,
      message: milestone.message,
      unlocked: milestone.unlocked
    });
    setEditingId(id);
    setShowAddForm(true);
  };

  const handleUpdateMilestone = async () => {
    if (!newMilestone.title.trim() || !newMilestone.message.trim()) {
      alert('Please fill in title and message');
      return;
    }

    try {
      const res = await fetch(`/api/milestones/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMilestone)
      });

      if (res.ok) {
        const data = await res.json();
        setMilestones(data.milestones || []);
        setNewMilestone({
          title: '',
          date: '',
          icon: '💕',
          message: '',
          unlocked: true
        });
        setEditingId(null);
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Error updating milestone:', err);
    }
  };

  const cancelEdit = () => {
    setNewMilestone({
      title: '',
      date: '',
      icon: '💕',
      message: '',
      unlocked: true
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  if (loading) {
    return <p className="loading">Loading milestones...</p>;
  }

  return (
    <div className="milestones-container">
      <h2>Our Journey Together 💕</h2>
      <p style={{ 
        color: '#888', 
        fontSize: '0.95rem', 
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        Every moment with you is a milestone worth celebrating
      </p>

      <button 
        onClick={() => setShowAddForm(!showAddForm)}
        style={{ 
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)'
        }}
      >
        {showAddForm ? '✕ Cancel' : '✨ Add New Milestone'}
      </button>

      {showAddForm && (
        <div style={{
          background: 'linear-gradient(135deg, #fff0f8 0%, #ffe8f3 100%)',
          padding: '1.5rem',
          borderRadius: '15px',
          marginBottom: '2rem',
          border: '2px solid rgba(255, 182, 193, 0.4)'
        }}>
          <h3 style={{ color: '#d1477a', marginBottom: '1rem' }}>
            {editingId ? 'Edit Milestone' : 'Add New Milestone'}
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1477a' }}>
              Title *
            </label>
            <input
              type="text"
              value={newMilestone.title}
              onChange={e => setNewMilestone({...newMilestone, title: e.target.value})}
              placeholder="e.g., 1 Month Together"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1477a' }}>
              Date
            </label>
            <input
              type="text"
              value={newMilestone.date}
              onChange={e => setNewMilestone({...newMilestone, date: e.target.value})}
              placeholder="e.g., December 2024"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1477a' }}>
              Icon (Emoji)
            </label>
            <input
              type="text"
              value={newMilestone.icon}
              onChange={e => setNewMilestone({...newMilestone, icon: e.target.value})}
              placeholder="💕"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1477a' }}>
              Message *
            </label>
            <textarea
              value={newMilestone.message}
              onChange={e => setNewMilestone({...newMilestone, message: e.target.value})}
              placeholder="Write your heartfelt message..."
              className="notes-textarea"
              rows={4}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d1477a' }}>
              <input
                type="checkbox"
                checked={newMilestone.unlocked}
                onChange={e => setNewMilestone({...newMilestone, unlocked: e.target.checked})}
              />
              Unlocked (visible now)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={editingId ? handleUpdateMilestone : handleAddMilestone}
              style={{ flex: 1 }}
            >
              {editingId ? 'Update Milestone' : 'Add Milestone'}
            </button>
            {editingId && (
              <button 
                onClick={cancelEdit}
                style={{ 
                  flex: 1,
                  background: 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)',
                  color: '#666'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      <div className="milestones-timeline">
        {milestones.map((milestone, idx) => (
          <div key={milestone.id || idx} className="milestone-item">
            <div 
              className={`milestone-marker ${milestone.unlocked ? 'unlocked' : 'locked'}`}
              onClick={() => milestone.unlocked && handleMilestoneClick(milestone)}
            >
              <div className="milestone-icon">
                {milestone.unlocked ? milestone.icon : '🔒'}
              </div>
              <div className="milestone-pulse"></div>
            </div>
            
            <div className="milestone-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 className="milestone-title">{milestone.title}</h3>
                  <p className="milestone-date">{milestone.date}</p>
                  {!milestone.unlocked && (
                    <p className="milestone-locked-text">Coming soon...</p>
                  )}
                </div>
                {/* {milestone.id !== 'default' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button
                      onClick={() => handleEditMilestone(milestone.id)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.85rem',
                        background: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
                        margin: 0
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.85rem',
                        background: 'linear-gradient(135deg, #ff9999 0%, #ffb3b3 100%)',
                        margin: 0
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )} */}
              </div>
            </div>

            {idx < milestones.length - 1 && (
              <div className="milestone-connector"></div>
            )}
          </div>
        ))}

        {/* Infinity indicator */}
        {milestones.length > 0 && (
          <div className="milestone-item" style={{ opacity: 0.5 }}>
            <div className="milestone-marker locked">
              <div className="milestone-icon" style={{ fontSize: '2rem' }}>
                ∞
              </div>
            </div>
            <div className="milestone-content">
              <h3 className="milestone-title">And Gazillion more...</h3>
            </div>
          </div>
        )}
      </div>

      {showModal && selectedMilestone && (
        <div className="milestone-modal" onClick={closeModal}>
          <div className="milestone-modal-content" onClick={e => e.stopPropagation()}>
            <button className="milestone-close" onClick={closeModal}>×</button>
            
            <div className="milestone-modal-header">
              <div className="milestone-modal-icon">{selectedMilestone.icon}</div>
              <h2>{selectedMilestone.title}</h2>
              <p className="milestone-modal-date">{selectedMilestone.date}</p>
            </div>

            <div className="milestone-modal-body">
              <p className="milestone-message">{selectedMilestone.message}</p>
            </div>

            <div className="milestone-modal-footer">
              <div className="milestone-hearts">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="milestone-heart" style={{ animationDelay: `${i * 0.1}s` }}>
                    💕
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}