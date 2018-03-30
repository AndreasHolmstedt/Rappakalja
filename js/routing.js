let openWindow = function (idToOpen) {
    
    let windows = document.getElementsByClassName("window")

    for (i = 0; i < windows.length; i++) {
        windows[i].style.opacity = "0";
    }

    window.setTimeout(function () {
        for (i = 0; i < windows.length; i++) {
            windows[i].style.display = "none";
        }
        document.getElementById(idToOpen).style.display = "flex";
    }, 300);
    
    window.setTimeout(function () {
        document.getElementById(idToOpen).style.opacity = "1";
    }, 400);
}
