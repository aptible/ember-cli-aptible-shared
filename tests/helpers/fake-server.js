import Pretender from 'pretender';

var currentServer;

function stringifyJSON(json){
  return json ? JSON.stringify(json) : '{"error": "not found"}';
}

function raiseOnUnhandledRequest(verb, path, request){
  console.error("FakeServer received unhandled request",{verb:verb,path:path,request:request});
  ok(false, "FakeServer received unhandled request for " + verb + " " + path);
  throw "FakeServer received unhandled request for :" + verb + " " + path;
}

export var jsonMimeType = {"Content-Type": "application/json"};

function errorRequest(status, errors){
  // if called without `status`
  if (!errors) { errors = status; status = 422; }

  return [status, jsonMimeType, errors];
}

function notFoundRequest(){
  return [404, jsonMimeType, {}];
}

function successRequest(status, json){
  // if called without `status`
  if (!json) { json = status; status = 200; }

  return [status, jsonMimeType, json];
}

function noContentRequest(status){
  // if called without `status`
  if (!status) { status = 204; }

  return [status, jsonMimeType, ''];
}

function logHandledRequest(verb, path, request){
  console.log('[FakeServer] handled: ' + verb + ' ' + path, request);
}

function jsonFromRequest(request){
  if (!request.requestBody) {
    console.warn("[FakeServer] tried to parse json from request without a requestBody",request);
    return {};
  }

  return JSON.parse(request.requestBody);
}

function stubRequest(verb, path, callback){
  if (!currentServer) { throw "Cannot stubRequest when FakeServer is not running."; }

  var context = {
    json: jsonFromRequest,
    success: successRequest,
    noContent: noContentRequest,
    error: errorRequest,
    notFound: notFoundRequest
  };
  var boundCallback = function(){
    var args = Array.prototype.slice.call(arguments);
    return callback.apply(context, args);
  };
  currentServer[verb](path, boundCallback);
}

export { stubRequest };

export default {
  start: function(){
    if (currentServer) {
      throw new Error('Cannot start FakeServer while it is already running...');
    }

    currentServer = new Pretender();
    currentServer.prepareBody = stringifyJSON;
    currentServer.unhandledRequest = raiseOnUnhandledRequest;
    currentServer.handledRequest = logHandledRequest;
  },
  stop: function(){
    if (!currentServer) {
      console.warn('Called FakeServer.stop while it was not running');
      return;
    }

    currentServer.shutdown();
    currentServer = null;
  }
};
