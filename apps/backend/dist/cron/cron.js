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
const node_cron_1 = __importDefault(require("node-cron"));
const action_1 = require("./action");
const client_1 = require("../lib/client");
const notifer_1 = require("../notifer/notifer");
const expo_server_sdk_1 = require("expo-server-sdk");
function formatDate(date) {
    const travelDate = new Date(date);
    const formatted = travelDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).replace(/ /g, "-");
    return formatted;
}
node_cron_1.default.schedule("*/20 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Running scheduler...");
        const trips = yield (0, action_1.fetchTrips)();
        for (const trip of trips) {
            const source = trip.source.code;
            const destination = trip.destination.code;
            const travelDate = formatDate(trip.travelDate);
            const buses = yield (0, action_1.fetchBuses)(source, destination, travelDate);
            const allFares = buses.flatMap(bus => bus.fareList);
            const minFare = Math.min(...allFares);
            yield client_1.prisma.fareSnapshot.create({
                data: {
                    tripId: trip.tripId,
                    fare: minFare
                }
            });
            const users = new Set();
            const alertIds = [];
            for (const alert of trip.alerts) {
                if (!alert.user.token)
                    continue;
                let token = alert.user.token.trim();
                if (!token.startsWith("ExponentPushToken[")) {
                    // Format the token correctly
                    token = `ExponentPushToken[${token}]`;
                }
                if (expo_server_sdk_1.Expo.isExpoPushToken(token) && minFare <= alert.targetPrice) {
                    users.add(token);
                    alertIds.push(alert.alertId);
                }
            }
            if (users.size > 0) {
                (0, notifer_1.sendNotificationsToUsers)(Array.from(users), minFare, trip.source.name, trip.destination.name, trip.travelDate);
            }
            if (alertIds.length > 0) {
                yield client_1.prisma.alert.updateMany({
                    where: {
                        alertId: {
                            in: alertIds
                        }
                    },
                    data: {
                        notified: true
                    }
                });
            }
        }
    }
    catch (error) {
        console.error("Error processing trips:", error);
    }
}));
