import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle, AlertTriangle, Clock, Hourglass, Settings, Maximize, Minimize } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Display() {
  const [machines, setMachines] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
      // Approximate card height (190px min-h) + gap (20px)
      const cardHeight = 190;
      const gap = 20;

      let rows = Math.floor((availableHeight + gap) / (cardHeight + gap));
      if (rows < 1) rows = 1;

      setItemsPerPage(cols * rows);
    };

    calculateItemsPerPage();
    window.addEventListener('resize', calculateItemsPerPage);
    return () => window.removeEventListener('resize', calculateItemsPerPage);
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
    const q = query(collection(db, 'machines'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ms = snapshot.docs.map(doc => ({ firebaseId: doc.id, ...doc.data() }));
      setMachines(ms);
    }, (error) => {
      console.error('Error fetching machines:', error);
    });

    return () => unsubscribe();
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
    <div className="bg-[#0a0a0a] text-gray-100 min-h-screen font-sans flex flex-col relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="ambient-glow"></div>
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0a0a0a] border-b border-white/10 shadow-xl flex justify-between items-center px-6 md:px-10 h-16 md:h-20">
        <div>
          <h1 className="font-bold text-2xl md:text-3xl text-gray-100 tracking-tight">Painel de Laboratório</h1>
        </div>
        
        <div className="flex items-center">
          {totalPages > 1 && (
            <div className="flex mr-4 items-center">
              {Array.from({ length: totalPages }).map((_, i) => (
                <span 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 mr-1.5 ${i === currentPage ? 'bg-emerald-500 w-6' : 'bg-white/20 w-1.5'}`}
                />
              ))}
            </div>
          )}
          <div className="flex items-center bg-white/5 border border-white/10 px-4 py-2 md:py-2.5 rounded-lg shadow-sm mr-4">
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
      <main className="flex-grow pt-24 md:pt-28 pb-6 px-6 lg:px-8 mx-auto w-full relative z-10 transition-all duration-300 flex flex-col">
        <div className="flex flex-wrap -mx-2 md:-mx-2.5 flex-grow content-start">
          {displayedMachines.map((m) => (
            <div key={m.firebaseId || m.id} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/5 p-2 md:p-2.5 flex flex-col">
              <MachineCard data={m} />
            </div>
          ))}
          {machines.length === 0 && (
            <div className="w-full flex items-center justify-center h-[50vh] text-gray-500 font-medium">
              <p>Nenhuma OP sendo exibida no momento.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const MachineCard = ({ data }: { data: any }) => {
  const isManipuladoLiberado = data.tag?.toUpperCase() === 'MANIPULADO' && data.status?.toUpperCase() === 'LIBERADO';
  
  const isGreen = !isManipuladoLiberado && data.status?.toUpperCase() === 'LIBERADO';
  const isRed = data.status?.toUpperCase() === 'EM AJUSTE';
  const isYellow = data.status?.toUpperCase() === 'AGUARDANDO' || isManipuladoLiberado;

  const colorText = isGreen ? 'text-emerald-400' : isRed ? 'text-red-400' : isYellow ? 'text-amber-400' : 'text-gray-400';
  const colorBg = isGreen ? 'bg-emerald-500/10 border-emerald-500/20' : isRed ? 'bg-red-500/10 border-red-500/20' : isYellow ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-white/10';
  const headerText = isRed ? 'text-red-400' : isYellow ? 'text-amber-400' : 'text-gray-100';
  const indicatorColor = isRed ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : isGreen ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : isYellow ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-gray-600';
  const glowClass = isGreen ? 'glow-green' : isRed ? 'glow-red' : isYellow ? 'glow-yellow' : '';
  
  const Icon = isGreen ? CheckCircle : isRed ? AlertTriangle : isYellow ? Hourglass : Clock;

  return (
    <div className={`glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-full min-h-[190px] hover:-translate-y-1 transition-all duration-300 ${glowClass}`}>
      <div className={`absolute top-0 left-0 w-full h-1 ${indicatorColor}`}></div>
      
      <div className="flex justify-between items-start mb-3 pt-1">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-gray-500 block mb-1 uppercase">Reator</span>
          <h2 className={`text-3xl font-black tracking-tight ${headerText}`}>{data.id}</h2>
        </div>
        <div className={`${colorBg} ${colorText} px-2.5 py-1.5 rounded-lg flex items-center border shadow-sm`}>
          <Icon className="w-3.5 h-3.5 mr-1.5" />
          <span className="text-[9px] font-bold tracking-wider uppercase">{data.status}</span>
        </div>
      </div>
      
      <div className="flex-grow z-10 pt-1">
        <div className="mb-3">
          <span className="text-[10px] font-bold tracking-wider text-gray-500 block mb-0.5 uppercase">Produto</span>
          <p className="text-base font-bold text-gray-200 uppercase leading-tight truncate" title={data.product}>{data.product}</p>
        </div>
        <div className="flex flex-wrap -mx-1.5">
          <div className="w-1/2 px-1.5">
            <div className="bg-white/5 p-2 rounded-lg border border-white/5 h-full">
              <span className="text-[10px] font-bold tracking-wider text-gray-500 block mb-0.5 uppercase">OP</span>
              <p className="text-[13px] font-semibold text-gray-300">{data.op}</p>
            </div>
          </div>
          <div className="w-1/2 px-1.5">
            <div className="bg-white/5 p-2 rounded-lg border border-white/5 h-full">
              <span className="text-[10px] font-bold tracking-wider text-gray-500 block mb-0.5 uppercase">Amostra</span>
              <p className="text-[13px] font-semibold text-gray-300 uppercase">{data.tag}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center z-10">
        <span className={`text-[10px] font-bold tracking-wider uppercase flex items-center ${isRed ? 'text-red-400' : 'text-gray-500'}`}>
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          Horário: {data.time}
        </span>
      </div>
    </div>
  );
}
