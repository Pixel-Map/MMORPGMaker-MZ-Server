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
exports.User = void 0;
var core_1 = require("@mikro-orm/core");
var uuid_1 = require("uuid");
var Skin_1 = require("./Skin");
var Stats_1 = require("./Stats");
var User = /** @class */ (function () {
    function User(init) {
        this.id = (0, uuid_1.v4)();
        Object.assign(this, init);
    }
    __decorate([
        (0, core_1.PrimaryKey)(),
        __metadata("design:type", String)
    ], User.prototype, "id", void 0);
    __decorate([
        (0, core_1.Property)(),
        __metadata("design:type", String)
    ], User.prototype, "username", void 0);
    __decorate([
        (0, core_1.Property)(),
        __metadata("design:type", String)
    ], User.prototype, "password", void 0);
    __decorate([
        (0, core_1.Property)({ default: 0 }),
        __metadata("design:type", Number)
    ], User.prototype, "x", void 0);
    __decorate([
        (0, core_1.Property)({ default: 0 }),
        __metadata("design:type", Number)
    ], User.prototype, "y", void 0);
    __decorate([
        (0, core_1.Property)({ default: false }),
        __metadata("design:type", Boolean)
    ], User.prototype, "isBusy", void 0);
    __decorate([
        (0, core_1.Property)({ default: 1 }),
        __metadata("design:type", Number)
    ], User.prototype, "mapId", void 0);
    __decorate([
        (0, core_1.Property)({ default: 0 }),
        __metadata("design:type", Number)
    ], User.prototype, "permission", void 0);
    __decorate([
        (0, core_1.OneToOne)(function () { return Skin_1.Skin; }, function (skin) { return skin.user; }),
        __metadata("design:type", Skin_1.Skin)
    ], User.prototype, "skin", void 0);
    __decorate([
        (0, core_1.OneToOne)(function () { return Stats_1.Stats; }, function (stats) { return stats.user; }),
        __metadata("design:type", Stats_1.Stats)
    ], User.prototype, "stats", void 0);
    User = __decorate([
        (0, core_1.Entity)(),
        __metadata("design:paramtypes", [Object])
    ], User);
    return User;
}());
exports.User = User;
