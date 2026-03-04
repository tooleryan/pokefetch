// Global
var pokemonCache = {};
var currentPokemon = null;
var team = [];

// Onload
window.onload = function () {
  loadTeam();
  renderTeam();

  document.getElementById("findButton").onclick = fetchPokemon;
  document.getElementById("addToTeamButton").onclick = addToTeam;

  // Search
  document.getElementById("pokemonInput").onkeydown = function (event) {
    if (event.key === "Enter") {
      fetchPokemon();
    }
  };

  // Empty moves
  fillMoveSelect("moveSelect1", []);
  fillMoveSelect("moveSelect2", []);
  fillMoveSelect("moveSelect3", []);
  fillMoveSelect("moveSelect4", []);

};

// Message
function setMessage(text) {
  document.getElementById("message").innerText = text;
}

// Cache key
function getStorageKey(query) {
  return "pokemonCache_" + query;
}

// Retrieve cache
function getCachedPokemon(query) {
  if (pokemonCache[query]) {
    return pokemonCache[query];
  }

  // localStorage cache
  var storageKey = getStorageKey(query);
  var storedText = localStorage.getItem(storageKey);

  if (storedText) {
    try {
      var storedObject = JSON.parse(storedText);
      pokemonCache[query] = storedObject;
      return storedObject;
    } catch (error) {
      localStorage.removeItem(storageKey);
    }
  }

  return null;
}

// Save the cache
function saveCachedPokemon(query, data) {
  pokemonCache[query] = data;
  localStorage.setItem(getStorageKey(query), JSON.stringify(data));
}

// Get pokemon
async function fetchPokemon() {
  var query = document.getElementById("pokemonInput").value.trim().toLowerCase();

	// Try cache first
  var cachedData = getCachedPokemon(query);
  if (cachedData) {
    currentPokemon = cachedData;
    renderPokemon(cachedData);
    return;
  }

	// Get from API
  try {
    var url = "https://pokeapi.co/api/v2/pokemon/" + query;
    var response = await fetch(url);

    if (!response.ok) {
      setMessage("Pokemon not found. Try a different name or ID.");
      return;
    }

    var data = await response.json();

    saveCachedPokemon(query, data);

    currentPokemon = data;
    renderPokemon(data);
  } catch (error) {
  }
}

// Rendering
function renderPokemon(data) {
	// Image
  var pokemonImage = document.getElementById("pokemonImage");

  var officialArtwork = "";
  if (
    data.sprites &&
    data.sprites.other &&
    data.sprites.other["official-artwork"] &&
    data.sprites.other["official-artwork"].front_default
  ) {
    officialArtwork = data.sprites.other["official-artwork"].front_default;
  }

  var basicSprite = "";
  if (data.sprites && data.sprites.front_default) {
    basicSprite = data.sprites.front_default;
  }

  pokemonImage.src = officialArtwork || basicSprite || "";
  pokemonImage.alt = data.name || "Pokemon image";

  // Audio
  var pokemonAudio = document.getElementById("pokemonAudio");
  var cryUrl = "";

  if (data.cries && data.cries.latest) {
    cryUrl = data.cries.latest;
  } else if (data.cries && data.cries.legacy) {
    cryUrl = data.cries.legacy;
  }

  if (cryUrl) {
    pokemonAudio.src = cryUrl;
    pokemonAudio.load();
  } else {
    pokemonAudio.removeAttribute("src");
    pokemonAudio.load();
  }

  // Moves Selections
  var moveNames = [];
  for (var i = 0; i < data.moves.length; i++) {
    moveNames.push(data.moves[i].move.name);
  }

  fillMoveSelect("moveSelect1", moveNames);
  fillMoveSelect("moveSelect2", moveNames);
  fillMoveSelect("moveSelect3", moveNames);
  fillMoveSelect("moveSelect4", moveNames);
}

// Move list
function fillMoveSelect(selectId, moveNames) {
  var select = document.getElementById(selectId);
  select.innerHTML = "";

  // Blank
  var defaultOption = document.createElement("option");
  defaultOption.value = "";
  select.appendChild(defaultOption);

  // Move options
  for (var i = 0; i < moveNames.length; i++) {
    var option = document.createElement("option");
    option.value = moveNames[i];
    option.innerText = moveNames[i];
    select.appendChild(option);
  }
}

// Add to Team
function addToTeam() {
  // Need pokemon to add
  if (!currentPokemon) {
    setMessage("Search for a pokemon first.");
    return;
  }

  // Size limit
  if (team.length >= 6) {
    setMessage("Team is full (6 Pokemon).");
    return;
  }

  // Record moves
  var move1 = document.getElementById("moveSelect1").value;
  var move2 = document.getElementById("moveSelect2").value;
  var move3 = document.getElementById("moveSelect3").value;
  var move4 = document.getElementById("moveSelect4").value;

  // Check for 4 moves
  if (move1 === "" || move2 === "" || move3 === "" || move4 === "") {
    setMessage("You must choose 4 moves.");
    return;
  }

  // Teamlist sprite
  var teamSpriteUrl = "";
  if (currentPokemon.sprites && currentPokemon.sprites.front_default) {
    teamSpriteUrl = currentPokemon.sprites.front_default;
  }

  // Build entry
  var teamEntry = {
    name: currentPokemon.name,
    sprite: teamSpriteUrl,
    moves: [move1, move2, move3, move4]
  };


  // Save and display
  setMessage("");
  team.push(teamEntry);
  saveTeam();
  renderTeam();

}

// Render Team
function renderTeam() {
  var teamList = document.getElementById("teamList");
  teamList.innerHTML = "";

  // Build rows
  for (var i = 0; i < team.length; i++) {
    var row = document.createElement("div");
    row.className = "teamRow";

    // Sprite
    var sprite = document.createElement("img");
    sprite.className = "teamSprite";
    sprite.src = team[i].sprite;
    sprite.alt = team[i].name;

    // Moves list
    var movesList = document.createElement("ul");
    movesList.className = "teamMoves";

    for (var m = 0; m < team[i].moves.length; m++) {
      var li = document.createElement("li");
      li.innerText = team[i].moves[m];
      movesList.appendChild(li);
    }

    row.appendChild(sprite);
    row.appendChild(movesList);
    teamList.appendChild(row);
  }
}

// Save Team
function saveTeam() {
  localStorage.setItem("team", JSON.stringify(team));
}

// Load Team
function loadTeam() {
  var storedTeamText = localStorage.getItem("team");

  if (storedTeamText) {
    try {
      team = JSON.parse(storedTeamText);
    } catch (error) {
      team = [];
      localStorage.removeItem("team");
    }
  }
}