import readline from 'readline';
import { MongoClient } from 'mongodb';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Voer de naam van het deck in: ', (deckName) => {
    rl.question('Voer de kaarten in, gescheiden door komma\'s: ', (cardsInput) => {
        const cards = cardsInput.split(',').map(card => card.trim());
        console.log(`Deck naam is: ${deckName}`);
        console.log('Kaarten in het deck:', cards);
        rl.close();
    });
});
const uri = 'mongodb://localhost:27017'; 
const client = new MongoClient(uri);

async function saveDeckToDatabase(deckName: string, cards: string[]) {
    try {
        await client.connect();
        const database = client.db('mtg');
        const collection = database.collection('decks');
        const deck = { name: deckName, cards: cards, createdAt: new Date() };
        const result = await collection.insertOne(deck);

        console.log(`Deck opgeslagen met ID: ${result.insertedId}`);
    } catch (error) {
        console.error('Fout bij het opslaan van het deck:', error);
    } finally {
        await client.close();
    }
}

saveDeckToDatabase(deckName, cards);