(() => {
    function manifest_loaded (manifest) {
        manifest.split('\n').forEach(v, idx =>{
            console.log("file" + v);
        });
    } 

    fetch("./assets/manifest.txt")
        .then(res => res.text())
        .then(res => manifest_loaded(res));
})();