import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle, AlertTriangle, Clock, Hourglass, Settings, Maximize, Minimize, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Display() {
  const [machines, setMachines] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [layoutSpec, setLayoutSpec] = useState({ cols: 1, rows: 1 });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    try {
      const elem = document.documentElement as any;
      const isFullscreenNow = document.fullscreenElement || elem.webkitFullscreenElement || elem.mozFullScreenElement || elem.msFullscreenElement;
      
      if (!isFullscreenNow) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(() => {});
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        }
      } else {
        const doc = document as any;
        if (doc.exitFullscreen) {
          doc.exitFullscreen().catch(() => {});
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        } else if (doc.msExitFullscreen) {
          doc.msExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          doc.mozCancelFullScreen();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const elem = document.documentElement as any;
      const isFullscreenNow = document.fullscreenElement || elem.webkitFullscreenElement || elem.mozFullScreenElement || elem.msFullscreenElement;
      setIsFullscreen(!!isFullscreenNow);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const calculateItemsPerPage = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      let cols = 1;
      if (w >= 1536) cols = 5;
      else if (w >= 1280) cols = 4;
      else if (w >= 1024) cols = 3;
      else if (w >= 640) cols = 2;

      // Available height = window height - top padding (pt-28 = 112px max) - bottom padding (pb-6 = 24px)
      const availableHeight = h - 112 - 24; 
      // Approximate min card height
      const cardHeight = 210;
      const gap = 20;

      let rows = Math.floor((availableHeight + gap) / (cardHeight + gap));
      if (rows < 1) rows = 1;

      setLayoutSpec({ cols, rows });
      setItemsPerPage(cols * rows);
    };

    calculateItemsPerPage();
    // Use resize listener with slight debounce
    let timeoutId: any;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateItemsPerPage, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let unsubscribeFn: (() => void) | null = null;

    const subscribe = () => {
      if (unsubscribeFn) return;
      const q = query(collection(db, 'machines'), orderBy('updatedAt', 'desc'));
      unsubscribeFn = onSnapshot(q, (snapshot) => {
        const ms = snapshot.docs.map(doc => ({ firebaseId: doc.id, ...doc.data() }));
        setMachines(ms);
      }, (error) => {
        console.error('Error fetching machines:', error);
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        unsubscribeFn?.();
        unsubscribeFn = null;
      } else {
        subscribe();
      }
    };

    subscribe();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribeFn?.();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (machines.length <= itemsPerPage) {
      setCurrentPage(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) * itemsPerPage >= machines.length ? 0 : prev + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, [machines.length, itemsPerPage]);

  const displayedMachines = machines.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const totalPages = Math.ceil(machines.length / itemsPerPage);

  return (
    <div className="bg-[#0a0a0a] text-gray-100 min-h-screen font-sans flex flex-col relative overflow-x-hidden selection:bg-[rgba(16,185,129,0.3)] selection:text-emerald-200">
      <div className="ambient-glow"></div>
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0a0a0a] border-b border-[rgba(255,255,255,0.1)] shadow-xl flex justify-between items-center px-6 md:px-10 h-16 md:h-20">
        <div>
          <h1 className="font-bold text-2xl md:text-3xl text-gray-100 tracking-tight">Painel de Laboratório</h1>
        </div>
        
        <div className="flex items-center">
          {totalPages > 1 && (
            <div className="flex mr-4 items-center">
              {Array.from({ length: totalPages }).map((_, i) => (
                <span 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 mr-1.5 ${i === currentPage ? 'bg-emerald-500 w-6' : 'bg-[rgba(255,255,255,0.2)] w-1.5'}`}
                />
              ))}
            </div>
          )}
          <div className="hidden lg:flex items-center gap-4 mr-5">
            {[
              { color: 'bg-red-500',     label: 'EM AJUSTE'  },
              { color: 'bg-amber-500',   label: 'AGUARDANDO' },
              { color: 'bg-blue-500',    label: 'EM ANÁLISE' },
              { color: 'bg-emerald-500', label: 'LIBERADO'   },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${color} shrink-0`}></div>
                <span className="text-[9px] font-bold tracking-wider text-gray-500 uppercase">{label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-4 py-2 md:py-2.5 rounded-lg shadow-sm mr-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)] mr-2"></span>
            <span className="text-[10px] md:text-xs font-bold tracking-wider text-gray-300 uppercase">Atualizado: {currentTime}</span>
          </div>
          <button onClick={toggleFullscreen} className="p-2 mr-2 text-gray-500 hover:text-emerald-400 transition-colors" title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}>
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          <Link to="/admin" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-emerald-400 transition-colors" title="Acessar Painel Administrativo">
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 md:pt-28 pb-6 px-6 lg:px-8 mx-auto w-full relative z-10 transition-all duration-300 flex flex-col h-screen max-h-screen overflow-hidden">
        <div 
          className="grid gap-4 md:gap-5 flex-grow"
          style={{ 
            gridTemplateColumns: `repeat(${layoutSpec.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${layoutSpec.rows}, minmax(0, 1fr))` 
          }}
        >
          {displayedMachines.map((m) => (
            <MachineCard key={m.firebaseId || m.id} data={m} />
          ))}
          {machines.length === 0 && (
            <div className="flex items-center justify-center h-full w-full text-gray-500 font-medium" style={{ gridColumn: `1 / -1`, gridRow: `1 / -1` }}>
              <p>Nenhuma OP sendo exibida no momento.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const formatDate = (ts: any): string => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const MachineCard = ({ data }: { data: any }) => {
  const isManipuladoLiberado = data.tag?.toUpperCase() === 'MANIPULADO' && data.status?.toUpperCase() === 'LIBERADO';

  const isGreen = !isManipuladoLiberado && data.status?.toUpperCase() === 'LIBERADO';
  const isRed = data.status?.toUpperCase() === 'EM AJUSTE';
  const isYellow = data.status?.toUpperCase() === 'AGUARDANDO' || isManipuladoLiberado;
  const isBlue = data.status?.toUpperCase() === 'EM ANÁLISE';

  const colorText = isGreen ? 'text-emerald-400' : isRed ? 'text-red-400' : isYellow ? 'text-amber-400' : isBlue ? 'text-blue-400' : 'text-gray-400';
  const colorBg = isGreen ? 'bg-[rgba(16,185,129,0.15)] border-[rgba(16,185,129,0.38)]' : isRed ? 'bg-[rgba(239,68,68,0.15)] border-[rgba(239,68,68,0.38)]' : isYellow ? 'bg-[rgba(245,158,11,0.15)] border-[rgba(245,158,11,0.38)]' : isBlue ? 'bg-[rgba(59,130,246,0.15)] border-[rgba(59,130,246,0.38)]' : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]';
  const headerText = isRed ? 'text-red-400' : isYellow ? 'text-amber-400' : isBlue ? 'text-blue-400' : isGreen ? 'text-emerald-400' : 'text-gray-100';
  const glowClass = isGreen ? 'glow-green' : isRed ? 'glow-red' : isYellow ? 'glow-yellow' : isBlue ? 'glow-blue' : '';
  const accentColor = isRed ? 'rgb(239,68,68)' : isGreen ? 'rgb(16,185,129)' : isYellow ? 'rgb(245,158,11)' : isBlue ? 'rgb(59,130,246)' : 'rgb(75,85,99)';
  const accentSoft  = isRed ? 'rgba(239,68,68,0.13)'  : isGreen ? 'rgba(16,185,129,0.13)'  : isYellow ? 'rgba(245,158,11,0.13)'  : isBlue ? 'rgba(59,130,246,0.13)'  : 'transparent';
  const accentMid   = isRed ? 'rgba(239,68,68,0.4)'   : isGreen ? 'rgba(16,185,129,0.4)'   : isYellow ? 'rgba(245,158,11,0.4)'   : isBlue ? 'rgba(59,130,246,0.4)'   : 'rgba(255,255,255,0.06)';
  const Icon = isGreen ? CheckCircle : isRed ? AlertTriangle : isYellow ? Hourglass : isBlue ? Search : Clock;

  return (
    <div className={`relative rounded-2xl overflow-hidden flex flex-col h-full border border-[rgba(255,255,255,0.08)] bg-[#0d0d11] shadow-2xl ${glowClass}`}>
      {/* Left accent bar — 4px full height */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: accentColor }}></div>
      {/* Bottom echo bar */}
      <div style={{ position: 'absolute', bottom: 0, left: '4px', right: 0, height: '2px', background: `linear-gradient(90deg, ${accentMid} 0%, transparent 100%)` }}></div>

      {/* Header — diagonal color gradient */}
      <div className="pl-6 pr-5 pt-5 pb-4 relative z-10" style={{ background: `linear-gradient(135deg, ${accentSoft} 0%, transparent 65%)` }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[8px] font-bold tracking-[0.22em] text-gray-600 uppercase block mb-1">Reator</span>
            <h2 className={`text-5xl font-black tracking-tight leading-none ${headerText}`}>{data.id}</h2>
          </div>
          <div className={`shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl border shadow-lg ${colorBg}`}>
            <Icon className={`w-4 h-4 ${colorText} shrink-0`} />
            <span className={`text-[9px] font-black tracking-[0.1em] uppercase ${colorText} whitespace-nowrap`}>{data.status}</span>
          </div>
        </div>
      </div>

      {/* Colored fading divider */}
      <div style={{ height: '1px', background: `linear-gradient(90deg, ${accentMid} 0%, rgba(255,255,255,0.04) 100%)` }}></div>

      {/* Body — Product name */}
      <div className="pl-6 pr-5 py-4 flex-grow relative z-10 flex flex-col justify-center">
        <span className="text-[8px] font-bold tracking-[0.18em] text-gray-600 uppercase block mb-1.5">Produto</span>
        <p className="text-base md:text-lg font-bold text-white uppercase leading-snug line-clamp-2" title={data.product}>{data.product}</p>
      </div>

      {/* Footer — OP, Amostra, Horário */}
      <div className="pl-6 pr-5 pt-3 pb-5 relative z-10" style={{ background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <span className="text-[8px] font-bold tracking-[0.15em] text-gray-600 uppercase block mb-0.5">OP</span>
            <p className="text-sm font-semibold text-gray-300">{data.op}</p>
          </div>
          <div>
            <span className="text-[8px] font-bold tracking-[0.15em] text-gray-600 uppercase block mb-0.5">Amostra</span>
            <p className={`text-sm font-bold uppercase ${colorText}`}>{data.tag}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-semibold flex items-center gap-1.5 ${isRed ? 'text-red-400' : 'text-gray-500'}`}>
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {formatDate(data.updatedAt) && <span className="opacity-70">{formatDate(data.updatedAt)}</span>} {data.time}
          </span>
          {data.history && data.history.length > 0 && (() => {
            const last = data.history[data.history.length - 1];
            return (
              <span className="text-[9px] text-gray-600 text-right leading-tight">
                ant: {last.status} · {formatDate(last.timestamp) && <>{formatDate(last.timestamp)} </>}{last.time}
              </span>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
