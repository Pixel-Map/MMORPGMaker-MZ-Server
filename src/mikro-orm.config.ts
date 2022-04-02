import { Player } from './entities/Player';
import { Skin } from './entities/Skin';
import { Stats } from './entities/Stats';

export default {
    entities: [Player, Skin, Stats],
    type: 'postgresql',
    dbName: 'postgres', // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
};
