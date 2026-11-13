# Project Memory

## Project Identity

- Project: Kashi Riverside Stay website
- Hotel location: Sonarpura, Varanasi
- Primary purpose: customer-facing hotel presentation and room booking
- Initial scope: public guest website
- Admin dashboard: planned later, but the architecture must support it

## Hotel Inventory

- Total rooms: 8
- AC rooms: 7
- Non-AC rooms: 1
- AC room price: ₹2,000 per night
- Non-AC room price: ₹1,500 per night
- Prices are admin-controlled and may change by season.
- Current standard occupancy: 2 adults and 2 children per room
- A 3-adult option is available with one extra mattress.
- Extra mattress charge: ₹500
- Check-in: 1:00 PM
- Check-out: 11:00 AM
- Required advance: 30%

## Included Amenities

- Air conditioning
- Fan
- Hot and cold water
- Toiletries
- Mirror
- Television
- Wi-Fi
- Room service
- 24-hour reception
- Housekeeping
- CCTV security
- Power backup

## Additional Services

These services are available on request and may involve additional charges:

- Parking
- Extra bedding
- Boat ride arrangements
- Ticket booking assistance
- Car rental assistance
- Scooty rental assistance
- Local shopping assistance, including saree shopping

## Booking Rules

- Guests can select check-in and check-out dates, room type, number of guests, and extra mattress preference.
- The booking form does not include a number-of-rooms field.
- Guests complete the booking form before paying the advance.
- The website calculates the total and 30% advance.
- Guests pay the advance using the hotel’s QR code/UPI instructions.
- Guests submit the UPI transaction/reference number and may submit a screenshot.
- Payment is manually verified by the admin.
- Payment alone does not confirm the booking.
- Admin verification is required before final confirmation.
- The remaining 70% is paid at the hotel for the pay-at-hotel option.

### Booking status flow

`Payment Pending → Payment Submitted – Pending Admin Verification → Confirmed`

Possible outcomes:

- Rejected
- Cancelled
- Refund Processing
- Refunded

## Long-Stay Enquiries

- Long-stay guests should be able to contact the hotel through WhatsApp.
- Special long-stay rates and availability are handled through direct enquiry.

## Website Structure

- Home
- Rooms
- Booking
- Services
- Gallery
- Location and Contact information in the footer
- Booking status and confirmation
- One Policies link in the footer containing all policy information

### Home page decisions

- Full-width video hero
- Header over the hero video
- Centered tagline: **Culture in Every Stay**
- No supporting subtitle in the hero
- Revolving amenities strip near the top
- Services section after the amenities strip
- Room preview
- Why-stay-with-us section
- Gallery preview
- Persistent floating Book a Room button

## Design Decisions

### Brand feeling

Rich and cultural Varanasi character combined with modern comfort.

### Color palette

- Brown: `#74342B`
- Cream: `#EDDBC2`
- Deep brown: `#391212`
- Baby blue accent: `#8FA4D1`

Cream is the main background. Brown is used for feature areas and cards. Deep brown is used for contrast and the footer. Baby blue is used sparingly.

### Typography

- Cormorant Garamond for the hotel name and major headings
- Manrope for body text, navigation, forms, labels, buttons, and prices
- Typography must remain creative but uniform.

### Logo

- The supplied KRS logo is the official logo.
- It is also used for the favicon.
- A compact emblem version may be used for favicon legibility.

### Header

- Desktop: logo left, navigation centered, Book a Room button right
- Mobile: logo with hamburger navigation

### Hero

- Background video
- Very subtle warm-brown overlay
- Centered “Culture in Every Stay” text
- Book a Room button

### Components and interaction

- Slightly rounded rectangular buttons
- Visible card borders and soft shadows
- Rounded room and gallery images
- Elegant horizontal service cards
- Two large side-by-side room cards on desktop
- Horizontal image carousel for the gallery
- Slow automatic revolving amenities strip
- Smooth scrolling and subtle reveal animations
- Button hover lift/glow effects
- Subtle cursor effect on desktop only
- Cultural decorative elements only in key areas
- Deep-brown footer with cream text and a compact map section

## Technology Decisions

- Frontend: Next.js, React, TypeScript
- Styling: Tailwind CSS
- Backend: Next.js server-side routes/API handlers
- Database: PostgreSQL through Supabase
- Admin authentication: Supabase Auth
- File storage: Supabase Storage
- Hosting: Vercel
- Initial payment method: hotel QR code/UPI with manual verification

## Important Constraints

- Do not build the admin dashboard until the public website planning and implementation are ready.
- Do not treat QR payment submission as automatically verified.
- Do not mark a booking confirmed before admin verification.
- Do not expose private guest information publicly.
- Do not show fixed prices for additional arranged services unless supplied later.
- Seasonal/admin pricing explanations belong in the single Policies area, not the Rooms page.
- Keep the public website mobile-friendly.
- Respect reduced-motion preferences.
- Do not use excessive cultural decoration or too many unrelated fonts.

## Pending Information

- Complete phone number
- WhatsApp number
- Email address, if used
- Exact map link/location pin
- Nearby landmark
- Final hotel photography
- Final hero video asset
- Final policy wording and legal review
- Final payment QR code and UPI instructions
- Final button/icon assets

## Current Documentation

- `PRD.md` — product requirements
- `ARCHITECTURE.md` — system and technical architecture
- `DESIGN.md` — visual and interaction design system
- `MEMORY.md` — persistent project context

## Future Documentation

- `TASKS.md` — implementation tasks and progress
- `RULES.md` — permanent project and development rules
