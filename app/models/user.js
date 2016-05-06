import DS from 'ember-data';
import can from "../utils/can";
import Ember from 'ember';

export default DS.Model.extend({
  email: DS.attr('string'),
  name: DS.attr('string'),
  username: DS.attr('string'),
  password: DS.attr('string'),
  verified: DS.attr('boolean'),
  createdAt: DS.attr('date'),
  superuser: DS.attr('boolean'),
  otpEnabled: DS.attr('boolean'),
  otpUri: DS.attr('string'),
  otpToken: DS.attr('string'),

  // used when changing a user's password. Set as an `attr` so that it
  // will be sent to the API
  currentPassword: DS.attr('string'),

  // not persisted, used when changing a user's password
  passwordConfirmation: null,

  // Used when enabling 2FA. Set as an `attr` so that it's sent to the API;
  otpReset: DS.attr('boolean'),

  // relationships
  token: DS.belongsTo('token', { async: true, requireReload: true }),
  roles: DS.hasMany('role', {async:true}),
  sshKeys: DS.hasMany('ssh-key', {async:true}),

  // check ability, returns a promise
  // e.g.: user.can('manage', stack).then(function(boolean){ ... });
  can: function(scope, stack){
    return can(this, scope, stack);
  },

  organizations: Ember.computed('roles.@each.organization', function() {
    var organizations = {};

    this.get('roles').forEach(function(role) {
      var organization = role.get('organization');
      var organizationId = organization.get('id');
      organizations[organizationId] = organization;
    });

    return Ember.keys(organizations).map(function(organizationId) {
      return organizations[organizationId];
    });

  })
});
