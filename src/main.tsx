import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getWeather, formatObservationTime, type Backend, type Weather } from './weather';
import './style.css';

const urls: Record<Backend, string> = {
  go: import.meta.env.VITE_GO_API_URL || (import.meta.env.DEV ? 'http://localhost:8080' : ''),
  dotnet: import.meta.env.VITE_DOTNET_API_URL || (import.meta.env.DEV ? 'http://localhost:8082' : ''),
  rust: import.meta.env.VITE_RUST_API_URL || (import.meta.env.DEV ? 'http://localhost:8081' : ''),
};
const labels: Record<Backend, string> = { go: 'Go', rust: 'Rust', dotnet: '.NET' };
const number = (n: number) => n.toLocaleString('pl-PL', { maximumFractionDigits: 1 });
function App() {
  const [backend, setBackend] = useState<Backend>('go');
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<{ data: Weather; elapsed: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let timedOut = false;
    setResult(null); setError(''); setLoading(true);
    const start = performance.now();
    const timer = window.setTimeout(() => { timedOut = true; controller.abort(); }, 90000);
    getWeather(urls[backend], backend, controller.signal)
      .then(data => { if (active) setResult({ data, elapsed: Math.round(performance.now() - start) }); })
      .catch(reason => { if (active) setError(timedOut ? 'Przekroczono czas oczekiwania. Spróbuj ponownie.' : reason instanceof TypeError ? 'Nie można połączyć się z backendem. Sprawdź połączenie i konfigurację CORS.' : reason.message || 'Nie udało się pobrać pogody.'); })
      .finally(() => { window.clearTimeout(timer); if (active) setLoading(false); });
    return () => { active = false; window.clearTimeout(timer); controller.abort(); };
  }, [backend, refresh]);
  const current = result?.data.current;
  return <main>
    <header><a className="brand" href="/">◌ <span>pogoda<span className="brand-dot">.</span></span></a><span className="location">50.0647° N · 19.9450° E</span></header>
    <section className="intro"><p className="eyebrow">MAŁOPOLSKA, POLSKA</p><h1>Jak dziś w Krakowie?</h1><p>Sprawdź pogodę, zanim wyjdziesz.</p></section>
    <section className="weather-card" aria-label="Pogoda w Krakowie" aria-busy={loading}>
      <div className="card-top"><div><span className="eyebrow">AKTUALNE WARUNKI</span><h2>Kraków</h2></div><span className={'status ' + (error ? 'offline' : '')}><i/>{loading ? 'Pobieranie' : error ? 'Brak połączenia' : 'Dane pobrane'}</span></div>
      <div className="weather-main">
        <div className="temperature">{current ? number(current.temperature_2m) : '—'}<span>°C</span></div>
        <svg className="weather-art" viewBox="0 0 180 130" aria-hidden="true"><circle cx="112" cy="46" r="29" fill="#f4c66e"/><g stroke="#f4c66e" strokeWidth="3" strokeLinecap="round"><path d="M112 4v-3M112 88v6M70 46h-6M154 46h7M82 16l-5-5M143 76l5 5M143 16l5-5"/></g><path d="M41 109a24 24 0 1 1 7-47 34 34 0 0 1 65-8 27 27 0 1 1 16 55Z" fill="#dcecf1"/><path d="M41 109h88" stroke="#b9d7e2" strokeWidth="3" strokeLinecap="round"/></svg>
      </div>
      <div className="metrics"><div><span>Odczuwalna</span><strong>{current?.apparent_temperature != null ? number(current.apparent_temperature) + ' °C' : current ? 'Brak danych' : '—'}</strong></div><div><span>Wilgotność</span><strong>{current ? number(current.relative_humidity_2m) + ' %' : '—'}</strong></div><div><span>Wiatr</span><strong>{current ? number(current.wind_speed_10m) + ' km/h' : '—'}</strong></div></div>
      <div className="card-bottom"><span>{current ? 'Czas danych: ' + formatObservationTime(current.time) + ' · Warszawa' : 'Oczekiwanie na dane pogodowe'}</span><button className="refresh" disabled={loading} onClick={() => setRefresh(n => n + 1)}>{loading ? 'Pobieranie…' : '↻ Odśwież'}</button></div>
      {error && <div className="error" role="alert">{error}</div>}
    </section>
    <section className="backend-panel" aria-label="Wybór backendu"><div><h3>Jeden widok. Trzy backendy.</h3><p>Wybierz serwis, który pobierze pogodę.</p></div><div className="switch" role="group" aria-label="Backend">{(['go', 'rust', 'dotnet'] as const).map(value => <button key={value} aria-pressed={backend === value} onClick={() => setBackend(value)}>{labels[value]}</button>)}</div></section>
    <div className="request-info" aria-live="polite"><span>Wybrany backend: <b>{labels[backend]}</b></span><span>{result ? 'Czas żądania: ' + result.elapsed + ' ms' : loading ? 'Łączenie… Wybudzenie serwera może potrwać około minuty.' : 'Brak danych'}</span></div>
    <footer><a href="https://danepubliczne.imgw.pl/" target="_blank" rel="noreferrer">Dane: IMGW-PIB ↗</a><span>Pomiary stacji Kraków · strefa Europe/Warsaw</span></footer><p className="source-note">Źródłem pochodzenia danych jest Instytut Meteorologii i Gospodarki Wodnej – Państwowy Instytut Badawczy. Dane Instytutu Meteorologii i Gospodarki Wodnej – Państwowego Instytutu Badawczego zostały przetworzone (jednostka prędkości wiatru i format czasu).</p>
  </main>;
}
createRoot(document.getElementById('root')!).render(<App />);
