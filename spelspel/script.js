// Initialises global variables
let dateUnix = Math.floor(Date.now()/(1000*60*60*24));
var WOORD;
var CENTRAALINDEX;
var CENTRAALLETTER;
const WOORDLETTERS = [];
const alphletters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
var GUESSES = [];
var ANTWOORDEN = [];
var scoreHistory = [];
const shuffle = [0, 1, 2, 3, 4, 5, 6];
var answersShown = false;

if (typeof(Storage) == "undefined") {
    alert("Sorry, your browser does not support local storage, so data won't be saved between sessions.")
}

// Chooses a word and central letter based on the current day
selectWord(dateUnix);
testOutput(scoreHistory);

// Sets up word submission on pressing Enter and shuffle on pressing Space
document.getElementById("woord-input").addEventListener("keydown", function(event){
    if (event.key === "Enter") {
        submitWord();
    }
    if (event.code === "Space") {
        event.preventDefault();
        shuffleLetters();
    }
});

// Prints the variable x on the HTML page (used for testing/debugging)
function testOutput(x) {
    document.getElementById("test").innerHTML += x + "<br>";
}

// Prints the variable x in the output section and word count in the wordcount section
function printOutput(x) {
    if (isPangram(x)) {
        document.getElementById("output").innerHTML = "<b>" + x + "</b><br>" + document.getElementById("output").innerHTML;
    } else {
        document.getElementById("output").innerHTML = x + "<br>" + document.getElementById("output").innerHTML;
    }
    document.getElementById("woordtel").innerHTML = "Je hebt vandaag al <b>" + GUESSES.length + "</b> woorden gevonden."
}

// Prints the variable x as an invalid error message
function printError(x) {
    document.getElementById("invalid-guess").innerHTML = x;
}

// TO-DO? Checks if the date matches the cached data, if not it deletes the previous day's info
function checkDate(){

}

// Saves today's guesses to local storage
function savetoStorage() {
    localStorage.setItem("date", dateUnix);
    let jsonGuesses = JSON.stringify(GUESSES);
    localStorage.setItem("guesses", jsonGuesses);
}

// Retrieves today's guesses from local storage
function getfromStorage(d) {
    let jsonDate = localStorage.getItem("date");
    let jsonGuesses = localStorage.getItem("guesses");
    let jsonScoreHistory = localStorage.getItem("score-hist");
    if (jsonDate == null || jsonGuesses == null || jsonScoreHistory == null) {
        return;
    }
    scoreHistory = JSON.parse(jsonScoreHistory);
    if (jsonDate == d) {
        GUESSES = JSON.parse(jsonGuesses);
        GUESSES.forEach(g => printOutput(g));
    } else {
        localStorage.clear("answers");
        let prevGuesses = JSON.parse(jsonGuesses);
        scoreHistory.push(prevGuesses.length);
        let jsonScoreHistory = JSON.stringify(scoreHistory);
        localStorage.setItem("score-hist", jsonScoreHistory);   // Sets score history in local storage only on a new day
    }
}

// Uses the day seed to select a pangram word and central letter
function selectWord(d) {
    getfromStorage(d);
    let woordnummer = (d ** 3) % ZEVENS.length;
    CENTRAALINDEX = (d ** 23) % 7;  // 23rd power gives equal probability for each of the 7 letters
    WOORD = ZEVENS[woordnummer];
    alphletters.forEach((value) => WOORD.indexOf(value) != -1 ? WOORDLETTERS.push(value) : null);   // Goes through the alphabet in order and adds the letters of the chosen word to the array WOORDLETTERS
    CENTRAALLETTER = WOORDLETTERS[CENTRAALINDEX];
    [shuffle[0], shuffle[CENTRAALINDEX]] = [shuffle[CENTRAALINDEX], shuffle[0]] // Swaps the central letter index to the front so it can be avoided during shuffling
    findSols();
    shuffleLetters();
    savetoStorage();
};

function isPangram(w) {
    let guessLetters = [];
    alphletters.forEach((value) => w.indexOf(value) != -1 ? guessLetters.push(value) : null);   // Creates array of letters in the guess
    return (guessLetters.length == 7);
};

// Finds all solutions to today's puzzle and saves them in the array ANTWOORDEN + local storage (only done once per day)
function findSols() {
    let jsonAnswers = localStorage.getItem("answers");
    if (jsonAnswers != null) {
        ANTWOORDEN = JSON.parse(jsonAnswers);
        return;
    }
    WOORDEN.forEach(x => checkWord(x) ? ANTWOORDEN.push(x) : null);
    jsonAnswers = JSON.stringify(ANTWOORDEN);
    localStorage.setItem("answers", jsonAnswers);
}

// Prints the list of possible answers
function showAnswers() {
    document.getElementById("antwoorden").innerHTML = "";
    if (answersShown) {
        document.getElementById("show-answers").innerHTML = "Show answers";
        answersShown = false;
        return;
    }
    document.getElementById("show-answers").innerHTML = "Hide answers";
    document.getElementById("antwoorden").innerHTML = "Er staan <b>" + ANTWOORDEN.length + "</b> mogelijke antwoorden in ons woordenlijst.<br>";
    ANTWOORDEN.forEach(x => {
        if (isPangram(x)) {
            document.getElementById("antwoorden").innerHTML += "<b>" + x + "</b><br>";
        } else {
            document.getElementById("antwoorden").innerHTML += x + "<br>";
        }
    });
    answersShown = true;
}; 

// Checks to see if the input is a valid guess
function checkWord(w) {
    // Is it part of the array WOORDEN? (which includes all words with 4+ letters)
    let isWord = WOORDEN.some(x => x === w);

    // Does it only contain the letters given in the puzzle? Does it contain the central letter?
    let guessLetters = [];
    alphletters.forEach((value) => w.indexOf(value) != -1 ? guessLetters.push(value) : null);   // Creates array of letters in the guess
    let hasValidLetters = guessLetters.every((value) => WOORDLETTERS.indexOf(value) != -1);     // Returns FALSE if any letter in the guess is not in the pangram
    if (hasValidLetters == false) {
        return false;
    }
    let hasCentral = (guessLetters.indexOf(CENTRAALLETTER) != -1);                              // Returns FALSE if the central letter is missing
    if (hasCentral == false) {
        return false;
    }
    let isValid = (hasValidLetters && hasCentral);

    // Has this word already been guessed?
    let newguess = GUESSES.reduce((total, current) => current == w ? total + 1 : total, 0);     // Counts how many times this guess has been made already (incl. this time)
    let isNew = (newguess == 0);

    let isNewValidWord = (isWord && isValid && isNew);
    return isNewValidWord;
};

// Adds letters to input on button press
function buttonPress(l) {
    document.getElementById("woord-input").value += WOORDLETTERS[shuffle[l]];
};

// Delete the last letter inputted
function backspace() {
    let inputbox = document.getElementById("woord-input");
    inputbox.value = inputbox.value.slice(0, inputbox.value.length - 1);
}

// Takes guess, checks if it is valid, then prints it/an error message and saves it to local storage.
function submitWord() {
    var guess = document.getElementById("woord-input").value;
    printError("");
    document.getElementById("woord-input").value = "";
    var guess_valid = checkWord(guess);
    if (guess_valid == false) {
        printError("Invalid guess, please try again!");
        return;
    }
    GUESSES.push(guess);
    printOutput(guess);
    savetoStorage();
    document.getElementById("woord-input").click();
}

// Labels a button with the appropriate letter in the shuffle array
function assignLetter(l) {
    document.getElementById("letter"+l).value = WOORDLETTERS[shuffle[l]];
}

// Shuffles the shuffle array, excluding the first/central letter, and assigns them to the buttons
function shuffleLetters(){
    shuffle.shift();                    // Removes first/central letter
    for (let i = shuffle.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffle[i], shuffle[j]] = [shuffle[j], shuffle[i]];
    }
    shuffle.unshift(CENTRAALINDEX);     // Replaces first/central letter
    shuffle.forEach((value) => assignLetter(value));
}