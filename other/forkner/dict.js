(() => {
    let imgs = new Object;

    function image_loaded(file_name, img) {
        let word = file_name.split('.')[0];
        let is_abv = word.endsWith("_abv");
        if (is_abv) {
            word = word.split('_')[0];
        }
        imgs[word] = {
            img: img,
            abv: is_abv,
        };
    }

    function manifest_loaded (manifest) {
        manifest.split('\n').forEach((v, idx) => {
            fetch("./assets/dict/" + v)
                .then(res => res.blob())
                .then(res => image_loaded(v, res));
        });
    } 

    fetch("./assets/manifest.txt")
        .then(res => res.text())
        .then(res => manifest_loaded(res));
})();