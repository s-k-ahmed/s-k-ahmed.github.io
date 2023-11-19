if (typeof(Storage) == "undefined") {
    document.getElementById("storage").textContent += "\nSorry, your browser does not support local storage, so data won't be saved between sessions."
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
    localStorage.setItem("eps-watched-" + extension, jsonWatched);
    jsonNRanked = JSON.stringify(episodesNRanked);
    localStorage.setItem("eps-nranked-" + extension, jsonNRanked);
    jsonElos = JSON.stringify(episodesElos);
    localStorage.setItem("eps-elos-" + extension, jsonElos);
}
function getFromStorage() {
    let jsonWatched = localStorage.getItem("eps-watched-" + extension);
    episodesWatched = JSON.parse(jsonWatched);
    updateWatchCount();
    let jsonNRanked = localStorage.getItem("eps-nranked-" + extension);
    episodesNRanked = JSON.parse(jsonNRanked);
    let jsonElos = localStorage.getItem("eps-elos-" + extension);
    episodesElos = JSON.parse(jsonElos);
}
function hideEps() {
    const epList = document.getElementById("ep-list-check");
    if (epList.style.display == "none") {
        epList.style.display = "block";
        document.getElementById("hide-eps").textContent = "Hide episodes"
    } else {
        epList.style.display = "none";
        document.getElementById("hide-eps").textContent = "Show episodes"
    }
}
function hideDrs() {
    drList = document.getElementById("dr-list-check");
    if (drList.style.display == "none") {
        drList.style.display = "block";
        document.getElementById("hide-drs").textContent = "Hide " + docOrSeries;
    } else {
        drList.style.display = "none";
        document.getElementById("hide-drs").textContent = "Show " + docOrSeries;
    }
}
function updateWatchCount() {
    document.getElementById("ep-watch-count").textContent = "Episodes/serials watched: " + episodesWatched.filter(Boolean).length;
}
function initialise() {
    setUp();
    buildChecxLabels();
    updateWatchCount();
    updateRankCount();
    hideDrs();
    hideEps();
    hideRankings();
    hideDrRankings();
}
function resetLocalStorage() {
    for (ep=0; ep<episodeTitles.length; ep++) {
        episodesWatched[ep] = false;
        episodesNRanked[ep] = 0;
        episodesElos[ep] = 1500;
    }
    saveToStorage();
    localStorage.setItem("notfirsttime-" + extension, "true")
}
function setUp() {
    if (localStorage.getItem("notfirsttime-" + extension) != "true") {
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
        labepArray[ep].textContent = episodeTitles[ep];
        labepArray[ep].episode = ep;
        epListCheck.appendChild(labepArray[ep]);
        epListCheck.append(document.createElement("br"));
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
        labdrArray[dr].textContent = doctors[dr];
        labdrArray[dr].episode = dr;
        drListCheck.appendChild(labdrArray[dr]);
        drListCheck.append(document.createElement("br"));
    }
}
function newRankOptions() {
    let epsWatchIndices = [];
    episodesWatched.forEach((value, index) => value === true ? epsWatchIndices.push(index) : null)
    epsWatchIndices.sort((a, b) => (Math.random()*((episodesNRanked[a]+1)**3)) - (Math.random()*((episodesNRanked[b]+1)**3)))
    let index1 = 0;
    let index2 = 1 + Math.floor(Math.random() * (epsWatchIndices.length - 1));
    if (Math.random() > .5) {
        [index1, index2] = [index2, index1];
    }
    optionA = epsWatchIndices[index1];
    optionB = epsWatchIndices[index2];
    document.getElementById("option-1").textContent = episodeTitles[optionA];
    document.getElementById("option-2").textContent = episodeTitles[optionB];
}
function rankerClick(option) {
    episodesNRanked[optionA]++
    episodesNRanked[optionB]++
    updateRankCount();
    let eloInitA = episodesElos[optionA];
    let eloInitB = episodesElos[optionB];
    const kFactor = 10;
    let qA = 10 ** (eloInitA / 400);
    let qB = 10 ** (eloInitB / 400);
    let expScoreA = qA / (qA + qB);
    let expScoreB = qB / (qA + qB);
    let scoreA = 0.5 + (option / 2);
    let scoreB = 0.5 - (option / 2);
    let eloNewA = Math.round(eloInitA + kFactor * (scoreA - expScoreA));
    let eloNewB = Math.round(eloInitB + kFactor * (scoreB - expScoreB));
    episodesElos[optionA] = eloNewA;
    episodesElos[optionB] = eloNewB;
    saveToStorage();
    updateEpRankings();
    updateDrRankings();
    newRankOptions();
}
function hideRankings(){
    updateEpRankings();
    const epRank = document.getElementById("ep-rankings");
    if (epRank.style.display == "none") {
        epRank.style.display = "block";
        document.getElementById("view-rankings").textContent = "Hide rankings"
    } else {
        epRank.style.display = "none";
        document.getElementById("view-rankings").textContent = "Show rankings"
    }
}
function hideDrRankings(){
    updateDrRankings();
    const drRank = document.getElementById("dr-rankings");
    if (drRank.style.display == "none") {
        drRank.style.display = "block";
        document.getElementById("view-dr-rankings").textContent = "Hide rankings by " + docOrSeries
    } else {
        drRank.style.display = "none";
        document.getElementById("view-dr-rankings").textContent = "Show rankings by " + docOrSeries
    }
}
function updateEpRankings(){
    document.getElementById("ep-rankings").textContent = "Rank \t Rating \t nRanked \t Episode";
    let epsRankIndices = [];
    episodesNRanked.forEach((value, index) => value > 0 && episodesWatched[index] == true ? epsRankIndices.push(index) : null);
    epsRankIndices.sort((a, b) => episodesElos[b] - episodesElos[a]);
    for (index = 0; index < epsRankIndices.length; index++) {
        document.getElementById("ep-rankings").textContent += "\n" + (index + 1) + "\t" + episodesElos[epsRankIndices[index]] + "\t" + episodesNRanked[epsRankIndices[index]] + "\t" + episodeTitles[epsRankIndices[index]];
    }
}
function updateDrRankings(){
    document.getElementById("dr-rankings").textContent = "Rank \t avg Rating \t " + docOrSeries;
    const drEloMeans = [];
    let drIndices = [];
    for (dr=0; dr < doctors.length; dr++) {
        drIndices[dr] = dr;
        let drEpIndices = [];
        let drFirst = drEps[dr][0];
        let drLast = drEps[dr][1];
        for (ep=0; ep < episodesNRanked.length; ep++) {
            if (episodesNRanked[ep] > 0 && ep >= drFirst && ep <= drLast) {
                drEpIndices.push(ep);
            }
        }
        const drWatchedElos = drEpIndices.map(value => episodesElos[value]);
        drEloMeans[dr] = Math.round(drWatchedElos.reduce((x, y) => x + y, 0) / drEpIndices.length);
    }
    let drIndFilt = drIndices.filter(x => !isNaN(drEloMeans[x]))
    drIndFilt.sort((a, b) => drEloMeans[b] - drEloMeans[a]);
    for (index = 0; index < drIndFilt.length; index++) {
        document.getElementById("dr-rankings").textContent += "\n" + (index + 1) + "\t" + drEloMeans[drIndFilt[index]] + "\t" + doctors[drIndFilt[index]];
    }
}
function updateRankCount(){
    let totalNRanked = episodesNRanked.reduce((x, y) => x + y) / 2;
    document.getElementById("rank-count").textContent = "Rankings so far: " + totalNRanked;
}
function importBackup(){
    
}

let episodesWatched = []    // true for episodes marked as watched, false for episodes not marked as watched
let episodesNRanked = []    // number of times the episode has been ranked against another
let episodesElos = []       // elo scores for each episode
let optionA;
let optionB;

importBackup();
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