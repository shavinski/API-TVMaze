"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const TV_MAZE_URL = "http://api.tvmaze.com"


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

function findImgNull(showsData) {

  for(let show of showsData) {
    const imageNotFoundUrl = 'https://cdn-icons-png.flaticon.com/512/2748/2748558.png';

    if(show.show.image === null) {
      show.show.image = {medium: imageNotFoundUrl};
    }
  }

  return showsData;
}

async function getShowsByTerm(term) {
  const showsData = await axios.get(`${TV_MAZE_URL}/search/shows`, {params: {
      q: term
    }
  });

  // console.log('showsData', findImgNull(showsData.data));
  return findImgNull(showsData.data)
}


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.show.image.medium}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.show.name}</h5>
             <div><small>${show.show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
    console.log(show.show.id)
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

async function getEpisodesOfShow(id) {
  const episodeInfo = await axios.get(`${TV_MAZE_URL}/shows/${id}/episodes`);

  return episodeInfo.data
}

/** Write a clear docstring for this function... */

async function displayEpisodes(showId) {
  const episodes = await getEpisodesOfShow(showId);

  for(let episode of episodes) {
    const $newEpisode = $(`<li>${episode.name} (season ${episode.season}, episode ${episode.number})</li>`);
    $episodesArea.append($newEpisode);
  }

}

function handleEpisodeClick(e) {
  console.log("target ==>", e.target);
  $episodesArea.css('display', 'static');

  const episodesOfShow = getEpisodesOfShow(526)
  displayEpisodes(episodesOfShow);
  // displayEpisodes(getEpisodesOfShow(`${}`));
}

const $episodesBtn = $('.Show-getEpisodes');


$showsList.on('click', handleEpisodeClick);

// add other functions that will be useful / match our structure & design
// {