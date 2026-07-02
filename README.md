# StudyHub ERP — Frontend

A premium, multi-tenant SaaS frontend for **StudyHub** — built for reading libraries, UPSC/SSC/NEET/JEE study spaces, and student co-working rooms across India. Not a books-management system: this is built around seats, study hours, fees, and student progress.

Built with **React 19 + Vite + Tailwind CSS v4 + Framer Motion + Recharts + React Router**, wired directly to the Spring Boot backend in `LMS_Final.zip`.

---

## 1. Before you start

This frontend expects your Spring Boot backend running at:

```
https://lms-backend-ztjf.onrender.com
```

The backend's CORS config (`CorsConfig.java`) only allows requests from `http://localhost:5173` — which is Vite's default dev port. **Don't change the frontend port** unless you also update the backend's CORS config.

### Start the backend first

```bash
cd LMS               # wherever you extracted LMS_Final.zip
# import into IntelliJ / your IDE, or run:
mvn spring-boot:run
```

Make sure your MySQL database (`LMS` schema, per `application.properties`) is running and reachable.

---

## 2. Run the frontend

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. That's it.

To build for production:

```bash
npm run build      # outputs to /dist
npm run preview    # preview the production build locally
```

---

## 3. How login & roles work

The backend's `/api/auth/login` and `/api/auth/signup` endpoints return only `{ jwt, message }` — no role field. This frontend **decodes the JWT** client-side (`jwt-decode`) to read the `role` claim (`ROLE_STUDENT`, `ROLE_LIBRARY_ADMIN`, `ROLE_SUPERADMIN`) and routes the user to the matching dashboard automatically after login.

| Role | Dashboard route | How the account is created |
|---|---|---|
| Super Admin | `/superadmin` | Created directly in the database, or via `/api/auth/signup` with `role: "ROLE_SUPERADMIN"` |
| Library Admin | `/admin` | Auto-created when a library registers via the public "Register your library" page, or by a Super Admin adding a library |
| Student | `/student` | Created by a Library Admin from **Students → Add student** — students don't self-register |

---

## 4. Project structure

```
src/
  api/            # one file per backend controller — axios calls matching every endpoint exactly
  components/
    ui/           # Button, Card, Input, Modal, Table, Badge, StatCard, etc.
    layout/       # Sidebar, Topbar, DashboardLayout, role-based nav config
    landing/      # Navbar, Footer, Hero, Features, Pricing, Testimonials
    charts/       # themed Recharts wrappers
    seat/         # seat map card component
  context/        # AuthContext (JWT decode + session), ThemeContext (dark/light)
  pages/
    auth/         # Login, Register Library, Forgot/Reset Password, OTP, 2FA
    landing/      # public marketing site (Home, Features, Pricing, About, etc.)
    superadmin/   # Super Admin dashboard pages
    libraryadmin/ # Library Admin dashboard pages
    student/      # Student dashboard pages
  routes/         # ProtectedRoute (auth + role guard)
  utils/          # formatting helpers (currency, dates, study-hours)
```

---

## 5. What's fully wired to your backend

These pages call real endpoints from `LMS_Final.zip` and will show live data once the backend + database are running:

- **Auth** — login, library self-registration (`/api/public/create`)
- **Super Admin** — libraries (CRUD, status changes), subscription plans (CRUD)
- **Library Admin** — students (CRUD), seats (create, allocate, deallocate, maintenance), plans (CRUD), fees (update/list), QR generation, attendance (by date)
- **Student** — punch in/out (manual + QR), monthly attendance history

## 6. What's UI-only (no backend endpoint yet)

A few screens are fully designed but run on sample/placeholder data because the corresponding backend endpoint doesn't exist yet in `LMS_Final.zip`. Each is clearly marked with an in-app note:

| Page | Why | What to add on the backend |
|---|---|---|
| Forgot Password / OTP / Reset Password / 2FA | No password-reset or OTP endpoints exist | `/api/auth/forgot-password`, `/api/auth/verify-otp`, `/api/auth/reset-password` |
| Student → Fee Status | Fee endpoints are Library-Admin-scoped only | A student-scoped `/api/student/fee` endpoint |
| Student → My Seat | Seat endpoints are Library-Admin-scoped only | A student-scoped `/api/student/seat` endpoint |
| Student/Library Admin → Leaderboard | No ranking/leaderboard endpoint exists | An aggregation endpoint ranking students by study minutes |
| Super Admin → Billing & Invoices | No dedicated invoices/payments table | A proper invoices/payments endpoint (currently derived from each library's assigned plan) |
| Reports → Revenue/Student/Plan trend charts | No historical reporting endpoint exists | Time-series aggregation endpoints (attendance-by-date already works and is live) |

None of this blocks you from running and demoing the whole app today — it just means those specific numbers are illustrative until you add the endpoints.

---

## 7. Design system

- **Theme**: "desk lamp at night" — deep ink-navy background with warm amber accents, built for long study-session viewing comfort (dark by default, light mode toggle included).
- **Fonts**: Fraunces (display/headings), Inter (body), JetBrains Mono (timers/codes).
- **Tailwind v4**: theme tokens live in `src/index.css` under `@theme` — edit colors, shadows, and radii there.
- All components are hand-built (no UI library lock-in) so you can restyle freely.

---

## 8. Common issues

**"Network Error" / blank dashboards** — your backend isn't running on port 8080, or CORS is blocking the request. Check the backend console and confirm `CorsConfig.java` allows `http://localhost:5173`.

**Login works but I land on a 404 / session-expired page** — the JWT's `role` claim didn't match an expected value. Confirm the account's role in the database is exactly `ROLE_STUDENT`, `ROLE_LIBRARY_ADMIN`, or `ROLE_SUPERADMIN`.

**Port 5173 already in use** — stop whatever else is running on it, or run `npm run dev -- --port 5174` *and* add that origin to the backend's CORS config.
