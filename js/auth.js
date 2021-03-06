let userObj;


window.onload = function () {

    document.getElementById("signOut").style.display = "none";
    let facebookProvider = new firebase.auth.FacebookAuthProvider();

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            userObj = user;
             document.getElementById("signedInAs").innerText = userObj.displayName;
             document.getElementById("signedInImg").src = userObj.photoURL;
            document.getElementById("pleaseSignIn").innerText = "Du kan skapa ett nytt spelrum eller gå med i en väns spelrum.";
             document.getElementById("signIn").style.display = "none";
             document.getElementById("signOut").style.display = "inline";
            db.ref("users/" + userObj.uid).once("value", snapshot => {
                if(!snapshot.val()) {
                    db.ref("users/" + userObj.uid).set({
                        displayImage: userObj.photoURL,
                        email: userObj.email,
                        name: userObj.displayName,
                    });
                }
            })
        }else{
            document.getElementById("signIn").style.display = "inline";
            document.getElementById("signOut").style.display = "none";
            document.getElementById("pleaseSignIn").innerText = "Logga in via Facebook för att börja spela.";
            document.getElementById("signedInAs").innerText = "";
        }

        firebase.auth().getRedirectResult()
            .then(result => {
                if (result.credential) {

                }
            }).catch(err => {
                console.log("Sign in failed, error: ", err.message);
            });

        document.getElementById("signIn").addEventListener("click", () => {

            firebase.auth().signInWithRedirect(facebookProvider);
        });


        document.getElementById("signOut").addEventListener("click", () => {
            firebase.auth().signOut()
                .then(() => {
                    console.log("Sign out success!");
                }).catch(() => {
                    console.log("Sign out failed");
                });
        });
    });

}
