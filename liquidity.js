import inquirer from "inquirer";
import { runTransaction, get, set, ref } from "firebase/database";
import { rdb } from "./firebase.js";
import { getBalance } from "./get_printBalance.js";

async function liquidity(userID) {
  try {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "selection",
        message: "Which token would you like to add to the pool?",
        choices: [
          { name: "1. Add Token A to Pool", value: "A->pool" },
          { name: "2. Add Token B to Pool", value: "B->pool" },
        ],
      },
    ]);

    const amount = await inquirer.prompt([
      {
        type: "input",
        name: "userValue",
        message: "How much would you like to add to the pool: ",
        validate: (input) =>
          !isNaN(input) && input > 0 ? true : "Please enter a valid number.",
      },
    ]);

    const amt = parseFloat(amount.userValue);

    switch (answers.selection) {
      case "A->pool":
        await addLiquidityA(amt, userID);
        break;

      case "B->pool":
        await addLiquidityB(amt, userID);
        break;

      default:
        console.log("Invalid selection.");
    }
  } catch (error) {
    console.log("Error occurred during operation:", error);
  }
  getBalance(userID);
}

async function addLiquidityA(amount, userID) {
  const userRef = ref(rdb, "users/" + userID);
  const poolRef = ref(rdb, "pool");

  try {
    const userSnapshot = await get(userRef);
    if (!userSnapshot.exists()) {
      console.error("No user data found.");
      return;
    }
    const userData = userSnapshot.val();

    if (userData.tokenA < amount) {
      console.error("Insufficient TokenA balance.");
      return;
    }

    await runTransaction(poolRef, (currentPool) => {
      if (!currentPool) {
        console.error("");
        return null;
      }

      // Deduct TokenA from the user and add to the pool
      userData.tokenA -= amount;
      currentPool.tokenA += amount;

      // Calculate the required TokenB to maintain K
      const currentK = currentPool.K;
      const newTokenB = currentK / currentPool.tokenA;

      const addedTokenB = Math.abs(currentPool.tokenB - newTokenB);

      // Check if user has enough TokenB
      if (userData.tokenB < addedTokenB) {
        console.error(
          `Insufficient TokenB balance. You need ${addedTokenB}, but have only ${userData.tokenB}.`
        );
        return null;
      }

      // Update pool and user balances
      currentPool.tokenB = newTokenB;
      userData.tokenB -= addedTokenB;

      return currentPool;
    });

    await set(userRef, userData);
    console.log("Liquidity added successfully!");
  } catch (error) {
    console.error("Error in addLiquidityA:", error);
  }
}

async function addLiquidityB(amount, userID) {
  const userRef = ref(rdb, "users/" + userID);
  const poolRef = ref(rdb, "pool");

  try {
    const userSnapshot = await get(userRef);
    if (!userSnapshot.exists()) {
      console.error("No user data found.");
      return;
    }
    const userData = userSnapshot.val();

    if (userData.tokenB < amount) {
      console.error("Insufficient TokenB balance.");
      return;
    }

    await runTransaction(poolRef, (currentPool) => {
      if (!currentPool) {
        console.error("");
        return null;
      }

      // Deduct TokenB from the user and add to the pool
      userData.tokenB -= amount;
      currentPool.tokenB += amount;

      // Calculate the required TokenA to maintain K
      const currentK = currentPool.K;
      const newTokenA = currentK / currentPool.tokenB;

      const addedTokenA = Math.abs(currentPool.tokenA - newTokenA);

      // Check if user has enough TokenA
      if (userData.tokenA < addedTokenA) {
        console.error(
          `Insufficient TokenA balance. You need ${addedTokenA}, but have only ${userData.tokenA}.`
        );
        return null;
      }

      // Update pool and user balances
      currentPool.tokenA = newTokenA;
      userData.tokenA -= addedTokenA;

      return currentPool;
    });

    await set(userRef, userData);
    console.log("Liquidity added successfully!");
  } catch (error) {
    console.error("Error in addLiquidityB:", error);
  }
}

export { liquidity };
