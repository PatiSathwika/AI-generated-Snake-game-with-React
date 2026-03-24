import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music, Trophy, Gamepad2, RefreshCw, Volume2, Settings, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Point {
  x: number;
  y: number;
}

interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
  cover: string;
}

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 150;

const DUMMY_TRACKS: Track[] = [
  {
    id: 1,
    title: "Neon Nights",
    artist: "SynthWave AI",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://picsum.photos/seed/neon1/400/400"
  },
  {
    id: 2,
    title: "Cyber Pulse",
    artist: "Digital Dreamer",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://picsum.photos/seed/neon2/400/400"
  },
  {
    id: 3,
    title: "Midnight Drive",
    artist: "Retro Future",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://picsum.photos/seed/neon3/400/400"
  }
];

export default function App() {
  // --- Music Player State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = DUMMY_TRACKS[currentTrackIndex];

  // --- Snake Game State ---
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const gameLoopRef = useRef<number | null>(null);

  // --- Music Logic ---
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % DUMMY_TRACKS.length);
  const prevTrack = () => setCurrentTrackIndex((prev) => (prev - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length);

  // --- Snake Logic ---
  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    if (isGameOver || !gameStarted) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        setGameStarted(false);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, gameStarted, generateFood]);

  useEffect(() => {
    if (isGameOver && score > highScore) {
      setHighScore(score);
    }
  }, [isGameOver, score, highScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
        case ' ': e.preventDefault(); togglePlay(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isPlaying]);

  useEffect(() => {
    if (gameStarted && !isGameOver) {
      gameLoopRef.current = window.setInterval(moveSnake, GAME_SPEED);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameStarted, isGameOver, moveSnake]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    setGameStarted(true);
    setFood(generateFood(INITIAL_SNAKE));
  };

  return (
    <div className="min-h-screen bg-hw-bg p-8 font-sans text-hw-card selection:bg-hw-accent/30 flex items-center justify-center">
      {/* Main Hardware Unit */}
      <div className="w-full max-w-6xl bg-hw-card rounded-[32px] p-8 shadow-2xl border-t-4 border-white/5 relative overflow-hidden">
        {/* Internal Glow for Hardware Feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-12 relative z-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-hw-accent hw-glow" />
              <h1 className="font-mono font-bold text-xl tracking-tighter text-hw-text-primary uppercase">
                Rhythm-Unit <span className="text-hw-accent">v2.0</span>
              </h1>
            </div>
            <p className="hw-label">Hardware Interface / Specialist Tool</p>
          </div>

          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <span className="hw-label text-right">Master Output</span>
              <div className="hw-display w-32 text-right text-2xl">
                {score.toString().padStart(5, '0')}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="hw-label text-right">Peak Signal</span>
              <div className="hw-display w-32 text-right text-2xl opacity-60">
                {highScore.toString().padStart(5, '0')}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 relative z-10">
          {/* Left Column: Music Control Panel */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            <div className="hw-dashed rounded-2xl p-6 flex flex-col gap-6 bg-black/20">
              <div className="flex justify-between items-center">
                <span className="hw-label">Audio Source</span>
                <Music className="w-4 h-4 text-hw-text-secondary" />
              </div>
              
              <div className="aspect-square rounded-xl overflow-hidden border border-white/5 relative group">
                <img 
                  src={currentTrack.cover} 
                  alt={currentTrack.title}
                  className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-hw-card/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-mono text-sm font-bold text-hw-text-primary truncate">{currentTrack.title}</p>
                  <p className="hw-label text-[8px]">{currentTrack.artist}</p>
                </div>
              </div>

              <div className="flex items-center justify-between px-4">
                <button onClick={prevTrack} className="p-2 text-hw-text-secondary hover:text-hw-accent transition-colors">
                  <SkipBack className="w-6 h-6" />
                </button>
                <button 
                  onClick={togglePlay}
                  className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
                    isPlaying ? 'border-hw-accent text-hw-accent hw-glow' : 'border-hw-text-secondary/20 text-hw-text-secondary'
                  }`}
                >
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
                <button onClick={nextTrack} className="p-2 text-hw-text-secondary hover:text-hw-accent transition-colors">
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 hw-dashed rounded-2xl p-6 flex flex-col gap-4 bg-black/20">
              <span className="hw-label">Signal Modulation</span>
              <div className="flex justify-around items-center py-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="hw-knob" style={{ transform: `rotate(${isPlaying ? '45deg' : '-45deg'})` }} />
                  <span className="hw-label text-[8px]">Gain</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="hw-knob" style={{ transform: `rotate(${score > 0 ? '90deg' : '0deg'})` }} />
                  <span className="hw-label text-[8px]">Freq</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="hw-knob" style={{ transform: `rotate(${gameStarted ? '120deg' : '-120deg'})` }} />
                  <span className="hw-label text-[8px]">Res</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Game Screen */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            <div className="bg-black rounded-2xl p-4 border-4 border-hw-text-secondary/10 relative group">
              {/* Screen Glare */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-xl" />
              
              <div 
                className="grid gap-px bg-white/5"
                style={{ 
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                  width: '100%',
                  aspectRatio: '16/9'
                }}
              >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                  const x = i % GRID_SIZE;
                  const y = Math.floor(i / GRID_SIZE);
                  const isSnake = snake.some(s => s.x === x && s.y === y);
                  const isHead = snake[0].x === x && snake[0].y === y;
                  const isFood = food.x === x && food.y === y;

                  return (
                    <div 
                      key={i} 
                      className={`transition-all duration-200 ${
                        isHead ? 'bg-hw-accent shadow-[0_0_10px_rgba(0,255,0,0.8)] z-10' :
                        isSnake ? 'bg-hw-accent/40' :
                        isFood ? 'bg-hw-accent animate-pulse scale-75' :
                        'bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Game Over / Start Overlay */}
              <AnimatePresence>
                {(!gameStarted || isGameOver) && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center p-8 text-center rounded-xl"
                  >
                    <div className="hw-dashed p-8 rounded-2xl bg-hw-card/50 backdrop-blur-sm">
                      {isGameOver ? (
                        <>
                          <Trophy className="w-12 h-12 text-hw-accent mx-auto mb-4 hw-glow" />
                          <h2 className="font-mono text-2xl font-bold text-hw-text-primary mb-2">TERMINATED</h2>
                          <div className="hw-display mb-6">SCORE: {score}</div>
                          <button 
                            onClick={startGame}
                            className="px-8 py-3 bg-hw-accent text-hw-card font-bold rounded-md hover:brightness-110 transition-all flex items-center gap-2 mx-auto"
                          >
                            <RefreshCw className="w-4 h-4" /> REBOOT
                          </button>
                        </>
                      ) : (
                        <>
                          <Gamepad2 className="w-12 h-12 text-hw-text-secondary mx-auto mb-4" />
                          <h2 className="font-mono text-2xl font-bold text-hw-text-primary mb-2">READY_</h2>
                          <p className="hw-label mb-8">System check complete. Awaiting input.</p>
                          <button 
                            onClick={startGame}
                            className="px-10 py-4 bg-hw-accent text-hw-card font-bold rounded-md hover:brightness-110 transition-all hw-glow"
                          >
                            INITIALIZE
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Panel: Visualizer & Stats */}
            <div className="grid grid-cols-2 gap-8">
              <div className="hw-dashed rounded-2xl p-6 bg-black/20 flex flex-col gap-4">
                <span className="hw-label">Frequency Spectrum</span>
                <div className="h-24 flex items-end gap-1 px-2">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: isPlaying ? [10, Math.random() * 80 + 10, 10] : 4 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.4 + Math.random() * 0.4,
                        ease: "easeInOut"
                      }}
                      className="flex-1 bg-hw-accent/40 rounded-t-[1px]"
                    />
                  ))}
                </div>
              </div>

              <div className="hw-dashed rounded-2xl p-6 bg-black/20 flex flex-col gap-4">
                <span className="hw-label">System Diagnostics</span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="hw-label text-[8px]">Sync State</span>
                    <span className="font-mono text-[10px] text-hw-accent">LOCKED</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="hw-label text-[8px]">Buffer</span>
                    <span className="font-mono text-[10px] text-hw-accent">OPTIMAL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="hw-label text-[8px]">Clock</span>
                    <span className="font-mono text-[10px] text-hw-accent">INTERNAL</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                    <motion.div 
                      animate={{ width: isPlaying ? '100%' : '0%' }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="h-full bg-hw-accent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="mt-12 pt-6 border-t border-white/5 flex justify-between items-center opacity-30">
          <div className="flex gap-4">
            <Settings className="w-4 h-4" />
            <Volume2 className="w-4 h-4" />
          </div>
          <span className="hw-label text-[8px]">© 2026 NEON RHYTHM SYSTEMS / ARCADE DIVISION</span>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={nextTrack}
      />
    </div>
  );
}

