import DS from 'ember-data';

export default DS.Model.extend({
  verificationCode: DS.attr('string'),
  invitationId: DS.attr('string'),
  type: DS.attr('string'),
  userId: DS.attr('string'),
  resetCode: DS.attr('string'),
  password: DS.attr('string')
});
