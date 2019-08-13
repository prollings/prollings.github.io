(() => {
    let file = new XMLHttpRequest();
    file.open("GET", "./assets/manifest.txt");
    file.onreadystatechange = () => {
        let allText = file.responseText;
        console.log(allText);
    };
})();