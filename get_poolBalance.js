import { ref, get } from "firebase/database";
import { rdb } from "./firebase.js";

async function getPool() {
    try {
        const balance1 = await get(ref(rdb, "pool/tokenA"));
        const balance2 = await get(ref(rdb, "pool/tokenB"));
        const balance3 = await get(ref(rdb, "pool/K"));

        if (balance1.exists() && balance2.exists() && balance3.exists()) {
            console.log("\n--------POOL--------");
            console.table({
                tokenA: balance1.val(),
                tokenB: balance2.val(),
                K: balance3.val(),
            });
        } else {
            console.error("No data found for one or more tokens.");
        }
    } catch (error) {
        console.error("Error occurred while getting balance:", error);
    }
}

export { getPool };
