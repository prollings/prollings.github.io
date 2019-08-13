(() => {
    function manifest_loaded (manifest) {
        console.log(manifest);
    } 

    fetch("./assets/manifest.txt")
        .then(res => res.text())
        .then(res => manifest_loaded(res));
})();