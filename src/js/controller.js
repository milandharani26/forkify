import * as model from "./model.js";
import { MODAL_CLOSE_SEC } from "./config.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";

// import icons from '../img/icons.svg'  //parcel 1
//parcel 2
import "core-js/stable";
import "regenerator-runtime/runtime";


// if (module.hot) {
//   module.hot.accept();
// }


const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    console.log(id);

    if (!id) return;
    recipeView.renderSpinner();

    //0) update result view to mark selected search result 
    resultsView.update(model.getSearchResultPage());

    //1) updating bookmark view
    bookmarksView.update(model.state.bookmarks);

    //2) loading recipe
    await model.loadRecipe(id);

    //3) rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }

};

// window.addEventListener("hashchange", controlRecipes);
// window.addEventListener("load", controlRecipes);


const controlSearchResults = async function () {
  try {

    resultsView.renderSpinner();

    //1) get search query
    const query = searchView.getQuery()
    if (!query) return;

    //2) load search result
    await model.loadSearchResults(query);

    //3) render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultPage());

    //4) render initial pagination buttons
    paginationView.render(model.state.search);

  } catch (err) {
    console.log(err);
  }
}


const controlPagination = function (goToPage) {

  //1) render new results
  // resultsView.render(model.state.search.results);
  resultsView.render(model.getSearchResultPage(goToPage));

  //4) render new pagination buttons
  paginationView.render(model.state.search);
}


const controlServings = function (newServings) {

  //update the recipe servings
  model.updateServings(newServings);

  //update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};


const controlAddbookmark = function () {
  //1) add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deletBookmark(model.state.recipe.id);

  //2) update recipe view
  recipeView.update(model.state.recipe);

  //3) render bookmarks
  bookmarksView.render(model.state.bookmarks);

}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) { 
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddbookmark)
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();
