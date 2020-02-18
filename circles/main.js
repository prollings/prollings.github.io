(() => {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    let num_masters = 7;
    let cell_size = canvas.width / (num_masters + 1); // including padding
    let padding = canvas.width / 150;
    let rad = (cell_size - (padding * 2)) / 2;
    let last = performance.now() / 1000.0;
    let coords = [0, 0, 0, 0, 0, 0, 0];

    let colours = [0, 30, 60, 120, 180, 240, 300];
    for (let i = 0; i < colours.length; i++) {
        colours[i] = hsl_to_cmyk(colours[i], 75, 60);
    }
    let child_colours = [];
    for (let row = 0; row < num_masters; row++) {
        child_colours[row] = [];
        for (let col = 0; col < num_masters; col++) {
            let mixed = mix_cmy(colours[row], colours[col]);
            child_colours[row][col] = cmyk_to_rgb(mixed)
                .map((el) => el.toString(16).padStart(2, '0'))
                .reduce((acc, v) => acc + v, "#");
        }
    }
    for (let i = 0; i < colours.length; i++) {
        colours[i] = cmyk_to_rgb(colours[i])
            .map((el) => el.toString(16).padStart(2, '0'))
            .reduce((acc, v) => acc + v, "#");
    }

    let centres = [];
    for (let i = 0; i < num_masters; i++) {
        centres[i] = (i + 1) * cell_size + (cell_size / 2);
    }
    let minor_centre = rad + padding;

    let offscreen_canvas = (() => {
        let os_canvas = document.createElement("canvas");
        os_canvas.width = canvas.width;
        os_canvas.height = canvas.height;
        return os_canvas;
    })();

    let offscreen_ctx = offscreen_canvas.getContext("2d");

    function hsl_to_cmyk(h, s, l) {
        h = h / 360.0;
        s = s / 100.0;
        l = l / 100.0;
        let hue_to_rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }
        let q = (l < 0.5) ? l * (1 + s) : (l + s - l * s);
        let p = 2 * l - q;
        let r = hue_to_rgb(p, q, h + 1/3);
        let g = hue_to_rgb(p, q, h);
        let b = hue_to_rgb(p, q, h - 1/3);

        let c = 1 - r;
        let m = 1 - g;
        let y = 1 - b;
        let k = Math.min(c, m, y);
        c = (c - k) / (1 - k);
        m = (m - k) / (1 - k);
        y = (y - k) / (1 - k);

        return [c, m, y, k];
    }

    function cmyk_to_rgb (col) {
        let c = col[0];
        let m = col[1];
        let y = col[2];
        let k = col[3];
        c = c * (1 - k) + k;
        m = m * (1 - k) + k;
        y = y * (1 - k) + k;
        let r = Math.round((1 - c) * 255);
        let g = Math.round((1 - m) * 255);
        let b = Math.round((1 - y) * 255);
        return [r, g, b];
    }

    function mix_cmy(col_1, col_2) {
        let new_col = [0,0,0,0];
        for (let i = 0; i < new_col.length; i++) {
            new_col[i] = (col_1[i] + col_2[i]) / 2;
        }
        return new_col;
    }

    function fill_canvas(this_ctx, col) {
        if (this_ctx == undefined) {
            this_ctx = ctx;
        }
        if (col == undefined) {
            col = '#333333';
        }
        this_ctx.fillStyle = col;
        this_ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function draw_circle(x, y, rad, col, fill) {
        ctx.beginPath();
        ctx.ellipse(x + rad, y + rad, rad, rad, 0, 0, Math.PI * 2);
        if (fill) {
            ctx.fillStyle = col;
            ctx.fill();
        } else {
            ctx.setLineDash([]);
            ctx.lineWidth = 3;
            ctx.strokeStyle = col;
            ctx.stroke();
        }
    }

    function draw_point(x, y, rad, col, this_ctx) {
        if (this_ctx == undefined) {
            this_ctx = ctx;
        }
        this_ctx.beginPath();
        this_ctx.ellipse(x, y, rad, rad, 0, 0, Math.PI * 2);
        this_ctx.fillStyle = col;
        this_ctx.fill();
    }

    function draw_master(num) {
        let pos = (num + 1) * cell_size + padding;
        let colour = colours[num];
        // row
        draw_circle(pos, padding, rad, colour, false);
        // column
        draw_circle(padding, pos, rad, colour, false);
    }

    function draw_master_points(num) {
        let major_centre = centres[num];
        let x = coords[num].x;
        let y = coords[num].y;
        draw_point(x + major_centre, y + minor_centre, 5, 'white');
        draw_point(x + minor_centre, y + major_centre, 5, 'white');
    }

    function draw_master_lines(num) {
        let pos = coords[num];
        let col_x = pos.x + centres[num];
        let col_y = pos.y + minor_centre;
        let row_x = pos.x + minor_centre;
        let row_y = pos.y + centres[num];
        ctx.strokeStyle = '#777777';
        ctx.setLineDash([3, 5]);
        ctx.lineWidth = 1;
        // vertical
        ctx.beginPath();
        ctx.moveTo(col_x, 800);
        ctx.lineTo(col_x, col_y);
        ctx.stroke();
        // horizontal
        ctx.beginPath();
        ctx.moveTo(800, row_y);
        ctx.lineTo(row_x, row_y);
        ctx.stroke();
    }

    function get_child_coords(row_parent, col_parent) {
        return {
            x: centres[col_parent] + coords[col_parent].x,
            y: centres[row_parent] + coords[row_parent].y,
        };
    }

    function get_last_child_coords(row_parent, col_parent) {

    }

    function draw_child_point(row_parent, col_parent) {
        let c = get_child_coords(row_parent, col_parent);
        draw_point(c.x, c.y, 3, 'white');
    }

    function draw_child(row_parent, col_parent) {
        let pos = get_child_coords(row_parent, col_parent);
        let colour = child_colours[row_parent][col_parent];
        draw_point(pos.x, pos.y, 1.5, colour, offscreen_ctx);
    }

    document.addEventListener("keyup", (ev) => {
        if (ev.key == " ") {
            fill_canvas(offscreen_ctx);
        }
    });

    document.getElementById("blank").onclick = () => {
        fill_canvas(offscreen_ctx);
    }

    function render(time) {
        time = time / 1000.0;
        let dt = (time - last);
        last = time;
        // update master ts
        for (let i = 0; i < num_masters; i++) {
            let t = time * (i + 1) / 2;
            coords[i] = {
                x: Math.cos(t) * rad,
                y: Math.sin(t) * rad,
            };
        }
        // draw stuff
        fill_canvas();
        ctx.drawImage(offscreen_canvas, 0, 0);
        for (let i = 0; i < num_masters; i++) {
            draw_master(i);
            draw_master_lines(i);
            draw_master_points(i);
        }
        for (let col = 0; col < num_masters; col++) {
            for (let row = 0; row < num_masters; row++) {
                draw_child(row, col);
                draw_child_point(row, col);
            }
        }
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
})();