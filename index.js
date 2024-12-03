import { Command } from "commander";
import inquirer from "inquirer";

const program = new Command();


program
    .name("Uniswap V2 DEX")
    .description("Uniswap V2 DEX Simülasyonu")
    .version("0.0.1");

program 
    .command("start-app <username>")
    .description("Log in to app")
        .action((name) => {
            console.log("Hello " + name);
            chooseOption();
        });

async function chooseOption() {
    console.clear();

    const answers = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "ne yapmak istersin kardaş la",
            choices: [
                { name: 'Uniswap V2 DEX Simülasyonu Başlat', value: 'start' },
                { name: 'Versiyon Bilgisi', value: 'version' },
                { name: 'Yardım', value: 'help' },
                { name: 'Çıkış', value: 'exit' },
            ] 
        }
    ]);

    if (answers.action === 'start') {
        console.log('Simülasyon başlatıldı...');
        // Burada simülasyon işlemleri yapılabilir
    } else if (answers.action === 'version') {
        console.log('Versiyon: 1.0.0');
    } else if (answers.action === 'help') {
        program.help(); // Yardım komutunu göster
    } else if (answers.action === 'exit') {
        console.log('Çıkılıyor...');
        process.exit(0); // Uygulamadan çık
    }
}

program.parse();