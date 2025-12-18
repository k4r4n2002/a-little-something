function AffirmationBox({ affirmation, loading, counter, onGetAnother }) {
  const [showSudoku, setShowSudoku] = React.useState(false);
  const [sudokuUnlocked, setSudokuUnlocked] = React.useState(false);

  React.useEffect(() => {
    checkSudokuStatus();
  }, []);

  const checkSudokuStatus = () => {
    const solvedTime = localStorage.getItem('sudoku_solved_time');
    
    if (solvedTime) {
      const timeDiff = Date.now() - parseInt(solvedTime);
      const oneDayInMs = 24 * 60 * 60 * 1000;
      
      if (timeDiff < oneDayInMs) {
        // Puzzle was solved within last 24 hours - unlocked!
        setSudokuUnlocked(true);
        setShowSudoku(false);
      } else {
        // More than 24 hours - need to solve again
        setSudokuUnlocked(false);
        setShowSudoku(true);
        localStorage.removeItem('sudoku_solved_time');
      }
    } else {
      // No solved puzzle - show sudoku
      setSudokuUnlocked(false);
      setShowSudoku(true);
    }
  };

  // Periodically check if sudoku got solved
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

  if (showSudoku) {
    return <Sudoku />;
  }

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

// Sudoku Component
function Sudoku() {
  const [grid, setGrid] = React.useState([]);
  const [solution, setSolution] = React.useState([]);
  const [selectedCell, setSelectedCell] = React.useState(null);
  const [error, setError] = React.useState('');
  const [initialGrid, setInitialGrid] = React.useState([]);
  const [hintsUsed, setHintsUsed] = React.useState(0);

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

    setHintsUsed(prev => prev + 1);
    setSelectedCell(null);
    setError('');
  };

  // DEV: Automatically complete the Sudoku for testing purposes
  const handleAutoSolve = () => {
    // Fill the grid with the solved board
    setGrid(solution.map(row => [...row]));
    setError('');
  };

  if (grid.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading puzzle...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem', textAlign: 'center' }}>
      <h2 style={{ color: '#d1477a', marginBottom: '0.5rem' }}>
        Solve the Sudoku to Unlock! 🧩
      </h2>
      <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Complete the puzzle to see today's affirmations
      </p>
      
      <div style={{ 
        display: 'inline-block',
        border: '3px solid #d1477a',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '1rem',
        boxShadow: '0 4px 15px rgba(255, 105, 180, 0.2)'
      }}>
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex' }}>
            {row.map((cell, colIdx) => {
              const isInitial = initialGrid[rowIdx][colIdx] !== 0;
              const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
              const isError = cell !== 0 && cell !== solution[rowIdx][colIdx];
              
              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
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

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '0.5rem',
          maxWidth: '300px',
          margin: '0 auto'
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              style={{
                padding: '0.75rem',
                fontSize: '1.25rem',
                background: 'linear-gradient(135deg, #ffb3d9 0%, #ffc9e3 100%)',
                border: '2px solid rgba(255, 182, 193, 0.6)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                color: '#d1477a'
              }}
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            style={{
              padding: '0.75rem',
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #ff9999 0%, #ffb3b3 100%)',
              border: '2px solid rgba(255, 182, 193, 0.6)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              color: 'white',
              gridColumn: 'span 2'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <button
        onClick={handleHint}
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

      {/* DEV: button to instantly solve the puzzle – comment out in production */}
      {/* <button
        onClick={handleAutoSolve}
        style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          fontSize: '1rem',
          background: 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)',
          border: '2px solid rgba(76, 175, 80, 0.6)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          color: '#2e7d32'
        }}
      >
        Auto-solve (Dev)
      </button> */}

      {error && (
        <div style={{ 
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

      <div style={{ 
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'linear-gradient(135deg, #fff0f8 0%, #ffe8f3 100%)',
        borderRadius: '12px',
        fontSize: '0.85rem',
        color: '#666',
        border: '2px solid rgba(255, 182, 193, 0.3)'
      }}>
        <p style={{ margin: 0 }}>
          💡 <strong>Tip:</strong> Click a cell, then click a number to fill it in.
          Numbers in <strong>bold</strong> are part of the original puzzle.
        </p>
      </div>
    </div>
  );
}
