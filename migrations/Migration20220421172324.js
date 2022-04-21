"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20220421172324 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20220421172324 extends migrations_1.Migration {
    up() {
        return __awaiter(this, void 0, void 0, function* () {
            this.addSql('create table "player" ("id" varchar(255) not null, "username" varchar(255) not null, "password" varchar(255) not null, "x" int not null default 0, "y" int not null default 0, "status" varchar(255) null, "map_id" int not null default 1, "permission" int not null default 0);');
            this.addSql('alter table "player" add constraint "player_pkey" primary key ("id");');
            this.addSql('create table "skin" ("id" serial primary key, "user_id" varchar(255) not null, "battler_name" varchar(255) not null default \'Actor1\', "character_index" int not null default 0, "character_name" varchar(255) not null default \'Actor1\', "face_index" int not null default 0, "face_name" varchar(255) not null default \'Actor1\');');
            this.addSql('alter table "skin" add constraint "skin_user_id_unique" unique ("user_id");');
            this.addSql('create table "stats" ("id" serial primary key, "user_id" varchar(255) not null, "class_id" int not null default 1, "exp" int not null default 0, "hp" int not null default 544, "mp" int not null default 41, "level" int not null default 1, "items" jsonb not null default \'{}\', "gold" int not null default 0, "equips" text[] not null default \'{}\', "skills" text[] not null default \'{}\');');
            this.addSql('alter table "stats" add constraint "stats_user_id_unique" unique ("user_id");');
            this.addSql('alter table "skin" add constraint "skin_user_id_foreign" foreign key ("user_id") references "player" ("id") on update cascade;');
            this.addSql('alter table "stats" add constraint "stats_user_id_foreign" foreign key ("user_id") references "player" ("id") on update cascade;');
        });
    }
    down() {
        return __awaiter(this, void 0, void 0, function* () {
            this.addSql('alter table "skin" drop constraint "skin_user_id_foreign";');
            this.addSql('alter table "stats" drop constraint "stats_user_id_foreign";');
            this.addSql('drop table if exists "player" cascade;');
            this.addSql('drop table if exists "skin" cascade;');
            this.addSql('drop table if exists "stats" cascade;');
        });
    }
}
exports.Migration20220421172324 = Migration20220421172324;
