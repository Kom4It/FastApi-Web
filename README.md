# FastAPI-WEB

React + TypeScript + Vite. Pogoda w Krakowie i przełącznik pomiędzy niezależnymi backendami Go i Rust.
Zmiana backendu anuluje poprzednie żądanie i czyści poprzednie wyniki. Timeout: 15 s.
Wyświetlany czas dotyczy całego żądania HTTP, nie jest benchmarkiem języka.
Ikona pogody jest dekoracyjna; aplikacja nie pobiera opisu zachmurzenia.

## Lokalnie

Wymagania: Node.js 22+, npm. Uruchom oba backendy w trybie `--serve`.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Adres: http://localhost:5173. Backend Go: http://localhost:8080. Rust: http://localhost:8081.

```sh
npm test
npm run build
```

## Vercel

Importuj to repozytorium jako projekt Vite. Root Directory: katalog główny.
Build Command: `npm run build`. Output Directory: `dist`.
Ustaw publiczne adresy HTTPS backendów:
- `VITE_GO_API_URL` — URL serwera Go, bez `/api/weather`.
- `VITE_RUST_API_URL` — URL serwera Rust, bez `/api/weather`.

Zmienne są wbudowywane w frontend; po zmianie wykonaj redeploy. Nie umieszczaj w nich sekretów.
Na obu backendach ustaw `ALLOWED_ORIGINS` na dokładny origin Vercel, bez końcowego ukośnika.
Bez adresu backendu produkcyjny frontend pokazuje brak konfiguracji; nigdy nie udaje prawdziwej pogody.
Backendy wymagają osobnego hostingu HTTP (Dockerfile w każdym repozytorium).
Źródło danych: [Open-Meteo](https://open-meteo.com/), bezpłatne API do użytku niekomercyjnego.

## Kontrakt

```json
{"backend":"go","city":"Kraków","timezone":"Europe/Warsaw","current":{"time":"2026-10-29T14:15","temperature_2m":10.5,"apparent_temperature":9.2,"relative_humidity_2m":75,"wind_speed_10m":8}}
```

To przykładowe dane. Rust zwraca identyczną strukturę z `"backend":"rust"`.
