import React, { useState, useEffect, useCallback } from 'react';
import { Shuffle, RotateCcw, Trophy, Timer, Move } from 'lucide-react';
import './App.css';

const AestheticPuzzleGame = () => {
  const [board, setBoard] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [emptyIndex, setEmptyIndex] = useState(15);
  const [showLogo, setShowLogo] = useState(true);
  const [logoAnimation, setLogoAnimation] = useState('initial');

  // Initialize board with solved state
  const initializeBoard = useCallback(() => {
    const newBoard = Array.from({ length: 15 }, (_, i) => i + 1);
    newBoard.push(null); // Empty space
    setBoard(newBoard);
    setEmptyIndex(15);
    setIsComplete(false);
    setMoves(0);
    setTime(0);
    setIsPlaying(false);
  }, []);

  // Logo transition effect
  useEffect(() => {
    if (showLogo) {
      const timer1 = setTimeout(() => {
        setLogoAnimation('expand');
      }, 1000);
      
      const timer2 = setTimeout(() => {
        setLogoAnimation('transform');
      }, 2000);
      
      const timer3 = setTimeout(() => {
        setShowLogo(false);
      }, 3000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [showLogo]);

  // Shuffle board
  const shuffleBoard = useCallback(() => {
    const newBoard = [...board];
    let currentEmptyIndex = emptyIndex;
    
    // Perform 1000 valid moves to ensure solvability
    for (let i = 0; i < 1000; i++) {
      const validMoves = getValidMoves(currentEmptyIndex);
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      
      // Swap empty space with the selected tile
      [newBoard[currentEmptyIndex], newBoard[randomMove]] = [newBoard[randomMove], newBoard[currentEmptyIndex]];
      currentEmptyIndex = randomMove;
    }
    
    setBoard(newBoard);
    setEmptyIndex(currentEmptyIndex);
    setMoves(0);
    setTime(0);
    setIsPlaying(true);
    setIsComplete(false);
  }, [board, emptyIndex]);

  // Get valid moves for empty space
  const getValidMoves = (emptyIdx) => {
    const moves = [];
    const row = Math.floor(emptyIdx / 4);
    const col = emptyIdx % 4;
    
    if (row > 0) moves.push(emptyIdx - 4); // Up
    if (row < 3) moves.push(emptyIdx + 4); // Down
    if (col > 0) moves.push(emptyIdx - 1); // Left
    if (col < 3) moves.push(emptyIdx + 1); // Right
    
    return moves;
  };

  // Handle tile click
  const handleTileClick = (index) => {
    if (!isPlaying || isComplete) return;
    
    const validMoves = getValidMoves(emptyIndex);
    if (validMoves.includes(index)) {
      const newBoard = [...board];
      [newBoard[emptyIndex], newBoard[index]] = [newBoard[index], newBoard[emptyIndex]];
      
      setBoard(newBoard);
      setEmptyIndex(index);
      setMoves(prev => prev + 1);
      
      // Check if puzzle is solved
      const isSolved = newBoard.every((tile, idx) => {
        if (idx === 15) return tile === null;
        return tile === idx + 1;
      });
      
      if (isSolved) {
        setIsComplete(true);
        setIsPlaying(false);
      }
    }
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (isPlaying && !isComplete) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isComplete]);

  // Initialize on mount
  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Logo Component
  const LogoAnimation = () => {
    return (
      <div className="logo-container">
        <div className={`logo ${logoAnimation}`}>
          <div className="logo-grid">
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className={`logo-tile ${i === 15 ? 'empty' : ''}`}
                style={{
                  animationDelay: `${i * 50}ms`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (showLogo) {
    return <LogoAnimation />;
  }

  return (
    <div className="game-container">
      <div className="game-panel">
        {/* Stats */}
        <div className="stats">
          <div className="stat-item">
            <Move className="stat-icon" />
            <span>{moves}</span>
          </div>
          <div className="stat-item">
            <Timer className="stat-icon" />
            <span>{formatTime(time)}</span>
          </div>
        </div>

        {/* Game Board */}
        <div className="game-board">
          {board.map((tile, index) => (
            <div
              key={index}
              onClick={() => handleTileClick(index)}
              className={`
                tile
                ${tile === null ? 'empty' : 'filled'}
                ${getValidMoves(emptyIndex).includes(index) && tile !== null ? 'movable' : ''}
              `}
            >
              {tile}
            </div>
          ))}
        </div>

        {/* Win Message */}
        {isComplete && (
          <div className="win-message">
            <Trophy className="trophy-icon" />
            <h2>Congratulations!</h2>
            <p>Completed in {moves} moves and {formatTime(time)}</p>
          </div>
        )}

        {/* Controls */}
        <div className="controls">
          <button
            onClick={shuffleBoard}
            disabled={board.length === 0}
            className="btn btn-primary"
          >
            <Shuffle className="btn-icon" />
            {isPlaying ? 'New Game' : 'Start Game'}
          </button>
          
          <button
            onClick={initializeBoard}
            className="btn btn-secondary"
          >
            <RotateCcw className="btn-icon" />
            Reset
          </button>
        </div>

        {/* Instructions */}
        <div className="instructions">
          Click on tiles adjacent to the empty space to move them
        </div>
      </div>
    </div>
  );
};

function App() {
  return <AestheticPuzzleGame />;
}

export default App;