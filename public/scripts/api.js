/* global $ store */
'use strict';

const api = (function() {
  const search = function(path, query) {
    return $.ajax({
      type: 'GET',
      url: path,
      dataType: 'json',
      data: query,
      headers: { Authorization: `Bearer ${store.authToken}` }
    });
  };

  const details = function(path) {
    return $.ajax({
      type: 'GET',
      url: path,
      dataType: 'json',
      headers: { Authorization: `Bearer ${store.authToken}` }
    });
  };

  const update = function(path, obj) {
    return $.ajax({
      type: 'PUT',
      url: path,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(obj),
      headers: { Authorization: `Bearer ${store.authToken}` }
    });
  };

  const create = function(path, obj) {
    return $.ajax({
      type: 'POST',
      url: path,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(obj),
      headers: { Authorization: `Bearer ${store.authToken}` }
    });
  };

  const remove = function(path, obj) {
    return $.ajax({
      type: 'DELETE',
      url: path,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(obj),
      headers: { Authorization: `Bearer ${store.authToken}` }
    });
  };

  return {
    create,
    search,
    details,
    update,
    remove
  };
})();
