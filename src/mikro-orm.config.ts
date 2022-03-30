import { User } from './entities/User';
import { Skin } from './entities/Skin';
import { Stats } from './entities/Stats';

export default {
    entities: [User, Skin, Stats],
    type: 'postgresql',
    dbName: 'postgres',
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password', // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
};
