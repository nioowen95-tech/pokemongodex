import { useEffect, useMemo, useRef, useState } from 'react';

type Pokemon = { id: number; name: string; types: string[]; attack: number; defense: number; stamina: number; shiny?: boolean; shadow?: boolean; mega?: boolean; hasGoStats?: boolean; isMega?: boolean; artId?: number; energy?: number; repeatEnergy?: number };
type Detail = { buddy?: number; candy?: string; evolves?: string; fast?: string; charged?: string; weakness?: string[]; resistance?: string[] };
const types = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];
const colors: Record<string, string> = { Grass: '#e5f3e8', Poison: '#f0e5f7', Fire: '#ffebdf', Flying: '#e9edfc', Water: '#e2efff', Bug: '#eef2db', Normal: '#edf0f2', Electric: '#fff5cc', Ground: '#f4e9d9', Fairy: '#fbe6f2', Fighting: '#f8e2dd', Psychic: '#fce2ec', Rock: '#eee9dc', Ice: '#def4f4', Ghost: '#eae5f7', Dragon: '#e5e4fc', Dark: '#e8e5e4', Steel: '#e5edf0' };
const regions = ['Semua generasi', 'Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea'];
const bounds = [0, 151, 251, 386, 493, 649, 721, 809, 905, 1025];
const seeds: Pokemon[] = [
  { id: 1, name: 'Bulbasaur', types: ['Grass', 'Poison'], attack: 118, defense: 111, stamina: 128, shiny: true, shadow: true },
  { id: 2, name: 'Ivysaur', types: ['Grass', 'Poison'], attack: 151, defense: 143, stamina: 155, shiny: true, shadow: true },
  { id: 3, name: 'Venusaur', types: ['Grass', 'Poison'], attack: 198, defense: 189, stamina: 190, shiny: true, shadow: true, mega: true },
  { id: 4, name: 'Charmander', types: ['Fire'], attack: 116, defense: 93, stamina: 118, shiny: true, shadow: true },
  { id: 5, name: 'Charmeleon', types: ['Fire'], attack: 158, defense: 126, stamina: 151, shiny: true, shadow: true },
  { id: 6, name: 'Charizard', types: ['Fire', 'Flying'], attack: 223, defense: 173, stamina: 186, shiny: true, shadow: true, mega: true },
  { id: 7, name: 'Squirtle', types: ['Water'], attack: 94, defense: 121, stamina: 127, shiny: true, shadow: true },
  { id: 8, name: 'Wartortle', types: ['Water'], attack: 126, defense: 155, stamina: 153, shiny: true, shadow: true },
  { id: 9, name: 'Blastoise', types: ['Water'], attack: 171, defense: 207, stamina: 188, shiny: true, shadow: true, mega: true },
  { id: 10, name: 'Caterpie', types: ['Bug'], attack: 55, defense: 55, stamina: 128, shiny: true },
  { id: 11, name: 'Metapod', types: ['Bug'], attack: 45, defense: 80, stamina: 137, shiny: true },
  { id: 12, name: 'Butterfree', types: ['Bug', 'Flying'], attack: 167, defense: 137, stamina: 155, shiny: true },
];
const cp = (p: Pokemon) => Math.floor((p.attack + 15) * Math.sqrt(p.defense + 15) * Math.sqrt(p.stamina + 15) * 0.8403 ** 2 / 10);
const cpLabel = (p: Pokemon) => p.hasGoStats === false ? '—' : cp(p).toLocaleString('en-US');
const pretty = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
async function api(file: string) {
  const response = await fetch(`https://pogoapi.net/api/v1/${file}.json`);
  if (!response.ok) throw new Error('API tidak tersedia');
  return response.json();
}
function Icon({ name, className = '' }: { name: string; className?: string }) {
  const paths: Record<string, string> = { search: 'm21 21-5-5M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0', arrow: 'M7 17 17 7M7 7h10v10', chevron: 'm9 5 7 7-7 7', close: 'm6 6 12 12M6 18 18 6', filter: 'M4 7h16M7 12h10M10 17h4', sparkle: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3', bolt: 'm13 2-9 12h7l-1 8L21 9h-8l1-7', grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z', info: 'M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0', book: 'M4 4h6l2 2 2-2h6v15h-6l-2 2-2-2H4zM12 6v15' };
  return <svg className={`w-5 h-5 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name] || paths.sparkle} /></svg>;
}
function Ball({ className = '' }: { className?: string }) {
  return <span className={`relative block rounded-full border-[3px] border-current overflow-hidden ${className}`}><span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-current" /><span className="absolute left-1/2 top-1/2 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-current bg-white" /></span>;
}
function Artwork({ id, shiny = false, className = '' }: { id: number; shiny?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [id, shiny]);
  return failed ? <svg role="img" aria-label="Gambar Pokémon tidak tersedia" viewBox="0 0 100 100" className={className}><circle cx="50" cy="50" r="32" fill="#e2e8f0" stroke="#64748b" strokeWidth="3" /><path d="M18 50h64" stroke="#64748b" strokeWidth="3" /><circle cx="50" cy="50" r="10" fill="white" stroke="#64748b" strokeWidth="3" /></svg> : <img className={`object-contain ${className}`} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${shiny ? 'shiny/' : ''}${id}.png`} alt={`${shiny ? 'Shiny ' : ''}Pokémon #${id}`} onError={() => setFailed(true)} />;
}
function Badge({ type }: { type: string }) {
  return <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-slate-700" style={{ background: colors[type] || '#edf0f2' }}><span className="h-1.5 w-1.5 rounded-full bg-current" />{type}</span>;
}
function PokemonCard({ pokemon: p, onClick }: { pokemon: Pokemon; onClick: () => void }) {
  return <button onClick={onClick} className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-[0_3px_12px_#0f172a03] transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-600">
    <div className="relative mx-3 mt-3 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-[#f6f8fa]">
      <span className="absolute left-3 top-3 font-mono text-xs font-medium text-slate-500">#{String(p.id).padStart(3, '0')}</span>
      <div className="absolute right-3 top-3 flex gap-1.5">{p.shiny && <span title="Shiny tersedia" className="text-amber-600"><Icon name="sparkle" className="!h-4 !w-4" /></span>}{p.mega && <span title="Mega tersedia" className="text-purple-600"><Icon name="bolt" className="!h-4 !w-4" /></span>}</div>
      <div className="absolute bottom-3 h-5 w-24 rounded-[50%] bg-slate-200/60 blur-md" />
      <Artwork id={p.artId ?? p.id} className="relative h-32 w-32 transition duration-300 group-hover:scale-110" />
    </div>
    <div className="px-5 pb-4 pt-3"><h3 className="text-lg font-bold tracking-tight">{p.name}</h3><div className="mt-2 flex flex-wrap gap-1.5">{p.types.map(t => <Badge key={t} type={t} />)}</div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-xs font-medium text-slate-500">{p.hasGoStats === false ? 'CP GO BELUM TERSEDIA' : 'MAX CP'} <span className="ml-1 text-base font-bold text-slate-800">{cpLabel(p)}</span></span><span className="text-slate-500 transition group-hover:text-blue-600"><Icon name="arrow" className="!h-4 !w-4" /></span></div></div>
  </button>;
}
function PokemonModal({ pokemon: p, onClose }: { pokemon: Pokemon; onClose: () => void }) {
  const [shiny, setShiny] = useState(false);
  const [tab, setTab] = useState('Ringkasan');
  const [detail, setDetail] = useState<Detail>({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    dialog.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const nodes = dialog.current?.querySelectorAll<HTMLElement>('button, [href], [tabindex="0"]');
        if (!nodes?.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); previous?.focus(); };
  }, [onClose]);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [buddy, evolution, moves, fast, charged, poke] = await Promise.all([
          api('pokemon_buddy_distances'), api('pokemon_evolutions'), api('current_pokemon_moves'), api('fast_moves'), api('charged_moves'),
          fetch(`https://pokeapi.co/api/v2/pokemon/${p.artId ?? p.id}`).then(r => { if (!r.ok) throw Error(); return r.json(); }),
        ]);
        const normal = (rows: any[]) => rows.find(r => r.pokemon_id === p.id && (!r.form || r.form === 'Normal'));
        const b = Array.isArray(buddy) ? normal(buddy) : Object.entries(buddy).flatMap(([distance, rows]: [string, any]) => Array.isArray(rows) ? rows.map(r => ({ ...(typeof r === 'object' ? r : { pokemon_id: r }), distance: Number(distance) })) : []).find(r => r.pokemon_id === p.id);
        const ev = normal(evolution); const move = normal(moves);
        const rank = (names: string[], source: any[]) => names?.map(n => source.find(m => m.name === n)).filter(Boolean).sort((a, b) => (b.power / (b.duration || 1000)) - (a.power / (a.duration || 1000)))[0]?.name;
        const relations = await Promise.all(poke.types.map((t: any) => fetch(t.type.url).then(r => r.json())));
        const multiplier: Record<string, number> = Object.fromEntries(types.map(t => [t.toLowerCase(), 1]));
        relations.forEach((t: any) => {
          ['double_damage_from', 'half_damage_from', 'no_damage_from'].forEach((key, i) => t.damage_relations[key].forEach((v: any) => { multiplier[v.name] *= [1.6, 0.625, 0.390625][i]; }));
        });
        if (active) setDetail({ buddy: b?.buddy_distance || b?.distance, candy: ev?.evolutions?.map((e: any) => `${e.candy_required ?? '?'} Candy`).join(' / '), evolves: ev?.evolutions?.map((e: any) => e.pokemon_name).join(' / '), fast: rank(move?.fast_moves, fast), charged: rank(move?.charged_moves, charged), weakness: Object.entries(multiplier).filter(([, v]) => v > 1).map(([t, v]) => `${pretty(t)} ×${v.toFixed(2)}`), resistance: Object.entries(multiplier).filter(([, v]) => v < 1).map(([t, v]) => `${pretty(t)} ×${v.toFixed(2)}`) });
      } catch { if (active) setFailed(true); } finally { if (active) setLoading(false); }
    }
    load(); return () => { active = false; };
  }, [p.id]);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
    <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="pokemon-title" onClick={e => e.stopPropagation()} className="relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl outline-none md:p-8">
      <button aria-label="Tutup detail" onClick={onClose} className="absolute right-4 top-4 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white text-slate-600 focus-visible:ring-2"><Icon name="close" /></button>
      <div className="flex flex-col items-center rounded-2xl bg-slate-50 pb-5"><Artwork id={p.artId ?? p.id} shiny={shiny} className="h-44 w-44" /><button aria-pressed={shiny} onClick={() => setShiny(!shiny)} className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-blue-700 focus-visible:ring-2"><Icon name="sparkle" />{shiny ? 'Shiny' : 'Normal'}<span className="text-slate-500"> / Ganti tampilan</span></button></div>
      <div className="my-5 flex flex-wrap items-center justify-between gap-4"><div><p className="font-mono text-sm text-slate-500">#{String(p.id).padStart(3, '0')}</p><h2 id="pokemon-title" className="text-3xl font-bold">{p.name}</h2><div className="mt-2 flex gap-2">{p.types.map(t => <Badge key={t} type={t} />)}</div></div><div className="text-right text-sm text-slate-600">Max CP<p className="text-3xl font-bold text-blue-600">{cpLabel(p)}</p><p className="text-xs">Level 50 · IV 15/15/15</p></div></div>
      {p.isMega && <div className="mb-5 rounded-xl border border-purple-200 bg-purple-50 p-4"><h3 className="flex items-center gap-2 font-bold text-purple-800"><Icon name="bolt" />Energi {p.name.startsWith('Primal') ? 'Primal' : 'Mega'}</h3><div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700"><p>Evolusi pertama<strong className="block text-lg text-purple-800">{p.energy} energi</strong></p><p>Evolusi berikutnya<strong className="block text-lg text-purple-800">{p.repeatEnergy} energi</strong></p></div><p className="mt-2 text-sm text-slate-600">Biaya berikutnya adalah nilai dasar API; dapat berkurang mengikuti Mega Level dan waktu istirahat.</p></div>}
      {p.hasGoStats === false && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Terdaftar di National Pokédex. Statistik GO belum tersedia dari sumber; nilai di bawah tidak mewakili statistik resminya.</p>}
      <div role="tablist" aria-label="Detail Pokémon" className="mb-5 flex border-b border-slate-200">{['Ringkasan', 'Moveset', 'Efektivitas'].map(t => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`min-h-11 flex-1 border-b-2 text-sm font-semibold focus-visible:ring-2 ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600'}`}>{t}</button>)}</div>
      {loading && <p role="status" className="mb-4 animate-pulse text-sm text-blue-700 motion-reduce:animate-none">Memuat informasi tambahan…</p>}
      {failed && <p role="status" className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Informasi tambahan gagal dimuat. Statistik dasar tetap tersedia.</p>}
      {tab === 'Ringkasan' && <div className="space-y-4">{[['Attack', p.attack, 'bg-rose-400'], ['Defense', p.defense, 'bg-blue-500'], ['Stamina', p.stamina, 'bg-emerald-500']].map(([label, value, color]) => <div key={label} className="flex items-center gap-4 text-sm"><span className="w-20 text-slate-600">{label}</span><strong className="w-8">{value}</strong><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(Number(value) / 400 * 100, 100)}%` }} /></div></div>)}<div className="grid grid-cols-2 gap-3 pt-3"><div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Jarak Buddy<p className="mt-1 font-bold text-slate-900">{detail.buddy ? `${detail.buddy} km / Candy` : 'Belum tersedia'}</p></div><div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Evolusi berikutnya<p className="mt-1 font-bold text-slate-900">{detail.evolves || 'Tidak ada / belum tersedia'}</p><p>{detail.candy}</p></div></div></div>}
      {tab === 'Moveset' && <div className="space-y-3"><h3 className="font-bold">Pilihan PvE / Raid</h3>{[['Fast Move', detail.fast], ['Charged Move', detail.charged]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 rounded-xl bg-slate-50 p-4 text-sm"><span className="text-slate-600">{label}</span><strong>{value ? pretty(value) : 'Belum tersedia'}</strong></div>)}<p className="text-sm leading-relaxed text-slate-600">Estimasi berdasarkan damage per durasi animasi, tanpa bonus STAB, energi, atau jurus legacy. Bukan simulasi DPS penuh.</p><h3 className="pt-2 font-bold">PvP / GO Battle League</h3><p className="text-sm leading-relaxed text-slate-600">Rekomendasi bergantung liga, energi, coverage, dan pembaruan musim. Ranking PvP langsung belum tersedia dalam sumber ini.</p></div>}
      {tab === 'Efektivitas' && <div className="space-y-5">{[['Kelemahan', detail.weakness], ['Ketahanan', detail.resistance]].map(([label, list]) => <div key={String(label)}><h3 className="mb-3 font-bold">{label}</h3><div className="flex flex-wrap gap-2">{Array.isArray(list) && list.length ? list.map(t => <span key={t} className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{t}</span>) : <p className="text-sm text-slate-600">Data belum tersedia.</p>}</div></div>)}</div>}
    </div>
  </div>;
}
export default function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>(seeds);
  const [megas, setMegas] = useState<Pokemon[]>([]);
  const [snapshot, setSnapshot] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState(0);
  const [type, setType] = useState('');
  const [special, setSpecial] = useState<string[]>([]);
  const [sort, setSort] = useState('number');
  const [limit, setLimit] = useState(24);
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState('Pokédex');
  const [statusReady, setStatusReady] = useState(false);
  useEffect(() => {
    let active = true; setLoading(true); setError(false);
    async function load() {
      let catalog: Pokemon[] = [];
      try {
        const response = await fetch('/pokedex.json');
        if (!response.ok) throw Error('Katalog gagal dimuat');
        const data = await response.json();
        catalog = data.pokemon;
        if (active) { setPokemon(catalog); setMegas(data.megas); setSnapshot(true); setLoading(false); setStatusReady(true); }
      } catch { /* API langsung tetap dicoba jika katalog lokal gagal dimuat. */ }
      try {
        const [stats, typing, shiny, shadow, mega] = await Promise.all([api('pokemon_stats'), api('pokemon_types'), api('shiny_pokemon').catch(() => null), api('shadow_pokemon').catch(() => null), api('mega_pokemon').catch(() => null)]);
        const ids = (data: any) => new Set((Array.isArray(data) ? data : Object.values(data || {})).map((p: any) => p.pokemon_id ?? p.id));
        const shinyIds = ids(shiny), shadowIds = ids(shadow), megaIds = ids(mega);
        const best = (rows: any[], id: number) => rows.find(p => p.pokemon_id === id && p.form === 'Normal') || rows.find(p => p.pokemon_id === id);
        const records = (catalog.length ? catalog : seeds).map(p => {
          const stat = best(stats, p.id);
          return { ...p, ...(stat ? { attack: stat.base_attack, defense: stat.base_defense, stamina: stat.base_stamina, hasGoStats: true } : {}), types: best(typing, p.id)?.type || p.types, shiny: shiny ? shinyIds.has(p.id) : p.shiny, shadow: shadow ? shadowIds.has(p.id) : p.shadow, mega: mega ? megaIds.has(p.id) : p.mega };
        });
        if (!records.length) throw Error();
        if (active) {
          setPokemon(records); setSnapshot(false); setStatusReady(Boolean(shiny && shadow && mega));
          if (mega) setMegas(previous => mega.map((m: any) => ({ ...previous.find(p => p.name === m.mega_name), id: m.pokemon_id, name: m.mega_name, types: m.type, attack: m.stats.base_attack, defense: m.stats.base_defense, stamina: m.stats.base_stamina, hasGoStats: true, mega: true, isMega: true, shiny: shinyIds.has(m.pokemon_id), energy: m.first_time_mega_energy_required, repeatEnergy: m.mega_energy_required })));
        }
      } catch { if (active) setError(true); } finally { if (active) setLoading(false); }
    }
    load(); return () => { active = false; };
  }, [retry]);
  useEffect(() => setLimit(24), [search, region, type, special, sort, view]);
  const filtered = useMemo(() => (view === 'Mega Evolution' ? megas : pokemon).filter(p => {
    const query = search.trim().toLowerCase().replace(/^#/, '');
    return (p.name.toLowerCase().includes(query) || (/^\d+$/.test(query) ? p.id === Number(query) : !query)) && (!region || (p.id > bounds[region - 1] && p.id <= bounds[region])) && (!type || p.types.includes(type)) && special.every(s => Boolean(p[s as 'shiny' | 'shadow' | 'mega']));
  }).sort((a, b) => sort === 'cp' ? cp(b) - cp(a) : sort === 'name' ? a.name.localeCompare(b.name) : a.id - b.id), [pokemon, megas, search, region, type, special, sort, view]);
  const reset = () => { setSearch(''); setRegion(0); setType(''); setSpecial([]); };
  const toggle = (s: string) => setSpecial(prev => prev.includes(s) ? prev.filter(v => v !== s) : [...prev, s]);
  const close = useMemo(() => () => setSelected(null), []);
  const activeCount = Number(Boolean(region)) + Number(Boolean(type)) + special.length;
  return <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] font-sans text-slate-900 selection:bg-blue-100">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex min-h-20 max-w-[1480px] items-center justify-between gap-6 px-5 lg:px-10">
      <button onClick={() => { setView('Pokédex'); reset(); }} aria-label="GOdex beranda" className="flex min-h-11 items-center gap-2.5 focus-visible:ring-2"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"><Ball className="h-6 w-6" /></span><span className="text-2xl font-extrabold tracking-tighter">GO<span className="text-blue-600">dex</span><span className="ml-2 align-top text-xs font-medium tracking-normal text-slate-500">/</span></span></button>
      <nav aria-label="Navigasi utama" className="flex min-w-0 items-center gap-2 md:gap-7">{['Pokédex', 'Mega Evolution', 'Panduan'].map(v => <button key={v} onClick={() => { setView(v); reset(); }} className={`relative min-h-20 px-1 text-sm font-semibold focus-visible:ring-2 ${view === v ? 'text-blue-600 after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-t after:bg-blue-600' : 'text-slate-600'}`}>{v}</button>)}</nav>
      <span className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 lg:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Pokémon GO companion</span>
    </div></header>
    <main className="mx-auto max-w-[1480px] px-5 pb-12 pt-8 lg:px-10">
      <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-[#edf4ff] px-6 py-8 md:px-9 md:py-9">
        <div className="pointer-events-none absolute -right-8 -top-14 rotate-[-25deg] text-blue-200/50 md:right-12"><Ball className="h-80 w-80 !border-[22px] [&>span:first-child]:!h-[22px] [&>span:last-child]:!border-[18px] [&>span:last-child]:!bg-[#edf4ff]" /></div>
        <div className="relative"><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700"><span className="h-1.5 w-1.5 rounded-full bg-blue-600" />Your adventure starts here</div><h1 className="text-3xl font-extrabold leading-tight tracking-[-0.045em] md:text-[42px]">{view === 'Mega Evolution' ? <>Kekuatan baru. <span className="text-blue-600">Mega Evolution.</span></> : <>Kenali Pokémon. <span className="text-blue-600">Kuasai petualangan.</span></>}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 md:text-base">Temukan statistik, evolusi, dan moveset terbaik Pokémon GO.<br className="hidden md:block" /> Semua yang kamu butuhkan, dalam satu Pokédex.</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-600"><span className="flex items-center gap-2"><Icon name="book" className="!h-4 !w-4 text-blue-600" />{loading ? 'Memuat' : pokemon.length} Pokémon</span><span className="h-3 w-px bg-blue-200" /><span className="flex items-center gap-2"><Icon name="grid" className="!h-4 !w-4 text-blue-600" />9 Generasi</span><span className="h-3 w-px bg-blue-200" /><span className="flex items-center gap-2"><Icon name="bolt" className="!h-4 !w-4 text-blue-600" />Data khusus Pokémon GO</span></div></div>
      </section>
      {view === 'Panduan' ? <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-8"><p className="text-sm font-semibold text-blue-600">TRAINER FIELD NOTES</p><h2 className="mt-2 text-2xl font-bold">Sedikit persiapan, petualangan lebih seru.</h2><div className="mt-7 grid gap-6 md:grid-cols-3">{[['Pahami Max CP', 'Max CP dihitung pada level 50 dengan IV sempurna 15/15/15, tanpa boost Best Buddy. CP bukan satu-satunya penentu kekuatan.'], ['Pilih moveset sesuai tujuan', 'Raid mengutamakan damage, sedangkan PvP memerlukan keseimbangan energi, coverage, dan batas CP liga.'], ['Jelajahi bentuk spesial', 'Gunakan filter Shiny, Shadow, dan Mega. Ketersediaan di alam liar atau event dapat berbeda dari status yang tercatat pada API.']].map(([title, text], i) => <div key={title} className="rounded-xl bg-slate-50 p-5"><span className="text-sm font-bold text-blue-600">0{i + 1}</span><h3 className="my-3 font-bold">{title}</h3><p className="text-sm leading-7 text-slate-600">{text}</p></div>)}</div><button onClick={() => setView('Pokédex')} className="mt-7 min-h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white focus-visible:ring-2">Mulai jelajahi Pokédex</button></section> : <>
      <div className="mb-6 mt-7 flex flex-col gap-3 sm:flex-row"><label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm focus-within:ring-2 focus-within:ring-blue-500"><Icon name="search" className="text-slate-500" /><input aria-label="Cari nama atau nomor Pokémon" value={search} onChange={e => setSearch(e.target.value)} className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-slate-500" placeholder="Cari Pokémon berdasarkan nama atau nomor Pokédex..." /><span className="hidden rounded border border-slate-200 px-1.5 font-mono text-xs text-slate-500 md:block">⌕</span></label><button onClick={() => setFiltersOpen(!filtersOpen)} aria-pressed={filtersOpen} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium md:hidden"><Icon name="filter" />Filter {activeCount > 0 && `(${activeCount})`}</button><label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600"><span className="whitespace-nowrap">Urutkan:</span><select aria-label="Urutkan Pokémon" value={sort} onChange={e => setSort(e.target.value)} className="min-h-12 min-w-0 bg-transparent font-semibold text-slate-800 outline-none focus-visible:ring-2"><option value="number">Nomor Pokédex</option><option value="cp">Max CP tertinggi</option><option value="name">Nama A–Z</option></select></label></div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900"><span>{view === 'Mega Evolution' ? `${megas.length} bentuk Mega & Primal • Termasuk varian X dan Y. Klik kartu untuk statistik dan biaya energi.` : `${pokemon.length} / 1025 spesies National Pokédex • #0001 Bulbasaur hingga #1025 Pecharunt. Data GO tersedia tidak selalu berarti sudah dirilis dalam game.`}</span>{view !== 'Mega Evolution' && <button onClick={() => { reset(); setView('Mega Evolution'); }} className="flex min-h-11 items-center gap-2 font-bold focus-visible:ring-2"><Icon name="bolt" />Jelajahi Mega</button>}</div>
      {error && <div role="status" className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"><span>{snapshot ? 'Pembaruan API gagal. Katalog lengkap dan bentuk Mega tetap tersedia dari snapshot bawaan.' : 'Katalog gagal dimuat. Menampilkan data contoh terbatas.'}</span><button onClick={() => setRetry(retry + 1)} className="min-h-11 font-bold underline focus-visible:ring-2">Coba lagi</button></div>}
      {!loading && !error && !statusReady && <p role="status" className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Sebagian data Shiny, Shadow, atau Mega tidak tersedia. Status yang tidak diketahui tidak ditampilkan.</p>}
      <div className="flex items-start gap-7">
        <aside aria-label="Filter Pokémon" className={`${filtersOpen ? 'block' : 'hidden'} w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-5 md:block md:w-[226px] ${filtersOpen ? 'max-md:mb-5' : ''}`}>
          <div className="mb-6 flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-bold"><Icon name="filter" className="!h-4 !w-4" />Filter</h2><button onClick={reset} className="min-h-11 text-xs font-semibold text-blue-600 focus-visible:ring-2">Reset semua</button></div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="generation">Generasi</label><select id="generation" value={region} onChange={e => setRegion(Number(e.target.value))} className="mb-6 mt-3 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus-visible:ring-2">{regions.map((r, i) => <option key={r} value={i}>{r}</option>)}</select>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tipe Pokémon</h3><div className="grid grid-cols-2 gap-x-2 gap-y-1">{types.map(t => <button key={t} aria-pressed={type === t} onClick={() => setType(type === t ? '' : t)} className={`flex min-h-11 items-center gap-2 rounded-lg px-2 text-xs font-medium transition focus-visible:ring-2 ${type === t ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-300' : 'text-slate-600 hover:bg-slate-50'}`}><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-slate-700" style={{ background: colors[t] }}>{t.slice(0, 1)}</span>{t}</button>)}</div>
          <div className="mb-3 mt-5 border-t border-slate-100 pt-5 text-xs font-bold uppercase tracking-wider text-slate-500">Status khusus</div>{[['shiny', 'Shiny tersedia', 'sparkle'], ['shadow', 'Shadow Pokémon', 'ghost'], ['mega', 'Mega Evolution', 'bolt']].map(([key, label, icon]) => <label key={key} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="h-4 w-4 rounded accent-blue-600 focus-visible:ring-2" checked={special.includes(key)} onChange={() => toggle(key)} /><Icon name={icon} className={`!h-4 !w-4 ${key === 'shiny' ? 'text-amber-600' : 'text-purple-600'}`} />{label}</label>)}
          <div className="mt-6 rounded-xl bg-blue-50 p-3.5"><Icon name="info" className="mb-2 !h-4 !w-4 text-blue-600" /><p className="text-xs leading-5 text-slate-600">Max CP dihitung pada <strong className="font-semibold">Level 50</strong> dengan IV sempurna (15/15/15).</p></div>
        </aside>
        <section aria-label="Daftar Pokémon" className={`min-w-0 flex-1 ${filtersOpen ? 'max-md:hidden' : ''}`}>
          <div className="mb-4 flex min-h-7 flex-wrap items-center justify-between gap-2"><h2 className="text-sm text-slate-600">{loading ? 'Menyiapkan Pokédex...' : <>Menampilkan <strong className="font-bold text-slate-900">{filtered.length}</strong> {view === 'Mega Evolution' ? 'bentuk Mega / Primal' : 'Pokémon'}</>}</h2><span className="flex items-center gap-1.5 text-xs text-slate-500"><span className={`h-1.5 w-1.5 rounded-full ${error ? 'bg-amber-500' : 'bg-emerald-500'}`} />{snapshot ? 'Snapshot PokéAPI + GO API' : error ? 'Mode contoh' : 'PokéAPI + GO API'}</span></div>
          {loading ? <div role="status" aria-label="Memuat Pokémon" className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:gap-5 2xl:grid-cols-4">{Array.from({ length: 12 }, (_, i) => <div key={i} className="h-[296px] animate-pulse rounded-2xl border border-slate-200 bg-white p-3 motion-reduce:animate-none"><div className="h-40 rounded-xl bg-slate-100" /><div className="mt-4 h-5 w-2/3 rounded bg-slate-100" /><div className="mt-3 h-4 w-1/2 rounded bg-slate-100" /></div>)}</div> : <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:gap-5 2xl:grid-cols-4">{filtered.slice(0, limit).map(p => <PokemonCard key={`${p.id}-${p.name}`} pokemon={p} onClick={() => setSelected(p)} />)}</div>}
          {!loading && !filtered.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center"><Icon name="search" className="mx-auto mb-4 !h-8 !w-8 text-blue-600" /><h3 className="text-lg font-bold">Pokémon belum ditemukan</h3><p className="mt-2 text-sm text-slate-600">Coba nama lain atau kurangi filter pencarian.</p><button onClick={reset} className="mt-5 min-h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white focus-visible:ring-2">Reset pencarian</button></div>}
          {!loading && limit < filtered.length && <div className="mt-8 text-center"><button onClick={() => setLimit(limit + 24)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-7 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-400 focus-visible:ring-2">Muat lebih banyak <span className="ml-2 text-slate-500">({Math.min(limit, filtered.length)} / {filtered.length})</span></button></div>}
        </section>
      </div></>}
      <footer className="mt-12 flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-6 text-xs leading-5 text-slate-500"><span>GOdex — Dibuat untuk para Trainer, oleh penggemar.</span><span>Data: pogoapi.net & PokéAPI · Tidak berafiliasi dengan Niantic atau Nintendo.</span></footer>
    </main>
    {selected && <PokemonModal pokemon={selected} onClose={close} />}
  </div>;
}
