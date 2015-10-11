function goToNextLevel() {
    currentLevel++;
    setStartingPlayerPosition();
}

function setStartingPlayerPosition() {
    switch (currentLevel) {
        case 1:
            playerStartX = width / 2;
            playerStartY = height + 300;
            break;
    }
}

