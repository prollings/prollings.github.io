(() => {
    let search_box = document.getElementById("search_box");
    let img_box = document.getElementById("img_box");
    let imgs = {};

    function image_loaded(file_name, img) {
        // lower case of word and remove symbols and abv marker
        // store original word (with capital and/or apostrophe) in `display`
        if (file_name == "") {
            return;
        }
        let word = file_name.split('.')[0];
        let is_abv = word.endsWith("_abv");
        if (is_abv) {
            word = word.split('_')[0];
        }
        let display = word;
        let proper_noun = word[0] != word[0].toLowerCase();
        if (proper_noun) {
            word = word.toLowerCase();
        }
        img = URL.createObjectURL(img);
        imgs[word] = {
            img: img,
            abv: is_abv,
            proper_noun: proper_noun,
            display: display,
        };
    }

    function manifest_loaded(manifest) {
        let promises = [];
        manifest.split('\n').forEach((v, idx) => {
            let promise = fetch("./assets/dict/" + v)
                .then(res => res.blob())
                .then(res => image_loaded(v, res));
            promises.push(promise);
        });
        return Promise.all(promises);
    }

    function search(text) {
        text = text.toLowerCase();
        let result = imgs[text];
        if (result) {
            img_box.src = result.img;
            console.log(result);
        }
    }

    window.onload = () => {
        fetch("./assets/manifest.txt")
            .then(res => res.text())
            .then(res => manifest_loaded(res))
            .then(res => {
                search_box.disabled = false;
                search_box.placeholder = "Search dictionary...";
            });

        search_box.onchange = () => {
            search(search_box.value);
        };
    };
})();