function errorMessage() {
    document.getElementById("output").innerHTML += "This input is not a valid Wordle result. Please try again."
};

function setCookie(cname, cvalue) {
    const d = new Date();
    d.setTime(d.getTime() + (365*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

function updateFromCookie() {
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i=0; i<ca.length; i++) {
        let cki = ca[i].split("=");
        cookie[cki[0]] = cki[1];
    };
};


const results = [];
const cookie = {};
var played;
var streak;
var one;
var two;
var three;
var four;
var five;
var six;
var failure;

document.getElementById("submit").addEventListener("click", () => {
    updateFromCookie();
    var inp = document.getElementById("input").value;
    const blocks = inp.split(" ");
    if (blocks[0] != "Wordle") {
        errorMessage();
        return;
    }
    const lines = blocks[2].split("\n");
    var wordleNum = blocks[1];
    results[wordleNum] = [];
    var score = lines[0].slice(0,1);
    var mode = lines[0].slice(-1);
    var cookieString = score + mode;
    for (let l = 2; l < lines.length - 1; l++) {
        let line = lines[l].split(/.*?/u);
        results[wordleNum][l-2] = 0;
        for (let em = 0; em < 5; em++){
            let eval;
            switch(line[em]){
                case "⬜":
                    eval = 0;
                    break;
                case "🟨":
                    eval = 1;
                    break;
                case "🟩":
                    eval = 2;
                    break;
                default:
                    errorMessage();
            }
            results[wordleNum][l-2] += 3**(4-em) * eval;
        }
        document.getElementById("output").innerHTML += `Line ${l-1}: ${results[wordleNum][l-2].toString(36)}<br>`
        cookieString += `,${results[wordleNum][l-2].toString(36)}`
    }
    document.getElementById("output").innerHTML += `Score: ${score}<br>Wordle: ${wordleNum}`;
    setCookie(`wordle${wordleNum}`,cookieString);
    played++;
    switch(score) {
        case "1":
            streak++;
            one++;
            setCookie("one",one);
            break;
        case "2":
            streak++;
            two++;
            setCookie("two",two);
            break;
        case "3":
            streak++;
            three++;
            setCookie("three",three);
            break;
        case "4":
            streak++;
            four++;
            setCookie("four",four);
            break;
        case "5":
            streak++;
            five++;
            setCookie("five",five);
            break;
        case "6":
            streak++;
            six++;
            setCookie("six",six);
            break;
        case "X":
            streak = 0;
            failure++;
            setCookie("failure", failure);
    }
    setCookie("played",played);
    setCookie("streak",streak);
});