# Booking setup

## Email notifications (in progress)

- Gmail SMTP credentials are configured locally and authentication was verified
  without sending a message. Guest email remains optional.
- Booking-status changes queue hotel and guest emails in a database outbox. The
  application can retry pending or failed messages from the admin dashboard.
- The outbox migration was tested in the isolated project and applied to the
  hotel database. Email delivery remains disabled until the production server
  is configured and verified. Keep Gmail credentials in server-only variables.
- Vercel production variables are configured, with both booking and email flags
  set to false. A protected staged production build passed, and its room-rates
  endpoint and disabled-booking response were verified. It has not been promoted.
- The hotel admin signed in to the staged deployment and confirmed receipt of
  the authenticated test email sent from Vercel. The owner plans to purchase a
  domain through GoDaddy; the custom domain is not connected yet.
- A message left in `sending` after an interrupted delivery requires manual
  investigation; retrying it automatically could send a duplicate. Gmail
  acceptance is not proof that the message reached the recipient's inbox.
- Set `HOTEL_TEST_SUPABASE_URL` to the dedicated test project's URL when running
  `scripts/test-booking-flow.mjs`; never point destructive integration tests at
  a database containing real bookings or availability overrides.
- A separate test project was created in Mumbai on 2026-11-18. Its schema and
  notification queue passed transactional SQL checks. The HTTP booking, payment,
  recovery, and admin integration suite also passed against that test project,
  with email sending disabled. A separate approved test queued one hotel email;
  Gmail accepted it and the owner confirmed it arrived in the hotel inbox.

## Payment screenshot verification — 2026-11-14

- Optional PNG/JPEG evidence (maximum 3 MB) is accepted with the payment reference.
- Evidence is stored in the private payment-evidence bucket; authenticated admins
  receive a signed viewing link valid for 60 seconds.
- Guest access is authorized through the booking cookie before uploads.
- Admin password setup and live sign-in were verified in the previous step.
- Production build passed. HTTP integration tests passed for pricing, invalid
  dates, private guest status, admin login, invalid file rejection, private
  screenshot access, duplicate payment submission, approval, capacity conflict
  and rejection. Test records, evidence and temporary admin were removed.
- A same-origin validation issue found by testing was fixed by comparing the
  Origin host with the incoming HTTP Host rather than Next's internal URL.
- Tests used BOOKINGS_ENABLED=true only in the test server process. The saved
  environment flag remains false. Browser/mobile QA is complete. Booking
  idempotency, durable request throttling and cross-device guest recovery are
  verified; notification delivery remains pending.
- Failed/uncertain payment commits preserve uploaded evidence to avoid deleting
  a file that may already be referenced; periodic orphan cleanup remains pending.

## Latest implementation

- Booking form posts to a server route; server validates inputs, reads current
  room prices, checks availability and calculates prices in integer paise.
- A private HttpOnly cookie grants status access for the latest booking in that
  browser. The database stores only its SHA-256 hash.
- Payment reference submission updates the booking and payment atomically.
- `/admin` authenticates against Supabase Auth and checks hotel_admins on every
  protected operation. Approval verifies payment and checks capacity under a lock.
- Admin account kashiriverside@gmail.com is allowlisted, but needs private password setup.
- Payment and approval SQL smoke tests passed inside rolled-back transactions.
- BOOKING_ENABLED / BOOKINGS_ENABLED: the actual flag is BOOKINGS_ENABLED and
  remains false until end-to-end testing and admin password setup are complete.
- Remaining: automated guest notifications.
- A successful QR reference submission is not proof of funds received.

The earlier setup notes below describe the state before these server routes were added.

The initial database schema is prepared in
`supabase/migrations/001_booking_foundation.sql` and was applied to the hotel project as `booking_foundation`.
It includes rooms, bookings, payments and audit events with row-level security.
It also includes an initially empty hotel_admins allowlist. All five tables
deny direct anonymous/authenticated access; server-side authorization is required.
Room rates/inventory are seeded. No guests, payments or admin accounts were created.
Database constraints enforce the daily mattress total and 30% advance.
The live Node.js REST connection was verified; the earlier PowerShell 401 was
caused by request detection rather than an incorrect secret key.
Full admin implementation is now authorized by the owner. The earlier deferral
in RULES.md and other planning documents is superseded by this decision.

Guest contact fields, special requests, policy agreement and a review step have
been added. No booking data is submitted or stored yet.

Missing: Supabase project connection. Configure SUPABASE_URL and
SUPABASE_SERVICE_ROLE_KEY locally, never in chat or Git. Keep BOOKING_ENABLED
false until server validation, availability checks, private payment uploads,
admin verification and end-to-end tests are complete.

The QR asset is saved, but payment collection must wait until requests can be
persisted reliably. The owner must still specify child age limits and refunds
for hotel-rejected requests.
