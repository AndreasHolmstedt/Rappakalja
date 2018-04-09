let db = firebase.database();


//CREATE NEW GAME
document.getElementById("createNewGame").addEventListener("click", function () {

    let gameKey = createGameKey();

    let availableAvatars = ["birdie", "cat", "dog", "elephant", "mouse", "rabbit", "turtle", "chicken"];

    document.getElementById("gameKey").innerText = gameKey;
    console.log("skapar denna gameKEY", gameKey);
    let playerObj = {}

    playerObj.displayName = userObj.displayName
    db.ref(`currentGameRooms/${gameKey}/players/${userObj.uid}`).set(playerObj);
    db.ref(`currentGameRooms/${gameKey}/availableAvatars`).set(availableAvatars);
    db.ref(`currentGameRooms/${gameKey}/host`).set(userObj.uid);
    openWindow("newGameScreen");

    handleNewGameScreen(gameKey);


    document.getElementById("startGame").onclick = function () {



        db.ref(`currentGameRooms/${gameKey}/`).once("value", function (snapshot) {

            let data = snapshot.val()
            let temp = false;

            for (let i in data.players) {
                if (data.players[i].avatar == undefined) {
                    temp = false;
                    break;
                }
                temp = true;
            }

            if (temp) {
                let game = {};
                game.players = data.players;
                game.active = true;
                let key = db.ref(`previousGames/`).push(game).getKey();
                db.ref(`currentGameRooms/${gameKey}/newGame`).set(key);
                document.getElementById("startGame").onclick = null;
                startRoundAsHost(key);
                db.ref(`currentGameRooms/${gameKey}/`).off()
            } else {}
        });

    };


});

//JOIN GAME
document.getElementById("joinGame").addEventListener("click", function () {


    let gameKey = document.getElementById("joinGameKey").value
    db.ref(`currentGameRooms/`).once("value", function (snapshot) {
        data = snapshot.val()
        let gameFound = false;
        for (let i in data) {
            if (i == gameKey) {

                let playerObj = {}
                playerObj.displayName = userObj.displayName;
                db.ref(`currentGameRooms/${gameKey}/players/${userObj.uid}`).set(playerObj);

                gameFound = true;


            }


        }

        if (gameFound) {
            openWindow("newGameScreen");

            document.getElementById("gameKey").innerHTML = gameKey;

            handleNewGameScreen(gameKey);
        } else {
            document.getElementById("joinGameKey").value = "";
            document.getElementById("joinGameKey").placeholder = "Spelet hittades inte";
        }
    })
});






function createGameKey() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (var i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

let pickAvatar = function (i, gameKey) {


    db.ref(`currentGameRooms/${gameKey}/availableAvatars`).once("value", function (snapshot) {
        let data = snapshot.val();
        let index = data.indexOf(i);
        if (index !== -1) {
            data.splice(index, 1);
        }
        db.ref(`currentGameRooms/${gameKey}/availableAvatars`).set(data);
    })

    db.ref(`currentGameRooms/${gameKey}/players/${userObj.uid}/avatar`).set(i);



    // push pick into currentgame/gamekey/players/uid.pet
}

function viewPetPicks() {
    //start this in join and create game functions
    //subscribe on currentgames/gamekey/players/ALL_uid.pet
}


//created this because of bug i couldnt fix. somehow firebase didnt stop listening on changes so it started startRoundAsJoined 21 times.
let alreadyJoined = false


let handleNewGameScreen = function (gameKey) {

    db.ref(`currentGameRooms/${gameKey}/`).on("value", function (snapshot) {
        let data = snapshot.val()

        if (data.host != userObj.uid) {
            if (data.newGame) {
                db.ref(`currentGameRooms/${gameKey}/`).off();
                if (!alreadyJoined) {
                    alreadyJoined = true;
                    startRoundAsJoined(data.newGame);
                }
            }
        }
        let availableAvatarsDiv = document.getElementById("availableAvatars");

        while (availableAvatarsDiv.firstChild) {
            availableAvatarsDiv.removeChild(availableAvatarsDiv.firstChild);
        }

        let availableAvatars = data.availableAvatars;



        for (let i of availableAvatars) {
            let avatarImg = document.createElement("img")
            avatarImg.classList.add("pets")
            avatarImg.src = `resources/${i}.svg`;
            availableAvatarsDiv.appendChild(avatarImg);



            if (data.players[userObj.uid].avatar == undefined) {
                avatarImg.addEventListener("click", function () {
                    pickAvatar(i, gameKey);
                })

            }

            // ONLY ADD IF PLAYER/UID/AVATAR IS NOT SET;

        }


        let joinedPlayers = document.getElementById("joinedPlayers");

        while (joinedPlayers.firstChild) {
            joinedPlayers.removeChild(joinedPlayers.firstChild)
        }



        for (let i in data.players) {

            let playerDiv = document.createElement("div");
            let playerName = document.createElement("p");
            playerName.innerText = data.players[i].displayName;
            playerDiv.appendChild(playerName);

            if (data.players[i].avatar != undefined) {



                let playerAvatar = document.createElement("img");
                playerAvatar.src = `resources/${data.players[i].avatar}.svg`

                playerName.style.color = setColorByAvatar(data.players[i].avatar)
                playerDiv.appendChild(playerAvatar);

            } else {

                playerDiv.appendChild(document.createElement("div"));
            }


            joinedPlayers.appendChild(playerDiv);
        }

    });

}

let setColorByAvatar = function (avatar) {

    switch (avatar) {
        case "birdie":
            return "#E7807D"
            break;
        case "cat":
            return "#F8DE65"
            break;
        case "elephant":
            return "#80A3BE"
            break;
        case "dog":
            return "#6651AA"
            break;
        case "mouse":
            return "#D75887"
            break;
        case "rabbit":
            return "#BF7CBF"
            break;
        case "turtle":
            return "#51C651"
            break;
        case "chicken":
            return "#F8B965"
            break;
    }
}

let setGradientByAvatar = function (avatar) {

    switch (avatar) {
        case "birdie":
            return "linear-gradient(to bottom, #FFA5A5 50%, #F86565 50%)"
            break;
        case "cat":
            return "linear-gradient(to bottom, #FFF0A5 50%, #F8DE65 50%)"
            break;
        case "elephant":
            return "linear-gradient(to bottom, #80A3BE 50%, #47799F 50%)"
            break;
        case "dog":
            return "linear-gradient(to bottom, #9788C6 50%, #6651AA 50%)"
            break;
        case "mouse":
            return "linear-gradient(to bottom, #E796B4 50%, #D75887 50%)"
            break;
        case "rabbit":
            return "linear-gradient(to bottom, #BF7CBF 50%, #A142A1 50%)"
            break;
        case "turtle":
            return "linear-gradient(to bottom, #8EDB8E 50%, #51C651 50%)"
            break;
        case "chicken":
            return "linear-gradient(to bottom, #FFD9A5 50%, #F8B965 50%)"
            break;
    }


}
