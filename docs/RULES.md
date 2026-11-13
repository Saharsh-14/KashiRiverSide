# Project Rules

These rules apply to all future work on the Kashi Riverside Stay project.

## 1. Scope Rules

- Build the customer-facing hotel website first.
- Keep the admin dashboard deferred until the public website is complete and verified.
- Do not add features outside the agreed scope without recording and reviewing the change.
- Preserve the hotel’s identity as Kashi Riverside Stay in Sonarpura, Varanasi.

## 2. Hotel Information Rules

- There are 8 rooms in total: 7 AC rooms and 1 non-AC room.
- AC room price is ₹2,000 per night unless updated by the admin.
- Non-AC room price is ₹1,500 per night unless updated by the admin.
- Extra mattress charge is ₹500.
- Check-in is at 1:00 PM.
- Check-out is at 11:00 AM.
- The required advance is 30%.
- Prices must be treated as admin-controlled and seasonally changeable.
- Prices captured in an existing booking must not change when future prices are updated.

## 3. Booking Rules

- The booking form must include check-in date, check-out date, room type, number of guests, extra mattress preference, guest name, phone number, optional email, and optional special request.
- The booking form must not include a number-of-rooms field.
- The guest completes the booking form before paying the advance.
- The system must calculate the total and 30% advance before payment submission.
- QR/UPI payment is manually verified by the admin.
- Payment submission alone must never confirm a booking.
- A booking becomes confirmed only after admin verification.
- The remaining 70% is paid at the hotel for the pay-at-hotel option.
- The booking system must prevent confirmed bookings from exceeding room availability.
- The system must prevent duplicate submissions where reasonably possible.
- A booking reference ID must be generated for every valid booking request.

## 4. Booking Status Rules

Use clear, consistent status values:

- `payment_pending`
- `payment_submitted_pending_verification`
- `confirmed`
- `rejected`
- `cancelled`
- `refund_processing`
- `refunded`

Payment statuses must remain separate from booking statuses:

- `pending`
- `submitted`
- `verified`
- `rejected`
- `refund_pending`
- `refunded`

Never show a successful or confirmed state to the guest unless the underlying status supports it.

## 5. Payment Rules

- Use the hotel’s supplied QR code and UPI instructions for the initial payment flow.
- Do not claim that a payment was automatically verified.
- Do not store UPI PINs, passwords, card details, or banking credentials.
- Store only the payment reference, amount, date, status, and optional screenshot reference.
- Payment screenshots must not be publicly accessible.
- Display the required advance and remaining balance clearly.
- Handle rejected bookings and refunds according to the approved policy.

## 6. Cancellation and Refund Rules

The initial policy is:

- Cancellation 7 or more days before check-in: full advance refund.
- Cancellation 3–6 days before check-in: 50% of the advance refunded.
- Cancellation less than 3 days before check-in: advance non-refundable.
- No-show: advance non-refundable.
- Hotel cancellation of a confirmed booking: full advance refund.
- Date changes depend on availability.
- Only one date-change request is allowed.
- Refunds return to the original payment method where possible.
- Refund processing may take 5–7 working days.
- Applicable payment gateway charges may be deducted where relevant.

Do not change this policy silently. Any change must be reflected in the PRD, memory, customer-facing policy content, and implementation tasks.

## 7. Content Rules

- Use clear, welcoming, and concise language.
- Do not invent hotel amenities, facilities, services, photographs, locations, contact details, or prices.
- Only advertise amenities confirmed by the owner.
- Describe additional services as available on request.
- Do not show fixed prices for additional services unless supplied by the owner.
- Keep seasonal pricing explanations in the single Policies area, not on the Rooms page.
- Keep contact details as pending until the owner supplies them.
- Long-stay guests must have a visible WhatsApp contact option.

## 8. Design Rules

- The visual identity is rich and cultural with modern comfort.
- Use the approved palette:
  - Brown `#74342B`
  - Cream `#EDDBC2`
  - Deep brown `#391212`
  - Baby blue `#8FA4D1`
- Cream is the primary light background.
- Deep brown is the footer background.
- Use baby blue sparingly.
- Use Cormorant Garamond for major display headings and the hotel name.
- Use Manrope for body text, navigation, forms, labels, buttons, and prices.
- Keep typography creative but uniform.
- Do not introduce unrelated fonts without approval.
- Use the supplied KRS logo as the official brand logo and favicon identity.
- Do not distort, stretch, or recolor the logo without approval.
- Use slightly rounded rectangular buttons.
- Use visible card borders, soft shadows, and rounded image corners.
- Use subtle cultural motifs only in key areas.
- Do not overcrowd the interface with decoration.

## 9. Motion and Interaction Rules

- Use subtle, polished animations rather than distracting effects.
- Use slow automatic movement for the revolving amenities strip.
- Support reduced-motion preferences.
- Disable cursor-specific effects on touch devices.
- Do not let cursor effects, glows, or animations interfere with forms or booking actions.
- Keep buttons visibly interactive with hover and focus states.
- Preserve keyboard accessibility.

## 10. Layout Rules

- Desktop header: logo left, navigation centered, Book a Room button right.
- Mobile header: logo with hamburger navigation.
- Hero: background video, subtle warm-brown overlay, centered “Culture in Every Stay” tagline, and Book a Room button.
- Do not add a hero subtitle unless explicitly approved.
- Use two large side-by-side room cards on desktop and stack them on mobile.
- Use elegant horizontal cards for additional services.
- Use a horizontal image carousel for the Gallery.
- Keep a floating Book a Room button available throughout the website.
- Keep floating WhatsApp and booking controls from covering important content.
- Use the footer for compact contact details, a small map, navigation, and one Policies link.

## 11. Accessibility Rules

- Maintain sufficient color contrast.
- Provide meaningful labels for buttons and icons.
- Provide alt text for meaningful images.
- Provide visible keyboard focus indicators.
- Do not use color alone to communicate status.
- Keep payment and booking instructions readable.
- Respect reduced-motion settings.
- Ensure forms have clear labels and useful error messages.

## 12. Security and Privacy Rules

- Validate all important input on the server as well as the client.
- Protect admin routes with authentication and authorization.
- Never expose private guest data in public URLs or public API responses.
- Restrict access to payment screenshots and internal booking information.
- Use environment variables for secrets and credentials.
- Never commit secrets, UPI credentials, API keys, or private tokens to the repository.
- Keep an audit trail for payment verification, approval, rejection, cancellation, and refund actions.
- Use safe file-type and size validation for uploads.

## 13. Technical Rules

- Use Next.js, React, and TypeScript for the application.
- Use Tailwind CSS for styling unless a justified exception is documented.
- Use PostgreSQL through Supabase for persistent data.
- Use Supabase Auth for future admin authentication.
- Use Supabase Storage for controlled media and upload storage.
- Use Vercel as the planned hosting platform.
- Keep components reusable and focused.
- Keep business rules out of purely presentational components.
- Centralize room prices, advance percentage, and configurable hotel settings.
- Preserve price snapshots in booking records.
- Keep booking, payment, and notification concerns separated.

## 14. Change Management Rules

- Review `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, and `MEMORY.md` before making major changes.
- Update `TASKS.md` when work starts, finishes, or becomes blocked.
- Update `MEMORY.md` when an important project decision changes.
- Update `PRD.md` when a product requirement changes.
- Update `ARCHITECTURE.md` when system structure, technology, or data flow changes.
- Update `DESIGN.md` when approved visual or interaction decisions change.
- Do not silently override an owner decision.
- Mark uncertain information as pending instead of inventing it.

## 15. Verification Rules

Before considering a feature complete:

- Test it on mobile and desktop.
- Test the normal flow and likely error states.
- Verify all links and buttons.
- Verify booking amount and advance calculations.
- Verify status transitions.
- Verify privacy and access controls for guest/payment data.
- Check visual consistency with the approved design system.
- Check accessibility basics.
- Update the related task in `TASKS.md`.
