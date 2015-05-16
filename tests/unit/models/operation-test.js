import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';
import { stubRequest } from '../../helpers/fake-server';
import modelDeps from '../../support/common-model-dependencies';

moduleForModel('operation', 'model:operation', {
  // Specify the other units that are required for this test.
  needs: modelDeps.concat([
    'adapter:operation'
  ])
});

test('when creating an operation for a db, POSTs to /databases/:id/operations', function(){
  expect(2);

  var store = this.store();
  var db, op;
  Ember.run(function(){
    db = store.createRecord('database', {id: 'db-id'});
    op = store.createRecord('operation', {
      database: db,
      diskSize: 10,
      type: 'provision'
    });
  });

  stubRequest('post', '/databases/db-id/operations', function(){
    ok(true, 'posts to correct url');

    return this.success({
      id: 'op-id',
      diskSize: 10,
      type: 'provision',
      _links: {}
    });
  });

  return Ember.run(function(){
    return op.save().then(function(_op){
      ok(true, 'operation saved');
    });
  });
});

test('store.find("operation", {app:app, page:page}) formats the URL correctly"', function(){
  expect(4);

  var store = this.store();
  var app;
  var firstRequest = true;

  stubRequest('get', '/apps/app-id/operations', function(request){
    if (firstRequest) {
      firstRequest = false;
      equal(request.queryParams.page, "1", "first request has page=1 query param");

      return this.success({
        page: 1,
        total_pages: 2,
        _embedded: {
          operations: [{id:'op-1'}]
        }
      });
    } else {
      equal(request.queryParams.page, "2", "second request has page=2 query param");

      return this.success({
        page: 2,
        total_pages: 2,
        _embedded: {
          operations: [{id:'op-2'}]
        }
      });
    }
  });

  return Ember.run(function(){
    app = store.push('app', {id: 'app-id'});

    return store.find('operation', {app:app, page:1}).then(function(){
      deepEqual(store.metadataFor('operation'),
                {page:1,total_pages:2}, 'store has correct metadata first time');

      return store.find('operation', {app:app, page:2});
    }).then(function(){
      deepEqual(store.metadataFor('operation'),
                {page:2,total_pages:2}, 'store has correct metadata second time');
    });
  });
});

test('store.find("operation", {database:database, page:page}) formats the URL correctly"', function(){
  expect(4);

  var store = this.store();
  var db;
  var firstRequest = true;

  stubRequest('get', '/databases/db-id/operations', function(request){
    if (firstRequest) {
      firstRequest = false;
      equal(request.queryParams.page, "1", "first request has page=1 query param");

      return this.success({
        page: 1,
        total_pages: 2,
        _embedded: {
          operations: [{id:'op-1'}]
        }
      });
    } else {
      equal(request.queryParams.page, "2", "second request has page=2 query param");

      return this.success({
        page: 2,
        total_pages: 2,
        _embedded: {
          operations: [{id:'op-2'}]
        }
      });
    }
  });

  return Ember.run(function(){
    db = store.push('database', {id: 'db-id'});

    return store.find('operation', {database:db, page:1}).then(function(){
      deepEqual(store.metadataFor('operation'),
                {page:1,total_pages:2}, 'store has correct metadata first time');

      return store.find('operation', {database:db, page:2});
    }).then(function(){
      deepEqual(store.metadataFor('operation'),
                {page:2,total_pages:2}, 'store has correct metadata second time');
    });
  });
});

let vhostId = 'vhost-id';
let vhostOperationURL = `/vhosts/${vhostId}/operations`;
test(`when creating an operation for a vhost, POSTs to ${vhostOperationURL}`, function(){
  expect(2);

  var store = this.store();
  var vhost, op;

  Ember.run(function(){
    vhost = store.createRecord('vhost', {id: vhostId});
    op = store.createRecord('operation', {
      type: 'provision',
      vhost: vhost
    });
  });

  stubRequest('post', vhostOperationURL, function(){
    ok(true, 'posts to correct url');

    return this.success({
      id: 'op-id',
      type: 'provision',
    });
  });

  return Ember.run(function(){
    return op.save().then(function(_op){
      ok(true, 'operation saved');
    });
  });
});

let logDrainId = 'log-drain-id-1';
let logDrainOperationURL = `/log_drains/${logDrainId}/operations`;
test(`creating an operation for a log drain POSTS to ${logDrainOperationURL}`, function(){
  expect(2);

  let store = this.store(),
      logDrain, op;

  Ember.run(function(){
    logDrain = store.createRecord('log-drain', {id: logDrainId});
    op = store.createRecord('operation', {
      type: 'configure',
      logDrain: logDrain
    });
  });

  stubRequest('post', logDrainOperationURL, function(){
    ok(true, 'posts to correct url');

    return this.success({
      id: 'op-id',
      type: 'configure',
    });
  });

  return Ember.run(function(){
    return op.save().then(function(_op){
      ok(true, 'operation saved');
    });
  });
});

let serviceId = 'service-1';
let serviceOperationURL = `/services/${serviceId}/operations`;
test(`creating an operation for a service POSTS to ${serviceOperationURL}`, function(){
  expect(2);

  let store = this.store(),
      service, op;

  Ember.run(function(){
    service = store.createRecord('service', {id: serviceId});
    op = store.createRecord('operation', {
      type: 'configure',
      service: service
    });
  });

  stubRequest('post', serviceOperationURL, function(){
    ok(true, 'posts to correct url');

    return this.success({
      id: 'op-id',
      type: 'configure',
    });
  });

  return Ember.run(function(){
    return op.save().then(function(_op){
      ok(true, 'operation saved');
    });
  });
});
