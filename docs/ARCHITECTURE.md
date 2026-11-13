# System Architecture

## 1. Project

**Kashi Riverside Stay**  
Location: Sonarpura, Varanasi

This document defines the technical and functional architecture for the hotel website and its booking system. The public guest website is the first implementation priority. The admin dashboard is part of the planned architecture and will be implemented later.

## 2. Architecture Goals

- Support a fast, mobile-friendly hotel website.
- Keep the guest website separate from the future admin dashboard.
- Support room booking requests, QR-based advance payment, and manual verification.
- Preserve booking and payment history.
- Allow admin-controlled room prices, availability, policies, QR details, and service information.
- Keep the system modular so future features can be added without rebuilding the public website.

## 3. High-Level Architecture

The system will have three primary layers:

```text
Guest Website
      |
      v
Booking Backend and Database
      |
      +--> QR Payment Submission
      |
      +--> Admin Dashboard
      |
      +--> Guest/Admin Notifications
```

### 3.1 Guest Website

The public website will provide:

- Home
- Rooms
- Booking
- Services
- Gallery
- Location and Contact
- Booking status and confirmation
- Policies through one footer link

It will collect booking requests and display the QR payment instructions supplied by the hotel.

### 3.2 Booking and Payment Backend

The backend will:

- Validate booking form data.
- Calculate nights, room price, extra mattress charge, total amount, and 30% advance.
- Check date overlap and room availability.
- Store guest, booking, and payment information.
- Store payment reference numbers and optional screenshots.
- Maintain booking and payment statuses.
- Prevent confirmed bookings from exceeding available inventory.
- Provide data to the future admin dashboard.

### 3.3 Admin Dashboard

The future admin dashboard will allow authorized hotel staff to:

- View new booking requests.
- Review guest and payment details.
- Verify QR/UPI payments manually.
- Approve or reject booking requests.
- Update room prices and availability.
- Update the QR code and UPI instructions.
- Manage policies and service information.
- Trigger guest status updates and final confirmations.

## 4. Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

Next.js will support the public pages and server-side application functionality in one project.

### Backend and Data

- Next.js server-side routes/API handlers
- PostgreSQL database
- Supabase as the managed backend service
- Supabase Auth for future admin authentication
- Supabase Storage for hotel images, gallery assets, QR code files, and optional payment screenshots

### Hosting

- Vercel for application hosting and deployment

### External Communication

- WhatsApp deep links for long-stay enquiries and general contact initially
- Email or automated WhatsApp notifications may be integrated later

## 5. Main Application Modules

### 5.1 Public Website Module

Responsible for hotel content, navigation, room presentation, services, gallery, location, policies, and floating actions.

### 5.2 Room and Pricing Module

Responsible for:

- AC room type
- Non-AC room type
- Room inventory of 7 AC rooms and 1 non-AC room
- Current room prices
- Seasonal/admin price changes
- Extra mattress pricing
- Room availability rules

Prices must be copied into a booking record when a booking is submitted so later price changes do not modify an existing booking.

### 5.3 Booking Module

Responsible for:

- Booking form validation
- Date selection
- Room type selection
- Number of guests
- Extra mattress selection
- Guest contact information
- Special requests
- Booking totals
- Booking status transitions
- Booking confirmation details

### 5.4 QR Payment Module

There will be no payment gateway in the initial version. Guests will pay the required advance using the hotel’s QR code/UPI instructions.

The module will:

- Display the current hotel QR code and payment instructions.
- Calculate and display the 30% advance amount.
- Accept a UPI transaction/reference number.
- Optionally accept a payment screenshot.
- Store the submitted payment information.
- Mark payment as awaiting manual verification.

The system must not automatically treat a QR payment as verified.

### 5.5 Admin Module

The admin module will be implemented later but must use the same backend data model. It will manage approval, manual payment verification, room availability, pricing, content settings, and guest notifications.

### 5.6 Notification Module

The initial version may use status pages and direct WhatsApp contact. The architecture should leave room for later email, SMS, or automated WhatsApp notifications for:

- New booking submission
- Payment submission
- Payment verification
- Booking approval
- Booking rejection
- Final confirmation
- Refund processing

## 6. Booking Data Model

### Booking

- Unique booking ID
- Room type
- Check-in date
- Check-out date
- Number of guests
- Extra mattress selected
- Booking creation timestamp
- Current booking status
- Room price snapshot
- Number of nights
- Extra mattress charge snapshot
- Total amount
- Required advance amount
- Advance paid
- Remaining balance
- Currency

### Guest

- Guest name
- Phone number
- Email address, optional
- Special request, optional

### Payment

- Payment record ID
- Booking ID
- Payment amount
- Payment method: QR/UPI
- UPI transaction/reference number
- Optional screenshot file reference
- Payment submission timestamp
- Payment verification timestamp
- Payment status
- Admin note, if applicable

### Room Type and Inventory

- Room type name
- AC/non-AC classification
- Total inventory
- Current price
- Active/inactive state
- Availability or maintenance notes

### Hotel Settings

- Hotel name
- Address
- Contact details
- WhatsApp number
- QR code file reference
- UPI payment instructions
- Check-in time
- Check-out time
- Advance percentage
- Extra mattress price
- Policy content

## 7. Status Models

### Booking Status

```text
payment_pending
payment_submitted_pending_verification
confirmed
rejected
cancelled
refund_processing
refunded
```

### Payment Status

```text
pending
submitted
verified
rejected
refund_pending
refunded
```

## 8. Booking and Payment Flow

```text
Guest submits booking form
        |
        v
System calculates total and 30% advance
        |
        v
Guest pays using hotel QR code
        |
        v
Guest submits transaction/reference details
        |
        v
Payment Submitted – Pending Admin Verification
        |
        v
Admin verifies payment and availability
        |
   +----+----+
   |         |
Approve   Reject
   |         |
   v         v
Confirmed  Rejected / refund handling
```

The booking is not confirmed merely because the guest submitted a booking form or payment reference. Admin verification is required.

## 9. Availability Rules

- The system will track 7 AC rooms and 1 non-AC room.
- Date ranges are checked for overlap before a booking request is accepted.
- Confirmed bookings consume room inventory for their date range.
- Rejected and cancelled bookings do not consume inventory.
- Payment-submitted bookings may be reviewed by admin but do not become confirmed automatically.
- Admin must be able to resolve conflicting or duplicate requests.

## 10. Public Routes and Screens

The initial application should provide routes or equivalent screens for:

- `/` — Home
- `/rooms` — Rooms
- `/booking` — Booking form and payment submission
- `/services` — Additional services
- `/gallery` — Gallery
- `/location` — Location and contact
- `/booking/status` — Booking status and confirmation
- `/policies` — Complete policy content opened through the single footer Policies link

The exact URL structure may be adjusted during implementation, but the user-facing information architecture should remain consistent.

## 11. Security and Privacy

- Validate all booking and payment-submission fields on both client and server.
- Never store UPI PINs, banking passwords, or sensitive payment credentials.
- Restrict admin data and actions behind authentication.
- Store uploaded payment screenshots with controlled access.
- Avoid exposing private guest details in public URLs.
- Use server-side authorization for admin actions.
- Protect against duplicate submissions and repeated payment references.
- Keep an audit trail for approval, rejection, verification, and refund actions.

## 12. Extensibility

The architecture should allow later addition of:

- Full admin dashboard
- Automated email or WhatsApp notifications
- Online payment gateway
- Seasonal pricing rules
- Coupon or discount codes
- Room maintenance blocking
- Guest review management
- Revenue and occupancy reports
- Multiple staff roles

These features should not complicate the first public website implementation.
