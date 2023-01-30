
const random_mealElement = document.getElementById('random-meal');
const favorite_mealElement = document.getElementById('fav-meals');
const searchTerm = document.getElementById("search-term");
const searchButton = document.getElementById("search");

//pop up
const popup_mealInfo = document.getElementById("meal-info-popup");
const popup_closeButton = document.getElementById("close-popup");
const meal_recipeElement = document.getElementById("meal-recipe");



getRandomMeal();
fetchFavoriteMeals();

async function getRandomMeal() {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const responseData = await response.json();
    const randomMeal = responseData.meals[0];

    console.log(randomMeal);

    loadRandomMeal(randomMeal, true);
}

async function getMealById(id) {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
    const responseData = await response.json();
    const meal = responseData.meals[0];

    return meal;
}


async function getMealByName(name) {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + name);
    const responseData = await response.json();
    const allMeal = responseData.meals;
    return allMeal;
}


function loadRandomMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');

    meal.innerHTML = ` 
    <div>
        Wanna Try this out?
    </div>

    <div class="meal-header">
        ${random ? `<span class="random">
        Random-recipe
     </span>` : ''}

        <img src="${mealData.strMealThumb}" alt=""/>

    </div>
    <div class="meal-body">
        <h4>${mealData.strMeal}</h4>
        <button class="fav-button">
            <i class="fas fa-heart"></i>
        </button>
    </div>
</div>`

    //add to favorites
    const button = meal.querySelector(".meal-body .fav-button");

    button.addEventListener('click', () => {
        if (button.classList.contains('active')) {
            removeMealfromLocalStorage(mealData.idMeal);
            button.classList.remove('active');
        } else {
            addMealstoLocalStorage(mealData.idMeal);
            button.classList.add('active');
        }
        // console.log("Clicked");

        fetchFavoriteMeals();

    });

    // meal.querySelector(".meal-body .fav-button").addEventListener('click', (event) => { 
    //         event.classList.toggle('active');
    //         console.log("Clicked");
    //      });
    meal.addEventListener('click', () => {
        showMealInfo(mealData);
    });

    random_mealElement.appendChild(meal);
}


function addMealstoLocalStorage(newMealID) {
    const mealIDs = getMealsFromLocalStorage();
    localStorage.setItem('mealIDs', JSON.stringify([...mealIDs, newMealID]));
}

function removeMealfromLocalStorage(mealID) {
    const mealIDs = getMealsFromLocalStorage();
    localStorage.setItem('mealIDs', JSON.stringify(mealIDs.filter((item) => item != mealID)));
    ;
}

function getMealsFromLocalStorage() {
    const mealIDs = JSON.parse(localStorage.getItem('mealIDs'));
    // console.log(mealIDs);
    return mealIDs === null ? [] : mealIDs;
}

async function fetchFavoriteMeals() {
    //clear favorite meals for duplicate reloading  
    favorite_mealElement.innerHTML = "";
    const mealIDs = getMealsFromLocalStorage();

    for (let i = 0; i < mealIDs.length; i++) {
        const mealID = mealIDs[i];
        const favoriteMeal = await getMealById(mealID);
        addMealToFavorite(favoriteMeal);

        // console.log(favoriteMeal);
    }

}


function addMealToFavorite(mealData) {
    const favoriteMeal = document.createElement('li');

    favoriteMeal.innerHTML = ` 
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" />
    <span>${mealData.strMeal}</span>
    <button class="clear"><i class="fa-solid fa-xmark"></i></button> 
   `
    const clearButton = favoriteMeal.querySelector('.clear');

    clearButton.addEventListener('click', () => {
        removeMealfromLocalStorage(mealData.idMeal);
        fetchFavoriteMeals();
    });

    favoriteMeal.addEventListener('click', () => {
        showMealInfo(mealData);
    })

    favorite_mealElement.appendChild(favoriteMeal);

    console.log(favoriteMeal);

}

searchButton.addEventListener('click', async () => {
    //clean the container to else the items will load at the bottom
    random_mealElement.innerHTML = "";

    const searchWord = searchTerm.value;
    // console.log(await getMealByName(searchWord));

    const meals = await getMealByName(searchWord);

    if (meals) {
        meals.forEach((item) => {
            loadRandomMeal(item);
        })
    }

})

function showMealInfo(mealData) {
    //clean up element
    meal_recipeElement.innerHTML = "";

    const mealElement = document.createElement('div');

    const ingredients = [];
    //get ingredients
    for (let i = 1; i <= 20; i++) {
        if (mealData['strIngredient' + i]) {
            ingredients.push(`${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`);

        } else {
            break;
        }
    }



    mealElement.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="">
        <p>Instructions : ${mealData.strInstructions}</p>

        <h3>Ingredients</h3>
        <ul>
            ${ingredients.map((item) => `<li>${item}</li>`)}
        </ul>
    `;

    // console.log(mealElement);


    meal_recipeElement.appendChild(mealElement);
    //show popup
    popup_mealInfo.classList.remove("hidden");
}

popup_closeButton.addEventListener('click', () => {
    popup_mealInfo.classList.add("hidden");
});



