"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const db_1 = require("@repo/db");
exports.prisma = new db_1.PrismaClient();
