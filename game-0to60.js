var gameState = [];
var turn = 0;
var round = 0;
var score = [0, 0, 0, 0];
var roundOver = false;


//creating the tiles arrays so they can be referenced later to change images
const tileGroup = ['antiquewhite', 'coral', 'cornflowerblue'];

function changeColor(id, p){
    document.getElementById(id).style.backgroundColor = tileGroup[p];
    document.getElementById(id).style.color = 'white';
};

function updateText(){
    document.getElementById("turn").innerHTML = turn;
    document.getElementById("round1score").innerHTML = `Round 1: A: ${score[0]}, B: ${score[1]}`;
};

function calculateScores(i){
    let player = 2*round+gameState[i]-1;
    let tilePoints = i;
    if (score[player] + tilePoints > 60){
        score[player] = 0;
        roundOver = true;
        round++;
        document.getElementById("nextround").style.display = "flex";
    } else if (score[player] + tilePoints == 60){
        score[player] += tilePoints;
        roundOver = true;
        round++;
        document.getElementById("nextround").style.display = "flex";
    } else {
        score[player] += tilePoints;
    }
}

for (let i = 1; i < 16; i++) {
    gameState[i] = 0;
    document.getElementById(`tile-${i}`).addEventListener("click", () => {
        if (gameState[i] == 0 && roundOver == false) {
            changeColor(`tile-${i}`, turn % 2 + 1);
            gameState[i] = turn % 2 + 1;
            calculateScores(i);
            turn++;
            updateText();
        }
    });
};

// Get the modal
var modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

span.onclick = function() {
    modal.style.display = "none";
  }

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}