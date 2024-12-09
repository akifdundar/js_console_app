import inquirer from "inquirer";
import { runTransaction, get, set, ref } from "firebase/database";
import { rdb } from "./firebase.js";
import { getBalance } from "./get_printBalance.js";

async function liquidity(userID) {
  try {
    const amount = await inquirer.prompt([
      {
        type: "input",
        name: "userValue",
        message: "How much liquidity (Token A equivalent) would you like to add to the pool: ",
        validate: (input) =>
          !isNaN(input) && input > 0 ? true : "Please enter a valid number.",
      },
    ]);

    const amt = parseFloat(amount.userValue);
    await addLiquidity(amt, userID);
  } catch (error) {
    console.log("Error occurred during operation:", error);
  }
  getBalance(userID);
}

async function addLiquidity(amountA, userID) {
  const userRef = ref(rdb, "users/" + userID);
  const poolRef = ref(rdb, "pool");

  try {
    const userSnapshot = await get(userRef);
    if (!userSnapshot.exists()) {
      console.error("No user data found.");
      return;
    }

    const userData = userSnapshot.val();
    const poolSnapshot = await get(poolRef);
    if (!poolSnapshot.exists()) {
      console.error("No pool data found.");
      return;
    }

    const poolData = poolSnapshot.val();
    const { tokenA: poolTokenA, tokenB: poolTokenB } = poolData;

    const tokenBRatio = poolTokenB / poolTokenA;
    const requiredTokenB = amountA * tokenBRatio;

    if (userData.tokenA < amountA) {
      console.error("Insufficient Token A balance.");
      return;
    }
    if (userData.tokenB < requiredTokenB) {
      console.error(
        `Insufficient Token B balance. You need ${requiredTokenB.toFixed(
          2
        )}, but have only ${userData.tokenB.toFixed(2)}.`
      );
      return;
    }

    await runTransaction(poolRef, (currentPool) => {
      if (!currentPool) return null;

      currentPool.tokenA += amountA;
      currentPool.tokenB += requiredTokenB;
      currentPool.K = currentPool.tokenA * currentPool.tokenB; 
      return currentPool;
    });

    userData.tokenA -= amountA;
    userData.tokenB -= requiredTokenB;

    await set(userRef, userData);
    console.log("Liquidity added successfully!");
  } catch (error) {
    console.error("Error in addLiquidity:", error);
  }
}

export { liquidity };
