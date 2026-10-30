# FastAPI-WEB

React + TypeScript + Vite. Pogoda w Krakowie i przełącznik pomiędzy niezależnymi backendami Go, Rust i .NET.
Zmiana backendu anuluje poprzednie żądanie i czyści poprzednie wyniki. Timeout: 90 s (uwzględnia wybudzanie darmowego serwera Render).
Wyświetlany czas dotyczy całego żądania HTTP, nie jest benchmarkiem języka.
Ikona pogody jest dekoracyjna; aplikacja nie pobiera opisu zachmurzenia.

## Lokalnie

Wymagania: Node.js 22+, npm. Uruchom backendy w trybie `--serve`.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Adres: http://localhost:5173. Backend Go: http://localhost:8080. Rust: http://localhost:8081. .NET: http://localhost:8082.

```sh
npm test
npm run build
```

## Vercel

Importuj to repozytorium jako projekt Vite. Root Directory: katalog główny.
Build Command: `npm run build`. Output Directory: `dist`.
Ustaw publiczne adresy HTTPS backendów:
- `VITE_GO_API_URL` — URL serwera Go, bez `/api/weather`.
- `VITE_DOTNET_API_URL` — URL serwera .NET, bez `/api/weather`.
- `VITE_RUST_API_URL` — URL serwera Rust, bez `/api/weather`.

Zmienne są wbudowywane w frontend; po zmianie wykonaj redeploy. Nie umieszczaj w nich sekretów.
Na backendach ustaw `ALLOWED_ORIGINS` na dokładny origin Vercel, bez końcowego ukośnika.
Bez adresu backendu produkcyjny frontend pokazuje brak konfiguracji; nigdy nie udaje prawdziwej pogody.
Backendy wymagają osobnego hostingu HTTP (Dockerfile w każdym repozytorium).
Źródło danych: [IMGW-PIB](https://danepubliczne.imgw.pl/apiinfo), stacja Kraków (12566), bez klucza API. Backend przelicza wiatr z m/s na km/h, frontend wyświetla czas pomiaru UTC w strefie Europe/Warsaw. Temperatura odczuwalna jest niedostępna (`null`). Cache backendów: 10 minut.

## Kontrakt

```json
{"backend":"go","city":"Kraków","timezone":"Europe/Warsaw","current":{"time":"2026-10-29T14:00:00Z","temperature_2m":10.5,"apparent_temperature":null,"relative_humidity_2m":75,"wind_speed_10m":8}}
```

To przykładowe dane. Rust zwraca identyczną strukturę z `"backend":"rust"`, a .NET z `"backend":"dotnet"`.

## Wdrożenie backendów na Render

Plik `render.yaml` w tym repozytorium opisuje dwa niezależne serwisy Docker:
Go i Rust, plan Free, region Frankfurt, health check `/health`.
Połącz Render z GitHubem i nadaj mu dostęp do obu prywatnych repozytoriów backendów.
Utwórz Blueprint z tego repozytorium. Przed zatwierdzeniem sprawdź plan Free dla obu usług.

Po udanym wdrożeniu odczytaj rzeczywiste publiczne adresy usług w Render.
Ustaw je na Vercelu jako `VITE_GO_API_URL` i `VITE_RUST_API_URL`, a następnie wykonaj redeploy.
Sprawdź oba endpointy `/api/weather` i przełącznik we frontendzie.
Darmowe godziny są współdzielone; nie konfiguruj sztucznego podtrzymywania aktywności.
Backend .NET znajduje się w `Kom4It/FastApi.NET` i jest wdrażany osobno z Dockerfile. Istniejący `render.yaml` opisuje tylko Go i Rust; nie twórz ponownie istniejących usług.
