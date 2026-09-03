# Bokningstjänsten

Bokningstjänst i pensionatets microservice-uppdelning, flyttad hit från Backend 1. Äger rum och
bokningar och serverar React-frontenden. Kunder ägs av kundtjänsten, notifieringar av
notifieringstjänsten. Ingen tjänst läser i någon annans databas, allt går via REST.

## Tjänsterna

| Tjänst | Repo | Port | Ansvar |
|---|---|---|---|
| Bokningstjänsten | det här | 8081 | Rum, bokningar, frontend |
| Kundtjänsten | `backend2_customer-service` | 8080 | Kunder, inloggning, JWT |
| Notifieringstjänsten | `backend2_notification-service` | 8082 | Loggar bokningsbekräftelser |

Så pratar de med varandra:

- **Bokning skapas.** Bokningstjänsten frågar `GET /api/customers/{id}` hos kundtjänsten. 404
  ger 404 tillbaka och ingen bokning. Timeout eller annat fel ger 503 med "Vi kunde inte hantera
  din bokning just nu, försök igen senare", och inte heller då sparas något. Efter sparad
  bokning postas en bekräftelse till notifieringstjänsten. Misslyckas den loggas en varning,
  bokningen står kvar.
- **Kund raderas.** Kundtjänsten frågar `GET /api/bookings/count?customerId=&status=ACTIVE`
  här. Fler än noll ger 409 hos kundtjänsten.
- **Bokningslistan.** Namnen hämtas i en batch, `GET /api/customers?ids=1,2,3`. Är kundtjänsten
  nere visas `Kund #id` i stället.
- **Kundsidorna i frontenden** går via `/api/customers/**` här, som skickar anropet vidare till
  kundtjänsten med samma status och kropp tillbaka. Webbläsaren pratar bara med en origin.
- **JWT.** Kundtjänsten utfärdar tokens via `POST /api/auth/login`. Alla skrivande anrop hit
  (POST, PUT, DELETE under `/api`) kräver `Authorization: Bearer <token>`. Inkommande token
  skickas med på alla utgående anrop. Läsningar är öppna.

## Kom igång

Kräver Docker. Klona de tre repona bredvid varandra, compose bygger syskonen.

```bash
cat > .env <<'ENV'
JWT_SECRET=<openssl rand -base64 32>
ADMIN_PASSWORD=<valfritt lösenord>
ENV

docker compose up
```

Frontend på <http://localhost:8081>, logga in med `admin` och lösenordet ur `.env`. Swagger UI på
<http://localhost:8081/swagger-ui/index.html>, hälsokoll på
<http://localhost:8081/actuator/health/readiness>.

`JWT_SECRET` måste vara identisk i alla tre tjänsterna. Compose sätter samma värde överallt.

Har databasen kvar en `customers`-tabell från Backend 1 tas den bort vid start av
`schema-postgresql.sql`, tillsammans med främmande nyckeln från `bookings`.

### Utveckling utanför Docker

```bash
docker run --rm -p 5433:5432 \
  -e POSTGRES_DB=bookingdb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  postgres:17-alpine
JWT_SECRET=... JAVA_HOME=$(/usr/libexec/java_home -v 21) ./mvnw spring-boot:run   # 8081
cd frontend && npm install && npm run dev                                          # 5173
```

Kundtjänsten förväntas på `localhost:8080` och notifieringstjänsten på `localhost:8082`. Vite
proxar `/api` till backend. `npm run build` skriver bundlen till `src/main/resources/static`, som
är gitignorerad och byggs om i Docker.

### Tester

```bash
JAVA_HOME=$(/usr/libexec/java_home -v 21) ./mvnw test
```

26 tester mot H2, ingen Docker behövs. `BookingControllerIntegrationTest` går genom
säkerhetsfilter, controller, service, repository och databas med riktiga HTTP-anrop.
Kundtjänsten och notifieringstjänsten ersätts med `@MockitoBean` på klientgränssnittet.
Bland annat: 201 vid skapad bokning, 409 vid dubbelbokning, 404 vid okänd kund, 503 när
kundtjänsten är nere, 401 utan token, 400 vid ogiltig inmatning.

## API

| Metod | Path | Svar |
|---|---|---|
| GET | `/api/bookings` | 200 |
| GET | `/api/bookings/{id}` | 200 · 404 |
| GET | `/api/bookings/count?customerId=&status=ACTIVE` | 200 `{count}` · 400 |
| POST | `/api/bookings` | 201 + `Location` · 400 · 401 · 404 · 409 · 503 |
| PUT | `/api/bookings/{id}` | 200 · 400 · 401 · 404 · 409 · 503 |
| DELETE | `/api/bookings/{id}` | 204 · 401 · 404 |
| GET | `/api/rooms`, `/api/rooms/{id}`, `/api/rooms/types`, `/api/rooms/available` | 200 · 400 · 404 |
| POST | `/api/rooms` | 201 + `Location` · 400 · 401 |
| PUT | `/api/rooms/{id}` | 200 · 400 · 401 · 404 |
| DELETE | `/api/rooms/{id}` | 204 · 401 · 404 · 409 |
| GET | `/api/stats` | 200 |
| * | `/api/customers/**`, `/api/auth/login` | vidarebefordras till kundtjänsten, 503 om den är nere |

`count` är alltid 200 för ett giltigt id, även för en okänd kund, då är `count` noll. Aktiv
betyder `checkOut >= idag` i `Europe/Stockholm`.

Fel returneras som `application/problem+json`:

```json
{
  "type": "/problems/room-already-booked",
  "title": "Rummet är upptaget",
  "status": 409,
  "detail": "Rummet är redan bokat för de valda datumen",
  "instance": "/api/bookings",
  "errorCode": "ROOM_ALREADY_BOOKED"
}
```

| `errorCode` | Status |
|---|---|
| `VALIDATION_FAILED` (med `errors[]` per fält), `INVALID_REQUEST` | 400 |
| `UNAUTHORIZED` | 401 |
| `BOOKING_NOT_FOUND`, `ROOM_NOT_FOUND`, `CUSTOMER_NOT_FOUND` | 404 |
| `ROOM_ALREADY_BOOKED`, `ROOM_HAS_BOOKINGS` | 409 |
| `CUSTOMER_SERVICE_UNAVAILABLE` (med `Retry-After: 5`) | 503 |

## Miljövariabler

| Variabel | Standard | Beskrivning |
|---|---|---|
| `PORT` | `8081` | Lyssnarport |
| `PGHOST`, `PGPORT`, `PGDATABASE` | `localhost`, `5433`, `bookingdb` | Postgres, sätts av Render från databasen |
| `SPRING_DATASOURCE_URL` | byggd av `PG*` | Fullständig JDBC-URL, går före `PG*` |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | |
| `SPRING_DATASOURCE_PASSWORD` | `postgres` | |
| `JWT_SECRET` | — | 32 byte Base64, samma som kundtjänsten |
| `CUSTOMER_SERVICE_URL` | `http://localhost:8080` | |
| `NOTIFICATION_SERVICE_URL` | `http://localhost:8082` | |

## Kubernetes

```bash
./k8s/create-secret.sh   # läser JWT_SECRET och ADMIN_PASSWORD ur .env
docker compose build     # taggar booking-service, customer-service och notification-service :latest
kubectl apply -f k8s/
```

`k8s/` startar hela systemet, alla tre tjänster med varsin Postgres. Tjänsterna hittar varandra
på sina Service-namn, samma namn som i compose. Tjänsterna är ClusterIP, så
`kubectl port-forward svc/booking-service 8081:8081` för att nå frontenden. Riv ner med
`kubectl delete -f k8s/`.

Samma manifest för kund- och notifieringstjänsten ligger i kundtjänstens repo. Ändras de där ska
kopiorna här uppdateras.

## Render

`render.yaml` är en Blueprint som skapar databasen `booking-db` och webbtjänsten
`pensionat-booking-service` i Frankfurt på gratisplanen. `JWT_SECRET`, `CUSTOMER_SERVICE_URL` och
`NOTIFICATION_SERVICE_URL` fylls i för hand när Blueprinten appliceras.

Gratisplanens webbtjänst somnar efter 15 minuter utan trafik och första anropet därefter tar
ungefär en minut. Gratisdatabasen raderas efter 30 dagar om den inte uppgraderas. Deploya sist,
när allt fungerar lokalt.

## Känd begränsning

En kund kan raderas mellan att bokningstjänsten kontrollerat att kunden finns och att bokningen
sparas, och en bokning kan skapas mellan kundtjänstens count-fråga och raderingen. Ingen
läsbaserad kontroll stänger det fönstret, det skulle kräva lås eller en samordnande tjänst.
Kundtjänsten raderar mjukt, så en sådan bokning kan ändå visa kundens namn, märkt "(raderad)".
