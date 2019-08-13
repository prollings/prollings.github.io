(() => {
    let search_box = document.getElementById("search_box");
    let imgs = new Object;

    function image_loaded(file_name, img) {
        let word = file_name.split('.')[0];
        let is_abv = word.endsWith("_abv");
        
        if (is_abv) {
            word = word.split('_')[0];
        }
        
        let proper_noun = word[0] != word[0].toLowerCase();
        
        if (proper_noun) {
            word = word.toLowerCase();
        }

        imgs[word] = {
            img: img,
            abv: is_abv,
            proper_noun: proper_noun,
        };
    }

    function manifest_loaded (manifest) {
        manifest.split('\n').forEach((v, idx) => {
            fetch("./assets/dict/" + v)
                .then(res => res.blob())
                .then(res => image_loaded(v, res));
        });
    }

    function search(text) {
        text = text.toLowerCase();
        let result = imgs[text];
        if (result) {
            console.log("pn: ", result.proper_noun, " abv: ", result.abv);
        }
    }

    window.onload = () => {
        fetch("./assets/manifest.txt")
            .then(res => res.text())
            .then(res => manifest_loaded(res));

        search_box.onchange = () => {
            console.log(search_box.text);
        };
    };
})();