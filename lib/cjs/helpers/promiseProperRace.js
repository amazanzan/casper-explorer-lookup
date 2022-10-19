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
// TODO: not tested
/* eslint-disable */ // this file is just a pain in the ass to lint. Be brave.
function PromiseProperRace(promises, count, results = []) {
    return __awaiter(this, void 0, void 0, function* () {
        // Source: https://blog.jcore.com/2016/12/18/promise-me-you-wont-use-promise-race/
        promises = Array.from(promises);
        if (promises.length < count) {
            throw new Error('Could not retrieve tx data');
        }
        const indexPromises = promises.map((p, index) => p.then(() => index).catch((err) => {
            // console.error(err);
            throw index;
        }));
        return Promise.race(indexPromises).then((index) => {
            const p = promises.splice(index, 1)[0];
            p.then(e => results.push(e));
            if (count === 1) {
                return results;
            }
            return PromiseProperRace(promises, count - 1, results);
        }).catch(index => {
            promises.splice(index, 1);
            return PromiseProperRace(promises, count, results);
        });
    });
}
exports.default = PromiseProperRace;
