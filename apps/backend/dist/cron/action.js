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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTrips = fetchTrips;
exports.fetchBuses = fetchBuses;
const axios_1 = __importDefault(require("axios"));
const client_1 = require("../lib/client");
function fetchTrips() {
    return __awaiter(this, void 0, void 0, function* () {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const trips = yield client_1.prisma.trip.findMany({
            where: {
                travelDate: {
                    gte: today
                },
                alerts: {
                    some: {
                        notified: false
                    }
                }
            },
            select: {
                travelDate: true,
                tripId: true,
                source: {
                    select: {
                        code: true,
                        name: true
                    }
                },
                destination: {
                    select: {
                        code: true,
                        name: true
                    }
                },
                alerts: {
                    select: {
                        userId: true,
                        alertId: true,
                        user: {
                            select: {
                                token: true
                            }
                        },
                        targetPrice: true
                    }
                }
            }
        });
        return trips;
    });
}
function fetchBuses(source, destination, date) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Fetching buses for ${source} to ${destination} on ${date}`);
        const url = `https://www.redbus.in/rpw/api/searchResults?fromCity=${source}&toCity=${destination}&DOJ=${date}&limit=25&offset=0&meta=true&groupId=0&sectionId=0&sort=0&sortOrder=0&from=initialLoad&getUuid=true&bT=1&clearLMBFilter=undefined`;
        const response = yield axios_1.default.post(url);
        const buses = response.data.data.inventories;
        return buses;
    });
}
