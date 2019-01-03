/* global $ betterFriend document store */
'use strict';

$(document).ready(function() {
  // If current user has valid token on refresh, show dashboard page. Otherwise show homepage
  if (!(store.authorized)) {
    betterFriend.renderHomePage();
  } else betterFriend.renderDashboardPage();
});
