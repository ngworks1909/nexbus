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
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const tripValidator_1 = require("../zod/tripValidator");
const client_1 = require("../lib/client");
const zod_1 = __importDefault(require("zod"));
const router = (0, express_1.Router)();
const isSameDate = (date1, date2) => {
    return date1.getUTCFullYear() === date2.getUTCFullYear() &&
        date1.getUTCMonth() === date2.getUTCMonth() &&
        date1.getUTCDate() === date2.getUTCDate();
};
router.post("/create", (0, auth_1.verifyAuth)("USER"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(400).json({ message: "Invalid user" });
        }
        const createTripValidationResponse = tripValidator_1.createTripSchema.safeParse(req.body);
        if (!createTripValidationResponse.success) {
            console.log(createTripValidationResponse.error.issues[0].message);
            return res.status(400).json({ message: createTripValidationResponse.error.issues[0].message });
        }
        const { sourceId, destinationId, travelDate, targetPrice } = createTripValidationResponse.data;
        const normalizedTravelDate = new Date(travelDate);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        if (normalizedTravelDate < today) {
            return res.status(400).json({ message: "Travel date should be in the future" });
        }
        normalizedTravelDate.setUTCHours(0, 0, 0, 0);
        const existingTrip = yield client_1.prisma.trip.findUnique({
            where: {
                sourceId_destinationId_travelDate: {
                    sourceId,
                    destinationId,
                    travelDate: normalizedTravelDate
                }
            },
            select: {
                tripId: true,
                travelDate: true
            }
        });
        if (existingTrip && isSameDate(new Date(existingTrip.travelDate), normalizedTravelDate)) {
            const existingAlert = yield client_1.prisma.alert.findUnique({
                where: {
                    userId_tripId: {
                        userId,
                        tripId: existingTrip.tripId
                    }
                }, select: {
                    alertId: true
                }
            });
            if (existingAlert) {
                return res.status(400).json({ message: "Alert already exists for this trip" });
            }
            yield client_1.prisma.alert.create({
                data: {
                    userId,
                    tripId: existingTrip.tripId,
                    targetPrice: targetPrice
                }
            });
            return res.status(200).json({ message: "Alert created successfully" });
        }
        yield client_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const newTrip = yield tx.trip.create({
                data: {
                    sourceId, destinationId, travelDate: normalizedTravelDate
                },
                select: {
                    tripId: true
                }
            });
            yield tx.alert.create({
                data: {
                    userId,
                    tripId: newTrip.tripId,
                    targetPrice
                }
            });
        }));
        return res.status(200).json({ message: "Trip and alert created successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
router.delete("/delete/:alertId", (0, auth_1.verifyAuth)("USER"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(400).json({ message: "Invalid user" });
        }
        const deleteTripValidationResponse = zod_1.default.string({ message: "Invalid alert" }).safeParse(req.params.alertId);
        if (!deleteTripValidationResponse.success) {
            return res.status(400).json({ message: deleteTripValidationResponse.error.issues[0].message });
        }
        const alertId = deleteTripValidationResponse.data;
        const alert = yield client_1.prisma.alert.findUnique({
            where: {
                alertId
            },
            select: {
                userId: true
            }
        });
        if (!alert) {
            return res.status(400).json({ message: "Alert not found" });
        }
        if (alert.userId !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }
        yield client_1.prisma.alert.delete({
            where: {
                alertId
            }
        });
        return res.status(200).json({ message: "Alert deleted successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
router.patch("/update/:alertId", (0, auth_1.verifyAuth)("USER"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(400).json({ message: "Invalid user" });
        }
        const deleteTripValidationResponse = zod_1.default.string({ message: "Invalid alert" }).safeParse(req.params.alertId);
        if (!deleteTripValidationResponse.success) {
            return res.status(400).json({ message: deleteTripValidationResponse.error.issues[0].message });
        }
        const alertId = deleteTripValidationResponse.data;
        const updateTripValidationResponse = tripValidator_1.createTripSchema.pick({ targetPrice: true }).safeParse(req.body);
        if (!updateTripValidationResponse.success) {
            return res.status(400).json({ message: updateTripValidationResponse.error.issues[0].message });
        }
        const { targetPrice } = updateTripValidationResponse.data;
        const alert = yield client_1.prisma.alert.findUnique({
            where: {
                alertId
            },
            select: {
                userId: true
            }
        });
        if (!alert) {
            return res.status(400).json({ message: "Alert not found" });
        }
        if (alert.userId !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }
        yield client_1.prisma.alert.update({
            where: {
                alertId
            },
            data: {
                targetPrice
            }
        });
        return res.status(200).json({ message: "Alert updated successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}));
router.get("/fetchalerts", (0, auth_1.verifyAuth)("USER"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(400).json({ message: "Invalid user" });
        }
        const alerts = yield client_1.prisma.alert.findMany({
            where: {
                userId
            },
            select: {
                alertId: true,
                targetPrice: true,
                trip: {
                    select: {
                        tripId: true,
                        source: {
                            select: {
                                name: true,
                                code: true
                            }
                        },
                        destination: {
                            select: {
                                name: true,
                                code: true
                            }
                        },
                        travelDate: true,
                        fareSnapshots: {
                            orderBy: {
                                createdAt: "desc"
                            },
                            take: 1,
                            select: {
                                fare: true,
                                createdAt: true
                            }
                        }
                    }
                }
            }
        });
        return res.status(200).json({ alerts });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
