/* global localStorage */

'use strict';

const store = (function() {
  return {
    authToken: localStorage.getItem('authToken') || null,
    authorized: localStorage.getItem('authorized') || false,
    currentUser: localStorage.getItem('currentUser') || null,
    profiles: []
  };
}());
