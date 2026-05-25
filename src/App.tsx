import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CigaretteOff, 
  TrendingUp, 
  HeartPulse, 
  Sparkles, 
  Calendar, 
  Activity, 
  AlertCircle,
  Coins,
  Wind,
  User,
  ShieldAlert
} from 'lucide-react';

type Level = 'ringan' | 'sedang' | 'berat' | 'akut';
type AppScreen = 'register' | 'dashboard' | 'sos' | 'detail';
type OutdoorLevel = 'ringan' | 'sedang' | 'berat';
type Gender = 'pria' | 'wanita';

interface UserProfile {
  name: string;
  age: string;
  outdoorLevel: OutdoorLevel;
  gender: Gender;
}

interface FormData {
  level: Level;
  price: string;
  packs: string;
}

interface AnalyzeResult {
  level: Level;
  priceNum: number;
  packsNum: number;
  durationWeeks: number;
  totalSaved: number;
  motivation: string;
  personalizationText: string;
}

const DATA: Record<Level, { label: string; durationWeeks: number; tips: string[]; organ: string }> = {
  ringan: {
    label: 'Ringan (< 0.5 bungkus / hari)',
    durationWeeks: 4,
    tips: [
      "Tunda rokok pertamamu setelah bangun tidur minimal 1 jam. Beri tubuh kesempatan bangun tanpa nikotin.",
      "Ganti kebiasaan 'tangan iseng' dengan nyemil sehat, permen karet bebas gula, atau mainin benda kecil (fidgeting).",
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
      "Sebagai dev yang paham betapa pusingnya debugging, jujur pelarian termudah memang nyebat. Tapi coba Terapi Pengganti Nikotin (NRT) seperti patch atau permen karet.",
      "Minta dukungan dari circle terdekat atau pasangan buat selalu ngingetin kalau lu mulai oleng.",
      "Bikin jadwal merokok yang ketat dan patuhi jamnya. Jangan main 'curi-curi' nyebat di luar jadwal."
    ],
    organ: "Dalam 1-9 bulan, frekuensi batuk-batuk pagi dan sesak napas akan berkurang drastis. Silia (rambut halus di paru-paru) mulai tumbuh normal dan membersihkan lendir secara maksimal."
  },
  akut: {
    label: 'Akut (Chain-smoker / > 2 bungkus)',
    durationWeeks: 24,
    tips: [
      "Ini udah kelas berat. Sangat disarankan untuk konsultasi ke dokter buat dapet opsi resep obat penghenti merokok supaya withdrawal symptom-nya nggak terlalu menyiksa.",
      "Rombak total gaya hidup. Stop alkohol dan kurangi banget kafein sementara waktu kalau itu memicu keinginan merokok berlebih.",
      "Fokus pada 'satu hari tanpa rokok', lalu ulangi besoknya. Nggak usah mikirin 'selamanya' berhenti dulu, biar otak nggak merasa terbebani."
    ],
    organ: "Dalam 1 tahun, risiko penyakit jantung koroner akan turun menembus setengah dari risiko perokok aktif. Jantung dan pembuluh darahmu bakal berterima kasih banget atas keputusan berat ini."
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

      <button
        onClick={onBack}
        className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-gray-300 transition-colors active:scale-[0.98]"
      >
        KEMBALI KE DASHBOARD
      </button>
    </motion.div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('register');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    age: '',
    outdoorLevel: 'sedang',
    gender: 'pria'
  });

  const [formData, setFormData] = useState<FormData>({
    level: 'ringan',
    price: '',
    packs: ''
  });
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [dailyQuote, setDailyQuote] = useState<string>('');

  useEffect(() => {
    setDailyQuote(MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!userProfile.name || !userProfile.age) {
      alert("Harap isi nama dan usia!");
      return;
    }
    setScreen('dashboard');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyze = (e: FormEvent) => {
    e.preventDefault();
    
    const priceNum = parseFloat(formData.price.replace(/[^\d]/g, ''));
    const packsNum = parseFloat(formData.packs.replace(/[^\d.]/g, ''));

    if (isNaN(priceNum) || isNaN(packsNum)) {
      alert("Uh oh, pastikan isi harga dan jumlah pack dengan angka.");
      return;
    }

    let baseDurationWeeks = DATA[formData.level].durationWeeks;
    const ageNum = parseInt(userProfile.age);
    let personalization = "";

    if (!isNaN(ageNum)) {
      if (ageNum >= 40) {
        baseDurationWeeks += 2; // Extra recovery time mapped
        personalization += `Usia ${ageNum} thn butuh waktu adaptasi fisik sedikit lebih lama. `;
      } else {
        personalization += `Usia ${ageNum} thn memberikan tubuh kemampuan recovery sel paru yang optimal. `;
      }
    }

    if (userProfile.outdoorLevel === 'berat') {
      baseDurationWeeks += 1; // Extra factor for trigger frequency outdoors
      personalization += `Aktivitas luar ruangan yang berat butuh perlindungan ekstra (seperti masker/permen mint) saat bekerja. `;
    } else if (userProfile.outdoorLevel === 'ringan') {
      personalization += `Karena mayoritas di dalam ruangan, tambahkan rutinitas olahraga/jalan santai agar metabolisme lancar. `;
    }

    if (userProfile.gender === 'wanita') {
      personalization += `Perubahan hormonal pada wanita kadang bisa membuat craving lebih terasa, usahakan tetap konsisten ya! `;
    } else {
      personalization += `Metabolisme pria biasanya memberikan adaptasi denyut jantung yang lebih cepat di awal fase. `;
    }

    const durationDays = baseDurationWeeks * 7;
    const totalSaved = priceNum * packsNum * durationDays;
    const quote = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];

    setResult({
      level: formData.level,
      priceNum,
      packsNum,
      durationWeeks: baseDurationWeeks,
      totalSaved,
      motivation: quote,
      personalizationText: personalization
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans flex flex-col selection:bg-teal-500/30 overflow-x-hidden">
      
      {/* HEADER */}
      <header className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left"
        >
          <h1 className="text-3xl font-bold tracking-tight text-teal-400">
            LEGA <span className="text-white font-light">| Tracker</span>
          </h1>
          <p className="text-gray-400 text-sm italic mt-1">
            "Bernapas lebih panjang, hidup lebih tenang."
          </p>
        </motion.div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center space-x-4 bg-white/5 px-4 py-2 rounded-full border border-white/10 shrink-0">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono uppercase tracking-widest text-gray-300">
              Sesi: {screen === 'register' ? 'Inisialisasi' : userProfile.name || 'Aktif'}
            </span>
          </div>
          {screen !== 'register' && (
            <button 
              onClick={() => {
                setScreen('register');
                setResult(null);
                setUserProfile({ name: '', age: '', outdoorLevel: 'sedang', gender: 'pria' });
              }}
              className="text-[10px] text-red-400/80 hover:text-red-300 uppercase tracking-widest transition-colors font-bold pr-2"
            >
              Logout Sesi
            </button>
          )}
        </div>
      </header>

      {/* REGISTRATION SCREEN */}
      {screen === 'register' && (
        <main className="flex-1 flex items-center justify-center p-6 w-full max-w-md mx-auto">
          <motion.div 
            className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-semibold border-l-4 border-teal-500 pl-3">Profil Personal</h2>
            </div>
            
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Nama Depan / Panggilan</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                     <User size={18} />
                   </div>
                  <input 
                    type="text" required name="name"
                    value={userProfile.name} onChange={handleProfileChange}
                    className="w-full bg-black/40 border border-white/10 text-teal-400 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:border-teal-500 font-medium placeholder:text-gray-600"
                    placeholder="Misal: Budi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Usia</label>
                  <input 
                    type="number" required name="age"
                    value={userProfile.age} onChange={handleProfileChange}
                    className="w-full bg-black/40 border border-white/10 text-teal-400 rounded-lg p-3 focus:outline-none focus:border-teal-500 font-medium placeholder:text-gray-600"
                    placeholder="Misal: 28"
                    min="12" max="100"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Jenis Kelamin</label>
                  <div className="relative">
                    <select
                      name="gender"
                      value={userProfile.gender}
                      onChange={handleProfileChange}
                      className="w-full appearance-none bg-black/40 border border-white/10 text-teal-400 rounded-lg p-3 focus:outline-none focus:border-teal-500 font-medium"
                    >
                      <option value="pria">Pria</option>
                      <option value="wanita">Wanita</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-teal-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Aktivitas di Luar Ruangan</label>
                <div className="relative">
                  <select
                    name="outdoorLevel"
                    value={userProfile.outdoorLevel}
                    onChange={handleProfileChange}
                    className="w-full appearance-none bg-black/40 border border-white/10 text-teal-400 rounded-lg px-4 py-3 focus:outline-none focus:border-teal-500 font-medium"
                  >
                    <option value="ringan">Ringan (Jarang / Dominan kerja kantoran)</option>
                    <option value="sedang">Sedang (Rutin mobilitas harian)</option>
                    <option value="berat">Berat (Pekerja lapangan / aktivitas fisik tinggi)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-teal-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl mt-4 transition-colors active:scale-[0.98]"
              >
                LANJUTKAN
              </button>
            </form>
          </motion.div>
        </main>
      )}

      {/* DASHBOARD SCREEN */}
      {screen === 'dashboard' && (
        <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-7xl w-full mx-auto">
          
          {/* LEFT PANE: INPUT FORM & MOTIVATION */}
          <section className={`flex flex-col gap-6 w-full transition-all duration-500 ${result ? 'lg:w-5/12' : 'max-w-2xl mx-auto'}`}>
            <motion.div 
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-semibold border-l-4 border-teal-500 pl-3">Diagnosis Adiktif</h2>
              </div>
              
              <form onSubmit={handleAnalyze} className="space-y-6">
                
                <div>
                  <label htmlFor="level" className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">
                    Tingkat Ketergantungan
                  </label>
                  <div className="relative">
                    <select
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="w-full appearance-none bg-black/40 border border-white/10 text-teal-400 rounded-lg px-4 py-3 focus:outline-none focus:border-teal-500 font-medium"
                    >
                      <option value="ringan">Ringan (Jarang nyebat, kadang saja)</option>
                      <option value="sedang">Sedang (Rutin tiap hari)</option>
                      <option value="berat">Berat (Lebih dari sebungkus)</option>
                      <option value="akut">Akut (Chain-smoker, &gt;2 bungkus)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-teal-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">
                      Harga / Pack (Rp)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      required
                      placeholder="25000"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 text-teal-400 rounded-lg p-3 focus:outline-none focus:border-teal-500 font-medium placeholder:text-gray-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="packs" className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">
                      Konsumsi Harian (Pack)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        id="packs"
                        name="packs"
                        required
                        placeholder="1.5"
                        value={formData.packs}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 text-teal-400 rounded-lg p-3 focus:outline-none focus:border-teal-500 font-medium placeholder:text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl mt-2 transition-colors active:scale-[0.98]"
                >
                  ANALISA KEBIASAAN
                </button>
              </form>

              <button
                  type="button"
                  onClick={() => setScreen('sos')}
                  className="w-full py-4 mt-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={20} />
                  SOS CRAVING (REDAKAN HASRAT)
                </button>
            </motion.div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 flex items-start gap-4">
              <div className="bg-yellow-500 text-black p-2 rounded-lg font-bold text-lg leading-none flex flex-col items-center justify-center shrink-0 w-10 h-10">
                <span className="-mt-1">!</span>
              </div>
              <div>
                <h3 className="text-yellow-500 font-bold text-sm uppercase mb-1">Motivasi Hari Ini</h3>
                <p className="text-sm text-yellow-200/80 leading-relaxed font-medium">"{dailyQuote}"</p>
              </div>
            </div>
          </section>

          {/* RIGHT PANE: RESULTS SECTION */}
          <AnimatePresence>
            {result && (
              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col gap-6"
              >
                
                {/* Top Row: Results Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Durasi Rekomendasi</p>
                      <h4 className="text-4xl font-bold text-teal-400 mt-1">{result.durationWeeks * 7} <span className="text-lg font-light text-teal-400/80">HARI</span></h4>
                      <p className="text-xs mt-2 text-gray-500 italic mb-4">Disesuaikan dengan usia & gaya.</p>
                    </div>
                    <button 
                      onClick={() => setScreen('detail')}
                      className="px-4 py-2 border border-teal-500/50 hover:bg-teal-500/10 text-teal-400 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors inline-block"
                    >
                      Detail Tapering
                    </button>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between items-end">
                    <p className="text-xs text-gray-400 uppercase text-right">Kinerja Organ</p>
                    <div className="flex justify-end gap-2 mt-2">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/40 text-sm" title="Paru-Paru">🫁</div>
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/40 text-sm" title="Jantung">🫀</div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-sm grayscale" title="Otak">🧠</div>
                    </div>
                    <p className="text-[10px] text-right mt-2 text-teal-400 italic line-clamp-2 max-w-full leading-tight">
                      {DATA[result.level].organ.substring(0, 70)}...
                    </p>
                  </div>
                </div>

                {/* Investment Box */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <TrendingUp size={120} strokeWidth={1} className="text-white" />
                  </div>
                  <h3 className="text-indigo-300 font-bold text-sm mb-4">PROYEKSI INVESTASI (5% p.a.)</h3>
                  
                  <div className="flex flex-col md:flex-row md:items-end gap-3 z-10 relative">
                    <h4 className="text-4xl sm:text-5xl font-bold text-white tracking-tighter truncate max-w-full">
                      {formatRupiah(result.totalSaved * 1.05)}
                    </h4>
                    <span className="text-green-400 text-xs md:text-sm font-mono mb-2 whitespace-nowrap">
                      +{formatRupiah(result.totalSaved * 0.05)} return/thn
                    </span>
                  </div>
                  <p className="text-xs text-indigo-300/60 mt-4 leading-relaxed italic relative z-10">
                    *Penghematan selama {result.durationWeeks} minggu yang dialihkan ke aset produktif.
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-indigo-500/20 grid grid-cols-2 gap-4 relative z-10">
                     <div>
                       <p className="text-[10px] text-indigo-400 uppercase tracking-wider mb-1">Nilai 5 Tahun</p>
                       <p className="font-bold text-indigo-100 truncate">{formatRupiah(result.totalSaved * Math.pow(1.05, 5))}</p>
                     </div>
                     <div>
                       <p className="text-[10px] text-indigo-400 uppercase tracking-wider mb-1">Nilai 10 Tahun</p>
                       <p className="font-bold text-indigo-100 truncate">{formatRupiah(result.totalSaved * Math.pow(1.05, 10))}</p>
                     </div>
                  </div>
                </div>

                {/* Tips & Tricks Scroll */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1 flex flex-col">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                    Tips Strategis ({DATA[result.level].label.split(' ')[0]})
                  </h3>
                  
                  {result.personalizationText && (
                    <div className="mb-4 bg-teal-500/10 border border-teal-500/30 p-3 rounded-xl">
                      <p className="text-sm text-teal-300 leading-relaxed font-medium">
                        <span className="font-bold text-teal-400 block mb-1">Insight Khusus untukmu:</span>
                        {result.personalizationText}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {DATA[result.level].tips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-4 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-teal-500/30 transition-colors">
                        <div className="w-8 h-8 shrink-0 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 font-bold italic text-sm mt-0.5">
                          0{idx + 1}
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      )}

      {/* SOS CRAVING SCREEN */}
      {screen === 'sos' && (
        <SOSCraving onBack={() => setScreen('dashboard')} />
      )}
      
      {/* DETAIL PENURUNAN SCREEN */}
      {screen === 'detail' && result && (
        <motion.main 
          className="flex-1 flex flex-col p-6 max-w-5xl w-full mx-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight border-l-4 border-teal-500 pl-4">
              Jadwal Tapering & Pola Rutinitas
            </h2>
            <button
              onClick={() => setScreen('dashboard')}
              className="text-xs font-bold text-gray-400 hover:text-teal-400 uppercase tracking-widest px-4 py-2 bg-white/5 rounded-lg border border-white/10 transition-colors"
            >
              Kembali
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xs uppercase tracking-widest text-teal-400 font-bold mb-4">Proyeksi Penurunan / Hari</h3>
              <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                Asumsi 1 bungkus = 20 batang. Saat ini kamu mengkonsumsi <strong className="text-white">{Math.round(result.packsNum * 20)} batang/hari</strong>. 
                Target bertahap selama {result.durationWeeks} minggu ke depan:
              </p>
              
              <div className="space-y-6 relative border-l border-white/10 pl-6 ml-2">
                <div className="relative">
                  <div className="absolute w-3 h-3 bg-red-400/80 rounded-full -left-[31px] top-1"></div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Minggu 1 - {(result.durationWeeks/4).toFixed(0)}</p>
                  <p className="text-xl font-bold text-white mt-1">{Math.floor((result.packsNum * 20) * 0.70)} batang</p>
                </div>
                <div className="relative">
                  <div className="absolute w-3 h-3 bg-yellow-400/80 rounded-full -left-[31px] top-1"></div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Minggu {(result.durationWeeks/4 + 1).toFixed(0)} - {(result.durationWeeks/2).toFixed(0)}</p>
                  <p className="text-xl font-bold text-white mt-1">{Math.floor((result.packsNum * 20) * 0.40)} batang</p>
                </div>
                <div className="relative">
                  <div className="absolute w-3 h-3 bg-teal-400/80 rounded-full -left-[31px] top-1"></div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Minggu {(result.durationWeeks/2 + 1).toFixed(0)} - {result.durationWeeks}</p>
                  <p className="text-xl font-bold text-white mt-1">{Math.max(1, Math.floor((result.packsNum * 20) * 0.15))} batang</p>
                </div>
                <div className="relative pt-2">
                  <div className="absolute w-4 h-4 bg-teal-500 rounded-full border-2 border-[#0a0a0a] -left-[32px] top-3 shadow-[0_0_15px_rgba(45,212,191,0.5)]"></div>
                  <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Tujuan Akhir</p>
                  <p className="text-2xl font-black text-white drop-shadow-md">0 batang / Berhenti</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-teal-900/40 to-[#0a0a0a] border border-teal-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-lg shrink-0">
                    <Wind size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Jam Strategis Konsumsi</h3>
                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">Panduan mendisiplinkan waktu merokok untuk melatih ketahanan neuroplastisitas menolak craving.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-4 text-sm text-gray-300 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="font-mono font-bold text-teal-400 w-12 pt-0.5">08:00</div>
                    <div>
                      <strong className="text-white block mb-1">Tunda Rokok Pagi</strong>
                      Paksakan jeda minimal 1-2 jam setelah bangun tidur sebelum nyebat batang pertama. Ini vital!
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-300 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="font-mono font-bold text-yellow-500 w-12 pt-0.5">13:00</div>
                    <div>
                      <strong className="text-white block mb-1">Rentan Habis Makan</strong>
                      Pasca makan ganti dengan sikat gigi ber-mint tinggi atau kunyah permen karet sugar-free. Tunda 30 menit.
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-300 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="font-mono font-bold text-indigo-400 w-12 pt-0.5">20:00</div>
                    <div>
                      <strong className="text-white block mb-1">Cut-off Malam</strong>
                      Dua jam sebelum tidur harus clear. Jangan biasakan otak relaksasi dengan nikotin sebelum tidur.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.main>
      )}
      
      {/* Footer */}
      <footer className="p-4 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600 uppercase tracking-tighter w-full mt-auto shrink-0">
        <span>V.1.0.4-STABLE</span>
        <span className="hidden sm:inline">Build for Developer Health Awareness</span>
        <span className="text-teal-900 font-bold">System Active • Memory Safe</span>
      </footer>
    </div>
  );
}
