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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = __importDefault(require("../src/db"));
function setupTranslations() {
    return __awaiter(this, void 0, void 0, function () {
        var conn, queries, _i, queries_1, query, items, _a, items_1, item, categories, _b, categories_1, cat, zutaten, _c, zutaten_1, zuta, e_1, err_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 26, 27, 28]);
                    return [4 /*yield*/, db_1.default.getConnection()];
                case 1:
                    conn = _d.sent();
                    console.log("Connected to database.");
                    queries = [
                        "CREATE TABLE IF NOT EXISTS items_translations (\n                id INT AUTO_INCREMENT PRIMARY KEY,\n                item_id INT NOT NULL,\n                language_code VARCHAR(5) NOT NULL,\n                name VARCHAR(255),\n                description TEXT,\n                UNIQUE KEY unique_translation (item_id, language_code)\n            )",
                        "CREATE TABLE IF NOT EXISTS itemcats_translations (\n                id INT AUTO_INCREMENT PRIMARY KEY,\n                category_id INT NOT NULL,\n                language_code VARCHAR(5) NOT NULL,\n                name VARCHAR(255),\n                description TEXT,\n                UNIQUE KEY unique_cat_translation (category_id, language_code)\n            )",
                        "CREATE TABLE IF NOT EXISTS pizza_zutaten_translations (\n                id INT AUTO_INCREMENT PRIMARY KEY,\n                zutaten_id INT NOT NULL,\n                language_code VARCHAR(5) NOT NULL,\n                name VARCHAR(255),\n                UNIQUE KEY unique_zutaten_translation (zutaten_id, language_code)\n            )"
                    ];
                    _i = 0, queries_1 = queries;
                    _d.label = 2;
                case 2:
                    if (!(_i < queries_1.length)) return [3 /*break*/, 5];
                    query = queries_1[_i];
                    return [4 /*yield*/, conn.query(query)];
                case 3:
                    _d.sent();
                    console.log("Executed schema query.");
                    _d.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, conn.query("SELECT * FROM items")];
                case 6:
                    items = _d.sent();
                    console.log("Found ".concat(items.length, " items to migrate."));
                    _a = 0, items_1 = items;
                    _d.label = 7;
                case 7:
                    if (!(_a < items_1.length)) return [3 /*break*/, 11];
                    item = items_1[_a];
                    // German (DE) - Original
                    return [4 /*yield*/, conn.query("INSERT IGNORE INTO items_translations (item_id, language_code, name, description) VALUES (?, 'de', ?, ?)", [item.id, item.name, item.description])];
                case 8:
                    // German (DE) - Original
                    _d.sent();
                    // English (EN) - Placeholder (Copy of DE for now)
                    return [4 /*yield*/, conn.query("INSERT IGNORE INTO items_translations (item_id, language_code, name, description) VALUES (?, 'en', ?, ?)", [item.id, "".concat(item.name, " [EN]"), item.description ? "".concat(item.description, " [EN]") : null])];
                case 9:
                    // English (EN) - Placeholder (Copy of DE for now)
                    _d.sent();
                    _d.label = 10;
                case 10:
                    _a++;
                    return [3 /*break*/, 7];
                case 11: return [4 /*yield*/, conn.query("SELECT * FROM itemcats")];
                case 12:
                    categories = _d.sent();
                    console.log("Found ".concat(categories.length, " categories to migrate."));
                    _b = 0, categories_1 = categories;
                    _d.label = 13;
                case 13:
                    if (!(_b < categories_1.length)) return [3 /*break*/, 17];
                    cat = categories_1[_b];
                    // German (DE)
                    return [4 /*yield*/, conn.query("INSERT IGNORE INTO itemcats_translations (category_id, language_code, name, description) VALUES (?, 'de', ?, ?)", [cat.id, cat.name, cat.description])];
                case 14:
                    // German (DE)
                    _d.sent();
                    // English (EN)
                    return [4 /*yield*/, conn.query("INSERT IGNORE INTO itemcats_translations (category_id, language_code, name, description) VALUES (?, 'en', ?, ?)", [cat.id, "".concat(cat.name, " [EN]"), cat.description ? "".concat(cat.description, " [EN]") : null])];
                case 15:
                    // English (EN)
                    _d.sent();
                    _d.label = 16;
                case 16:
                    _b++;
                    return [3 /*break*/, 13];
                case 17:
                    _d.trys.push([17, 24, , 25]);
                    return [4 /*yield*/, conn.query("SELECT * FROM pizza_zutaten")];
                case 18:
                    zutaten = _d.sent();
                    console.log("Found ".concat(zutaten.length, " zutaten to migrate."));
                    _c = 0, zutaten_1 = zutaten;
                    _d.label = 19;
                case 19:
                    if (!(_c < zutaten_1.length)) return [3 /*break*/, 23];
                    zuta = zutaten_1[_c];
                    // German (DE)
                    return [4 /*yield*/, conn.query("INSERT IGNORE INTO pizza_zutaten_translations (zutaten_id, language_code, name) VALUES (?, 'de', ?)", [zuta.id, zuta.name])];
                case 20:
                    // German (DE)
                    _d.sent();
                    // English (EN)
                    return [4 /*yield*/, conn.query("INSERT IGNORE INTO pizza_zutaten_translations (zutaten_id, language_code, name) VALUES (?, 'en', ?)", [zuta.id, "".concat(zuta.name, " [EN]")])];
                case 21:
                    // English (EN)
                    _d.sent();
                    _d.label = 22;
                case 22:
                    _c++;
                    return [3 /*break*/, 19];
                case 23: return [3 /*break*/, 25];
                case 24:
                    e_1 = _d.sent();
                    console.warn("Could not migrate pizza_zutaten (maybe table missing?):", e_1.message);
                    return [3 /*break*/, 25];
                case 25:
                    console.log("Translation setup complete.");
                    return [3 /*break*/, 28];
                case 26:
                    err_1 = _d.sent();
                    console.error("Error setting up translations:", err_1);
                    return [3 /*break*/, 28];
                case 27:
                    if (conn)
                        conn.release();
                    db_1.default.end();
                    return [7 /*endfinally*/];
                case 28: return [2 /*return*/];
            }
        });
    });
}
setupTranslations();
