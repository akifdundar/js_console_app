import inquirer from "inquirer";
import { initializeDataBase  } from "./initializeDatabase.js";  
import { getBalance, printBalance } from "./get_printBalance.js";
import {getPool} from "./get_poolBalance.js"

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
            console.log("...");
            break;
        case "swap":
            console.log("Swap işlemi...");
            break;
        case "pool":
            getPool();
            break;
        case "balance":
            await printBalance();
            break;
        case "exit":
            console.log("Çikiliyor...");
            return;  
        default:
            console.log("Geçersiz seçenek");
            break;
    }

    await menu(); 
}

await initializeDataBase();
await getBalance("userD");  // Bunu uygun durumlarda kullanıcı id'si ile değiştirebiliriz
await menu();