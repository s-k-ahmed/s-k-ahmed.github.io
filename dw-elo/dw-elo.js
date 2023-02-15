if (typeof(Storage) == "undefined") {
    document.getElementById("storage").innerHTML += "<br> Sorry, your browser does not support local storage, so data won't be saved between sessions."
}

function resetClick(start, end, bool) {
    for (ep = start; ep <= end; ep++) {
        episodesWatched[ep] = bool
        document.getElementById("ep" + ep).checked = bool

    }
}
function clickEpCheck(evt) {
    let epnum = evt.currentTarget.episode
    episodesWatched[epnum] = document.getElementById("ep" + epnum).checked
    //document.getElementById("ep-watched-count").innerHTML = epnum + " " + episodesWatched[epnum] + " " + episodesWatched.filter(Boolean).length;
    updateWatchCount();
    saveToStorage();
}
function clickDrCheck(evt) {
    let doctor = evt.currentTarget.doctor
    resetClick(drEps[doctor][0], drEps[doctor][1], document.getElementById("dr" + doctor).checked)
    saveToStorage();
    updateWatchCount();
}
function saveToStorage() {
    jsonWatched = JSON.stringify(episodesWatched);
    localStorage.setItem("eps-watched", jsonWatched);
    jsonNRanked = JSON.stringify(episodesNRanked);
    localStorage.setItem("eps-nranked", jsonNRanked);
    jsonElos = JSON.stringify(episodesElos);
    localStorage.setItem("eps-elos", jsonElos);
}
function getFromStorage() {
    var jsonWatched = localStorage.getItem("eps-watched");
    episodesWatched = JSON.parse(jsonWatched);
    updateWatchCount();
    var jsonNRanked = localStorage.getItem("eps-nranked");
    episodesNRanked = JSON.parse(jsonNRanked);
    var jsonElos = localStorage.getItem("eps-elos");
    episodesElos = JSON.parse(jsonElos);
}
function hideEps() {
    const epList = document.getElementById("ep-list-check");
    if (epList.style.display == "none") {
        epList.style.display = "block";
        document.getElementById("hide-eps").innerHTML = "Hide episodes"
    } else {
        epList.style.display = "none";
        document.getElementById("hide-eps").innerHTML = "Unhide episodes"
    }
}
function hideDrs() {
    drList = document.getElementById("dr-list-check");
    if (drList.style.display == "none") {
        drList.style.display = "block";
        document.getElementById("hide-drs").innerHTML = "Hide Doctors"
    } else {
        drList.style.display = "none";
        document.getElementById("hide-drs").innerHTML = "Unhide Doctors"
    }
}
function updateWatchCount() {
    document.getElementById("ep-watch-count").innerHTML = "Episodes/serials watched: " + episodesWatched.filter(Boolean).length;
}
function initialise() {
    setUp();
    buildChecxLabels();
    updateWatchCount();
    updateRankCount();
    hideDrs();
    hideEps();
}
function resetLocalStorage() {
    for (ep=0; ep<episodeTitles.length; ep++) {
        episodesWatched[ep] = false;
        episodesNRanked[ep] = 0;
        episodesElos[ep] = 1500;
    }
    saveToStorage();
    localStorage.setItem("notfirsttime", "true")
}
function setUp() {
    if (localStorage.getItem("notfirsttime") != "true") {
        resetLocalStorage();
    } else {
        getFromStorage();
    }
}
function buildChecxLabels() {
    const checxArray = [];
    const labepArray = [];
    const drxArray = [];
    const labdrArray = [];
    const epListCheck = document.getElementById("ep-list-check");
    const drListCheck = document.getElementById("dr-list-check");

    for (ep=0; ep<episodeTitles.length; ep++) {
        checxArray[ep] = document.createElement("input");
        epListCheck.appendChild(checxArray[ep]);
        checxArray[ep].type = "checkbox";
        checxArray[ep].id = "ep" + ep;
        checxArray[ep].episode = ep;
        checxArray[ep].addEventListener("click", clickEpCheck);
        checxArray[ep].checked = episodesWatched[ep];
    
        labepArray[ep] = document.createElement("label");
        labepArray[ep].for = "ep" + ep;
        labepArray[ep].id = "ep" + ep + "-lab";
        labepArray[ep].innerHTML = episodeTitles[ep] + "<br>";
        labepArray[ep].episode = ep;
        epListCheck.appendChild(labepArray[ep]);
    }
    
    for (dr=0; dr<doctors.length; dr++) {
        drxArray[dr] = document.createElement("input");
        drListCheck.appendChild(drxArray[dr]);
        drxArray[dr].type = "checkbox";
        drxArray[dr].id = "dr" + dr;
        drxArray[dr].doctor = dr;
        drxArray[dr].addEventListener("click", clickDrCheck);
    
        labdrArray[dr] = document.createElement("label");
        labdrArray[dr].for = "dr" + dr;
        labdrArray[dr].id = "dr" + dr + "-lab";
        labdrArray[dr].innerHTML = doctors[dr] + "<br>";
        labdrArray[dr].episode = dr;
        drListCheck.appendChild(labdrArray[dr]);
    }
}
function newRankOptions() {
    var epsWatchIndices = [];
    episodesWatched.forEach((value, index) => value === true ? epsWatchIndices.push(index) : null)
    epsWatchIndices.sort((a, b) => episodesNRanked[a]*Math.random() - episodesNRanked[b]*Math.random())
    window.optionA = epsWatchIndices[0];
    window.optionB = epsWatchIndices[1];
    document.getElementById("option-1").innerHTML = episodeTitles[optionA];
    document.getElementById("option-2").innerHTML = episodeTitles[optionB];
}
function rankerClick(option) {
    episodesNRanked[window.optionA]++
    episodesNRanked[window.optionB]++
    updateRankCount();
    var eloInitA = episodesElos[window.optionA];
    var eloInitB = episodesElos[window.optionB];
    const kFactor = 10;
    var qA = 10 ** (eloInitA / 400);
    var qB = 10 ** (eloInitB / 400);
    var expScoreA = qA / (qA + qB);
    var expScoreB = qB / (qA + qB);
    var scoreA = 0.5 + (option / 2);
    var scoreB = 0.5 - (option / 2);
    var eloNewA = Math.floor(eloInitA + kFactor * (scoreA - expScoreA));
    var eloNewB = Math.floor(eloInitB + kFactor * (scoreB - expScoreB));
    episodesElos[window.optionA] = eloNewA;
    episodesElos[window.optionB] = eloNewB;
    saveToStorage();
    newRankOptions();
}
function showRankings(){
    document.getElementById("rankings").innerHTML = "Rank \t Rating \t nRanked \t Episode";
    var epsRankIndices = [];
    episodesNRanked.forEach((value, index) => value > 0 ? epsRankIndices.push(index) : null);
    epsRankIndices.sort((a, b) => episodesElos[b] - episodesElos[a]);
    for (index = 0; index < epsRankIndices.length; index++) {
        document.getElementById("rankings").innerHTML += "<br>" + (index + 1) + "\t" + episodesElos[epsRankIndices[index]] + "\t" + episodesNRanked[epsRankIndices[index]] + "\t" + episodeTitles[epsRankIndices[index]];
    }
}
function updateRankCount(){
    var totalNRanked = episodesNRanked.reduce((x, y) => x + y) / 2;
    document.getElementById("rank-count").innerHTML = "Rankings so far: " + totalNRanked;
}

const episodeTitles = [
    "An Unearthly Child",
    "100,000 BC",
    "The Daleks",
    "The Edge of Destruction",
    "Marco Polo",
    "The Keys of Marinus",
    "The Aztecs",
    "The Sensorites",
    "The Reign of Terror",
    "Planet of Giants",
    "The Dalek Invasion of Earth",
    "The Rescue",
    "The Romans",
    "The Web Planet",
    "The Crusade",
    "The Space Museum",
    "The Chase",
    "The Time Meddler",
    "Galaxy 4",
    "Mission to the Unknown",
    "The Myth Makers",
    "The Daleks' Master Plan",
    "The Massacre of St Bartholomew's Eve",
    "The Ark",
    "The Celestial Toymaker",
    "The Gunfighters",
    "The Savages",
    "The War Machines",
    "The Smugglers",
    "The Tenth Planet",
    "The Power of the Daleks",
    "The Highlanders",
    "The Underwater Menace",
    "The Moonbase",
    "The Macra Terror",
    "The Faceless Ones",
    "The Evil of the Daleks",
    "Tomb of the Cybermen",
    "The Abominable Snowmen",
    "The Ice Warriors",
    "Enemy of the World",
    "The Web of Fear",
    "Fury from the Deep",
    "The Wheel in Space",
    "The Dominators",
    "The Mind Robber",
    "The Invasion",
    "The Krotons",
    "The Seeds of Death",
    "The Space Pirates",
    "The War Games",
    "Spearhead from Space",
    "Doctor Who and the Silurians",
    "The Ambassadors of Death",
    "Inferno",
    "Terror of the Autons",
    "The Mind of Evil",
    "The Claws of Axos",
    "Colony in Space",
    "The Dæmons",
    "Day of the Daleks",
    "The Curse of Peladon",
    "The Sea Devils",
    "The Mutants",
    "The Time Monster",
    "The Three Doctors",
    "Carnival of Monsters",
    "Frontier in Space",
    "Planet of the Daleks",
    "The Green Death",
    "The Time Warrior",
    "Invasion of the Dinosaurs",
    "Death to the Daleks",
    "The Monster of Peladon",
    "Planet of the Spiders",
    "Robot",
    "The Ark in Space",
    "The Sontaran Experiment",
    "Genesis of the Daleks",
    "Revenge of the Cybermen",
    "Terror of the Zygons",
    "Planet of Evil",
    "Pyramids of Mars",
    "The Android Invasion",
    "The Brain of Morbius",
    "The Seeds of Doom",
    "The Masque of Mandragora",
    "The Hand of Fear",
    "The Deadly Assassin",
    "The Face of Evil",
    "The Robots of Death",
    "Talons of Weng-Chiang",
    "Horror of Fang Rock",
    "The Invisible Enemy",
    "Image of the Fendahl",
    "The Sun Makers",
    "Underworld",
    "The Invasion of Time",
    "The Ribos Operation",
    "The Pirate Planet",
    "The Stones of Blood",
    "The Androids of Tara",
    "The Power of Kroll",
    "The Armageddon Factor",
    "Destiny of the Daleks",
    "City of Death",
    "Creature from the Pit",
    "Nightmare of Eden",
    "The Horns of Nimon",
    "Shada",
    "The Leisure Hive",
    "Meglos",
    "Full Circle",
    "State of Decay",
    "Warriors' Gate",
    "The Keeper of Traken",
    "Logopolis",
    "Castrovalva",
    "Four to Doomsday",
    "Kinda",
    "The Visitation",
    "Black Orchid",
    "Earthshock",
    "Time-Flight",
    "Arc of Infinity",
    "Snakedance",
    "Mawdryn Undead",
    "Terminus",
    "Enlightenment",
    "The King's Demons",
    "The Five Doctors",
    "Warriors of the Deep",
    "The Awakening",
    "Frontios",
    "Resurrection of the Daleks",
    "Planet of Fire",
    "The Caves of Androzani",
    "The Twin Dilemma",
    "Attack of the Cybermen",
    "Vengeance on Varos",
    "The Mark of the Rani",
    "The Two Doctors",
    "Timelash",
    "Revelation of the Daleks",
    "The Mysterious Planet",
    "Mindwarp",
    "Terror of the Vervoids",
    "The Ultimate Foe",
    "Time and the Rani",
    "Paradise Towers",
    "Delta and the Bannermen",
    "Dragonfire",
    "Remembrance of the Daleks",
    "The Happiness Patrol",
    "Silver Nemesis",
    "Greatest Show in the Galaxy",
    "Battlefield",
    "Ghost Light",
    "The Curse of Fenric",
    "Survival",
    "Doctor Who",
    "Rose",
    "The End of the World",
    "The Unquiet Dead",
    "Aliens of London",
    "Dalek",
    "The Long Game",
    "Father's Day",
    "The Empty Child",
    "Boom Town",
    "Bad Wolf",
    "The Christmas Invasion",
    "New Earth",
    "Tooth and Claw",
    "School Reunion",
    "The Girl in the Fireplace",
    "Rise of the Cybermen",
    "The Idiot's Lantern",
    "The Impossible Planet",
    "Love and Monsters",
    "Fear Her",
    "Doomsday",
    "The Runaway Bride",
    "Smith & Jones",
    "The Shakespeare Code",
    "Gridlock",
    "Evolution of the Daleks",
    "The Lazarus Experiment",
    "42",
    "Human Nature",
    "Blink",
    "Utopia/Last of the Time Lords",
    "Voyage of the Damned",
    "Partners in Crime",
    "The Fires of Pompeii",
    "Planet of the Ood",
    "The Sontaran Stratagem",
    "The Doctor's Daughter",
    "The Unicorn and the Wasp",
    "Silence in the Library",
    "Midnight",
    "Turn Left",
    "Journey's End",
    "The Next Doctor",
    "Planet of the Dead",
    "The Waters of Mars",
    "The End of Time",
    "The Eleventh Hour",
    "The Beast Below",
    "Victory of the Daleks",
    "The Time of Angels",
    "The Vampires of Venice",
    "Amy's Choice",
    "Cold Blood",
    "Vincent and the Doctor",
    "The Lodger",
    "The Big Bang",
    "A Christmas Carol",
    "The Impossible Astronaut",
    "The Curse of the Black Spot",
    "The Doctor's Wife",
    "The Rebel Flesh",
    "A Good Man Goes to War",
    "Let's Kill Hitler",
    "Night Terrors",
    "The Girl Who Waited",
    "The God Complex",
    "Closing Time",
    "The Wedding of River Song",
    "The Doctor, the Widow and the Wardrobe",
    "Asylum of the Daleks",
    "Dinosaurs on a Spaceship",
    "A Town Called Mercy",
    "The Power of Three",
    "The Angels Take Manhattan",
    "The Snowmen",
    "The Bells of Saint John",
    "The Rings of Akhaten",
    "Cold War",
    "Hide",
    "Journey to the Centre of the TARDIS",
    "The Crimson Horror",
    "Nightmare in Silver",
    "The Name of the Doctor",
    "The Day of the Doctor",
    "The Time of the Doctor",
    "Deep Breath",
    "Into the Dalek",
    "Robot of Sherwood",
    "Listen",
    "Time Heist",
    "The Caretaker",
    "Kill the Moon",
    "Mummy on the Orient Express",
    "Flatline",
    "In the Forest of the Night",
    "Death in Heaven",
    "Last Christmas",
    "The Magician's Apprentice",
    "Under the Lake / Before the Flood",
    "The Girl Who Died",
    "The Woman Who Lived",
    "The Zygon Invasion",
    "Sleep No More",
    "Face the Raven",
    "Heaven Sent",
    "Hell Bent",
    "The Husbands of River Song",
    "The Return of Doctor Mysterio",
    "The Pilot",
    "Smile",
    "Thin Ice",
    "Knock Knock",
    "Oxygen",
    "Extremis",
    "The Pyramid at the End of the World",
    "The Lie of the Land",
    "Empress of Mars",
    "The Eaters of Light",
    "World Enough and Time",
    "Twice Upon A Time",
    "The Woman Who Fell to Earth",
    "The Ghost Monument",
    "Rosa",
    "Arachnids in the UK",
    "The Tsuranga Conundrum",
    "Demons of the Punjab",
    "Kerblam!",
    "The Witchfinders",
    "It Takes You Away",
    "The Battle of Ranskoor av Kolos",
    "Resolution",
    "Spyfall",
    "Orphan 55",
    "Nikola Tesla's Night of Terror",
    "Fugitive of the Judoon",
    "Praxeus",
    "Can You Hear Me?",
    "The Haunting of Villa Diodati",
    "Ascension of the Cybermen",
    "Revolution of the Daleks",
    "The Halloween Apocalypse",
    "War of the Sontarans",
    "Once, Upon Time",
    "Village of the Angels",
    "Survivors of the Flux",
    "The Vanquishers",
    "Eve of the Daleks",
    "Legend of the Sea Devils",
    "The Power of the Doctor",
]
const doctors = [
    "First (Hartnell)", 
    "Second (Troughton)", 
    "Third (Pertwee)", 
    "Fourth (Baker)", 
    "Fifth (Davison)", 
    "Sixth (Baker)", 
    "Seventh (McCoy)", 
    "Eighth (McGann)", 
    "Ninth (Eccleston)", 
    "Tenth (Tennant)", 
    "Eleventh (Smith)",
    "Twelfth (Capaldi)",
    "Thirteenth (Whittaker)",
    "Fourteenth (Tennant)",
    "Fifteenth (Gatwa)"
]
const drEps = [
    [0, 29], [30, 50], [51, 74], [75, 116], [117, 136], [137, 147], [148, 159], [160, 160], [161, 170], [171, 206], [207, 245], [246, 280], [281, 309]
]

var episodesWatched = []    // true for episodes marked as watched, false for episodes marked as not watched, null for episodes that haven't been checked or unchecked
var episodesNRanked = []    // number of times the episode has been ranked against another
var episodesElos = []       // elo scores for each episode
var optionA;
var optionB;

initialise();
newRankOptions();

window.addEventListener("keydown", function(event){
    switch (event.code) {
        case "ArrowLeft":
            rankerClick(1);
            break;
        case "ArrowDown":
            rankerClick(0);
            break;
        case "ArrowRight":
            rankerClick(-1);
            break;
    }
})