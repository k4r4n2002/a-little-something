function Tijori({ username }) {
  const isKaran = username === 'karan';
  // Always keep exactly two slots
  const [images, setImages] = React.useState(['', '']);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [expanded, setExpanded] = React.useState(null); // null or index 0/1

  // Fetch existing images on mount
  React.useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('/api/tijori');
        if (res.ok) {
          const data = await res.json();
          const fetched = Array.isArray(data.images) ? data.images : [];
          // Ensure array has length 2
          setImages([fetched[0] || '', fetched[1] || '']);
        }
      } catch (err) {
        console.error('Error fetching Tijori images', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Handle file selection for a specific slot
  const handleFileChange = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setImages(prev => {
        const next = [...prev];
        next[index] = base64;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (imgArr) => {
    if (!isKaran) return;
    setSaving(true);
    try {
      await fetch('/api/tijori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: imgArr })
      });
    } catch (err) {
      console.error('Error saving Tijori images', err);
    } finally {
      setSaving(false);
    }
  };

  // Auto-save on images change (debounced by 500ms)
  React.useEffect(() => {
    if (!isKaran) return;
    const timer = setTimeout(() => {
      if (!loading) {
        handleSave(images);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [images]);

  if (loading) {
    return <p className="loading">Loading Tijori...</p>;
  }

  return (
    <div className="tijori-container">
      <h2>Tijori</h2>

      <div className="tijori-slots">
        {[0, 1].map((slot) => {
          const hasImage = images[slot];
          return (
            <div className="tijori-slot" key={slot}>
              {hasImage ? (
                <img
                  src={images[slot]}
                  alt={`memory ${slot + 1}`}
                  className="tijori-img"
                  onClick={() => setExpanded(slot)}
                />
              ) : (
                isKaran && (
                  <label className="tijori-placeholder">
                    <span className="plus">+</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(slot, e)}
                    />
                  </label>
                )
              )}
            </div>
          );
        })}
      </div>
      {saving && <p className="saving">Saving...</p>}

      {expanded !== null && images[expanded] && (
        <div className="tijori-modal" onClick={() => setExpanded(null)}>
          <img src={images[expanded]} alt="expanded" />
        </div>
      )}
    </div>
  );
}