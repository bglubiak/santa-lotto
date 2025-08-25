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
    let receivers = shuffle([...names]);

    for (let i = 0; i < names.length; i++) {
        if (names[i] === receivers[i]) {
            // If a person is assigned to themselves, swap with the next person.
            // This is a simple way to resolve self-assignments.
            const nextIndex = (i + 1) % names.length;
            [receivers[i], receivers[nextIndex]] = [receivers[nextIndex], receivers[i]];
        }
    }

    // Final check to ensure no one has themselves. If they do, it means the simple swap wasn't enough.
    // This can happen if the last person in the swapped pair also ends up with themselves.
    // In this rare case, we just run the draw again.
    for (let i = 0; i < names.length; i++) {
        if (names[i] === receivers[i]) {
            return drawNames(names);
        }
    }

    const result: Record<string, string> = {};
    for (let i = 0; i < names.length; i++) {
        result[names[i]] = receivers[i];
    }
    return result;
}

function getNamesFromInput(input: string): string[] {
    return input.split(',').map(name => name.trim());
}

function printResults(result: Record<string, string>): void {
    console.log('Gift Exchange Results:');
    console.log('======================');
    for (const [giver, receiver] of Object.entries(result)) {
        console.log(`🎁 ${giver} buys a gift for ${receiver}`);
    }
    console.log('======================\n');
    console.log('Everyone has a gift.');
}

function runLotto(names: string[]): void {
    const numberOfPersons = names.length;
    console.log(`Number of persons: ${numberOfPersons}`);

    if (numberOfPersons < 2) {
        console.log('Please enter at least two names.');
        return;
    }

    const result = drawNames(names);
    printResults(result);
}

function main() {
    rl.question('Enter names separated by commas: ', (input: string) => {
        const names = getNamesFromInput(input);
        runLotto(names);
        rl.close();
    });
}

main();
