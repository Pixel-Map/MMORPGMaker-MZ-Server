"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skin = void 0;
var core_1 = require("@mikro-orm/core");
var User_1 = require("./User");
var Skin = /** @class */ (function () {
    function Skin(init) {
        Object.assign(this, init);
    }
    __decorate([
        (0, core_1.PrimaryKey)(),
        __metadata("design:type", Number)
    ], Skin.prototype, "id", void 0);
    __decorate([
        (0, core_1.OneToOne)(function () { return User_1.User; }),
        __metadata("design:type", User_1.User)
    ], Skin.prototype, "user", void 0);
    __decorate([
        (0, core_1.Property)({ default: 'NPCizzleTest' }),
        __metadata("design:type", String)
    ], Skin.prototype, "battlerName", void 0);
    __decorate([
        (0, core_1.Property)({ default: 0 }),
        __metadata("design:type", Number)
    ], Skin.prototype, "characterIndex", void 0);
    __decorate([
        (0, core_1.Property)({ default: 'NPCizzleTest' }),
        __metadata("design:type", String)
    ], Skin.prototype, "characterName", void 0);
    __decorate([
        (0, core_1.Property)({ default: 0 }),
        __metadata("design:type", Number)
    ], Skin.prototype, "faceIndex", void 0);
    __decorate([
        (0, core_1.Property)({ default: 'NPCizzleTest' }),
        __metadata("design:type", String)
    ], Skin.prototype, "faceName", void 0);
    Skin = __decorate([
        (0, core_1.Entity)(),
        __metadata("design:paramtypes", [Object])
    ], Skin);
    return Skin;
}());
exports.Skin = Skin;
