import inquirer from "inquirer";
import { runTransaction, get, set, ref } from "firebase/database";
import { rdb } from "./firebase.js";
import { getBalance } from "./get_printBalance.js";

async function swap(userID) {
  try {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "selection",
        message: "Which token would you like to swap?",
        choices: [
          { name: "1. Swap Token A -> Token B", value: "A->B" },
          { name: "2. Swap Token B -> Token A", value: "B->A" },
        ],
      },
    ]);

    const amount = await inquirer.prompt([
      {
        type: "input",
        name: "userValue",
        message: "How much would you like to swap?",
        validate: (input) =>
          !isNaN(input) && input > 0 ? true : "Please enter a valid number.",
      },
    ]);

    const amt = parseFloat(amount.userValue); // Convert input to number

    switch (answers.selection) {
      case "A->B":
        await swapA(amt, userID);
        break;

      case "B->A":
        await swapB(amt, userID);
        break;

      default:
        console.log("Invalid selection.");
    }
  } catch (error) {
    console.log("Error occurred during operation:", error);
  }
  getBalance("userD");
}


async function swapA(amount, userID) {
  const userRef = ref(rdb, "users/" + userID);
  const poolRef = ref(rdb, "pool");

  try {
    // Fetch user data separately
    const userSnapshot = await get(userRef);
    if (!userSnapshot.exists()) {
      console.error("No user data found.");
      return;
    }
    const userData = userSnapshot.val();

    // Check if the user has enough TokenA
    if (userData.tokenA < amount) {
      console.error("Insufficient TokenA balance.");
      return;
    }

    // Perform pool transaction
    await runTransaction(poolRef, (currentPool) => {
      if (!currentPool) {
        console.error("No pool data found.");
        return null; // Abort transaction
      }

      // Deduct TokenA from the user and add to the pool
      userData.tokenA -= amount;
      currentPool.tokenA += amount;

      // Calculate new TokenB in the pool
      const newTokenB = currentPool.K / currentPool.tokenA;

      // Update TokenB balances
      const userTokenBGain = currentPool.tokenB - newTokenB;
      userData.tokenB += userTokenBGain;
      currentPool.tokenB = newTokenB;

      return currentPool; // Updated pool data
    });

    // Update user data
    await set(userRef, userData);

    console.log("Swap successful!");
  } catch (error) {
    console.error("Error in swapA:", error);
  }
}



async function swapB(amount, userID) {
  const userRef = ref(rdb, "users/" + userID);
  const poolRef = ref(rdb, "pool");

  try {
    // Fetch user data separately
    const userSnapshot = await get(userRef);
    if (!userSnapshot.exists()) {
      console.error("No user data found.");
      return;
    }
    const userData = userSnapshot.val();

    // Check if the user has enough TokenA
    if (userData.tokenB < amount) {
      console.error("Insufficient TokenA balance.");
      return;
    }

    // Perform pool transaction
    await runTransaction(poolRef, (currentPool) => {
      if (!currentPool) {
        console.error("No pool data found.");
        return null; // Abort transaction
      }

      // Deduct TokenA from the user and add to the pool
      userData.tokenB -= amount;
      currentPool.tokenB += amount;

      // Calculate new TokenB in the pool
      const newTokenA = currentPool.K / currentPool.tokenB;

      // Update TokenB balances
      const userTokenAGain = currentPool.tokenA - newTokenA;
      userData.tokenA += userTokenAGain;
      currentPool.tokenA = newTokenA;

      return currentPool; // Updated pool data
    });

    // Update user data
    await set(userRef, userData);

    console.log("Swap successful!");
  } catch (error) {
    console.error("Error in swapA:", error);
  }
}

export {swap}