"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

async function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  await getAndShowStories();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".nav-main-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}


/** Handler for when a user clicks on submit */
async function navSubmitStory(evt) {
  console.debug("navSubmitClick", evt);
  hidePageComponents();
  
  $submitStoryForm.show();
  await getAndShowStories();
}

$navSubmitStory.on('click', navSubmitStory);

/** Handler for when a user clicks on My Stories */
function navOwnStories() {
  console.debug('navMyStoriesClick');
  hidePageComponents();
  putStoriesOnPage(OWN_STORIES);
}

$navMyStories.on('click', navOwnStories);

/** Handler for when a user clicks on Favorites */
function navFavorites() {
  console.debug('navFavoritesClick');
  hidePageComponents();
  putStoriesOnPage(FAV_STORIES);
}

$navFavorites.on('click', navFavorites);