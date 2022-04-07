import * as fs from 'fs';
import pino from 'pino';
import Logger = pino.Logger;
/*****************************
 PUBLIC FUNCTIONS
 *****************************/

export default class GameData {
    private path = '../../' + process.env.GAME_PATH;
    public loaded = false;
    public data = {
        Actors: undefined,
    };
    logger: Logger;
    constructor(logger: Logger) {
        this.logger = logger;
        this.reloadData().then((r) => {
            logger.info(`[I] ${Object.keys(this.data).length} game files loaded.`);
            logger.info('[I] Game data initialized with success.');
            this.loaded = true;
        });
    }

    // Reload the game files data
    async reloadData() {
        const correctedPath = `${__dirname}/${this.path}data`;
        try {
            const stats = fs.statSync(`${correctedPath}`);

            if (!stats.isDirectory()) {
                return this.logger.info("[O] Data folder doesn't seems to exist.");
            }

            const files = fs.readdirSync(correctedPath, { withFileTypes: true });
            {
                for (const file of files) {
                    const fileName = file.name.split('.json')[0];

                    if (file.name.includes('.json')) {
                        const fileData = fs.readFileSync(`${correctedPath}/${file.name}`, { encoding: 'utf-8' });
                        this.data[fileName] = JSON.parse(fileData);
                    }
                }
            }
        } catch (e) {
            this.logger.error(e);
            return this.logger.error('[O] Could not find game data directory.');
        }
    }

    // Save the data back to the game files
    saveData(dataName) {
        if (this.data[dataName] === undefined) {
            return this.logger.error("[O] Data doesn't seems to exist.");
        }

        const correctedPath = `${__dirname}/${this.path}data`;

        fs.writeFile(`${correctedPath}/${dataName}.json`, JSON.stringify(this.data[dataName]), function (err) {
            if (err) {
                return this.logger.error(`[O] Error while saving ${dataName}`);
            }

            this.logger.info(`[I] ${dataName} was saved with success.`);
        });
    }
}
