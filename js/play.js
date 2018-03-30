let round = 1;
let isHost = false;

let startRoundAsHost = function (key) {
    isHost = true;
    //skapa en scoreBoard med närvarande spelare.
    if (round == 1) {
        openWindow("playScreen");
        drawScoreBoard(key)
    }

    randomWord = (Math.floor(Math.random() * 6) + 1)


    db.ref(`words/${randomWord}`).once("value", function (snapshot) {
        let data = snapshot.val()


        db.ref(`previousGames/${key}/rounds/${round}/word`).set(data);
        drawWord(key, data)
    })


    //lyssna på /previousGames/key/players///ALLA///points.


    //slumpa fram ett ord ur db.
    //pusha in ordet på förstaplats på previousGames/key/round$1/word
    //visa ordet

    //Pusha in UID:explanation i //previousGames/key/round1/explanations
    //lyssna så att svar == spelare.length på previousGames/key/round$1/explanations

    //visa alla explanations
    //pusha in egen_uid:uid_på_den_man_gissat_på i previousGames/key/round$1/guesses.
    //lyssna så att previousGames/key/round/$1/guesses.length == players.length

    //once på previousGames/key/round$1/guesses/
    //dela ut poäng.
    //3p om man gissar rätt 1p om nån gissar på ditt alternativ.



    //kolla om någon har vunnit
    //sätt round-variabeln till 1 igen.

}


let startRoundAsJoined = function (key) {
    isHost = false;

    if (round == 1) {
        openWindow("playScreen");
        drawScoreBoard(key)
    }

    db.ref(`previousGames/${key}/rounds/${round}/word`).on("value", function (snapshot) {
        
        let data = snapshot.val();
        
        if(data){
            drawWord(key, data)
        }
    })

    //lyssna efter previous/key/words child_added
    //visa senaste ordet

    //lyssna så att svar == spelare.length på previousGames/key/round$1/guesses

    //visa alla gissningar

}




let drawScoreBoard = function (key) {
    db.ref(`previousGames/${key}/players`).once("value", function (snapshot) {
        let data = snapshot.val();

        let scoreBoard = document.getElementById("scoreBoard");

        while (scoreBoard.firstChild) {
            scoreBoard.removeChild(scoreBoard.firstChild);
        }

        for (let i in data) {

            let playerDiv = document.createElement("div");

            let playerAvatar = document.createElement("img");
            playerAvatar.src = `resources/${data[i].avatar}.svg`;
            playerDiv.appendChild(playerAvatar);

            let pointsP = document.createElement("p");
            pointsP.innerText = "0";
            pointsP.id = `pointsP${i}`

            pointsP.style.color = setColorByAvatar(data[i].avatar);
            playerDiv.appendChild(pointsP);

            let barDiv = document.createElement("div");

            let pointsDiv = document.createElement("div");
            pointsDiv.id = `pointsDiv${i}`;
            pointsDiv.style.background = setGradientByAvatar(data[i].avatar);

            barDiv.appendChild(pointsDiv);
            playerDiv.appendChild(barDiv);

            scoreBoard.appendChild(playerDiv);
        }

    });
}

let drawWord = function (key, data) {

    let guessWord = document.createElement("div");
    guessWord.id = "guessWord";
    document.getElementById("playScreen").appendChild(guessWord);
    let h1 = document.createElement("h1")
   
    h1.innerText = Object.keys(data);
    guessWord.appendChild(h1)

    let textArea = document.createElement("textarea");
    textArea.placeholder = "Det betyder..";
    textArea.rows = 5;
    textArea.cols = 40;
    guessWord.appendChild(textArea);

    let button = document.createElement("button");
    button.innerText = "KLAR";

    let waitingForPlayersDiv = document.createElement("div");
    waitingForPlayersDiv.id = "waitingForPlayers";

    button.onclick = function () {

        if (textArea.value.length < 10) {
            textArea.value = "";
            textArea.placeholder = "Beskrivningen är för kort.";
            return;
        } else {
            db.ref(`previousGames/${key}/rounds/${round}/descriptions/${userObj.uid}`).set(textArea.value, function (error) {
                if (error) {

                } else {
                    button.style.transform = "scalex(0)";
                    h1.style.opacity = 0;
                    textArea.style.opacity = 0;
                    window.setTimeout(function () {
                        while (guessWord.lastChild) {
                            guessWord.removeChild(guessWord.lastChild);
                        }
                        guessWord.appendChild(waitingForPlayersDiv);
                        guessOnDescriptions(key);
                    }, 700);
                }
            });
        }



    }
    document.getElementById("guessWord").appendChild(button);
}

let guessOnDescriptions = function (key) {

    db.ref(`previousGames/${key}/players`).once("value", function (snapshot) {

        let playersData = snapshot.val()
        let numberOfPlayers = Object.keys(playersData).length

        db.ref(`previousGames/${key}/rounds/${round}/descriptions`).on("value", function (snapshot) {
            let desc = snapshot.val();

            let numberOfDescriptions = Object.keys(desc).length

            if (numberOfDescriptions == numberOfPlayers) {

                document.getElementById("waitingForPlayers").style.opacity = 0;

                window.setTimeout(function () {

                    document.getElementById("playScreen").removeChild(document.getElementById("guessWord"))

                    let guessDesc = document.createElement("div");
                    guessDesc.id = "guessDesc";
                    let h3 = document.createElement("h3");
                    h3.id = "descHeader";
                    h3.innerText = "Gissa vad du tror att ordet betyder."
                    guessDesc.appendChild(h3);

                    document.getElementById("playScreen").appendChild(guessDesc);


                    let optionsArray = []

                    db.ref(`previousGames/${key}/rounds/${round}/word`).once("value", function (snapshot) {
                        let correctWord = snapshot.val()


                        let button = document.createElement("button");
                        button.innerText = correctWord[Object.keys(correctWord)[0]];
                        button.classList.add("descOpt");
                        button.id = `desccorrectWord`

                        button.onclick = function () {
                            button.style.borderColor = "#51C651";
                            db.ref(`previousGames/${key}/rounds/${round}/guesses/${userObj.uid}`).set("correctWord")

                            window.setTimeout(function () {

                                let buttons = document.getElementsByClassName("descOpt")
                                document.getElementById("descHeader").style.transform = "scaleX(0)";
                                for (i = 0; i < buttons.length; i++) {
                                    buttons[i].style.transform = "scaleX(0)";
                                    buttons[i].onclick = null;
                                }

                            }, 500);
                            distributePoints(key, numberOfPlayers);

                        }


                        optionsArray.push(button);

                        for (let i in desc) {
                            let button = document.createElement("button");
                            button.innerText = desc[i];
                            button.classList.add("descOpt");
                            button.id = `desc${i}`
                            button.onclick = function () {

                                button.style.borderColor = "#51C651";
                                db.ref(`previousGames/${key}/rounds/${round}/guesses/${userObj.uid}`).set(i)

                                window.setTimeout(function () {

                                    let buttons = document.getElementsByClassName("descOpt")

                                    document.getElementById("descHeader").style.transform = "scaleX(0)";
                                    for (i = 0; i < buttons.length; i++) {
                                        buttons[i].style.transform = "scaleX(0)";
                                        buttons[i].onclick = null;
                                    }

                                }, 500);

                                distributePoints(key, numberOfPlayers);

                            }
                            optionsArray.push(button);

                        }
                        let tempLength = optionsArray.length;
                        for (var i = 0; i < tempLength; i++) {

                            let tempRandom = Math.floor(Math.random() * (optionsArray.length))

                            guessDesc.appendChild(optionsArray[tempRandom]);
                            optionsArray.splice(tempRandom, 1);
                        }
                    });
                }, 700)
            }
        })
    })
}

let distributePoints = function (key, numberOfPlayers) {

    db.ref(`previousGames/${key}/rounds/${round}/guesses/`).on("value", function (snapshot) {
        let guessesData = snapshot.val();

        if (Object.keys(guessesData).length == numberOfPlayers) {


            if (isHost) {

                for (let i in guessesData) {

                    if (guessesData[i] != "correctWord") {
                        db.ref(`previousGames/${key}/players/${guessesData[i]}/points`).transaction(function (points) {
                            if (points) {
                                points = points + 1
                            } else {
                                points = 1
                            }
                            return points;
                        })
                    } else {
                        db.ref(`previousGames/${key}/players/${i}/points`).transaction(function (points) {
                            if (points) {
                                points = points + 3
                            } else {
                                points = 3
                            }
                            return points;
                        })
                    }
                }
            }
            db.ref(`previousGames/${key}/players`).on("value", function (snapshot) {
                let data = snapshot.val()
                let winner = {};
                let winnerNumber = 1;
                for (let i in data) {
                    if (data[i].points) {

                        if (data[i].points >= 10) {
                            winner[winnerNumber++] = data[i];
                        }
                        document.getElementById(`pointsP${i}`).innerText = data[i].points;
                        document.getElementById(`pointsDiv${i}`).style.width = `${(data[i].points * 10)}%`;
                    }
                }
                if (Object.keys(winner).length > 0) {
                    presentWinner(winner);
                    return;
                }
            })

            db.ref(`previousGames/${key}`).once("value", function (snapshot) {

                let data = snapshot.val()
                let guessDesc = document.getElementById("guessDesc")

                let buttons = document.getElementsByClassName("descOpt");

                window.setTimeout(function () {
                    document.getElementById("descHeader").innerText = "Så här gissade ni"
                    document.getElementById("descHeader").style.transform = "scaleX(1)";
                    for (i = 0; i < buttons.length; i++) {
                        buttons[i].style.transform = "scaleX(1)";
                        if (buttons[i].id == "desccorrectWord") {

                            buttons[i].style.backgroundColor = "#C0FFC4";
                            buttons[i].style.borderColor = "#80A3BE";
                        } else {

                            buttons[i].style.borderColor = setColorByAvatar(data.players[buttons[i].id.substring(4, buttons[i].id.length)].avatar)
                            //sätt så att avataren kommer upp på det alternativ man valt.

                        }
                        let guesses = data.rounds[round].guesses;

                        for (let j in guesses) {
                            if (buttons[i].id.substring(4, buttons[i].id.length) == guesses[j]) {
                                buttons[i].innerHTML += `<img src="resources/${data.players[j].avatar}.svg" />`
                            }
                        }
                    }
                }, 1000);
            })

            window.setTimeout(function () {

                let guessDesc = document.getElementById("guessDesc");
                while (guessDesc.firstChild) {
                    guessDesc.removeChild(guessDesc.firstChild);
                }

                document.getElementById("playScreen").removeChild(guessDesc);

                round++;
                if (isHost) {
                    startRoundAsHost(key);
                } else {
                    startRoundAsJoined(key);
                }
            }, 5000)

        }
    })
}

let presentWinner = function (winner) {
    winnerScreen = document.getElementById("winnerScreen");
    console.log(Object.keys(winner).length)
    
    while(winnerScreen.firstChild){
        winnerScreen.removeChild(winnerScreen.firstChild)
    }
    
    while(playScreen.children[1]){
        playScreen.removeChild(playScreen.children[1]);
    }
    
    let h2 = document.createElement("h2");
    h2.innerText = "VINNARE";
    winnerScreen.appendChild(h2);
    
    for(i=1; i <= Object.keys(winner).length; i++){
        
        console.log(winner);
        console.log(winner[i].displayName);
        
        let h3 = document.createElement("h3");
        h3.innerText = winner[i].displayName;
        h3.style.color = setColorByAvatar(winner[i].avatar);
        winnerScreen.appendChild(h3);
        let img = document.createElement("img");
        img.src = `resources/${winner[i].avatar}Winner.svg`;
        winnerScreen.appendChild(img);
    }
    let button = document.createElement("button");
    button.innerText = "GÅ TILL MENYN";
    button.onclick = function () {
        
        openWindow("startScreen");
    }
    winnerScreen.appendChild(button);
    openWindow("winnerScreen");
    round = 1;
    
    
    
    
    
}