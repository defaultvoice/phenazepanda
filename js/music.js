function panda_musicInit() {
    var musicControl = document.getElementById("settings");
    var musicStateView = document.getElementById("musicState");

    var music = new Audio();
    music.src = "media/DAN.mp3";
    music.loop = "loop";
    music.preload = "preload";
    music.volume = 0.5;
    container.appendChild(music);
    window.music = music;

    if (getCookie("musicState") != "on") {
        musicStateView.innerHTML = String("Off");
    } else {
        music.play();
    }

    musicControl.onclick = function() {
        if(getCookie("musicState") == "on") {
            music.pause();
            musicStateView.innerHTML = String("Off");
            setCookie("musicState", "off", Date.now(), "/");
        } else {
            music.play();
            musicStateView.innerHTML = String("On");
            setCookie("musicState", "on", Date.now(), "/");
        }
    }
    console.log('Init Music');
};

function panda_soundsInit() {
    var coin = new Audio();
    coin.src = "media/coin.mp3";
    coin.preload = "preload";
    coin.volume = 0.2;
    container.appendChild(coin);

    var pickup = new Audio();
    pickup.src = "media/pickup.mp3";
    pickup.preload = "preload";
    pickup.volume = 0.2;
    container.appendChild(pickup);


    window.s_coin = coin;
    window.s_pickup = pickup;
}
