import assert from 'node:assert/strict';
import { bookingEmailContent } from '../lib/booking-email-content.ts';
const booking = {id:'TEST',guest_name:'Test Guest',email:'guest@example.com',phone:'1234567890',room_type:'ac',check_in:'2098-01-01',check_out:'2098-01-02',total:200000,advance_due:60000};
for(const event of ['payment_pending','payment_submitted_pending_verification','confirmed','rejected']){
 const hotel=bookingEmailContent('hotel',event,booking),guest=bookingEmailContent('guest',event,booking);
 assert.match(hotel.text,/Hello hotel team/);assert.match(guest.text,/Hello Test Guest/);
 assert.match(hotel.text,/Phone: 1234567890/);assert.doesNotMatch(guest.text,/Phone: 1234567890/);
 assert.notEqual(hotel.text,guest.text);
}
assert.match(bookingEmailContent('hotel','payment_submitted_pending_verification',booking).text,/bank account/);
assert.match(bookingEmailContent('guest','payment_pending',booking).text,/not confirmed/);
console.log('PASS: Hotel and guest emails have separate, appropriate wording for every booking status.');
