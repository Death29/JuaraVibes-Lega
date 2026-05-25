import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  TrendingUp, 
  Wind,
  User,
  ShieldAlert,
  Activity,
  History,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

type Level = 'ringan' | 'sedang' | 'berat' | 'akut';
type AppScreen = 'login' | 'register' | 'diagnosis' | 'target_duration' | 'dashboard' | 'sos' | 'detail_tapering' | 'check_in' | 'profile' | 'history';
type OutdoorLevel = 'ringan' | 'sedang' | 'berat';
type Gender = 'laki-laki' | 'perempuan';

interface UserProfile {
  name: string;
  age: string;
  outdoorLevel: OutdoorLevel;
  gender: Gender;
}

interface CheckInLog {
  time: string;
  value: number;
}

interface DiagnosisResult {
  level: string;
  priceNum: number;
  packsNum: number;
  durationWeeks: number;
  recPersonalized: string;
}

interface UserData {
  email: string;
  password?: string;
  profile?: UserProfile;
  diagnosis?: DiagnosisResult;
  targetDuration?: number;
  startDate?: string;
  checkIns?: Record<string, number>;
  checkInLogs?: Record<string, CheckInLog[]>;
}

interface Database {
  [email: string]: UserData;
}

const DATA: Record<Level, { label: string; durationWeeks: number; tips: string[]; organ: string }> = {
  ringan: {
    label: 'Ringan (< 0.5 bungkus / hari)',
    durationWeeks: 4,
    tips: [
      "Tunda rokok pertamamu setelah bangun tidur minimal 1 jam. Beri tubuh kesempatan bangun tanpa nikotin.",
      "Ganti kebiasaan 'tangan iseng' dengan nyemil sehat, permen karet bebas gula, atau mainin benda kecil.",
      "Kurangi jumlah batang rokok harianmu perlahan, misal: potong 1 batang setiap harinya."
    ],
    organ: "Dalam 2-3 hari sejak kamu mengurangi, tekanan darahmu mulai menormal dan indra perasa serta penciuman makin tajam. Makanan bakal terasa lebih enak, bro!"
  },
  sedang: {
    label: 'Sedang (1 bungkus / hari)',
    durationWeeks: 8,
    tips: [
      "Targetkan kurangi porsi harian secara konsisten. Kalau biasa sebungkus, coba pisahkan 3 batang di awal hari yang tidak boleh kamu sentuh.",
      "Jauhi trigger utamamu sementara waktu. Kurangi nongkrong lama di smoking area atau ngerokok sambil minum kopi.",
      "Mulai rutinkan olahraga ringan seperti jalan kaki. Biar kamu sadar napas udah mulai enteng."
    ],
    organ: "Dalam 2 minggu sampai 3 bulan, fungsi paru-parumu meningkat dan sirkulasi darah membaik. Buat naik tangga atau jalan agak jauh udah nggak begitu ngos-ngosan lagi."
  },
  berat: {
    label: 'Berat (> 1 - 2 bungkus / hari)',
    durationWeeks: 12,
    tips: [
      "Pelarian termudah memang nyebat. Tapi coba Terapi Pengganti Nikotin (NRT) seperti patch atau permen karet.",
      "Minta dukungan dari circle terdekat atau pasangan buat selalu ngingetin kalau lu mulai oleng.",
      "Bikin jadwal merokok yang ketat dan patuhi jamnya. Jangan main 'curi-curi' nyebat di luar jadwal."
    ],
    organ: "Dalam 1-9 bulan, frekuensi batuk-batuk pagi dan sesak napas akan berkurang drastis. Silia mulai tumbuh normal dan membersihkan lendir secara maksimal."
  },
  akut: {
    label: 'Akut (Chain-smoker / > 2 bungkus)',
    durationWeeks: 24,
    tips: [
      "Sangat disarankan untuk konsultasi ke dokter buat dapet opsi resep bantuan supaya withdrawal symptom-nya nggak menyiksa.",
      "Rombak total gaya hidup. Stop alkohol dan kurangi banget kafein sementara waktu.",
      "Fokus pada 'satu hari tanpa rokok', lalu ulangi besoknya. Nggak usah mikirin 'selamanya' dulu."
    ],
    organ: "Dalam 1 tahun, risiko penyakit jantung koroner akan turun menembus setengah dari risiko perokok aktif. Jantung dan pembuluh darahmu bakal berterima kasih banget."
  }
};

const MOTIVATIONS = [
  "Satu batang yang lu tolak hari ini adalah investasi napas panjang di masa depan. Stay strong!",
  "Nggak apa-apa pelan-pelan, yang penting konsisten. Sebagai sesama perokok, gue tau ini emang susah bro, tapi pasti bisa.",
  "Setiap kali lu nahan buat nggak nyebat, tubuh dan paru-paru lu lagi party ngerayain proses recovery.",
  "Duit rokoknya mending lu beliin kopi yang beneran enak, tambahin porto saham, atau jajanin orang tersayang.",
  "Ingat alasan pertama lu pengen ngerem kebiasaan ini. Tarik napas dalam-dalam, lu jauh lebih kuat dari nikotin itu sendiri."
];

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
};

const getTodayStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

function SOSCraving({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<'Tarik Napas' | 'Tahan' | 'Hembuskan'>('Tarik Napas');
  const [timeLeft, setTimeLeft] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phase === 'Tarik Napas') { setPhase('Tahan'); return 7; }
          if (phase === 'Tahan') { setPhase('Hembuskan'); return 8; }
          if (phase === 'Hembuskan') { setPhase('Tarik Napas'); return 4; }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const getScale = () => {
    if (phase === 'Tarik Napas') return 1.5;
    if (phase === 'Tahan') return 1.5;
    return 1;
  };

  const getColor = () => {
    if (phase === 'Tarik Napas') return 'border-teal-400 text-teal-400 shadow-[0_0_40px_rgba(45,212,191,0.4)]';
    if (phase === 'Tahan') return 'border-indigo-400 text-indigo-400 shadow-[0_0_40px_rgba(129,140,248,0.4)]';
    return 'border-gray-500 text-gray-500 shadow-[0_0_40px_rgba(107,114,128,0.3)]';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-1 flex flex-col items-center justify-center p-6 gap-12"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Fase SOS Craving</h2>
        <p className="text-gray-400">Ikuti irama napas ini (Metode 4-7-8) sampai hasrat merokok mereda.</p>
      </div>

      <div className="relative w-56 h-56 flex items-center justify-center my-12">
        <motion.div 
          animate={{ scale: getScale() }}
          transition={{ 
            duration: phase === 'Tarik Napas' ? 4 : phase === 'Hembuskan' ? 8 : 0, 
            ease: phase === 'Tahan' ? "linear" : "easeInOut" 
          }}
          className={`absolute inset-0 rounded-full border-[6px] ${getColor()}`}
        />
        <div className="text-center z-10 bg-[#0a0a0a]/50 p-6 rounded-full backdrop-blur-sm">
          <div className="text-5xl font-black mb-1 text-white">{timeLeft}</div>
          <div className="text-sm tracking-widest uppercase font-bold text-gray-300">{phase}</div>
        </div>
      </div>

      <button onClick={onBack} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-gray-300 transition-colors active:scale-[0.98]">
        KEMBALI KE LAYAR SEBELUMNYA
      </button>
    </motion.div>
  );
}

function HistoryScreen({ onBack, userLogs, startDate }: { onBack: () => void, userLogs: Record<string, CheckInLog[]>, startDate: string }) {
  const [currentDate, setCurrentDate] = useState(getTodayStr());

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    const newDateStr = d.toISOString().split('T')[0];
    if (newDateStr <= getTodayStr()) {
      setCurrentDate(newDateStr);
    }
  };

  const displayDateStr = new Date(currentDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const logsForDay = userLogs[currentDate] || [];

  return (
    <motion.main className="flex-1 flex flex-col p-6 max-w-lg w-full mx-auto" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
       <div className="flex justify-between items-center mb-8">
         <h2 className="text-xl font-bold tracking-tight text-white border-l-4 border-teal-500 pl-3">Riwayat Konsumsi</h2>
         <button onClick={onBack} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition bg-white/5 px-4 py-2 rounded-lg border border-white/10">Kembali</button>
       </div>

       <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
         <div className="flex justify-between items-center">
            <button onClick={handlePrevDay} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex justify-center items-center text-gray-400 hover:text-white transition-colors" disabled={currentDate <= startDate}>
               <ChevronLeft size={20} />
            </button>
            <div className="text-center flex-1">
               <p className="text-sm font-bold text-teal-400 capitalize">{displayDateStr}</p>
            </div>
            <button onClick={handleNextDay} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex justify-center items-center text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-gray-400" disabled={currentDate >= getTodayStr()}>
               <ChevronRight size={20} />
            </button>
         </div>
       </div>

       <div className="space-y-3">
          {logsForDay.length === 0 ? (
             <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <p className="text-gray-500 text-sm italic">Tidak ada log aktivitas untuk hari ini.</p>
             </div>
          ) : (
             logsForDay.map((log, index) => (
                <div key={index} className="flex justify-between items-center bg-[#0a0a0a] border border-white/5 rounded-xl p-4">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex justify-center items-center">
                         <History size={14} />
                      </div>
                      <span className="text-white font-medium text-sm">Check-in ke-{index + 1}</span>
                   </div>
                   <div className="text-right">
                      <p className="text-teal-400 font-bold text-lg leading-none mb-1">{log.value} <span className="text-[10px] text-gray-500 font-normal uppercase tracking-widest">Btg</span></p>
                      <p className="text-[10px] text-gray-500">{log.time}</p>
                   </div>
                </div>
             ))
          )}
       </div>
    </motion.main>
  );
}

export default function App() {
  const [db, setDb] = useState<Database>(() => {
    try {
      const data = localStorage.getItem('LEGA_DB');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  });
  
  const [sessionEmail, setSessionEmail] = useState<string | null>(() => localStorage.getItem('LEGA_SESSION'));
  const activeUser = sessionEmail ? db[sessionEmail] : null;

  const [navStack, setNavStack] = useState<AppScreen[]>(() => {
    const session = localStorage.getItem('LEGA_SESSION');
    return session ? ['dashboard'] : ['register'];
  });
  const currentScreen = navStack[navStack.length - 1];
  const navigate = (to: AppScreen) => setNavStack(prev => [...prev, to]);
  const resetNav = (to: AppScreen) => setNavStack([to]);
  const goBack = () => setNavStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);

  // Forms and Temp state for onboarding
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [profileForm, setProfileForm] = useState<UserProfile>({ name: '', age: '', outdoorLevel: 'sedang', gender: 'laki-laki' });
  const [diagForm, setDiagForm] = useState({ level: 'ringan', price: '', packs: '' });
  const [customTargetWeeks, setCustomTargetWeeks] = useState<string>('');
  
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);
  const [tempDiagnosis, setTempDiagnosis] = useState<DiagnosisResult | null>(null);
  const [tempTargetDuration, setTempTargetDuration] = useState<number | null>(null);

  const [checkInVal, setCheckInVal] = useState(0);
  const [detailContextDuration, setDetailContextDuration] = useState<number>(4);
  const [dailyQuote, setDailyQuote] = useState<string>('');

  useEffect(() => {
    setDailyQuote(MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);
  }, []);

  useEffect(() => {
    if (currentScreen === 'check_in' && activeUser) {
      setCheckInVal(0);
    }
  }, [currentScreen]);

  const saveActiveUser = (updates: Partial<UserData>) => {
    if (!sessionEmail) return;
    setDb(prev => {
      const existing = prev[sessionEmail] || { email: sessionEmail };
      const updated = { ...existing, ...updates };
      const newDb = { ...prev, [sessionEmail]: updated };
      localStorage.setItem('LEGA_DB', JSON.stringify(newDb));
      return newDb;
    });
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    const existing = db[authForm.email];
    if (existing) {
      if (existing.password === authForm.password) {
        let updatedUser = { ...existing };
        if (tempTargetDuration && tempProfile && tempDiagnosis) {
            updatedUser = {
                ...updatedUser,
                profile: tempProfile,
                diagnosis: tempDiagnosis,
                targetDuration: tempTargetDuration,
                startDate: existing.startDate || getTodayStr(),
                checkIns: existing.checkIns || {},
                checkInLogs: existing.checkInLogs || {}
            };
            setDb(prev => {
               const newDb = { ...prev, [authForm.email]: updatedUser };
               localStorage.setItem('LEGA_DB', JSON.stringify(newDb));
               return newDb;
            });
        }
        localStorage.setItem('LEGA_SESSION', authForm.email);
        setSessionEmail(authForm.email);
        resetNav('dashboard');
      } else {
        alert("Oops, password kamu salah.");
      }
    } else {
      if (!tempProfile || !tempDiagnosis || !tempTargetDuration) {
         alert("Akun belum terdaftar. Silakan mulai pendaftaran dari Profil Personal.");
         resetNav('register');
         return;
      }
      const newUser: UserData = { 
          email: authForm.email, 
          password: authForm.password,
          profile: tempProfile,
          diagnosis: tempDiagnosis,
          targetDuration: tempTargetDuration,
          startDate: getTodayStr(),
          checkIns: {},
          checkInLogs: {}
      };
      setDb(prev => {
        const newDb = { ...prev, [authForm.email]: newUser };
        localStorage.setItem('LEGA_DB', JSON.stringify(newDb));
        return newDb;
      });
      localStorage.setItem('LEGA_SESSION', authForm.email);
      setSessionEmail(authForm.email);
      resetNav('dashboard');
    }
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.age) {
      alert("Harap isi nama dan usia.");
      return;
    }
    setTempProfile(profileForm);
    navigate('diagnosis');
  };

  const handleDiagnose = (e: FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(diagForm.price.replace(/[^\d]/g, ''));
    const packsNum = parseFloat(diagForm.packs.replace(/[^\d.]/g, ''));
    if (isNaN(priceNum) || isNaN(packsNum)) {
      alert("Pastikan isi harga dan jumlah pack dengan angka ya.");
      return;
    }

    let baseWeeks = DATA[diagForm.level as Level].durationWeeks;
    const ageNum = parseInt(tempProfile?.age || "25");
    let personalization = "";

    if (ageNum >= 40) {
      baseWeeks += 2;
      personalization += `Usia ${ageNum} thn butuh waktu adaptasi fisik sedikit lebih lama. `;
    } else {
      personalization += `Usia ${ageNum} thn memberikan tubuh kemampuan recovery sel paru yang optimal. `;
    }

    if (tempProfile?.outdoorLevel === 'berat') {
      baseWeeks += 1;
      personalization += `Aktivitas luar ruangan yang berat butuh perlindungan ekstra saat bekerja. `;
    } else if (tempProfile?.outdoorLevel === 'ringan') {
      personalization += `Karena mayoritas di dalam ruangan, tambahkan rutinitas olahraga/jalan santai. `;
    }

    if (tempProfile?.gender === 'perempuan') {
      personalization += `Perubahan hormonal pada perempuan kadang bisa membuat craving lebih terasa, konsisten ya! `;
    } else {
      personalization += `Metabolisme laki-laki biasanya memberikan adaptasi denyut jantung yang cepat di awal. `;
    }

    setTempDiagnosis({
        level: diagForm.level,
        priceNum, packsNum, durationWeeks: baseWeeks, recPersonalized: personalization
    });

    navigate('target_duration');
  };

  const startProgram = (weeks: number) => {
    setTempTargetDuration(weeks);
    navigate('login');
  };

  const doLogout = () => {
    setSessionEmail(null);
    localStorage.removeItem('LEGA_SESSION');
    setAuthForm({ email: '', password: '' });
    setTempProfile(null);
    setTempDiagnosis(null);
    setTempTargetDuration(null);
    resetNav('register');
  };

  // Helper variables for computations
  const W = activeUser?.targetDuration || 1;
  const originalPacks = activeUser?.diagnosis?.packsNum || 1;
  const originalDaily = originalPacks * 20;

  let cw = 1, dailyLimit = 0, checkedInToday = 0, totalSavedCigarettes = 0;
  const todayStr = getTodayStr();

  if (activeUser?.startDate) {
    const s = new Date(activeUser.startDate); s.setHours(0,0,0,0);
    const t = new Date(todayStr); t.setHours(0,0,0,0);
    const diffDays = Math.floor((t.getTime() - s.getTime()) / (1000*3600*24));
    cw = Math.floor(diffDays / 7) + 1;
    
    if (cw <= W / 4) dailyLimit = Math.floor(originalDaily * 0.7);
    else if (cw <= W / 2) dailyLimit = Math.floor(originalDaily * 0.4);
    else if (cw <= W) dailyLimit = Math.max(1, Math.floor(originalDaily * 0.15));
    else dailyLimit = 0; // program finished

    checkedInToday = activeUser.checkIns?.[todayStr] || 0;

    const totalDaysInclusive = diffDays + 1;
    const expectedTotal = totalDaysInclusive * originalDaily;
    const actualTotal = Object.values(activeUser.checkIns || {}).reduce((acc, val) => acc + val, 0);
    totalSavedCigarettes = Math.max(0, expectedTotal - actualTotal);
  }

  const currentDiagnosis = activeUser?.diagnosis || tempDiagnosis;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans flex flex-col selection:bg-teal-500/30 overflow-x-hidden">
      
      {/* HEADER: No Sesi variables except buttons where required */}
      <header className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <motion.div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="flex items-baseline drop-shadow-md select-none">
              <span className="text-transparent text-4xl font-black tracking-widest" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.9)' }}>L</span>
              <span className="text-transparent text-4xl font-black tracking-widest ml-1.5" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.9)' }}>E</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#FDE047] to-[#DFAB30] text-4xl font-black tracking-widest ml-1.5 drop-shadow-sm">G</span>
              <span className="text-transparent text-4xl font-black tracking-widest ml-1.5" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.9)' }}>A</span>
            </div>
            <span className="text-white/50 font-light text-xl">| Tracker</span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm italic mt-1">"Bernapas lebih panjang, hidup lebih tenang."</p>
        </motion.div>
        
        {currentScreen === 'dashboard' && (
          <div className="flex items-center gap-6 shrink-0">
            <button onClick={() => navigate('profile')} className="text-xs text-teal-400 hover:text-teal-300 font-bold uppercase tracking-widest transition">Profil Saya</button>
            <button onClick={doLogout} className="text-xs text-red-400/80 hover:text-red-300 font-bold uppercase tracking-widest transition">Logout Sesi</button>
          </div>
        )}
      </header>

      {/* LOGIN */}
      {currentScreen === 'login' && (
        <main className="flex-1 flex flex-col justify-center items-center p-6 w-full max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-white tracking-tight border-l-4 border-teal-500 pl-3 mb-8">Autentikasi</h2>
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block font-bold">Email</label>
                <input type="email" required value={authForm.email} onChange={e=>setAuthForm(p=>({...p, email: e.target.value}))} className="w-full bg-black/40 border border-white/10 text-teal-400 rounded-lg p-3 focus:outline-none focus:border-teal-500" placeholder="user@email.com" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block font-bold">Password</label>
                <input type="password" required value={authForm.password} onChange={e=>setAuthForm(p=>({...p, password: e.target.value}))} className="w-full bg-black/40 border border-white/10 text-teal-400 rounded-lg p-3 focus:outline-none focus:border-teal-500" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-black font-bold tracking-widest rounded-xl mt-4 transition active:scale-[0.98]">MASUK ATAU DAFTAR</button>
            </form>
          </motion.div>
        </main>
      )}

      {/* PROFILE REGISTRATION */}
      {currentScreen === 'register' && (
        <main className="flex-1 flex items-center justify-center p-6 w-full max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-semibold border-l-4 border-teal-500 pl-3">Identitas Awal</h2>
            </div>
            
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Nama Depan</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500"><User size={18} /></div>
                  <input type="text" required value={profileForm.name} onChange={e=>setProfileForm(p=>({...p, name: e.target.value}))} className="w-full bg-black/40 border border-white/10 text-teal-400 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:border-teal-500" placeholder="Misal: Budi" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Usia</label>
                  <input type="number" required value={profileForm.age} onChange={e=>setProfileForm(p=>({...p, age: e.target.value}))} className="w-full bg-black/40 border border-white/10 text-teal-400 rounded-lg p-3 focus:outline-none focus:border-teal-500" placeholder="Misal: 28" min="12" max="100" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Jenis Kelamin</label>
                  <select value={profileForm.gender} onChange={e=>setProfileForm(p=>({...p, gender: e.target.value as Gender}))} className="w-full appearance-none bg-black/40 border border-white/10 text-teal-400 rounded-lg p-3 focus:outline-none focus:border-teal-500">
                    <option value="laki-laki">Laki-laki</option>
                    <option value="perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Aktivitas Luar Ruangan</label>
                <select value={profileForm.outdoorLevel} onChange={e=>setProfileForm(p=>({...p, outdoorLevel: e.target.value as OutdoorLevel}))} className="w-full appearance-none bg-black/40 border border-white/10 text-teal-400 rounded-lg p-3 focus:outline-none focus:border-teal-500">
                  <option value="ringan">Ringan (Dalam Ruangan)</option>
                  <option value="sedang">Sedang (Mobilitas Rutin)</option>
                  <option value="berat">Berat (Pekerja Lapangan)</option>
                </select>
              </div>

              <div className="mt-6 space-y-3">
                <button type="submit" className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-black font-bold tracking-widest rounded-xl transition active:scale-[0.98]">LANJUTKAN</button>
                <button type="button" onClick={() => navigate('login')} className="w-full py-4 border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white font-bold tracking-widest rounded-xl transition active:scale-[0.98] text-xs uppercase">MASUK, SUDAH PUNYA AKUN</button>
              </div>
            </form>
          </motion.div>
        </main>
      )}

      {/* DIAGNOSIS FORM */}
      {currentScreen === 'diagnosis' && (
         <main className="flex-1 flex justify-center items-center p-6 w-full max-w-lg mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full shadow-2xl">
              <h2 className="text-xl font-semibold border-l-4 border-teal-500 pl-3 mb-8">Diagnosis Adiktif</h2>
              <form onSubmit={handleDiagnose} className="space-y-6">
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Tingkat Ketergantungan</label>
                  <select value={diagForm.level} onChange={e=>setDiagForm(p=>({...p, level: e.target.value}))} className="w-full appearance-none bg-black/40 border border-white/10 text-teal-400 rounded-lg p-3 focus:outline-none focus:border-teal-500">
                    <option value="ringan">Ringan (Jarang nyebat)</option>
                    <option value="sedang">Sedang (Rutin tiap hari)</option>
                    <option value="berat">Berat (&gt;1 bungkus)</option>
                    <option value="akut">Akut (Chain-smoker)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Harga/Pack (Rp)</label>
                    <input type="number" required value={diagForm.price} onChange={e=>setDiagForm(p=>({...p, price: e.target.value}))} className="w-full bg-black/40 border border-white/10 text-teal-400 rounded-lg p-3 focus:outline-none focus:border-teal-500" placeholder="25000" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Konsumsi / Hari</label>
                    <input type="number" step="0.5" required value={diagForm.packs} onChange={e=>setDiagForm(p=>({...p, packs: e.target.value}))} className="w-full bg-black/40 border border-white/10 text-teal-400 rounded-lg p-3 focus:outline-none focus:border-teal-500" placeholder="1.5" />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-black tracking-widest font-bold rounded-xl mt-2 transition active:scale-[0.98]">ANALISA KEBIASAAN</button>
              </form>
            </motion.div>
         </main>
      )}

      {/* TARGET DURATION */}
      {currentScreen === 'target_duration' && currentDiagnosis && (
        <main className="flex-1 flex flex-col justify-center p-6 py-12 max-w-4xl w-full mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Target Penyesuaian</h2>
            <p className="text-gray-400">Pilih rekomendasi kami atau atur komitmenmu sendiri.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 relative">
            {/* CARD REKOMENDASI */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/5 border border-teal-500/50 rounded-2xl p-8 relative shadow-[0_0_30px_rgba(20,184,166,0.1)] flex flex-col">
              <div className="absolute top-0 right-0 bg-teal-500 text-black text-[10px] font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl uppercase tracking-widest">Rekomendasi</div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-bold mt-2">Target Durasi Optimal</p>
              <div className="text-6xl font-black text-white mb-8 bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">{currentDiagnosis.durationWeeks} <span className="text-xl font-medium tracking-normal text-teal-100/50">Minggu</span></div>
              
              <div className="space-y-4 mt-auto">
                 <button onClick={() => { setDetailContextDuration(currentDiagnosis.durationWeeks); navigate('detail_tapering'); }} className="w-full py-4 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition">Detail Tapering</button>
                 <button onClick={() => startProgram(currentDiagnosis.durationWeeks)} className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-black rounded-xl text-sm font-black shadow-lg uppercase tracking-widest transition">Pilih & Mulai Program</button>
              </div>
            </motion.div>

            {/* CARD KUSTOM */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-bold mt-2">Target Pribadi</p>
              <div className="flex gap-4 items-center mb-8">
                 <input type="number" 
                   className="w-32 bg-black/40 border border-white/10 text-5xl font-black text-white rounded-xl p-4 text-center focus:outline-none focus:border-teal-500 transition-colors" 
                   value={customTargetWeeks} onChange={e=>setCustomTargetWeeks(e.target.value)} min="1" max="100" />
                 <span className="text-xl font-medium text-gray-500">Minggu</span>
              </div>
              
              <div className="space-y-4 mt-auto">
                 {parseInt(customTargetWeeks) > 0 ? (
                   <button onClick={() => { setDetailContextDuration(parseInt(customTargetWeeks)); navigate('detail_tapering'); }} className="w-full py-4 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition">Detail Tapering</button>
                 ) : <div className="h-14 w-full"></div>}
                 <button 
                   onClick={() => {
                      const w = parseInt(customTargetWeeks);
                      if(w > 0) startProgram(w); else alert('Masukkan angka valid.');
                   }}
                   className="w-full py-4 border border-teal-500/50 text-teal-400 hover:bg-teal-500 hover:text-black rounded-xl text-sm font-black shadow-lg uppercase tracking-widest transition disabled:opacity-50"
                   disabled={!parseInt(customTargetWeeks) || parseInt(customTargetWeeks) <= 0}>
                   Pilih & Mulai Program
                 </button>
              </div>
            </motion.div>
          </div>
          
          <div className="mt-8 text-center">
            <button onClick={() => navigate('login')} className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors py-2 px-4">Ke Tampilan Login</button>
          </div>
        </main>
      )}

      {/* DASHBOARD */}
      {currentScreen === 'dashboard' && activeUser?.diagnosis && (
         <main className="flex-1 flex flex-col p-6 max-w-4xl w-full mx-auto gap-6 sm:gap-8 overflow-y-auto">
            {/* HALF CIRCULAR PROGRESS */}
            <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-8 relative overflow-hidden">
               <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-6">Konsumsi Harian (Hari {Math.floor((new Date(todayStr).getTime() - new Date(activeUser.startDate!).getTime())/86400000) + 1})</h3>
               
               <div className="relative w-64 md:w-72 h-32 md:h-36 flex justify-center">
                  <svg viewBox="0 0 100 50" className="w-full absolute inset-0">
                     <path d="M 10,50 A 40,40 0 0,1 90,50" fill="none" stroke="#222" strokeWidth="8" strokeLinecap="round" />
                     <path d="M 10,50 A 40,40 0 0,1 90,50" fill="none" stroke={checkedInToday > dailyLimit ? "#ef4444" : "#14b8a6"} strokeWidth="8" strokeLinecap="round" 
                       strokeDasharray="125.6" strokeDashoffset={125.6 - (Math.min(checkedInToday / Math.max(dailyLimit, 1), 1)) * 125.6} className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute bottom-0 flex flex-col items-center pb-2">
                     <span className={`text-6xl font-black tracking-tighter ${checkedInToday > dailyLimit ? 'text-red-400' : 'text-white'}`}>{checkedInToday}</span>
                     <span className="text-[10px] text-gray-500 uppercase tracking-widest w-[120px] text-center border-t border-white/10 mt-2 pt-2">Dari Batas: <span className="text-teal-400 font-bold">{dailyLimit}</span></span>
                  </div>
               </div>
               <p className="text-sm text-gray-400 mt-4 text-center">Jumlah rokok yang telah tercatat setiap check-in</p>
               {checkedInToday > dailyLimit && dailyLimit > 0 && <p className="text-xs text-red-400 font-bold mt-2 animate-pulse uppercase tracking-widest border border-red-500/20 bg-red-500/10 px-4 py-1.5 rounded-full">Batas harian terlewat!</p>}
               {dailyLimit === 0 && <p className="text-xs text-teal-400 font-bold mt-2 uppercase tracking-widest border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 rounded-full">Target Finish! 0 Batang</p>}
               
               <div className="flex flex-col sm:flex-row gap-4 w-full mt-8 max-w-xl">
                  <button onClick={() => navigate('check_in')} className="flex-1 bg-teal-500 hover:bg-teal-400 text-black py-4 rounded-xl font-bold transition-all uppercase tracking-widest text-sm text-center">Check-in</button>
                  <button onClick={() => navigate('sos')} className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-sm"><ShieldAlert size={18}/> SOS Craving</button>
               </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="bg-yellow-500 text-black p-2 rounded-lg font-bold text-lg leading-none flex items-center justify-center shrink-0 w-10 h-10">!</div>
                <div>
                  <h3 className="text-yellow-500 font-bold text-xs uppercase tracking-widest mb-2 text-center sm:text-left">Motivasi Hari Ini</h3>
                  <p className="text-sm text-yellow-200/80 leading-relaxed font-medium text-center sm:text-left italic">"{dailyQuote}"</p>
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="bg-gradient-to-tr from-teal-900/40 to-[#0a0a0a] border border-teal-500/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                    <Activity size={120} strokeWidth={1} className="text-teal-500/10 absolute -right-6 -top-6 rotate-12 pointer-events-none" />
                    <div className="bg-teal-500/20 p-4 rounded-full shrink-0 relative z-10 border border-teal-500/30">
                       <Activity size={32} className="text-teal-400" />
                    </div>
                    <div className="relative z-10 flex-1">
                        <h3 className="text-xs uppercase tracking-widest text-teal-400 font-bold mb-2 text-center md:text-left">Kinerja Organ</h3>
                        <p className="text-sm text-gray-300 leading-relaxed text-center md:text-left">{DATA[activeUser.diagnosis.level as Level].organ}</p>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-900/40 to-[#0a0a0a] border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col">
                    <TrendingUp size={120} strokeWidth={1} className="text-white absolute right-[-20px] top-[-10px] opacity-10 pointer-events-none" />
                    <h3 className="text-xs uppercase tracking-widest text-indigo-300 font-bold mb-4 relative z-10">Proyeksi Investasi (5% p.a)</h3>
                    <p className="text-[10px] text-indigo-300/60 mb-6 leading-relaxed uppercase tracking-wider relative z-10">*Estimasi jika diinvestasikan penuh</p>
                    
                    {(() => {
                       const durationWeeks = activeUser.targetDuration || currentDiagnosis.durationWeeks;
                       const baseSaved = activeUser.diagnosis.priceNum * activeUser.diagnosis.packsNum * 7 * durationWeeks;
                       const fv = (years: number) => baseSaved * Math.pow(1.05, years);
                       return (
                          <div className="mt-auto relative z-10 w-full">
                             <div className="mb-6">
                                <h4 className="text-3xl sm:text-4xl font-black text-white mb-2">{formatRupiah(baseSaved)}</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                   Potensi uang terkumpul dalam <span className="text-white font-bold">{durationWeeks} minggu</span> (durasi tapering) jika mengalokasikan pengeluaran <span className="text-white font-bold">{activeUser.diagnosis.packsNum} bungkus rokok/hari</span> (Rp{activeUser.diagnosis.priceNum.toLocaleString('id-ID')}/bgks).
                                </p>
                             </div>
                             <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs border-t border-indigo-500/30 pt-4">
                                <div>
                                  <p className="text-gray-400 mb-1">1 Tahun (+5%)</p>
                                  <p className="font-bold text-indigo-300">{formatRupiah(fv(1))}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 mb-1">5 Tahun</p>
                                  <p className="font-bold text-indigo-300">{formatRupiah(fv(5))}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 mb-1">10 Tahun</p>
                                  <p className="font-bold text-indigo-300">{formatRupiah(fv(10))}</p>
                                </div>
                             </div>
                          </div>
                       );
                    })()}
                </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                 <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">Tips Strategis</h3>
                 {activeUser.diagnosis.recPersonalized && (
                   <div className="mb-4 bg-teal-500/10 border border-teal-500/30 p-4 rounded-xl text-sm text-teal-300 leading-relaxed font-medium">
                     <span className="font-bold text-teal-400 block mb-1 uppercase tracking-widest text-[10px]">- Insight Analisis Personal - </span>
                     {activeUser.diagnosis.recPersonalized}
                   </div>
                 )}
                 <div className="space-y-3">
                    {DATA[activeUser.diagnosis.level as Level].tips.map((tip, i) => (
                       <div key={i} className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                          <div className="w-8 h-8 shrink-0 bg-teal-500/20 text-teal-400 rounded-full flex justify-center items-center font-bold text-xs italic">0{i+1}</div>
                          <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
                       </div>
                    ))}
                 </div>
            </div>
         </main>
      )}

      {/* CHECK-IN */}
      {currentScreen === 'check_in' && (
         <main className="flex-1 flex flex-col justify-center items-center p-6 w-full max-w-md mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 w-full flex flex-col items-center">
               <h2 className="text-center font-bold text-white uppercase tracking-widest mb-8 border-b border-white/10 pb-4 w-full">Update Data Hari Ini</h2>
               
               <div className="flex justify-center items-center gap-8 mb-8">
                  <button onClick={() => setCheckInVal(p=>Math.max(0, p-1))} className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex justify-center items-center text-3xl text-white font-bold transition-all active:scale-95">-</button>
                  <div className="flex flex-col items-center w-24">
                     <span className="text-6xl font-black text-teal-400">{checkInVal}</span>
                     <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">Batang</span>
                  </div>
                  <button onClick={() => setCheckInVal(p=>p+1)} className="w-16 h-16 rounded-full bg-teal-500 hover:bg-teal-400 border border-teal-400 flex justify-center items-center text-3xl text-black font-bold transition-all active:scale-95">+</button>
               </div>
               
               <div className="w-full flex gap-3 mt-4">
                  <button onClick={goBack} className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-gray-400 transition-colors uppercase text-sm tracking-widest">Batal</button>
                  <button onClick={() => {
                     const currentLog = activeUser?.checkIns || {};
                     const currentLogsMap = activeUser?.checkInLogs || {};
                     const today = getTodayStr();
                     const todayLogs = currentLogsMap[today] || [];
                     const now = new Date();
                     const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                     const currentTodayVal = currentLog[today] || 0;
                     
                     saveActiveUser({ 
                       checkIns: { ...currentLog, [today]: currentTodayVal + checkInVal },
                       checkInLogs: {
                         ...currentLogsMap,
                         [today]: [...todayLogs, { time: timeStr, value: checkInVal }]
                       }
                     });
                     goBack();
                  }} className="flex-1 py-4 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-colors uppercase text-sm tracking-widest">Check-in</button>
               </div>
            </motion.div>
         </main>
      )}

      {/* PROFILE VIEW */}
      {currentScreen === 'profile' && activeUser?.profile && (
        <main className="flex-1 flex flex-col p-6 max-w-2xl w-full mx-auto gap-6 sm:border-x border-white/5">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold tracking-tight text-white border-l-4 border-teal-500 pl-3">Profil Saya</h2>
            <button onClick={goBack} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition bg-white/5 px-4 py-2 rounded-lg border border-white/10">Kembali</button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="w-20 h-20 shrink-0 bg-gradient-to-tr from-teal-500 to-indigo-500 rounded-full flex justify-center items-center text-2xl font-black text-black shadow-lg uppercase">
              {activeUser.profile.name.substring(0,2)}
            </div>
            <div>
              <h3 className="text-3xl font-black text-white">{activeUser.profile.name}</h3>
              <p className="text-sm text-gray-400 font-mono capitalize mt-2">{activeUser.profile.age} Tahun • {activeUser.profile.gender} • <br className="sm:hidden"/>Aktivitas {activeUser.profile.outdoorLevel}</p>
              <p className="text-xs text-gray-500 font-mono mt-1 opacity-60">{activeUser.email}</p>
            </div>
          </div>
          
          {/* CHART */}
          {(() => {
             const data = Object.entries(activeUser.checkIns || {}).sort(([a], [b]) => a.localeCompare(b)).map(([dateStr, consumed]) => {
                const initialDaily = activeUser.diagnosis ? activeUser.diagnosis.packsNum * 20 : 0;
                return {
                    name: dateStr.split('-').slice(1).join('/'),
                    konsumsi: consumed,
                    dihemat: Math.max(0, initialDaily - consumed)
                }
             });
             if(data.length === 0) return null;
             return (
               <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold">Grafik Progres Konsumsi</h3>
                    <button onClick={() => navigate('history')} className="flex items-center gap-1.5 text-[10px] text-teal-400 hover:text-teal-300 font-bold uppercase tracking-widest transition px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 rounded-lg border border-teal-500/30">
                      <History size={12} /> Riwayat
                    </button>
                 </div>
                 <div className="h-48 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                       <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                       <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
                          itemStyle={{ color: '#fff' }}
                       />
                       <Line type="monotone" dataKey="konsumsi" name="Konsumsi" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                       <Line type="monotone" dataKey="dihemat" name="Dihemat" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, fill: '#14b8a6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
               </div>
             )
          })()}
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-start">
               <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-bold">Target Durasi</p>
               <p className="text-4xl font-black text-teal-400 mt-2 mb-4">{activeUser.targetDuration} <span className="text-sm font-medium text-teal-400/50 uppercase tracking-widest">Mgg</span></p>
               <button onClick={() => { setDetailContextDuration(activeUser.targetDuration!); navigate('detail_tapering'); }} className="mt-auto w-full py-2.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg text-[10px] font-bold uppercase tracking-widest transition">Detail Tapering</button>
             </div>
             <div className="bg-gradient-to-br from-green-900/40 to-[#0a0a0a] border border-green-500/30 rounded-2xl p-5">
               <p className="text-[10px] text-green-300 uppercase tracking-widest font-bold">Total Dihemat Sejauh Ini</p>
               <p className="text-4xl font-black text-white mt-2 tracking-tighter">{totalSavedCigarettes} <span className="text-xs text-gray-400 font-normal uppercase tracking-widest">Btg</span></p>
             </div>
          </div>

          <button onClick={doLogout} className="w-full mt-4 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 font-bold rounded-xl transition uppercase tracking-widest text-sm">Logout Sesi Profil</button>
        </main>
      )}

      {/* HISTORY */}
      {currentScreen === 'history' && activeUser && (
        <HistoryScreen onBack={goBack} userLogs={activeUser.checkInLogs || {}} startDate={activeUser.startDate || getTodayStr()} />
      )}

      {/* SOS CRAVING */}
      {currentScreen === 'sos' && (
        <SOSCraving onBack={goBack} />
      )}

      {/* DETAIL TAPERING */}
      {currentScreen === 'detail_tapering' && currentDiagnosis && (
        <motion.main className="flex-1 flex flex-col p-6 max-w-5xl w-full mx-auto" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight border-l-4 border-teal-500 pl-4">Jadwal Tapering & Pola</h2>
            <button onClick={goBack} className="text-xs font-bold text-gray-400 hover:text-teal-400 uppercase tracking-widest px-4 py-2 bg-white/5 rounded-lg border border-white/10 transition">Kembali</button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xs uppercase tracking-widest text-teal-400 font-bold mb-4">Proyeksi Jumlah Konsumsi per Fase</h3>
              <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                Asumsi awal: <strong className="text-white">{Math.round(currentDiagnosis.packsNum * 20)} batang/hari</strong>. 
                Penyusutan bertahap selama {detailContextDuration} minggu:
              </p>
              <div className="space-y-6 relative border-l border-white/10 pl-6 ml-2">
                <div className="relative">
                  <div className="absolute w-3 h-3 bg-red-400/80 rounded-full -left-[31px] top-1"></div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mgg 1 - {(detailContextDuration/4).toFixed(0) || 1}</p>
                  <p className="text-xl font-bold text-white mt-1">{Math.floor((currentDiagnosis.packsNum * 20) * 0.70)} batang / hari</p>
                </div>
                <div className="relative">
                  <div className="absolute w-3 h-3 bg-yellow-400/80 rounded-full -left-[31px] top-1"></div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mgg {(detailContextDuration/4 + 1).toFixed(0)} - {(detailContextDuration/2).toFixed(0)}</p>
                  <p className="text-xl font-bold text-white mt-1">{Math.floor((currentDiagnosis.packsNum * 20) * 0.40)} batang / hari</p>
                </div>
                <div className="relative">
                  <div className="absolute w-3 h-3 bg-teal-400/80 rounded-full -left-[31px] top-1"></div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mgg {(detailContextDuration/2 + 1).toFixed(0)} - {detailContextDuration}</p>
                  <p className="text-xl font-bold text-white mt-1">{Math.max(1, Math.floor((currentDiagnosis.packsNum * 20) * 0.15))} batang / hari</p>
                </div>
                <div className="relative pt-2">
                  <div className="absolute w-4 h-4 bg-teal-500 rounded-full border-2 border-[#0a0a0a] -left-[32px] top-3 shadow-[0_0_15px_rgba(45,212,191,0.5)]"></div>
                  <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Tujuan Akhir</p>
                  <p className="text-2xl font-black text-white drop-shadow-md">0 batang / hari</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-900/40 to-[#0a0a0a] border border-teal-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-lg shrink-0"><Wind size={20} /></div>
                <div>
                  <h3 className="font-bold text-white">Jam Strategis Konsumsi</h3>
                  <p className="text-sm text-gray-400 mt-1 leading-relaxed">Panduan mendisiplinkan waktu merokok untuk melatih ketahanan neuroplastisitas menolak craving.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-4 text-sm text-gray-300 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="font-mono font-bold text-teal-400 w-12 pt-0.5">08:00</div>
                  <div><strong className="text-white block mb-1">Tunda Rokok Pagi</strong> Paksakan jeda minimal 1-2 jam setelah bangun tidur sebelum nyebat batang pertama. Ini vital!</div>
                </div>
                <div className="flex gap-4 text-sm text-gray-300 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="font-mono font-bold text-yellow-500 w-12 pt-0.5">13:00</div>
                  <div><strong className="text-white block mb-1">Rentan Habis Makan</strong> Pasca makan ganti dengan sikat gigi ber-mint tinggi atau kunyah permen karet sugar-free. Tunda 30 menit.</div>
                </div>
                <div className="flex gap-4 text-sm text-gray-300 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="font-mono font-bold text-indigo-400 w-12 pt-0.5">20:00</div>
                  <div><strong className="text-white block mb-1">Cut-off Malam</strong> Dua jam sebelum tidur harus clear. Jangan biasakan otak relaksasi dengan nikotin sebelum tidur.</div>
                </div>
              </div>
            </div>
          </div>
        </motion.main>
      )}

    </div>
  );
}
