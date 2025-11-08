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
exports.sendNotificationsToUsers = void 0;
const expo_server_sdk_1 = require("expo-server-sdk");
// Create a new Expo SDK client
const expo = new expo_server_sdk_1.Expo();
const sendNotificationsToUsers = (tokens, fare, source, destination, date) => __awaiter(void 0, void 0, void 0, function* () {
    if (tokens.length === 0) {
        console.log("No tokens provided");
        return;
    }
    if (tokens.length === 0) {
        console.log("❌ No valid Expo push tokens found");
        return;
    }
    // Build the message payloads
    const messages = tokens.map((token) => ({
        to: token,
        sound: "default",
        title: "🚌 New Bus Available",
        body: `${source} ➝ ${destination} | ₹${fare} | ${date.toDateString()}`,
        data: {
            type: "bus_alert",
            source,
            destination,
            fare: fare.toString(),
            date: date.toISOString(),
        },
        channelId: "bus_alerts",
        priority: "high",
    }));
    try {
        // Send notifications in chunks (Expo recommends batching)
        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];
        for (const chunk of chunks) {
            try {
                const ticketChunk = yield expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            }
            catch (error) {
                console.error("🔥 Error sending chunk:", error);
            }
        }
        // Log results
        let successCount = tickets.filter((t) => t.status === "ok").length;
        let failCount = tickets.length - successCount;
        console.log(`✅ Successfully sent: ${successCount}, ❌ Failed: ${failCount}`);
        // Handle errors like invalid tokens
        tickets.forEach((ticket, idx) => {
            var _a, _b;
            if (ticket.status !== "ok") {
                console.error(`❌ Token ${tokens[idx]} failed:`, ticket.message);
                if (((_a = ticket.details) === null || _a === void 0 ? void 0 : _a.error) === "DeviceNotRegistered" ||
                    ((_b = ticket.details) === null || _b === void 0 ? void 0 : _b.error) === "InvalidCredentials") {
                    // ⚠️ Remove invalid tokens from your database here
                }
            }
        });
    }
    catch (err) {
        console.error("🔥 Error sending notifications:", err);
    }
});
exports.sendNotificationsToUsers = sendNotificationsToUsers;
