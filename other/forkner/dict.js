(() => {
    let search_box = document.getElementById("search_box");
    let metadata = {};

    function create_word_element(word) {
        let cce = (parent, child_type) => parent.appendChild(document.createElement(child_type));
        let mb = document.getElementById("main_box");
        let word_node = cce(mb, 'div');
        let wn_text = cce(word_node, 'p');
        let wn_img_container = cce(word_node, 'div');
        let wn_img = cce(wn_img_container, 'img');

        word_node.className = "word_box";
        wn_text.className = "word_text";
        wn_text.innerHTML = word;

        wn_img_container.className = "word_img_container";
        wn_img.className = "word_img";
        wn_img.setAttribute('src', 'assets/dict/' + word + '.svg');
    }

    function destroy_all_word_elements() {
        let mb = document.getElementById("main_box");
        let to_destroy = document.getElementsByClassName("word_box");

        for (let td of to_destroy) {
            mb.removeChild(td);
        }
    }

    function search(word) {
        let word = word.toLowerCase();
        // get exact match
        if (metadata.hasOwnProperty(word)) {
            create_word_element(word);
        }
        // get containing words
        for (let check_word of metadata.entries()) {
            if (check_word.includes(word)) {
                create_word_element(check_word);
            }
        }
    }

    window.onload = () => {
        search_box.disabled = true;
        fetch("./assets/metadata.json")
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