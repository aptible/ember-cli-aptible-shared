import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  plan: DS.attr('string'),
  paymentMethodName: DS.attr('string'),
  paymentMethodDisplay: DS.attr('string'),
  nextInvoiceDate: DS.attr('iso-8601-timestamp'),
  //paymentExpMonth: DS.attr('number'),
  //paymentExpYear: DS.attr('number'),
  allowPHI: Ember.computed.match('plan', /production|platform/),
  stripeSubscriptionId: DS.attr('string'),
  stripeCustomerId: DS.attr('string'),
  hasStripeSubscription: Ember.computed.bool('stripeSubscriptionId'),
  hasStripeCustomer: Ember.computed.bool('stripeCustomerId'),
  hasStripe: Ember.computed.and('hasStripeCustomer', 'hasStripeSubscription'),
  organization: DS.belongsTo('organization', {async:true})
  //stripeSubscriptionStatus: DS.attr()
});
