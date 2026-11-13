# Product Requirements Document

## Project

**Kashi Riverside Stay**  
Location: Sonarpura, Varanasi

## 1. Product Overview

Kashi Riverside Stay is a customer-facing hotel website for presenting the property and accepting room booking requests. The website will allow guests to view rooms and services, submit booking details, pay a required advance, and receive final confirmation after hotel-admin verification.

The initial scope is the public guest website. A separate admin dashboard will be planned later.

## 2. Goals

- Present Kashi Riverside Stay clearly and professionally.
- Show available room types, current prices, facilities, and extra bedding information.
- Make booking requests simple for guests.
- Support advance payment before final booking confirmation.
- Keep guests informed about booking and payment status.
- Provide WhatsApp access for long-stay enquiries and general assistance.
- Present additional hotel-arranged services without displaying fixed service prices.

## 3. Out of Scope for the Initial Public Website

- Admin dashboard implementation
- Staff accounts and permissions
- Revenue and occupancy reports
- Internal room-status management
- Fixed pricing for paid/arranged services
- Final contact details, which will be added later
- Final visual style, colors, typography, animations, and imagery direction

## 4. Hotel and Room Information

### Hotel

- Name: Kashi Riverside Stay
- Location: Sonarpura, Varanasi
- Total rooms: 8
- AC rooms: 7
- Non-AC rooms: 1

### Room pricing

- AC room: ₹2,000 per night
- Non-AC room: ₹1,500 per night
- Prices are controlled by the admin and may vary by season. This pricing rule will be communicated in the single Policies area accessible from the footer.

### Occupancy and bedding

- Standard occupancy: 2 adults and 2 children per room
- A 3-adult option is available using one extra mattress in a room
- Extra mattress charge: ₹500
- Extra bedding is subject to availability

### Timings

- Check-in: 1:00 PM
- Check-out: 11:00 AM

## 5. Included Amenities

The following amenities are included in the hotel offering:

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

On the Home page, these amenities will appear near the top in a revolving horizontal strip with icons and short labels.

## 6. Additional Services

The following services are available on request and may involve additional charges:

- Parking
- Extra bedding
- Boat ride arrangements
- Ticket booking assistance
- Car rental assistance
- Scooty rental assistance
- Local shopping assistance, including saree shopping

The Services section will not display fixed prices for these services unless prices are supplied later. A WhatsApp enquiry option should be available.

## 7. Website Structure

### 7.1 Home

The Home page will contain:

- Header and navigation
- Main hotel introduction
- Revolving amenities strip near the top
- Room preview
- Services section
- Why-stay-with-us section
- Gallery preview
- Floating **Book a Room** button
- Footer

The Home page will not contain separate sections for:

- Booking process
- Varanasi experience
- Guest trust
- Final call to action

### 7.2 Rooms

The Rooms page will show:

- AC room listing with current price
- Non-AC room listing with current price
- Room photographs
- Room facilities
- Occupancy information
- Extra mattress option and charge
- Book-this-room action

Seasonal/admin pricing explanations will not appear on the Rooms page; they belong in the Policies area.

### 7.3 Booking

The booking form will include:

- Check-in date
- Check-out date
- Room type
- Number of guests
- Extra mattress option
- Guest name
- Phone number
- Email address, optional
- Special request, optional
- Agreement to the Policies
- Advance payment step

The form will not include a number-of-rooms field.

### 7.4 Services

The Services page/section will focus on the additional paid or arranged services listed in Section 6. These services will be described as available on request, with charges communicated separately.

### 7.5 Gallery

The Gallery will support photographs of:

- AC rooms
- Non-AC room
- Bathrooms
- Hotel exterior
- Reception area
- Common areas
- Terrace or rooftop, if available
- Nearby surroundings, if selected for inclusion

Real hotel photographs should be used when available.

### 7.6 Location and Contact

The section will contain:

- Kashi Riverside Stay name
- Sonarpura, Varanasi location
- Embedded map
- Get Directions action
- Phone number, to be added later
- WhatsApp number, to be added later
- Email address, if selected later
- Nearby landmark, to be added later
- Check-in and check-out timings

### 7.7 Booking Status and Confirmation

After booking submission, guests will be able to view:

- Booking reference number
- Guest name
- Room type
- Number of guests
- Check-in and check-out dates
- Extra mattress selection
- Total booking amount
- 30% advance amount
- Advance payment status
- Remaining balance
- Current booking status
- Hotel contact details

Possible statuses:

- Payment Pending
- Payment Received – Pending Verification
- Booking Confirmed
- Booking Rejected
- Refund Processing

For a confirmed booking, the page will show the booking ID, confirmation date, remaining balance, hotel timings, and contact options. A download/save confirmation option may be included.

### 7.8 Footer

The footer will contain navigation, contact information when available, copyright information, and one **Policies** link.

The single Policies link will open all policy information in one place, including:

- Advance payment and booking confirmation
- Cancellation and refunds
- Check-in and check-out
- Extra bedding
- Seasonal pricing
- Paid services
- Guest identification
- Date changes and no-shows
- Damage responsibility

## 8. Booking and Payment Workflow

The required workflow is:

1. Guest completes the booking form.
2. Website calculates the booking total and required 30% advance.
3. Guest pays the 30% advance.
4. Status becomes **Payment Received – Pending Admin Verification**.
5. Admin receives the booking and payment notification.
6. Admin verifies room availability and booking details.
7. If approved, status becomes **Booking Confirmed**.
8. Guest receives final confirmation and booking ID.
9. The remaining 70% is paid at the hotel for the pay-at-hotel option.

If admin rejects the booking, the guest is notified and the advance is handled according to the refund policy.

Important rule:

> Payment alone does not confirm a booking. Admin verification is required before the booking becomes confirmed.

## 9. Long-Stay Enquiries

- The website will provide a visible WhatsApp contact option for long-stay enquiries.
- Long-stay guests may contact the hotel directly for availability and special rates.
- Long-stay enquiries do not need to use the standard booking flow unless the hotel directs the guest to do so.

## 10. Cancellation and Refund Policy Draft

The following draft policy will be presented through the single Policies link:

- Cancellation 7 or more days before check-in: full advance refund.
- Cancellation 3–6 days before check-in: 50% of the advance refunded.
- Cancellation less than 3 days before check-in: advance non-refundable.
- No-show: advance non-refundable.
- If the hotel cancels a confirmed booking, the full advance is refunded.
- Date changes are subject to availability.
- Only one date-change request is allowed.
- Refunds are processed to the original payment method.
- Refund processing may take 5–7 working days.
- Applicable payment gateway charges may be deducted from a refund.

This policy may be revised before launch.

## 11. Floating Actions

- A floating **Book a Room** button will be available throughout the website.
- It will open the Booking page/form.
- A separate floating WhatsApp button may be provided for enquiries and long-stay contact.
- Floating controls must not cover important content or navigation.

## 12. Content and Design Notes

- Contact information will be supplied at a later stage.
- Visual style will be decided separately with the owner.
- No colors, fonts, layouts, animations, or image style are finalized in this PRD.
- Customer-facing text should remain clear, welcoming, and concise.

## 13. Success Criteria

The initial public website is successful when:

- Guests can understand the hotel and room options quickly.
- Guests can find included amenities and additional services.
- Guests can contact the hotel on WhatsApp for long stays.
- Guests can submit a booking request with dates, room type, guest count, and bedding preference.
- Guests can pay the 30% advance.
- Admin verification can determine whether a booking becomes confirmed.
- Guests can see their booking/payment status and final confirmation.
- Policies are accessible through one footer link.
- The website works well on mobile and desktop.
