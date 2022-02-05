"use strict";

const play_button = document.querySelector("#play");
const rules_button = document.querySelector("#rules");
play_button.addEventListener('click', play);
rules_button.addEventListener('click', rules);

function play(event){
    window.location.href = 'dunk.html';
}

function rules(event){
    window.location.href = 'rules.html';
}