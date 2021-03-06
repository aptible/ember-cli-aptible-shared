import DS from 'ember-data';

export default DS.Model.extend({
  userUrl: DS.attr(),
  privileged: DS.attr('boolean'),
  user: DS.belongsTo('user'),
  role: DS.belongsTo('role', {async: true}),
  createdAt: DS.attr('date')
});
