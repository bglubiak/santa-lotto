import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function shuffle(array: string[]): string[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function drawNames(names: string[]): Record<string, string> {
    let shuffledNames = shuffle([...names]);
    const result: Record<string, string> = {};

    for (let i = 0; i < names.length; i++) {
        if (names[i] === shuffledNames[i]) {
            // If a person is assigned to themselves, reshuffle
            return drawNames(names);
        }
        result[names[i]] = shuffledNames[i];
    }
    return result;
}

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
    const receivers = new Set(Object.values(result));
    const personsWithoutGift = names.filter(name => !receivers.has(name));

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
