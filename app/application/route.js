import Ember from 'ember';

export default Ember.Route.extend({
  requireAuthentication: false,
  title: 'Aptible Dashboard',
  activate() {
    if (this.get('features').isEnabled('notifications')) {
      this._oldOnError = Ember.onerror;
      this._errorHandler = (e) => {
        this.get('flashMessages').danger(e);
        if (this._oldOnError) {
          this._oldOnError(e);
        }
      };
      Ember.onerror = this._errorHandler;
    }
  },
  deactivate() {
    if (this.get('features').isEnabled('notifications')) {
      Ember.onerror = this._oldOnError;
    }
  }
});
