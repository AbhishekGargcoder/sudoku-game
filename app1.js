let playBtn = document.querySelector(".play-btn");
let playAudio = new Audio("playAudio.wav");
playBtn.addEventListener("click",()=>{
    playAudio.play();
})