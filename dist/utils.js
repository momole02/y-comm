const WORD_DICTIONARY = [
    'lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'eagle', 'dolphin',
    'rose', 'tulip', 'daisy', 'lily', 'sunflower', 'orchid', 'violet', 'daffodil',
    'ocean', 'mountain', 'forest', 'river', 'desert', 'island', 'valley', 'meadow',
    'ruby', 'emerald', 'diamond', 'sapphire', 'gold', 'silver', 'crystal', 'pearl',
    'thunder', 'lightning', 'rainbow', 'sunshine', 'moonlight', 'starlight', 'aurora', 'comet'
];
export function generateClientId() {
    const getRandomWord = () => {
        return WORD_DICTIONARY[Math.floor(Math.random() * WORD_DICTIONARY.length)];
    };
    const word1 = getRandomWord();
    const word2 = getRandomWord();
    const number = Math.floor(Math.random() * 100);
    return `${word1}-${word2}-${number}`;
}
