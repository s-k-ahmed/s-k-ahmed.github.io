// Initialises global variables
let dateUnix = Math.floor(Date.now()/(1000*60*60*24));
var WOORD;
var CENTRAALINDEX;
var CENTRAALLETTER;
const WOORDLETTERS = [];
const alphletters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
const GUESSES = [];
const shuffle = [0, 1, 2, 3, 4, 5, 6];

// Chooses a word and central letter based on the current day
selectWord(dateUnix);

// Sets up word submission on pressing Enter
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
    document.getElementById("output").innerHTML += x + "<br>";
}

// TO-DO: Checks if the date matches the cached data, if not it deletes the previous day's info
function checkDate(){

}

// TO-DO: Saves today's guesses to local storage
function savetoStorage() {
    
}

// TO-DO: Retrieves today's guesses from local storage
function getfromStorage() {
    
}

// Uses the day seed to select a pangram word and central letter
function selectWord(d) {
    let woordnummer = (d ** 3) % ZEVENS.length;
    CENTRAALINDEX = (d ** 23) % 7;  // 23rd power gives equal probability for each of the 7 letters
    WOORD = ZEVENS[woordnummer];
    alphletters.forEach((value) => WOORD.indexOf(value) != -1 ? WOORDLETTERS.push(value) : null);   // Goes through the alphabet in order and adds the letters of the chosen word to the array WOORDLETTERS
    CENTRAALLETTER = WOORDLETTERS[CENTRAALINDEX];
    [shuffle[0], shuffle[CENTRAALINDEX]] = [shuffle[CENTRAALINDEX], shuffle[0]] // Swaps the central letter index to the front so it can be avoided during shuffling
    shuffleLetters();
};

// TO-DO: Finds solutions for today's word
function findSol() {

}; 

// Checks to see if the input is a valid guess
function checkWord(w) {
    // Is it part of the array WOORDEN? (which includes all words with 4+ letters)
    let isWord = WOORDEN.some(x => x === w);

    // Does it only contain the letters given in the puzzle? Does it contain the central letter?
    let guessLetters = [];
    alphletters.forEach((value) => w.indexOf(value) != -1 ? guessLetters.push(value) : null);   // Creates array of letters in the guess
    let hasValidLetters = guessLetters.every((value) => WOORDLETTERS.indexOf(value) != -1);     // Returns FALSE if any letter in the guess is not in the pangram
    let hasCentral = (guessLetters.indexOf(CENTRAALLETTER) != -1);                              // Returns FALSE if the central letter is missing
    let isValid = (hasValidLetters && hasCentral);

    // Has this word already been guessed?
    let newguess = GUESSES.reduce((total, current) => current == w ? total + 1 : total, 0);     // Counts how many times this guess has been made already (incl. this time)
    let isNew = (newguess == 1);

    let isNewValidWord = (isWord && isValid && isNew);
    return isNewValidWord;
};

// Adds letters to input on button press
function buttonPress(l) {
    document.getElementById("woord-input").value += WOORDLETTERS[shuffle[l]];
};

// Takes guess, checks if it is valid, then prints it/an error message.
function submitWord() {
    var guess = document.getElementById("woord-input").value;
    GUESSES.push(guess);
    document.getElementById("invalid-guess").innerHTML = "";
    document.getElementById("woord-input").value = "";
    var guess_valid = checkWord(guess);
    if (guess_valid == false) {
        document.getElementById("invalid-guess").innerHTML = "Invalid guess, please try again!";
        return;
    }
    document.getElementById("output").innerHTML += "<br>" + guess;
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