function AffirmationBox({ affirmation, loading, counter, onGetAnother, username }) {
  const [showSudoku, setShowSudoku] = React.useState(false);
  const [sudokuUnlocked, setSudokuUnlocked] = React.useState(false);
  const [activeSubTab, setActiveSubTab] = React.useState(username === 'karan' ? 'karan' : 'khushi');
  const [affirmations, setAffirmations] = React.useState([]);
  const [loadingAffirmations, setLoadingAffirmations] = React.useState(true);
  const [newAffirmation, setNewAffirmation] = React.useState('');
  const [editingId, setEditingId] = React.useState(null);
  const [editText, setEditText] = React.useState('');

  React.useEffect(() => {
    checkSudokuStatus();
  }, []);

  React.useEffect(() => {
    if (sudokuUnlocked) {
      fetchAffirmations();
    }
  }, [activeSubTab, sudokuUnlocked]);

  const checkSudokuStatus = () => {
    const solvedTimeStr = localStorage.getItem('sudoku_solved_time');

    // If there is no timestamp we definitely need to show the Sudoku
    if (!solvedTimeStr) {
      setSudokuUnlocked(false);
      setShowSudoku(true);
      return;
    }

    const solvedTime = parseInt(solvedTimeStr, 10);

    // If the stored value is not a valid number, clear it and show Sudoku
    if (Number.isNaN(solvedTime)) {
      localStorage.removeItem('sudoku_solved_time');
      localStorage.removeItem('sudoku_puzzle');
      setSudokuUnlocked(false);
      setShowSudoku(true);
      return;
    }

    const now = Date.now();
    // const now= new Date('2025-12-15T00:00:00+05:30').getTime();
    const timeDiff = now - solvedTime; // negative if timestamp is in the future
    const oneDayInMs = 24 * 60 * 60 * 1000;

    /*
      Unlock logic:
      1. If the timestamp is in the future (timeDiff < 0) we consider it invalid and force the Sudoku.
      2. If the timestamp is within the last 24 h (0 <= timeDiff < 24 h) we keep affirmations unlocked.
      3. Otherwise (> 24 h old) we lock again and clear the timestamp + puzzle.
    */
    if (timeDiff >= 0 && timeDiff < oneDayInMs) {
      setSudokuUnlocked(true);
      setShowSudoku(false);
    } else {
      // Either the timestamp is stale (> 24 h) or invalid (in the future)
      if (timeDiff >= oneDayInMs || timeDiff < 0) {
        localStorage.removeItem('sudoku_solved_time');
        localStorage.removeItem('sudoku_puzzle');
      }
      setSudokuUnlocked(false);
      setShowSudoku(true);
    }
  };

  

  React.useEffect(() => {
    if (showSudoku) {
      const interval = setInterval(() => {
        const solvedTime = localStorage.getItem('sudoku_solved_time');
        if (solvedTime) {
          setSudokuUnlocked(true);
          setShowSudoku(false);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [showSudoku]);

  const fetchAffirmations = async () => {
    setLoadingAffirmations(true);
    try {
      const res = await fetch(`/api/affirmations/${activeSubTab}`);
      if (res.ok) {
        const data = await res.json();
        setAffirmations(data.affirmations || []);
      }
    } catch (err) {
      console.error('Error fetching affirmations:', err);
    } finally {
      setLoadingAffirmations(false);
    }
  };

  const handleAddAffirmation = async () => {
    if (!newAffirmation.trim()) return;

    try {
      const res = await fetch('/api/affirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: newAffirmation.trim(),
          forUser: activeSubTab
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAffirmations(data.affirmations || []);
        setNewAffirmation('');
      }
    } catch (err) {
      console.error('Error adding affirmation:', err);
    }
  };

  const handleEditAffirmation = async (id) => {
    if (!editText.trim()) return;

    try {
      const res = await fetch(`/api/affirmations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setAffirmations(data.affirmations || []);
        setEditingId(null);
        setEditText('');
      }
    } catch (err) {
      console.error('Error editing affirmation:', err);
    }
  };

  const handleDeleteAffirmation = async (id) => {
    if (!confirm('Are you sure you want to delete this affirmation?')) return;

    try {
      const res = await fetch(`/api/affirmations/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        const data = await res.json();
        setAffirmations(data.affirmations || []);
      }
    } catch (err) {
      console.error('Error deleting affirmation:', err);
    }
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  if (showSudoku) {
    return <Sudoku />;
  }

  // Determine if current user can manage affirmations for the active subtab
  const canManage = (username === 'karan' && activeSubTab === 'khushi') || 
                    (username === 'khushi' && activeSubTab === 'karan');

  return (
    <>
      {/* Sub-tabs for Karan and Khushi */}
      <div style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        justifyContent: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <button
          className={`tab ${activeSubTab === 'khushi' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('khushi')}
          style={{ margin: 0 }}
        >
          💕 For Khushi
        </button>
        <button
          className={`tab ${activeSubTab === 'karan' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('karan')}
          style={{ margin: 0 }}
        >
          💙 For Karan
        </button>
      </div>

      {/* Show random affirmation view when user is viewing their own affirmations */}
      {!canManage && (
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
      )}

      {/* Show management view when user is managing affirmations for the other person */}
      {canManage && (
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff0f8 0%, #ffe8f3 100%)',
            padding: '1.5rem',
            borderRadius: '15px',
            marginBottom: '1.5rem',
            border: '2px solid rgba(255, 182, 193, 0.4)'
          }}>
            <h3 style={{ 
              color: '#d1477a', 
              marginBottom: '1rem',
              fontSize: '1.3rem'
            }}>
              Add New Affirmation
            </h3>
            <textarea
              value={newAffirmation}
              onChange={e => setNewAffirmation(e.target.value)}
              placeholder={`Write something beautiful for ${activeSubTab === 'khushi' ? 'Khushi' : 'Karan'}...`}
              className="notes-textarea"
              rows={3}
              style={{ marginBottom: '0.75rem' }}
            />
            <button 
              onClick={handleAddAffirmation}
              disabled={!newAffirmation.trim()}
              style={{ width: '100%' }}
            >
              Add Affirmation
            </button>
          </div>

          <h3 style={{ 
            color: '#d1477a', 
            marginBottom: '1rem',
            fontSize: '1.3rem',
            textAlign: 'center'
          }}>
            All Affirmations ({affirmations.length})
          </h3>

          {loadingAffirmations ? (
            <p className="loading" style={{ textAlign: 'center' }}>Loading...</p>
          ) : affirmations.length === 0 ? (
            <p style={{ 
              textAlign: 'center', 
              color: '#888',
              padding: '2rem',
              fontStyle: 'italic'
            }}>
              No affirmations yet. Add the first one! 💕
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {affirmations.map((aff, idx) => (
                <div
                  key={aff.id}
                  style={{
                    background: 'white',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '2px solid rgba(255, 182, 193, 0.3)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ 
                        color: '#d1477a',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}>
                        #{idx + 1}
                      </span>
                      <span style={{ 
                        color: '#888',
                        fontSize: '0.85rem',
                        marginLeft: '0.5rem',
                        fontStyle: 'italic'
                      }}>
                        by {aff.createdBy === 'karan' ? 'Karan' : 'Khushi'}
                      </span>
                    </div>
                    {aff.createdBy === username && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => startEdit(aff.id, aff.text)}
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
                          onClick={() => handleDeleteAffirmation(aff.id)}
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
                    )}
                  </div>

                  {editingId === aff.id ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="notes-textarea"
                        rows={3}
                        style={{ marginBottom: '0.5rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEditAffirmation(aff.id)}
                          style={{ 
                            flex: 1,
                            padding: '0.6rem',
                            margin: 0
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{ 
                            flex: 1,
                            padding: '0.6rem',
                            background: 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)',
                            color: '#666',
                            margin: 0
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p style={{
                      color: '#333',
                      fontSize: '1.05rem',
                      lineHeight: '1.6',
                      fontStyle: 'italic',
                      margin: 0
                    }}>
                      "{aff.text}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Sudoku Component remains the same
function Sudoku() {
  const [grid, setGrid] = React.useState([]);
  const [solution, setSolution] = React.useState([]);
  const [selectedCell, setSelectedCell] = React.useState(null);
  const [error, setError] = React.useState('');
  const [initialGrid, setInitialGrid] = React.useState([]);

  const generateSudoku = () => {
    const solvedGrid = Array(9).fill(null).map(() => Array(9).fill(0));
    
    for (let box = 0; box < 9; box += 3) {
      fillBox(solvedGrid, box, box);
    }
    
    solveSudoku(solvedGrid);
    
    const puzzle = solvedGrid.map(row => [...row]);
    const cellsToRemove = 40;
    
    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        removed++;
      }
    }
    
    return { puzzle, solution: solvedGrid };
  };

  const fillBox = (grid, row, col) => {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    
    let idx = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        grid[row + i][col + j] = nums[idx++];
      }
    }
  };

  const isValid = (grid, row, col, num) => {
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false;
    }
    
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false;
    }
    
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[boxRow + i][boxCol + j] === num) return false;
      }
    }
    
    return true;
  };

  const solveSudoku = (grid) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num;
              
              if (solveSudoku(grid)) {
                return true;
              }
              
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  const checkIfComplete = (currentGrid) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (currentGrid[i][j] === 0) return false;
        if (currentGrid[i][j] !== solution[i][j]) return false;
      }
    }
    return true;
  };

  React.useEffect(() => {
    const saved = localStorage.getItem('sudoku_puzzle');
    const solvedTime = localStorage.getItem('sudoku_solved_time');
    
    if (saved && solvedTime) {
      const timeDiff = Date.now() - parseInt(solvedTime);
      const oneDayInMs = 24 * 60 * 60 * 1000;
      
      if (timeDiff >= oneDayInMs) {
        localStorage.removeItem('sudoku_solved_time');
      }
    }
    
    if (saved) {
      const data = JSON.parse(saved);
      setGrid(data.grid);
      setSolution(data.solution);
      setInitialGrid(data.initialGrid);
    } else {
      const { puzzle, solution: sol } = generateSudoku();
      setGrid(puzzle);
      setSolution(sol);
      setInitialGrid(puzzle.map(row => [...row]));
      
      localStorage.setItem('sudoku_puzzle', JSON.stringify({
        grid: puzzle,
        solution: sol,
        initialGrid: puzzle
      }));
    }
  }, []);

  React.useEffect(() => {
    if (grid.length > 0 && solution.length > 0) {
      localStorage.setItem('sudoku_puzzle', JSON.stringify({
        grid,
        solution,
        initialGrid
      }));
      
      if (checkIfComplete(grid)) {
        setError('');
        const now = Date.now();
        localStorage.setItem('sudoku_solved_time', now.toString());
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }
  }, [grid]);

  const handleCellClick = (row, col) => {
    if (initialGrid[row][col] !== 0) return;
    setSelectedCell({ row, col });
    setError('');
  };

  const handleNumberInput = (num) => {
    if (!selectedCell) {
      setError('Please select a cell first');
      return;
    }
    
    const { row, col } = selectedCell;
    if (initialGrid[row][col] !== 0) {
      setError('Cannot change initial numbers');
      return;
    }
    
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = num;
    setGrid(newGrid);
    setError('');
  };

  const handleClear = () => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (initialGrid[row][col] !== 0) return;
    
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = 0;
    setGrid(newGrid);
  };

  const handleHint = () => {
    const emptyCells = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }
    if (emptyCells.length === 0) {
      setError('Puzzle already complete!');
      return;
    }
    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = solution[row][col];
    setGrid(newGrid);

    const newInit = initialGrid.map(r => [...r]);
    newInit[row][col] = solution[row][col];
    setInitialGrid(newInit);

    setSelectedCell(null);
    setError('');
  };

  if (grid.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading puzzle...</div>;
  }

  return (
    <div className="sudoku-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem', textAlign: 'center' }}>
      <h2 style={{ color: '#d1477a', marginBottom: '0.5rem' }}>
        Solve the Sudoku to Unlock! 🧩
      </h2>
      <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Complete the puzzle to see today's affirmations
      </p>
      
      {/* Scrollable container for sudoku grid */}
      <div className="sudoku-grid-container" style={{ marginBottom: '1rem' }}>
        <div 
          className="sudoku-grid-wrapper"
          style={{ 
            display: 'inline-block',
            border: '3px solid #d1477a',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(255, 105, 180, 0.2)'
          }}
        >
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="sudoku-row" style={{ display: 'flex' }}>
            {row.map((cell, colIdx) => {
              const isInitial = initialGrid[rowIdx][colIdx] !== 0;
              const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
              const isError = cell !== 0 && cell !== solution[rowIdx][colIdx];
              
              return (
                <div
                  key={`${rowIdx}-${colIdx}`} className="sudoku-cell"
                  onClick={() => handleCellClick(rowIdx, colIdx)}
                  style={{
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #ddd',
                    borderRight: colIdx % 3 === 2 ? '2px solid #d1477a' : '1px solid #ddd',
                    borderBottom: rowIdx % 3 === 2 ? '2px solid #d1477a' : '1px solid #ddd',
                    cursor: isInitial ? 'not-allowed' : 'pointer',
                    background: isSelected ? '#ffe8f3' : isInitial ? '#f5f5f5' : 'white',
                    color: isError ? '#ff4444' : isInitial ? '#333' : '#d1477a',
                    fontSize: '1.5rem',
                    fontWeight: isInitial ? 'bold' : 'normal',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cell !== 0 ? cell : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div 
          className="sudoku-number-grid"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.5rem',
            maxWidth: '300px',
            margin: '0 auto'
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num} className="sudoku-number-btn"
              onClick={() => handleNumberInput(num)}
              style={{
                padding: '0.75rem',
                fontSize: '1.25rem',
                background: 'linear-gradient(135deg, #ffb3d9 0%, #ffc9e3 100%)',
                border: '2px solid rgba(255, 182, 193, 0.6)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                color: '#d1477a'              }}
            >
              {num}
            </button>
          ))}
          <button
            className="sudoku-clear-btn" onClick={handleClear}
            style={{
              padding: '0.75rem',
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #ff9999 0%, #ffb3b3 100%)',
              border: '2px solid rgba(255, 182, 193, 0.6)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              color: 'white',
              gridColumn: 'span 5'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <button
        className="sudoku-hint-btn" onClick={handleHint}
        style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          fontSize: '1rem',
          background: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
          border: '2px solid rgba(33, 150, 243, 0.6)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          color: '#1565c0'
        }}
      >
        Hint
      </button>

      {error && (
        <div className="sudoku-error" style={{ 
          color: '#ff4444', 
          marginTop: '1rem',
          padding: '0.5rem',
          background: '#ffe5e5',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      <div className="sudoku-tip" style={{ 
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'linear-gradient(135deg, #fff0f8 0%, #ffe8f3 100%)',
        borderRadius: '12px',
        fontSize: '0.85rem',
        color: '#666',
        textAlign: 'left',
        border: '2px solid rgba(255, 182, 193, 0.3)'
      }}>
        <p style={{ margin: 0 }}>
          💡 <strong>Tip:</strong> Click a cell, then click a number to fill it in.
          Numbers in <strong>bold</strong> are part of the original puzzle and can't be changed.
        </p>
      </div>
    </div>
  );
}