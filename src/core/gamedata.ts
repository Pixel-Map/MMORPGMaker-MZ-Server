import * as fs from 'fs';

/*****************************
 PUBLIC FUNCTIONS
 *****************************/

export default class GameData {
    private path = '../../' + process.env.GAME_PATH;
    public loaded = false;
    public data = {};

    constructor() {
        this.reloadData();
        console.log(`[I] ${Object.keys(this.data).length} game files loaded.`);
        console.log('[I] Game data initialized with success.');
        this.loaded = true;
    }

    // Reload the game files data
    async reloadData() {
        const correctedPath = `${__dirname}/${this.path}data`;
        try {
            const stats = fs.statSync(`${correctedPath}`);

            if (!stats.isDirectory()) {
                return console.log("[O] Data folder doesn't seems to exist.");
            }

            const files = fs.readdirSync(correctedPath, { withFileTypes: true });
            {
                for (const file of files) {
                    const fileName = file.name.split('.json')[0];

                    if (file.name.includes('.json')) {
                        const fileData = await fs.readFileSync(`${correctedPath}/${file.name}`, { encoding: 'utf-8' });
                        this.data[fileName] = JSON.parse(fileData);
                    }
                }
            }
        } catch (e) {
            console.log(e);
            return console.log('[O] Could not find game data directory.');
        }
    }

    // Save the data back to the game files
    saveData(dataName) {
        if (this.data[dataName] === undefined) {
            return console.log("[O] Data doesn't seems to exist.");
        }

        const correctedPath = `${__dirname}/${this.path}data`;

        fs.writeFile(`${correctedPath}/${dataName}.json`, JSON.stringify(this.data[dataName]), function (err) {
            if (err) {
                return console.log(`[O] Error while saving ${dataName}`);
            }

            console.log(`[I] ${dataName} was saved with success.`);
        });
    }
}
