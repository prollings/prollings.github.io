(() => {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    let num_masters = 8;
    let cell_size = canvas.width / num_masters; // including padding
    let padding = canvas.width / 150;
    let rad = (cell_size - (padding * 2)) / 2;
    let last = performance.now() / 1000.0;

    let coords = [0, 0, 0, 0, 0, 0, 0];
    let colours = [0, 30, 60, 120, 180, 240, 300];
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

    function fill_canvas() {
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
        let col = `hsl(${colours[num]}, 90%, 65%)`;
        // row
        draw_circle(pos, padding, rad, col, false);
        // column
        draw_circle(padding, pos, rad, col, false);
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
        ctx.strokeStyle = '#555555';
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

    function draw_child_point(row_parent, col_parent) {
        let c = get_child_coords(row_parent, col_parent);
        draw_point(c.x, c.y, 3, 'white');
    }

    function draw_child(row_parent, col_parent) {
        let pos = get_child_coords(row_parent, col_parent);
        let hue = colours[row_parent] + colours[col_parent] / 2;
        let col = `hsl(${hue}, 90%, 64%)`
        draw_point(pos.x, pos.y, 1, col, offscreen_ctx);
    }

    function do_things(time) {
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
        for (let i = 0; i < num_masters; i++) {
            draw_master(i);
            draw_master_lines(i);
            draw_master_points(i);
        }
        for (let col = 0; col < num_masters; col++) {
            for (let row = 0; row < num_masters; row++) {
                draw_child(row, col);
            }
        }
        ctx.drawImage(offscreen_canvas, 0, 0);
        for (let col = 0; col < num_masters; col++) {
            for (let row = 0; row < num_masters; row++) {
                draw_child_point(row, col);
            }
        }
        requestAnimationFrame(do_things);
    }

    requestAnimationFrame(do_things);

    fill_canvas();
    
})();