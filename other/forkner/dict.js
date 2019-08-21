(() => {
    let search_box = document.getElementById("search_box");
    let metadata = {};

    function create_word_element(word, metadata) {
        let cce = (parent, child_type) => parent.appendChild(document.createElement(child_type));
        let mb = document.getElementById("main_box");
        let word_node = cce(mb, 'div');
        word_node.className = "word_box inside";

        let wn_text = cce(word_node, 'p');
        wn_text.className = "word_text";
        if (metadata.hasOwnProperty("display")) {
            wn_text.innerHTML = metadata["display"];
        } else {
            wn_text.innerHTML = word;
        }

        let wn_img_container = cce(word_node, 'div');
        wn_img_container.className = "word_img_container";
        
        let wn_img = cce(wn_img_container, 'img');
        wn_img.className = "word_img";
        wn_img.setAttribute('src', 'assets/dict/' + word + '.svg');
    }

    function destroy_all_word_elements() {
        while (document.getElementsByClassName("word_box").length) {
            let tr = document.getElementsByClassName("word_box")[0];
            tr.parent.removeChild(tr);
        }
    }

    function search(word) {
        let search_word = word.toLowerCase();
        // get exact match
        if (metadata.hasOwnProperty(search_word)) {
            create_word_element(search_word, metadata[search_word]);
        }
        // get containing words
        for (let check_word in metadata) {
            if (search_word == check_word) {
                continue;
            }
            if (check_word.includes(search_word)) {
                create_word_element(check_word, metadata[check_word]);
            }
        }
    }

    window.onload = () => {
        search_box.disabled = true;
        fetch("assets/dict/metadata.json")
            .then(res => res.json())
            .then(res => metadata = res)
            .then(res => {
                search_box.disabled = false;
                search_box.placeholder = "Search dictionary...";
                search_box.focus();
            });

        search_box.onchange = () => {
            destroy_all_word_elements();
            search(search_box.value);
        };
    };
})();