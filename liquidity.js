import inquirer from "inquirer";
import { runTransaction, ref, set, get } from "firebase/database";
import { rdb } from "./firebase.js";
import { getBalance } from "./get_printBalance.js";

async function liquidity(userID) {
    try {
        const answers = await inquirer.prompt([
            {
                type: "list",
                name: "selection",
                message: "Which token would you like to add to the pool from your wallet?",
                choices: [
                    { name: "1. Liquidate token A to Pool", value: "A->pool" },
                    { name: "2. Liquidate token B to Pool", value: "B->pool" },
                ],
            },
        ]);

        const amount = await inquirer.prompt([
            {
                type: "input",
                name: "userValue",
                message: "How many tokens would you like to add to the pool from your wallet?",
                validate: (input) =>
                    !isNaN(input) && input > 0 ? true : "Please enter a valid number.",
            },
        ]);

        const amt = parseFloat(amount.userValue);

        switch (answers.selection) {
            case "A->pool":
            case "B->pool":
                await liquidate(amt, userID, answers.selection);
                break;

            default:
                console.error("Invalid selection.");
        }
    } catch (error) {
        console.error("Error occurred during operation:", error);
    }
    getBalance(userID);
}

async function liquidate(amt, userID, tokenType) {
    const userRef = ref(rdb, "users/" + userID);
    const poolRef = ref(rdb, "pool");

    try {
        const userSnapshot = await get(userRef);
        const poolSnapshot = await get(poolRef);

        if (!userSnapshot.exists()) {
            console.error("No user data found.");
            return;
        }
        if (!poolSnapshot.exists()) {
            console.error("No pool data found.");
            return;
        }

        const userData = userSnapshot.val();

        let userToken, poolToken, otherToken;
        let isTokenAtoPool = tokenType === "A->pool";

        if (isTokenAtoPool) {
            userToken = userData.tokenA;
            poolToken = "tokenA";
            otherToken = "tokenB";
        } else {
            userToken = userData.tokenB;
            poolToken = "tokenB";
            otherToken = "tokenA";
        }

        if (userToken < amt) {
            console.error(`Insufficient ${poolToken} balance. You need ${amt} token, but have only ${userToken} token.`);
            return;
        }

        await runTransaction(poolRef, (currentPool) => {
            if (!currentPool) {
                console.error("No pool data found.");
                return null;
            }

            currentPool[poolToken] += amt;
            currentPool.K = currentPool[poolToken] * currentPool[otherToken];

            return currentPool;
        });

        userData[poolToken] -= amt;
        await set(userRef, userData);

        console.log("Liquidate successful!");
    } catch (error) {
        console.error("Error in liquidate:", error);
    }
}

export { liquidity };
