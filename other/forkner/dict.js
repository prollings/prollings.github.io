(() => {
    var client = new XMLHttpRequest();
    client.open('GET', '/assets/manifest.txt');
    client.onreadystatechange = function() {
        alert(client.responseText);
    }
    client.send();
})();