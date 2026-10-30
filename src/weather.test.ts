import { describe, it, expect, vi, afterEach } from 'vitest';
import { getWeather, parseWeather, formatObservationTime } from './weather';
const data = { backend: 'go', city: 'Kraków', timezone: 'Europe/Warsaw', current: { time: '2026-10-29T14:15', temperature_2m: 0, apparent_temperature: -2, relative_humidity_2m: 80, wind_speed_10m: 0 } };
afterEach(() => vi.unstubAllGlobals());
describe('weather contract', () => {
  it('accepts zero and negative values', () => expect(parseWeather(data, 'go')).toEqual(data));
  it('rejects a different backend', () => expect(() => parseWeather(data, 'rust')).toThrow());
  it('rejects missing measurements', () => expect(() => parseWeather({ ...data, current: { time: '2026-10-29T14:15' } }, 'go')).toThrow());
  it('uses the selected backend URL', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => data });
    vi.stubGlobal('fetch', fetcher);
    const signal = new AbortController().signal;
    await getWeather('https://go.example/', 'go', signal);
    expect(fetcher).toHaveBeenCalledWith('https://go.example/api/weather', { signal, cache: 'no-store' });
  });
  it('reports HTTP failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 502 }));
    await expect(getWeather('https://rust.example', 'rust', new AbortController().signal)).rejects.toThrow('502');
  });
  it('does not fetch without deployment configuration', async () => {
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    await expect(getWeather('', 'go', new AbortController().signal)).rejects.toThrow('podłączony');
    expect(fetcher).not.toHaveBeenCalled();
  });
});

it('accepts IMGW without apparent temperature', () => {
 const imgw = { ...data, current: { ...data.current, time: '2026-07-01T06:00:00Z', apparent_temperature: null } };
 expect(parseWeather(imgw, 'go')).toEqual(imgw);
});
it('rejects non-finite and missing apparent temperature', () => {
 for (const apparent_temperature of [undefined, NaN, Infinity, '0']) {
  expect(() => parseWeather({ ...data, current: { ...data.current, apparent_temperature } }, 'go')).toThrow();
 }
});

it('converts UTC observations to Warsaw winter and summer time', () => {
 expect(formatObservationTime('2026-01-01T06:00:00Z')).toContain('07:00');
 expect(formatObservationTime('2026-07-01T06:00:00Z')).toContain('08:00');
});

it('accepts the .NET contract and requests the .NET endpoint', async () => {
 const dotnet = { ...data, backend: 'dotnet', current: { ...data.current, apparent_temperature: null } };
 expect(parseWeather(dotnet, 'dotnet')).toEqual(dotnet);
 expect(() => parseWeather(dotnet, 'go')).toThrow();
 const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => dotnet });
 vi.stubGlobal('fetch', fetcher);
 const signal = new AbortController().signal;
 expect(await getWeather('https://dotnet.example/', 'dotnet', signal)).toEqual(dotnet);
 expect(fetcher).toHaveBeenCalledWith('https://dotnet.example/api/weather', { signal, cache: 'no-store' });
});
