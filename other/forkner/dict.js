(() => {
    let imgs = new Array;

    function image_loaded(img) {
        imgs.push(img);
        console.log(img);
    }

    function manifest_loaded (manifest) {
        manifest.split('\n').forEach((v, idx) => {
            fetch("./assets/dict/" + v)
                .then(res => res.blob())
                .then(res => image_loaded(res));
        });
    } 

    fetch("./assets/manifest.txt")
        .then(res => res.text())
        .then(res => manifest_loaded(res));
})();