"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStories() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * @returns The markup for the story.
 */

function generateStoryMarkup(story, showDelete = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        ${showDelete ? getDeleteBtnHTML() : ''}
        ${getFavBtnHTML(currentUser, story)}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/**
 * @returns HTML for a trashcan icon
 */
function getDeleteBtnHTML() {
  return $('<span>', {class:'trash-can'}).append($('<i>', {class:'fas fa-trash-alt'})).prop('outerHTML');
}

/**
 * Checks to see if story is in user's favorites. If it is return a filled star otherwise an empty star
 * @param {User} user The user we are checking for story in favorites.
 * @param {Story} story The story we are checking to see if it's in user's favorite.
 * @returns Blank if no user. Open star if not favorite for user. Closed star if is.
 */
function getFavBtnHTML(user, story) {
  if (!user)
    return '';

  let star;
  if (user.favorites.some(element => element.storyId === story.storyId)) {
    star = 'fas';
  } else {
    star = 'far';
  }

  return $('<span>', {class:'star'}).append($('<i>', {class:`${star} fa-star`})).prop('outerHTML');
}

/** Gets list of stories from server, generates their HTML, and puts on page. 
 * @param {Integer} type The type of stories to show. 1 for own stories, 2 for fav stories, else all stories.
*/
const OWN_STORIES = 1;
const FAV_STORIES = 2;
function putStoriesOnPage(type = 0) {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  let storiesList;
  switch (type) {
    case OWN_STORIES:
      storiesList = currentUser.ownStories;
      break;
    case FAV_STORIES:
      storiesList = currentUser.favorites;
      break;
    default:
      storiesList = storyList.stories;
  }

  if (!storiesList || storiesList.length === 0) {
    $('<div>', { text: 'No stories found.' }).appendTo($allStoriesList);
  } else {
    // loop through all of our stories and generate HTML for them
    for (let story of storiesList) {
      const $story = type === OWN_STORIES ? generateStoryMarkup(story, true) : generateStoryMarkup(story);
      $allStoriesList.append($story);
    }
  }

  $allStoriesList.show();
}

/** Handle story submission form */
async function submitStory(e) {
  console.debug('submit story');
  e.preventDefault();

  const author = $('#author').val().trim();
  const title = $('#title').val().trim();
  const url = $('#url').val().trim();

  if (!author || !title || !url) {
    alert("Invalid input");
    return;
  }

  try {
    const story = await StoryList.addStory(currentUser, { author, title, url });
    $submitStoryForm.trigger('reset');
    currentUser.ownStories.push(new Story(story));
    await getAndShowStories();
  } catch (e) {
    console.debug(e);
    alert("Error submitting story");
  }
}

$submitStoryForm.on('submit', submitStory);

/**
 * Delete the story closest to the trash can icon.
 */
async function deleteStory(e) {
  console.debug('delete story', e.target);
  try {
    const storyId = e.target.closest('li').id;
    const deleted = await StoryList.deleteStory(currentUser, storyId);
    // remove story from own and favorites
    currentUser.ownStories = currentUser.ownStories.filter(element => element.storyId !== deleted.storyId);
    currentUser.favorites = currentUser.favorites.filter(element => element.storyId !== deleted.storyId);
    navOwnStories();
  } catch (e) {
    console.debug(e);
    alert("Error deleting story");
  }
}

$allStoriesList.on('click', '.trash-can', deleteStory);

/**
 * Toggles favorite story
 */
async function favoriteStory(e) {
  console.debug('favorite story', e.target);
  try {
    const storyId = e.target.closest('li').id;
    let method;
    if (currentUser.favorites.some(element => element.storyId === storyId)) {
      method = 'DELETE';
    } else {
      method = 'POST';
    }
    const updatedFavorites = await StoryList.toggleFavorite(currentUser, storyId, method);
    currentUser.favorites = updatedFavorites.map(s => new Story(s));
    $(e.target).toggleClass("fas far");
  } catch (e) {
    console.debug(e);
    alert("Error adding story to favorites");
  }
}

$allStoriesList.on('click', '.star', favoriteStory);