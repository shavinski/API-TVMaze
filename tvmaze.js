"use strict";

const MISSING_IMAGE_URL = "https://tinyurl.com/missing-tv";
const TVMAZE_API_URL = "http://api.tvmaze.com/";

const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const response = await axios({
    baseURL: TVMAZE_API_URL,
    url: "search/shows",
    method: "GET",
    params: {
      q: term,
    },
  });

  return response.data.map(scoreAndShow => {
    const show = scoreAndShow.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : MISSING_IMAGE_URL,
    };
    // another possibility, using the "destructuring" syntax:
    // const {id, name, summary, image } = show;
    // return {
    //   id,
    //   name,
    //   summary,
    //   image: image ? image.medium : MISSING_IMAGE_URL,
    // };
  });
}


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
           <div class="media">
             <img src="${show.image}" alt="${show.name}" class="w-25 me-3">
             <div class="media-body">
               <h5 class="text-primary">${show.name}</h5>
               <div><small>${show.summary}</small></div>
               <button class="btn btn-outline-light btn-sm Show-getEpisodes">
                 Episodes
               </button>
             </div>
           </div>
        </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm (evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(showId) {
  const response = await axios({
    baseURL: TVMAZE_API_URL,
    url: `shows/${showId}/episodes`,
    method: "GET",
  });

  return response.data.map(ep => ({
    id: ep.id,
    name: ep.name,
    season: ep.season,
    number: ep.number,
  }));

  // similar to above, we could also do this with "destructuring" and
  // "object literal shorthand":
  //
  // return response.data.map(({id, name, season, number}) =>
  //     ({id, name, season, number})
  // );
}


/** Given list of episodes, create markup for each and append to DOM
 *
 * An episode is {id, name, season, number}.
 * */

function displayEpisodes(episodes) {
  $episodesList.empty();

  for (const episode of episodes) {
    const $episode = $(
        `<li>
         ${episode.name}
         (season ${episode.season}, episode ${episode.number})
       </li>
      `);

    $episodesList.append($episode);
  }

  $episodesArea.show();
}


/** Handle click on episodes button: get episodes for show and display */

async function retrieveEpisodesAndDisplay(showId) {
  const episodes = await getEpisodesOfShow(showId);
  displayEpisodes(episodes);
}


// note that:
// - we're using "event delegation", since the buttons *won't exist* on page
//   load, only after they've search for shows
// - our "discriminant" for this event handler is the class Show-getEpisodes;
//   this is much better than "match-all-buttons", since that would be a clear
//   bug if anyone ever added any other kind of button to the app!

$showsList.on(
    "click",
    ".Show-getEpisodes",
    async function handleEpisodeClick(evt) {
  // here's one way to get the ID of the show: search "closest" ancestor
  // with the class of .Show (which is put onto the enclosing div, which
  // has the .data-show-id attribute).
  const showId = Number(
      $(evt.target).closest(".Show").data("show-id")
  );

  // here's another way to get the ID of the show: search "closest" ancestor
  // that has an attribute of 'data-show-id'. This is called an "attribute
  // selector", and it's part of CSS selectors worth learning.
  // const showId = $(evt.target).closest("[data-show-id]").data("show-id");

  await retrieveEpisodesAndDisplay(showId);
});