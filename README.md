# Bokningstjänsten

Bokningstjänst i pensionatets microservice-uppdelning, flyttad hit från Backend 1. Äger rum och
bokningar. Kundtjänsten äger kunder och notifieringstjänsten äger notifieringar.

Läget just nu: koden är monoliten från Backend 1 med egen `customers`-tabell och egna
kundendpoints, ompaketerad för Docker och Railway. Kontraktet som kundtjänsten förväntar sig,
`GET /api/bookings/count?customerId=&status=ACTIVE` med JWT, är inte implementerat än.

## Kom igång

Kräver Docker och en JDK 21.

```bash
docker compose up --build
```

Applikationen på <http://localhost:8081>, Swagger UI på
<http://localhost:8081/swagger-ui/index.html>, hälsokoll på
<http://localhost:8081/actuator/health/readiness>.

### Utveckling

```bash
docker run --rm -p 5433:5432 \
  -e POSTGRES_DB=bookingdb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  postgres:17-alpine
JAVA_HOME=$(/usr/libexec/java_home -v 21) ./mvnw spring-boot:run   # backend på 8081
cd frontend && npm install && npm run dev                          # frontend på 5173
```

Utan `SPRING_DATASOURCE_URL` går tjänsten mot `localhost:5433`. Vite proxar `/api` till backend.
`npm run build` skriver bundlen till `src/main/resources/static`, som är gitignorerad och byggs om
i Docker.

### Tester

```bash
JAVA_HOME=$(/usr/libexec/java_home -v 21) ./mvnw test
```

13 tester mot H2, ingen Docker behövs.

## Konfiguration

| Variabel | Standard | Beskrivning |
|---|---|---|
| `PORT` | `8081` | Lyssnarport, sätts av Railway |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5433/bookingdb` | JDBC-URL till Postgres |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | |
| `SPRING_DATASOURCE_PASSWORD` | `postgres` | |

## Railway

Dockerfile i roten bygger frontend och jar. Lägg till en Postgres-tjänst och sätt på
bokningstjänsten:

```
PORT=8081
SPRING_DATASOURCE_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
SPRING_DATASOURCE_USERNAME=${{Postgres.PGUSER}}
SPRING_DATASOURCE_PASSWORD=${{Postgres.PGPASSWORD}}
```

Healthcheck Path: `/actuator/health/readiness`. Kundtjänstens `BOOKING_SERVICE_URL` pekas på
`http://${{booking-service.RAILWAY_PRIVATE_DOMAIN}}:8081`.

## API

| Metod | Path |
|---|---|
| GET/POST/PUT/DELETE | `/api/rooms`, `/api/rooms/{id}`, `/api/rooms/types`, `/api/rooms/available` |
| GET/POST/PUT/DELETE | `/api/bookings`, `/api/bookings/{id}` |
| GET/POST/PUT/DELETE | `/api/customers`, `/api/customers/{id}` |
| GET | `/api/stats` |

Fullständig spec i Swagger UI.
