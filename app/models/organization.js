import DS from 'ember-data';
import Ember from 'ember';

let orgRegex = new RegExp('organizations/([a-zA-Z0-9\-]+)');

const UPGRADE_PLAN_REQUEST_EVENT = 'Production Upgrade Request';
const CREATE_NEW_PRODUCTION_ENVIRONMENT_EVENT = 'Customer Created New Production Environment';

export { UPGRADE_PLAN_REQUEST_EVENT };
export { CREATE_NEW_PRODUCTION_ENVIRONMENT_EVENT };

export default DS.Model.extend({
  name: DS.attr('string'),
  primaryPhone: DS.attr('string'),
  emergencyPhone: DS.attr('string'),
  city: DS.attr('string'),
  state: DS.attr('string'),
  zip: DS.attr('string'),
  address: DS.attr('string'),
  plan: DS.attr('string'),
  opsAlertEmail: DS.attr('string'),
  securityAlertEmail: DS.attr('string'),
  users: DS.hasMany('user', {async:true}),
  invitations: DS.hasMany('invitation', {async:true}),
  roles: DS.hasMany('role', {async:true}),
  securityOfficer: DS.belongsTo('user', {async:true}),
  billingContact: DS.belongsTo('user', {async:true}),
  billingDetail: DS.belongsTo('billing-detail', {async:true}),
  allowPHI: Ember.computed.match('plan', /production|platform/),
  hasStripeSubscription: Ember.computed.bool('stripeSubscriptionId'),
  hasStripeCustomer: Ember.computed.bool('stripeCustomerId'),
  hasStripe: Ember.computed.and('hasStripeCustomer', 'hasStripeSubscription'),
  managePermissions: Ember.computed.filterBy('permissions', 'scope', 'manage'),

  getCriteriaSubjects(criteria) {
    let subjects = [];
    let organization = this;

    criteria.forEach((criterion) => {
      organization.getCriterionSubjects(criterion).forEach((s) => {
        subjects.push(s);
      });
    });

    return subjects;
  },

  getCriterionSubjects(criterion) {
    let prop = { training_log: 'users',
                 developer_training_log: 'developers',
                 security_officer_training_log: 'securityOfficer'}[criterion.get('handle')];

    return Ember.makeArray(this.get(prop));
  },

  developerRoles: Ember.computed('roles.@each.privileged', 'managePermissions', function() {
    // FIXME: Developer roles are any roles that:
    // 1. Are privileged: true
    // 2. Or have a manage permission on an API resource
    // This property will not be set without first setting permissions on
    // the organization instance.  This seems smelly.

    let roles = this.get('roles');
    let permissions = this.get('managePermissions');
    let managedRolesHrefs = permissions.map((p) => p.get('data.links.role'));

    return roles.filter((role) => {
      let roleHref = role.get('data.links.self');
      return role.get('privileged') || managedRolesHrefs.indexOf(roleHref) > -1;
    });
  }),

  developers: Ember.computed('developerRoles', 'roles.@each.users', function() {
    // FIXME: This depends on developerRoles, which requires permissions transient
    // set on organization instance

    let developerRoles = this.get('developerRoles');
    let developmentUsers = [];

    developerRoles.forEach((r) => {
      r.get('users').forEach((u) => {
        developmentUsers.addObject(u);
      });
    });
    return developmentUsers;
  }),
  
  // needed by aptible-ability
  permitsRole(role, scope){
    return new Ember.RSVP.Promise( (resolve) => {
      let roleOrganizationHref = role.get('data.links.organization');
      let match = orgRegex.exec(roleOrganizationHref);
      let roleOrganizationId = match[1];

      let permitted = roleOrganizationId === this.get('id');
      if (scope === 'manage') {
        permitted = permitted && role.get('privileged');
      }

      resolve(permitted);
    });
  }
});
