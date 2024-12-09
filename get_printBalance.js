import { writeFile, readFile } from "fs/promises";
import { ref, get } from "firebase/database";
import { rdb } from "./firebase.js";

async function getBalance(userID) {
    try {
        const balance = await get(ref(rdb, "users/" + userID));

        if(balance.exists()) {
            await writeFile("user.json", JSON.stringify(balance, null, 2), "utf-8");
        }
        else {
            console.log("No data found while getting data!!");  
        }
    }
    catch(err) {
        console.error("Error occured while getting balance", err);
    }
}

async function printBalance() {
    
    try {
        const balance = JSON.parse(await readFile("user.json", "utf-8"));
        console.log("-----YOUR WALLET-----");
        console.table(balance);
    }
    catch(err) {
        console.log("Error ocurred while printing balance!!", err);
    }
}

export { getBalance, printBalance };