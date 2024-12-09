import inquirer from "inquirer";
import { initializeDataBase  } from "./initializeDatabase.js";  
import { liquidity } from "./liquidity.js";
import { getBalance, printBalance } from "./get_printBalance.js";
import {getPool} from "./get_poolBalance.js";
import { swap } from "./swap.js";

async function menu() {
    
    const answers = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [
                { name: "1. Add Liquidity", value: "add" },
                { name: "2. Swap (Token A -> Token B or Token B -> Token A)", value: "swap" },
                { name: "3. View Pool Status", value: "pool" },
                { name: "4. View User Balance", value: "balance" },
                { name: "5. Exit", value: "exit" },
            ]
        }
    ]);

    switch (answers.action) {
        case "add":
            await liquidity("userD");
            break;
        case "swap":
            await swap("userD");
            break;
        case "pool":
            await getPool();
            break;
        case "balance":
            await printBalance();
            break;
        case "exit":
            console.log("You are quitting...");
            return;  
        default:
            console.log("Unvalid choice");
            break;
    }

    await menu(); 
}

await initializeDataBase();
await getBalance("userD");  // Bunu uygun durumlarda kullanıcı id'si ile değiştirebiliriz
await menu();