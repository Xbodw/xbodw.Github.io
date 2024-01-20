let hexString = "0123456789abcdef";
let hexCode = "#";
for( i = 0; i < 6; i++){
   hexCode += hexString[Math.floor(Math.random() * hexString.length)];
}
    document.querySelector('#lo').setAttribute('style','border:6px solid ' + hexCode);
setInterval(function () {
 let hexString = "0123456789abcdef";
let hexCode = "#";
for( i = 0; i < 6; i++){
   hexCode += hexString[Math.floor(Math.random() * hexString.length)];
}
    document.querySelector('#lo').setAttribute('style','border:6px solid ' + hexCode);
},150);