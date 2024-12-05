import inquirer from "inquirer";
import { runTransaction } from "firebase/database";
import { rdb } from "./firebase.js";

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
}


async function swapA(amount, userID) {
  const userRef = ref(rdb, "users/" + userID);
  const poolRef = ref(rdb, "pool");

  try {
    await runTransaction(poolRef, (CurrentPool) => {
      if (!CurrentPool) {
        console.log("No data found in 'pool'.");
        return null; // Abort transaction
      }

      return runTransaction(userRef, (CurrentUser) => {
        if (!CurrentUser) {
          console.log(`No data found for user: ${userID}`);
          return null; // Abort transaction
        }

        if (CurrentUser.tokenA < amount) {
          console.log("Insufficient Token A balance.");
          return null; // Abort transaction
        }

        // Perform the swap
        CurrentUser.tokenA -= amount; // Deduct Token A from user
        CurrentPool.tokenA += amount; // Add Token A to pool

        const tempB = CurrentPool.K / CurrentPool.tokenA; // Calculate new Token B
        CurrentUser.tokenB += CurrentPool.tokenB - tempB; // Add equivalent to users Token Balance
        CurrentPool.tokenB = tempB; // Update pool Token B

        return {
          CurrentPool,
          CurrentUser
        };
      })
        .then(() => {
          console.log("User transaction successful.");
        })
        .catch((error) => {
          console.log("User transaction failed:", error);
        });
    })
      .then(() => {
        console.log("Pool transaction successful.");
      })
      .catch((error) => {
        console.log("Pool transaction failed:", error);
      });
  } catch (error) {
    console.error("Error in swapA:", error);
  }
}


async function swapB(amount, userID) {
  const userRef = ref(rdb, "users/" + userID);
  const poolRef = ref(rdb, "pool");

  try {
    await runTransaction(poolRef, (CurrentPool) => {
      if (!CurrentPool) {
        console.log("No data found in 'pool'.");
        return null; // Abort transaction
      }

      return runTransaction(userRef, (CurrentUser) => {
        if (!CurrentUser) {
          console.log(`No data found for user: ${userID}`);
          return null; // Abort transaction
        }

        if (CurrentUser.tokenB < amount) {
          console.log("Insufficient Token B balance.");
          return null; // Abort transaction
        }

        // Perform the swap
        CurrentUser.tokenB -= amount; // Deduct Token B from user
        CurrentPool.tokenB += amount; // Add Token B to pool

        const tempA = CurrentPool.K / CurrentPool.tokenB; // Calculate new Token A
        CurrentUser.tokenA += CurrentPool.tokenA - tempA; // Add equivalent users Tokan Balanca
        CurrentPool.tokenA = tempA; // Update pool Token A

        return {
          CurrentPool,
          CurrentUser
        };
      }).then(() => {
          console.log("User transaction successful.");
        }).catch((error) => {
          console.log("User transaction failed:", error);
        });
    }).then(() => {
        console.log("Pool transaction successful.");
      }).catch((error) => {
        console.log("Pool transaction failed:", error);
      });
  } catch (error) {
    console.error("Error in swapB:", error);
  }
}

export {swap}