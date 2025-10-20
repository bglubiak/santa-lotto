import * as readline from 'readline';
import { drawNames, computePersonsWithoutGift } from './utils/drawNames';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter names separated by commas: ', (input: string) => {
    const names = input.split(',').map(name => name.trim());
    const numberOfPersons = names.length;
    console.log(`Number of persons: ${numberOfPersons}`);

    if (numberOfPersons < 2) {
        console.log('Please enter at least two names.');
        rl.close();
        return;
    }

    const result = drawNames(names);
    const personsWithoutGift = computePersonsWithoutGift(names, result);

    console.log('Gift Exchange Results:');
    console.log('======================');
    for (const [giver, receiver] of Object.entries(result)) {
        console.log(`🎁 ${giver} buys a gift for ${receiver}`);
    }
    console.log('======================\n');

    if (personsWithoutGift.length > 0) {
        console.log(`Persons without a gift: ${personsWithoutGift.join(', ')}`);
    } else {
        console.log('Everyone has a gift.');
    }

    rl.close();
});
