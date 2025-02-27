function toggle(){
    var blurMain = document.getElementsByTagName("main")[0];
    blurMain.classList.toggle('active');
    var blurAside = document.getElementsByTagName("aside")[0];
    blurAside.classList.toggle('active');
    var popup = document.getElementById('index-popup-container');
    popup.classList.toggle('active');
}