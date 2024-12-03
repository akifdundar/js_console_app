import { readFile } from "fs/promises";
import { ref, set } from "firebase/database";
import { rdb } from "./firebase.js";

async function initializeDataBase() {
    try {
        const data = await readFile("data.json", "utf-8");            
        const pool = JSON.parse(data);

        await set(ref(rdb), pool);
        console.log("Database has been initialized succesfuly");

    } 
    catch(err) {
        console.error("Error ocurred while initialize database", err);
    }     
}

export { initializeDataBase };