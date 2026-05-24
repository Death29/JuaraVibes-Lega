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
  Coins
} from 'lucide-react';

type Level = 'ringan' | 'sedang' | 'berat' | 'akut';

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

export default function App() {
  const [formData, setFormData] = useState<FormData>({
    level: 'ringan',
    price: '',
    packs: ''
  });
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [dailyQuote, setDailyQuote] = useState<string>('');

  // Set initial daily quote
  useEffect(() => {
    setDailyQuote(MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyze = (e: FormEvent) => {
    e.preventDefault();
    
    const priceNum = parseFloat(formData.price.replace(/[^\d]/g, ''));
    const packsNum = parseFloat(formData.packs.replace(/[^\d.]/g, ''));

    if (isNaN(priceNum) || isNaN(packsNum)) {
      alert("Uh oh, pastikan isi harga dan jumlah pack dengan angka ya bro.");
      return;
    }

    const durationWeeks = DATA[formData.level].durationWeeks;
    const durationDays = durationWeeks * 7;
    // Total uang yang harusnya dikeluarkan selama durasi rekomendasi
    const totalSaved = priceNum * packsNum * durationDays;
    
    // Pick a new random motivation to refresh it on calculation
    const quote = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];

    setResult({
      level: formData.level,
      priceNum,
      packsNum,
      durationWeeks,
      totalSaved,
      motivation: quote
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans flex flex-col selection:bg-teal-500/30 overflow-x-hidden">
      
      {/* HEADER */}
      <header className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left"
        >
          <h1 className="text-3xl font-bold tracking-tight text-teal-400">
            LEGA <span className="text-white font-light">| Dashboard</span>
          </h1>
          <p className="text-gray-400 text-sm italic mt-1">
            "Napas perlahan terasa enteng, dompet makin tebal."
          </p>
        </motion.div>
      </header>

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
              <h2 className="text-lg font-semibold border-l-4 border-teal-500 pl-3">Profil Adiktif</h2>
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
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-xs text-gray-400 uppercase">Durasi Rekomendasi</p>
                  <h4 className="text-4xl font-bold text-teal-400 mt-1">{result.durationWeeks * 7} <span className="text-lg font-light text-teal-400/80">HARI</span></h4>
                  <p className="text-xs mt-2 text-gray-500 italic">Target penyesuaian stabil</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-end">
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
      
      {/* Footer */}
      <footer className="p-4 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600 uppercase tracking-tighter w-full mt-auto">
        <span>V.1.0.4-STABLE</span>
        <span className="hidden sm:inline">Build for Developer Health Awareness</span>
        <span className="text-teal-900 font-bold">System Active • Memory Safe</span>
      </footer>
    </div>
  );
}
