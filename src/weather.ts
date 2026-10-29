export type Backend = 'go' | 'rust';
export type Weather = {
  backend: Backend; city: string; timezone: string;
  current: { time: string; temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number; wind_speed_10m: number };
};
export function parseWeather(value: unknown, backend: Backend): Weather {
  const data = value as Partial<Weather> | null;
  const current = data?.current;
  if (!data || data.backend !== backend || data.city !== 'Kraków' || data.timezone !== 'Europe/Warsaw'
    || !current || typeof current.time !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(current.time)
    || ![current.temperature_2m, current.apparent_temperature, current.relative_humidity_2m, current.wind_speed_10m].every(v => typeof v === 'number' && Number.isFinite(v))) {
    throw new Error('Backend zwrócił nieprawidłowe dane pogodowe.');
  }
  return data as Weather;
}
export async function getWeather(base: string, backend: Backend, signal: AbortSignal): Promise<Weather> {
  if (!base) throw new Error('Ten backend nie jest jeszcze podłączony. Skonfiguruj jego adres przy wdrożeniu.');
  const response = await fetch(base.replace(/\/$/, '') + '/api/weather', { signal, cache: 'no-store' });
  if (!response.ok) throw new Error('Serwis pogodowy jest niedostępny (HTTP ' + response.status + '). Spróbuj ponownie.');
  return parseWeather(await response.json(), backend);
}
