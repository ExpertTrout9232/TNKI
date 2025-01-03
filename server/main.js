import { Server } from "socket.io";


//NASLEDUJICI COMMENT JE POUZE PRIKLAD JAK VYPADA MAP ARRAY


//* Herní mapa, 1 reprezentzuje překážku, 0 volnou cestu. Můžeš si jí libovolně upravit.
// const map = [
//     [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
//     [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0],
//     [0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1],
//     [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
//     [1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
//     [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0],
//     [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
// ];




let map = [];
// ????
// ^^ coe more
// Mluv CESKY VOLE jsme v cesku ne


// ??
//^^ kamo coe
// ^^^^^^ ????????????????

// funkce pro lepsi logovani
function info(type, varfunc, vfname, message) {
    let final;
    if (type == "info" || type == "INFO" || type == "inf") {
        final = "[INFO] ";
    }
    if (type == "warn" || type == "WARN" || type == "war" || type == "warning" || type == "WARNING") {
        final = "[WARN] ";
    }
    if (type == "err" || type == "ERR" || type == "error" || type == "ERROR" || type == "fatal" || type == "FATAL") {
        final = "[ERR] ";
    }

    if (varfunc == "func" || varfunc == "FUNC") {
        final = final + "[FUNC ";
    }
    if (varfunc == "var" || varfunc == "VAR") {
        final = final + "[VAR ";
    }
    if (varfunc == "") {
        final = final + "[";
    }
    final = final + vfname + "] " + message;

    console.log(final);
}



//tohle generuje RANDOM INT, v min a max args zadas range generovani a vyplivne ti to random cele cislo
function ranint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}




//Funkce na generovani mapy, do argumentu zadas vysku a sirku (nemusis pocitat s nulou takze to je presne to co tam zadas)
//do closeness zadas jak ma ta mapa byt zahustena (cim vetsi cislo, tim vic barikad bude, maximalni hodnota closeness je 10, jakmile hodnota presahne 10, nic uz se menit nebude)
function generateMap(h, w, closeness) {
    function ranint(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function isWalkable(x, y, local_map) {
        return x >= 0 && x < h && y >= 0 && y < w && local_map[x][y] === 0;
    }

    function floodFill(x, y, visited, local_map) {
        let stack = [[x, y]];
        visited[x][y] = true;

        while (stack.length > 0) {
            let [cx, cy] = stack.pop();

            let neighbors = [
                [cx - 1, cy], [cx + 1, cy], 
                [cx, cy - 1], [cx, cy + 1]
            ];

            for (let [nx, ny] of neighbors) {
                if (isWalkable(nx, ny, local_map) && !visited[nx][ny]) {
                    visited[nx][ny] = true;
                    stack.push([nx, ny]);
                }
            }
        }
    }

    let local_map = [];
    let generate = true;
    let cycles = 0;

    // Initial map generation
    info("info", "FUNC", "generatingMap", "Generating map array...")
    for (let i = 0; i < h; i++) {
        local_map.push([]);
        for (let j = 0; j < w; j++) {
            let ranNum = ranint(1, 10);
            if (ranNum <= closeness) {
                local_map[i].push(1);  // Obstacle
            } else {
                local_map[i].push(0);  // Walkable path
            }
        }
    }

    // Adjust map until it is fully connected
    info("info", "FUNC", "generatingMap", "Finishing map...")
    while (generate) {
        generate = false;
        let visited = Array.from({ length: h }, () => Array(w).fill(false));

        // Find a starting point for flood fill
        info("info", "FUNC", "generatingMap", "Setting up floodfill...")
        let startX = -1, startY = -1;
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                if (local_map[i][j] === 0) {
                    startX = i;
                    startY = j;
                    break;
                }
            }
            if (startX !== -1) break;
        }

        if (startX === -1) return local_map; // No walkable tiles, return as-is

        // Perform flood fill
        info("info", "FUNC", "generatingMap", "Runnning floodfill...")
        floodFill(startX, startY, visited, local_map);

        // Identify disconnected areas and remove obstacles to connect them
        info("info", "FUNC", "generatingMap", "Correcting map...")
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                if (local_map[i][j] === 0 && !visited[i][j]) {
                    // Remove a nearby obstacle to connect this region
                    let neighbors = [
                        [i - 1, j], [i + 1, j],
                        [i, j - 1], [i, j + 1]
                    ];
                    for (let [nx, ny] of neighbors) {
                        if (nx >= 0 && nx < h && ny >= 0 && ny < w && local_map[nx][ny] === 1) {
                            local_map[nx][ny] = 0;  // Remove obstacle
                            generate = true; // Re-run flood fill to verify connectivity
                            break;
                        }
                    }
                }
            }
        }

        cycles += 1;
        if (cycles > h * w) {
            info("err", "FUNC", "generateMap", "Too many cycles, something might be wrong")
            break;
        }
    }

    console.log("[INFO] [VAR map]: \n");
    for (let a = 0; a < h; a++) {
        console.log("[" + local_map[a] + "]");
    }

    return local_map;
}




//TODO: dodelat to, aby si hrac mohl zvolit vysku a sirku a closeness mapy







const shuffle_map = () => {
    
    return map.slice();
}

//* Barvy tanků
const colors = ["red", "green", "blue", "yellow"];

//* Souřadnice spawnu jednotlivých tanků
const start_positions = [
    { x: 0, y: 0 },
    { x: 11, y: 0 },
    { x: 0, y: 11 },
    { x: 11, y: 11 },
];

//? Změnil jsi ovládání pohybu? Ujisti se, že jsou u klineta nastaveny stejné klávesy jako zde!
const map_key_value = new Map([
    ["ArrowUp", { x: 0, y: -1 }],
    ["ArrowLeft", { x: -1, y: 0 }],
    ["ArrowDown", { x: 0, y: 1 }],
    ["ArrowRight", { x: 1, y: 0 }],
]);

const rooms = new Map();
const map_id_room = new Map();

class Room {
    started = false;
    tanks = new Map();

    constructor(session_id, tank, max_players, room_name, game_map) {
        this.admin = session_id;
        this.max_players = max_players;
        this.room_name = room_name;
        this.game_map = game_map;

        this.tanks.set(session_id, tank);
        map_id_room.set(session_id, room_name);
    }

    join(session_id, tank) {
        this.tanks.set(session_id, tank);
        map_id_room.set(session_id, this.room_name);
    }

    //TODO: Vytvoř metodu pro smazání hráče ze serveru

    tanks_length() {
        return this.tanks.size;
    }

    //TODO: Implementuj metodu pro doplnění nábojů

}

class Tank {
    constructor(index, player_name, session_id) {
        //TODO: Přidej tanku potřebné atributy - směr, životy, náboje
        this.x = start_positions[index].x;
        this.y = start_positions[index].y;
        this.color = colors[index];
        this.player_name = player_name;
        this.index = index;
        this.session_id = session_id;
    }


    //! Místo této funkce
    //TODO: Vytvoř metodu, která ověří správnost souřadnic
    validate_move (next_x, next_y) {
        if (next_y < 0 || next_y >= map.length || next_x < 0 || next_x >= map[0].length || map[next_y][next_x] == 1) {
            return false;
        }
        return true;
    }

    move(key, shift) {
        const action = map_key_value.get(key);

        //TODO: Pokud je stisknuta klávesa "shift", tak tank mění pouze směr

        if (this.validate_move(this.x + action.x, this.y + action.y)) {
            this.x += action.x;
            this.y += action.y;

            //TODO: Automatická změna směru, dle pohybu. Nezapomeň tuto informaci zahrnout v return statementu!

            return [{ property: "x", value: this.x }, { property: "y", value: this.y }];
        }

        return false;
    }

    shoot() {
        //TODO: Ověř dostatek nábojů pro střelbu

        //TODO: Nezapomeň tanku po výstřelu odebrat náboj!

        let first_baricade = {}
        const hits = [];

        let map_cp = rooms.get(map_id_room.get(this.session_id)).game_map;

        //TODO: Změň směr střely podle natočení tanku

        let dir_coef = { x: 1, y: 0 };

        for (let i = 1; i <= map_cp.length; i++) {
            //* Kolize střely se zdí
            if (map_cp[this.y + i * dir_coef.y] === undefined || map_cp[this.y + i * dir_coef.y][this.x + i * dir_coef.x] === undefined) {
                first_baricade = { x: this.x + (i - 1) * dir_coef.x, y: this.y + (i - 1) * dir_coef.y };
                break;
            };

            //TODO: Zachyť kolizi střely s barikádou

            //TODO: Najdi zasáhnuté tanky a zavolej na nich metodu hit()
        }
        return { path: [first_baricade, { x: this.x, y: this.y }], hits: hits };
    }
}

const io = new Server(3000, { cors: { origin: '*' } });

//TODO: Vytvoř interval, který bude pravidelně doplňovat náboje

let mps




io.on("connection", (socket) => {
    console.log('A user connected');
  
    socket.on('inputValue', (inputValue) => {
      info("info", "var", "inputValue", inputValue);
      mps = inputValue;
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });

    socket.on("create_room", (msg) => {
        if (rooms.has(msg.room_name)) {
            socket.emit("error", { message: "Room with this name already exists" });
            return;
        }

        //Pokud je delka jmena hrace nebo nazev roomky delsi nez 12, program vypise error

        if (msg.player_name.length > 12) {
            socket.emit("error", { message: "The player name must not be longer than 12 characters!" });
            info("ERR", "var", "player_name", "Player name is too long (it's longer than 12 characters)"); // gramatika ty nic nerika ???? ja si totiz vsymam detailu, jsme tajni agent 007 fbi cia, naserte sy
            msg.player_name = msg.player_name.slice(0, 12);
            io.emit('player_name_updated', msg);
            info("info", "", "IO", "Updated player name for the invalid username client"); // invalidni vozik reference
        }

        if (msg.room_name.length > 12) {
            socket.emit("error", { message: "The room name must not be longer than 12 characters!" });
            info("ERR", "var", "room_name", "Room name is too long (it's longer than 12 characters)"); // gramatika ty nic nerika ???? ja si totiz vsymam detailu, jsme tajni agent 007 fbi cia, naserte sy
            msg.room_name = msg.room_name.slice(0, 12);
            io.emit('room_name_updated', msg);
            info("info", "", "IO", "Updated room name for the invalid roomname client host"); // invalidni vozik reference
        }
        

        const admin_tank = new Tank(0, msg.player_name, socket.id);
        

        rooms.set(msg.room_name, new Room(socket.id, admin_tank, msg.max_players, msg.room_name, shuffle_map()));

        socket.join(msg.room_name);

        socket.emit("room_joined", { player_index: 0, room_name: msg.room_name, max_players: msg.max_players });
    });

    socket.on("join_room", (msg) => {
        const room = rooms.get(msg.room_name);

        if (!room) {
            socket.emit("error", { message: "Room with this name doesn't exist! You can create one." });
            return;
        }

        if (room.started) {
            socket.emit("error", { message: "Room already started!" });
            return;
        }

        if (room.tanks_length() == room.max_players) {
            socket.emit("error", { message: "Room is full!" });
            return;
        }

        if (msg.player_name.length > 12) {
            socket.emit("error", { message: "The player name must not be longer than 12 characters!" });
            info("ERR", "var", "player_name", "Player name is too long (it's longer than 12 characters)"); // gramatika ty nic nerika ???? ja si totiz vsymam detailu, jsme tajni agent 007 fbi cia, naserte sy
            msg.player_name = msg.player_name.slice(0, 12);
            io.emit('player_name_updated', msg);
            info("info", "", "IO", "Updated player name for the invalid username client"); // invalidni vozik reference
        }

        const new_tank = new Tank(room.tanks_length(), msg.player_name, socket.id);

        room.join(socket.id, new_tank);

        socket.join(msg.room_name);

        socket.emit("room_joined", { player_index: new_tank.index, room_name: msg.room_name, max_players: room.max_players });

        io.to(msg.room_name).emit("update_players", { player_count: room.tanks_length(), max_players: room.max_players });
    })

    //TODO: Přidej event handler pro doborovolné odpojení hráče z čekajcí místnosti (lobby)
    socket.on("leave_room", () => {
    });

    socket.on("start_room", () => {

        let he = 50 * mps;
        let wi = 50 * mps;

        socket.emit('setDimensions', { width: he, height: wi });

        info("info", "var", "mps", mps);
        map = generateMap(mps, mps, 3);

        const room = rooms.get(map_id_room.get(socket.id));

        //TODO: Přidej podmínku, aby mohl místnost spustit jen admin
        
        room.started = true;
        io.to(room.room_name).emit("room_started", { tanks: [...room.tanks.entries()], map: map, room_name: room.room_name });
    });

    socket.on("update_move", (msg) => {
        const room = rooms.get(map_id_room.get(socket.id));

        if (!room) {
            //Místnost není aktivní!
            return;
        };

        const tank = room.tanks.get(socket.id);

        const update_msg = tank.move(msg.key, msg.shift);

        if (update_msg) {
            io.to(room.room_name).emit("move_updated", { id: socket.id, update: update_msg });
        }
    });

    socket.on("update_shoot", () => {
        const room = rooms.get(map_id_room.get(socket.id));

        if (!room) {
            return;
        };

        const tank = room.tanks.get(socket.id);

        const update_msg = tank.shoot();

        if (update_msg) {
            io.to(room.room_name).emit("shoot_updated", update_msg);
            io.to(room.room_name).emit("ammo_updated", { tank_id: tank.id, ammo: tank.ammo });
        }
    });

    socket.on('disconnect', () => {
        const room = rooms.get(map_id_room.get(socket.id));

        if (!room) {
            //Místnost není aktivní!
            return;
        }

        //TODO: Nezapomeň zavolat metodu kick pro smazání dat o hráči

        io.to(room.room_name).emit("player_left", { player_id: socket.id });

        if (room.tanks_length() === 1) {
            io.to(room.room_name).emit("win");
        }
    });
});