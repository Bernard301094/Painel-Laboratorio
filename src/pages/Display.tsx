import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle, AlertTriangle, Clock, Hourglass, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

export default function Display() {
  const [machines, setMachines] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

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
      const ms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMachines(ms);
    }, (error) => {
      console.error('Error fetching machines:', error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (machines.length <= ITEMS_PER_PAGE) {
      setCurrentPage(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) * ITEMS_PER_PAGE >= machines.length ? 0 : prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, [machines.length]);

  const displayedMachines = machines.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(machines.length / ITEMS_PER_PAGE);

  return (
    <div className="bg-[#121212] text-[#e5e2e1] min-h-screen font-sans flex flex-col relative overflow-x-hidden selection:bg-[#00E676]/30 selection:text-[#00E676]">
      <div className="ambient-glow"></div>
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex justify-between items-center px-6 md:px-10 h-16 md:h-20">
        <div>
          <h1 className="font-semibold text-2xl md:text-3xl text-[#e5e2e1] tracking-tight">Painel de Laboratório</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {totalPages > 1 && (
            <div className="flex gap-1.5 mr-4 items-center">
              {Array.from({ length: totalPages }).map((_, i) => (
                <span 
                  key={i} 
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${i === currentPage ? 'bg-[#00E676] w-6' : 'bg-white/20'}`}
                />
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 bg-[#2b2a2a]/50 border border-white/5 px-4 py-2 md:py-2.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
            <span className="text-[10px] md:text-xs font-semibold tracking-wider text-[#e5e2e1]">Atualizado: {currentTime}</span>
          </div>
          <Link to="/admin" target="_blank" rel="noopener noreferrer" className="p-2 text-white/50 hover:text-[#00E676] transition-colors" title="Acessar Painel Administrativo">
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 md:pt-28 pb-6 px-6 lg:px-8 mx-auto w-full relative z-10 transition-all duration-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
          {displayedMachines.map((m) => (
            <MachineCard key={m.id} data={m} />
          ))}
          {machines.length === 0 && (
            <div className="col-span-full flex items-center justify-center h-[50vh] text-white/50">
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
  const isNeutral = !isGreen && !isRed && !isYellow;

  const glowClass = isGreen ? 'glow-green' : isRed ? 'glow-red' : isYellow ? 'glow-yellow' : 'glow-neutral';
  const colorText = isGreen ? 'text-[#00E676]' : isRed ? 'text-[#FF3131]' : isYellow ? 'text-[#FFBD03]' : 'text-[#a0a0a0]';
  const colorBg = isGreen ? 'bg-[#00E676]/10 border-[#00E676]/30' : isRed ? 'bg-[#FF3131]/10 border-[#FF3131]/30' : isYellow ? 'bg-[#FFBD03]/10 border-[#FFBD03]/30' : 'bg-white/10 border-white/20';
  
  const Icon = isGreen ? CheckCircle : isRed ? AlertTriangle : isYellow ? Hourglass : Clock;

  return (
    <div className={`glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-full min-h-[190px] border border-white/5 hover:-translate-y-1 transition-transform duration-300 ${glowClass}`}>
      {isRed && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF3131] to-transparent opacity-80"></div>}
      {isGreen && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E676] to-transparent opacity-50"></div>}
      {isYellow && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFBD03] to-transparent opacity-50"></div>}
      {isNeutral && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>}
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-white/50 block mb-1 uppercase">Reator</span>
          <h2 className={`text-3xl font-bold tracking-tight ${isRed ? 'text-[#FF3131]' : isYellow ? 'text-[#FFBD03]' : 'text-[#e5e2e1]'}`}>{data.id}</h2>
        </div>
        <div className={`${colorBg} ${colorText} px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border shadow-sm`}>
          <Icon className="w-3 h-3" />
          <span className="text-[9px] font-bold tracking-wider uppercase">{data.status}</span>
        </div>
      </div>
      
      <div className="space-y-3 flex-grow z-10 pt-1">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-white/50 block mb-0.5 uppercase">Produto</span>
          <p className="text-base font-semibold text-[#e5e2e1] uppercase leading-tight truncate" title={data.product}>{data.product}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-white/50 block mb-0.5 uppercase">OP</span>
            <p className="text-[13px] font-medium text-[#c8c6c5]">{data.op}</p>
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-white/50 block mb-0.5 uppercase">Amostra</span>
            <p className="text-[13px] font-medium text-[#c8c6c5] uppercase">{data.tag}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center z-10">
        <span className={`text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${isRed ? 'text-[#FF3131]' : 'text-white/40'}`}>
          <Clock className="w-3.5 h-3.5" />
          Horário: {data.time}
        </span>
      </div>
    </div>
  );
}
