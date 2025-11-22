function Tijori({ username }) {
  const [images, setImages] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [expanded, setExpanded] = React.useState(null);

  // Fetch existing images on mount
  React.useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('/api/tijori');
        if (res.ok) {
          const data = await res.json();
          setImages(Array.isArray(data.images) ? data.images : []);
        }
      } catch (err) {
        console.error('Error fetching Tijori images', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      try {
        const res = await fetch('/api/tijori', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 })
        });
        
        if (res.ok) {
          const data = await res.json();
          setImages(data.images || []);
        }
      } catch (err) {
        console.error('Error uploading image', err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return <p className="loading">Loading Tijori...</p>;
  }

  // Sort images by upload time (newest first)
  const sortedImages = [...images].sort((a, b) => {
    return new Date(b.uploadedAt) - new Date(a.uploadedAt);
  });

  return (
    <div className="tijori-container">
      <h2>Tijori</h2>

      <div className="tijori-slots">
        {sortedImages.map((img, idx) => (
          <div 
            className="tijori-slot" 
            key={idx}
          >
            <img
              src={img.data}
              alt={`memory ${idx + 1}`}
              className={`tijori-img ${img.uploadedBy === 'karan' ? 'border-karan' : 'border-khushi'}`}
              onClick={() => setExpanded(idx)}
            />
          </div>
        ))}
        
        {/* Always show one upload placeholder */}
        <div className="tijori-slot">
          <label className="tijori-placeholder">
            <span className="plus">{uploading ? '⏳' : '+'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {uploading && <p className="saving">Uploading...</p>}

      {expanded !== null && sortedImages[expanded] && (
        <div className="tijori-modal" onClick={() => setExpanded(null)}>
          <img src={sortedImages[expanded].data} alt="expanded" />
        </div>
      )}
    </div>
  );
}