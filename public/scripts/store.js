/* global localStorage */

'use strict';

// eslint-disable-next-line no-unused-vars
const store = (function() {
  return {
    authToken: localStorage.getItem('authToken') || null,
    authorized: localStorage.getItem('authorized') || false,
    currentUser: localStorage.getItem('currentUser') || null,
    profiles: []
  };
}());
