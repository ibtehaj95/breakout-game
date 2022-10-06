let user_xcor = 50;
let wrecker_xcor = 50;
let wrecker_ycor = 50;
let bricks = [];
let wrecker_timer_id = 0;
let all_bricks_wrecked = 0;
let wreck_brick_id = "";
let score = 0;
let lives = 3;
let record = 0;
let rec_arry = [];

const wrecker_obj = {
    top_left_x: 0,
    top_left_y: 0,
    top_right_x: 0,
    top_right_y: 0,
    bottom_left_x: 0,
    bottom_left_y: 0,
    bottom_right_x: 0,
    bottom_right_y: 0,
    moving: "down-left", //up-left, up-right, down-left, down-right
    collided_with: "left"
};

const user_obj = {
    top_left_x: 0,
    top_left_y: 0,
    top_right_x: 0,
    top_right_y: 0,
    bottom_left_x: 0,
    bottom_left_y: 0,
    bottom_right_x: 0,
    bottom_right_y: 0
};

class Brick{
    top_left_x = 0;
    top_left_y = 0;
    top_right_x = 0;
    top_right_y = 0;
    bottom_left_x = 0;
    bottom_left_y = 0;
    bottom_right_x = 0;
    bottom_right_y = 0;
    wrecked = 0;
    id = 0;
    constructor(tl_x, tl_y, tr_x, tr_y, bl_x, bl_y, br_x, br_y, id){
        this.top_left_x = tl_x;
        this.top_left_y = tl_y;
        this.top_right_x = tr_x;
        this.top_right_y = tr_y;
        this.bottom_left_x = bl_x;
        this.bottom_left_y = bl_y;
        this.bottom_right_x = br_x;
        this.bottom_right_y = br_y;
        this.id = id;
    }
}

const game_container = document.querySelector(".game-container");
const start_btn = document.getElementById("start-btn");
const reload_btn = document.getElementById("reload-btn");

gen_bricks_all();
const bricks_selector = document.querySelectorAll(".bricks");
// console.log(bricks_selector);
gen_user();
const user = document.querySelector("#user");
start_btn.addEventListener("click", start_game);
reload_btn.addEventListener("click", reload_page);
get_user_corrs();


gen_wrecker();
const wrecker = document.querySelector("#wrecker");
const game_container_bounds = game_container.getBoundingClientRect();   //top, bottom, left, right

get_wrecker_corrs();
get_bricks_data();

update_lives(lives);
get_record();

function get_user_corrs(){
    const user_dims = user.getBoundingClientRect();
    const top_left_x = user_dims.x;
    const top_left_y = user_dims.y;
    user_obj.top_left_x = top_left_x;
    user_obj.top_left_y = top_left_y;
    user_obj.top_right_x = top_left_x + user_dims.width;
    user_obj.top_right_y = top_left_y;
    user_obj.bottom_left_x = top_left_x;
    user_obj.bottom_left_y = top_left_y + user_dims.height;
    user_obj.bottom_right_x = top_left_x + user_dims.width;
    user_obj.bottom_right_y = top_left_y + user_dims.height;
}

function get_wrecker_corrs(){
    const wrecker_dims = wrecker.getBoundingClientRect();
    const top_left_x = wrecker_dims.x;
    const top_left_y = wrecker_dims.y;
    wrecker_obj.top_left_x = top_left_x;
    wrecker_obj.top_left_y = top_left_y;
    wrecker_obj.top_right_x = top_left_x + wrecker_dims.width;
    wrecker_obj.top_right_y = top_left_y;
    wrecker_obj.bottom_left_x = top_left_x;
    wrecker_obj.bottom_left_y = top_left_y + wrecker_dims.height;
    wrecker_obj.bottom_right_x = top_left_x + wrecker_dims.width;
    wrecker_obj.bottom_right_y = top_left_y + wrecker_dims.height;
}

function get_bricks_data(){
    // console.log("Function Declared but not Defined");
    bricks_selector.forEach(function(selected_brick){
        const brick_dims = selected_brick.getBoundingClientRect();
        const brick_left_x = brick_dims.x;
        const brick_left_y = brick_dims.y;
        brick = new Brick(brick_left_x, brick_left_y, brick_left_x + brick_dims.width, brick_left_y, brick_left_x, brick_left_y + brick_dims.height, brick_left_x + brick_dims.width, brick_left_y + brick_dims.height, selected_brick.id);
        bricks.push(brick);
    });
}

function reload_page(){
   location.reload(); 
}

function start_game(){
    document.addEventListener("keydown", move_user);
    wrecker_timer_id = setInterval(move_wrecker, 40);
    start_btn.removeEventListener("click", start_game);
}

function move_wrecker(){
    switch (wrecker_obj.moving){
        case "up-left":
            wrecker_xcor = wrecker_xcor-1; //move left:    subtract from left
            wrecker_ycor = wrecker_ycor-1; //move up:      subtract from top
            break;
        case "up-right":
            wrecker_xcor = wrecker_xcor+1; //move right:   add to left
            wrecker_ycor = wrecker_ycor-1; //move up:      subtract from top
            break;
        case "down-left":
            wrecker_xcor = wrecker_xcor-1; //move left:    subtract from left
            wrecker_ycor = wrecker_ycor+1; //move down:    add to top
            break;
        case "down-right":
            wrecker_xcor = wrecker_xcor+1; //move right:   add to left
            wrecker_ycor = wrecker_ycor+1; //move down:    add to top
            break;
    }
    wrecker.setAttribute("style", `left: ${wrecker_xcor}%; top: ${wrecker_ycor}%;`); //style="left: 50%;";
    // console.log(wrecker);
    get_wrecker_corrs();
    const collision = check_collision();
    // console.log(collision);
    if (collision){
        wrecker_deflect();
        // console.log("Collision!");
        if(wreck_brick_id && wreck_brick_id != "Bottom"){
            brick_disappear();
            score++;
            update_score(score);
        }
        else if(wreck_brick_id == "Bottom"){
            wreck_brick_id = 0;
            life_lost();
        }
    }
}

function update_record(){
    //if score is above record, then update record
    if(score > record){
        rec_arry = ["record", score];
        localStorage.setItem("brkt", JSON.stringify(rec_arry));
    }
}

function get_record(){
    if(localStorage.getItem("brkt")){
        rec_arry = JSON.parse(localStorage.getItem("brkt"));
        if(rec_arry[0] == "record"){
            record = parseInt(rec_arry[1]);
            record_element = document.getElementById("record-number");
            record_element.textContent = record;
        }
    }
}

function update_score(score){
    score_element = document.getElementById("score-number");
    score_element.textContent = score;
}

function life_lost(){
    wrecker.setAttribute("style", `left: 50%; top: 50%;`); //style="left: 50%;";
    wrecker_obj.moving = "down-left", //up-left, up-right, down-left, down-right
    wrecker_obj.collided_with = "left";
    wrecker_xcor = 50;
    wrecker_ycor = 50;
    lives--;
    update_lives(lives);
}

function update_lives(lives){
    lives_element = document.getElementById("bound-number");
    lives_element.textContent = lives;
    if(lives == 0){
        end_game();
    }
}

function end_game(){
    clearInterval(wrecker_timer_id);
    document.removeEventListener("keydown", move_user);
    update_record();
    get_record();
}

function brick_disappear(){
    // console.log(wreck_brick_id);   //get element
    // console.log(typeof(wreck_brick_id));
    let wrecked_index = 100;
    for(let i=0; i<bricks.length; ++i){
        // console.log(bricks[i].id);
        if(bricks[i].id == wreck_brick_id){
            wrecked_index = i;
            // console.log(bricks[i]);
            break;
        }
    }
    bricks[wrecked_index].wrecked = 1;
    wrecked_element = document.getElementById(wreck_brick_id);   //hide element
    wrecked_element.style.visibility = "hidden";
    ;   //update in objects, use contains to locate and iterate through the array
    ;   //update bricks list at 156
}

function check_collision(){
    // console.log("Check Collision")
    // console.log(user_obj);
    // console.log(wrecker_obj);
    // console.log(wrecker_obj.bottom_left_y+1, game_container_bounds.bottom)
    if(wrecker_obj.top_left_x-5 < game_container_bounds.left){
        wrecker_obj.collided_with = "left";
        wreck_brick_id = 0;
        return 1;
    }

    else if(wrecker_obj.top_right_x+5 > game_container_bounds.right){
        wrecker_obj.collided_with = "right";
        wreck_brick_id = 0;
        return 1;
    }

    else if(wrecker_obj.top_left_y-5 < game_container_bounds.top){
        wrecker_obj.collided_with = "top";
        wreck_brick_id = 0;
        return 1;
    }

    else if(wrecker_obj.bottom_left_y+5 > game_container_bounds.bottom){
        wrecker_obj.collided_with = "bottom";
        wreck_brick_id = "Bottom";
        // console.log("Collided with Bottom");
        return 1;
    }

    else if(((wrecker_obj.bottom_left_x > user_obj.top_left_x && wrecker_obj.bottom_left_x < user_obj.top_right_x) && (wrecker_obj.bottom_left_y > user_obj.top_left_y-5 && wrecker_obj.bottom_left_y < user_obj.bottom_left_y)) || ((wrecker_obj.bottom_right_x > user_obj.top_left_x && wrecker_obj.bottom_right_x < user_obj.top_right_x)  && (wrecker_obj.bottom_right_y > user_obj.top_left_y-5 && wrecker_obj.bottom_right_y < user_obj.bottom_left_y))){
        wrecker_obj.collided_with = "bottom";
        wreck_brick_id = 0;
        return 1;
    }

    else if(!all_bricks_wrecked){
        let col_with_tl = 0;
        let col_with_tr = 0;
        let col_with_bl = 0;
        let col_with_br = 0;
        // console.log("All Bricks not Wrecked");
        const unwrecked_bricks = bricks.filter(function(brick){
            if(!brick.wrecked){
                return brick;
            }
        });
        if(unwrecked_bricks.length == 0){
            all_bricks_wrecked = 1;
            end_game();
        }
        // console.log(unwrecked_bricks);
        let col_det = 0;
        for(let i=0; i<unwrecked_bricks.length; ++i){
            
            if(wrecker_obj.top_left_x-0 > unwrecked_bricks[i].top_left_x && wrecker_obj.top_left_x-0 < unwrecked_bricks[i].top_right_x && wrecker_obj.top_left_y-0 > unwrecked_bricks[i].top_right_y && wrecker_obj.top_left_y-0 < unwrecked_bricks[i].bottom_right_y){
                // console.log("Collision with Brick - TopLeft");
                col_det = 1;
                // wrecker_obj.collided_with = "top";
                col_with_tl = 1;
                // console.log(col_with);
                wreck_brick_id = unwrecked_bricks[i].id;
                // break;
                }
            if(wrecker_obj.top_right_x+0 > unwrecked_bricks[i].top_left_x && wrecker_obj.top_right_x+0 < unwrecked_bricks[i].top_right_x && wrecker_obj.top_right_y-0 > unwrecked_bricks[i].top_right_y && wrecker_obj.top_right_y-0 < unwrecked_bricks[i].bottom_right_y){
                // console.log("Collision with Brick - TopRight");
                col_det = 1;
                // wrecker_obj.collided_with = "top";
                col_with_tr = 1;
                // console.log(col_with);
                wreck_brick_id = unwrecked_bricks[i].id;
                // break;
            }
            if(wrecker_obj.bottom_left_x-0 > unwrecked_bricks[i].top_left_x && wrecker_obj.bottom_left_x-0 < unwrecked_bricks[i].top_right_x && wrecker_obj.bottom_left_y+0 > unwrecked_bricks[i].top_right_y && wrecker_obj.bottom_left_y+0 < unwrecked_bricks[i].bottom_right_y){
                // console.log("Collision with Brick - BottomLeft");
                col_det = 1;
                // wrecker_obj.collided_with = "bottom";
                col_with_bl = 1;
                // console.log(col_with);
                wreck_brick_id = unwrecked_bricks[i].id;
                // break;
            }
            if(wrecker_obj.bottom_right_x+0 > unwrecked_bricks[i].top_left_x && wrecker_obj.bottom_right_x+0 < unwrecked_bricks[i].top_right_x && wrecker_obj.bottom_right_y+0 > unwrecked_bricks[i].top_right_y && wrecker_obj.bottom_right_y+0 < unwrecked_bricks[i].bottom_right_y){
                // console.log("Collision with Brick - BottomRight");
                col_det = 1;
                // wrecker_obj.collided_with = "bottom";
                col_with_br = 1;
                // console.log(col_with);
                wreck_brick_id = unwrecked_bricks[i].id;
                // break;
             }
             else{
                col_det = 0;
             }
             
             if(col_det == 1){
                break;
             }
        }

        //decide top/bottom/left/right on the basis of if-else above

        if(col_det){
            if(col_with_tl == 1 && col_with_tr == 1){
                wrecker_obj.collided_with = "top";
                // console.log(wrecker_obj.collided_with);
            }

            else if(col_with_tr == 1 && col_with_br == 1){
                wrecker_obj.collided_with = "right";
                // console.log(wrecker_obj.collided_with);
            }

            else if(col_with_br == 1 && col_with_bl == 1){
                wrecker_obj.collided_with = "bottom";
                // console.log(wrecker_obj.collided_with);
            }

            else if(col_with_bl == 1 && col_with_tl == 1){
                wrecker_obj.collided_with = "left";
                // console.log(wrecker_obj.collided_with);
            }

            else if(col_with_tr == 1){
                wrecker_obj.collided_with = "top";
                // console.log(wrecker_obj.collided_with);
            }

            else if(col_with_tl == 1){
                wrecker_obj.collided_with = "top";
                // console.log(wrecker_obj.collided_with);
            }

            else if(col_with_br == 1){
                wrecker_obj.collided_with = "bottom";
            }

            else if(col_with_bl == 1){
                wrecker_obj.collided_with = "bottom";
            }

            else{
                // console.log("Error at Collision Identification");
            }

        }

        if (col_det == 1){
            return 1;
        }
    }

    // else if(((wrecker_obj.bottom_left_x > user_obj.top_left_x))){
    //     // wrecker_obj.collided_with = "bottom";
    //     // wreck_brick_id = 0;
    //     console.log("Saved");
    //     // return 1;
    // }

    else{
        return 0;
    }
}

function wrecker_deflect(){
    // console.log("Deflect");
    // console.log(wrecker_obj.moving);
    // console.log(wrecker_obj.collided_with);
    if(wrecker_obj.moving == "up-right"){
        if(wrecker_obj.collided_with == "right"){
            wrecker_obj.moving = "up-left";
        }

        else if(wrecker_obj.collided_with == "top"){
            wrecker_obj.moving = "down-right";
        }

        else if(wrecker_obj.collided_with == "bottom"){
            wrecker_obj.moving = "up-left";
        }

        else if(wrecker_obj.collided_with == "left"){
            wrecker_obj.moving = "down-right";
            // console.log("Move Exception");
            // console.log(wrecker_obj.moving);
            // console.log(wrecker_obj.collided_with);
        }
        
    }

    else if(wrecker_obj.moving == "up-left"){
        if(wrecker_obj.collided_with == "left"){
            wrecker_obj.moving = "up-right";
        }

        else if(wrecker_obj.collided_with == "top"){
            wrecker_obj.moving = "down-left";
        }

        else if(wrecker_obj.collided_with == "bottom"){
            wrecker_obj.moving = "up-right";
        }

        else if(wrecker_obj.collided_with == "right"){
            wrecker_obj.moving = "down-left";
            // console.log("Move Exception");
            // console.log(wrecker_obj.moving);
            // console.log(wrecker_obj.collided_with);
        }
    }

    else if(wrecker_obj.moving == "down-right"){
        if(wrecker_obj.collided_with == "right"){
            wrecker_obj.moving = "down-left";
        }

        else if(wrecker_obj.collided_with == "bottom"){
            wrecker_obj.moving = "up-right"; //life lost if below a certain number of pixels
        }

        else if(wrecker_obj.collided_with == "top"){
            wrecker_obj.moving = "down-left";
        }

        else if(wrecker_obj.collided_with == "left"){
            wrecker_obj.moving = "up-right";
            // console.log("Move Exception");
            // console.log(wrecker_obj.moving);
            // console.log(wrecker_obj.collided_with);
        }
    }

    else if(wrecker_obj.moving == "down-left"){
        // console.log("Deflect at Bottom");
        if(wrecker_obj.collided_with == "left"){
            wrecker_obj.moving = "down-right";
        }

        else if(wrecker_obj.collided_with == "bottom"){
            wrecker_obj.moving = "up-left"; //life lost if below a certain number of pixels
        }

        else if(wrecker_obj.collided_with == "top"){
            wrecker_obj.moving = "down-right";
        }

        else if(wrecker_obj.collided_with == "right"){
            wrecker_obj.moving = "up-left";
            // console.log("Move Exception");
            // console.log(wrecker_obj.moving);
            // console.log(wrecker_obj.collided_with);
        }
    }
}

function move_user(event){
    if(event.key == "ArrowRight" && user_xcor<90)
    {
        // user_stats = user.getBoundingClientRect(); 
        // console.log(user_stats);
        user_xcor = user_xcor+5;
        // console.log(user_xcor);
        user.setAttribute("style", `left: ${user_xcor}%;`); //style="left: 50%;";
    }
    else if(event.key == "ArrowLeft" && user_xcor>0)
    {
        // user_stats = user.getBoundingClientRect(); 
        // console.log(user_stats);
        user_xcor = user_xcor-5;
        // console.log(user_xcor);
        user.setAttribute("style", `left: ${user_xcor}%;`); //style="left: 50%;";
    }
    get_user_corrs();
}

function gen_user(){
    user_div = document.createElement("div");
    user_div.classList.add("user");
    user_div.setAttribute("id", "user");
    user_div.setAttribute("style", "left: 50%;"); //style="left: 50%;";
    game_container.appendChild(user_div);
}

function gen_wrecker(){
    wrecker_div = document.createElement("div");
    wrecker_div.classList.add("wrecker");
    wrecker_div.setAttribute("id", "wrecker");
    wrecker_div.setAttribute("style", "left: 50%; top: 50%;"); //style="left: 50%;";
    game_container.appendChild(wrecker_div);
}

function gen_bricks_all(){

    gen_bricks_bytype("l", 0);  //first parameter is type and the second is the layer number of this type
    gen_bricks_bytype("m", 0);
    gen_bricks_bytype("s", 0);
    gen_bricks_bytype("l", 1);
    gen_bricks_bytype("m", 1);
    gen_bricks_bytype("s", 1);
    gen_bricks_bytype("l", 2);
    gen_bricks_bytype("m", 2);
    gen_bricks_bytype("s", 2);
}

function gen_bricks_bytype(type, seq){

    let number = 0;
    let bl_class = "";
    let brick_type = "";

    if (type == "l"){
        number = 4;
        bl_class = "bl-l";
        brick_type = "l";
    }
    else if (type == "m"){
        number = 8;
        bl_class = "bl-m";
        brick_type = "m";
    }
    else if (type == "s"){
        number = 16;
        bl_class = "bl-s";
        brick_type = "s";
    }
    else{
        console.log("Error Generating Bricks for the Wall");
        return 0;
    }
    const layer_div = document.createElement("div");
    layer_div.classList.add(bl_class);
    for(let i=number*seq; i<number*seq+number; ++i){

        brick_div = document.createElement("div");
        brick_div.classList.add(`bricks-${brick_type}`);
        brick_div.classList.add(`bricks`);
        brick_div.setAttribute("id", `${brick_type}-${i}`);
        layer_div.appendChild(brick_div);
    }
    game_container.appendChild(layer_div);
}

// brick = document.getElementById("l-2");
// console.log(brick.getBoundingClientRect());
// brick.style.visibility = "hidden";