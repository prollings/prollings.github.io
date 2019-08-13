(() => {
    var client = new XMLHttpRequest();
    client.open('GET', '/assets/manifest.txt');
    client.onreadystatechange = function() {
        console.log(client.responseText);
    }
    client.send();
})();