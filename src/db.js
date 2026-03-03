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
exports.getConnection = getConnection;
exports.getMenu = getMenu;
exports.createOrder = createOrder;
var mariadb_1 = __importDefault(require("mariadb"));
var pool = mariadb_1.default.createPool({
    host: 'localhost',
    user: 'dbuser',
    password: 'qwert',
    database: 'localdb',
    connectionLimit: 5
});
function getConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var conn, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    conn = _a.sent();
                    return [2 /*return*/, conn];
                case 2:
                    err_1 = _a.sent();
                    console.error("Error connecting to database:", err_1);
                    throw err_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.default = pool;
function getMenu() {
    return __awaiter(this, void 0, void 0, function () {
        var conn, categories, items_1, menu, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, 5, 6]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    conn = _a.sent();
                    return [4 /*yield*/, conn.query("SELECT * FROM itemcats ORDER BY order_id")];
                case 2:
                    categories = _a.sent();
                    return [4 /*yield*/, conn.query("SELECT * FROM items")];
                case 3:
                    items_1 = _a.sent();
                    menu = categories.map(function (cat) { return ({
                        id: cat.id,
                        name: cat.name,
                        description: cat.description,
                        additional_text: cat.additional_text,
                        pic_url: cat.pic_url,
                        items: items_1
                            .filter(function (item) { return item.category_id === cat.order_id; })
                            .map(function (item) { return ({
                            id: item.id,
                            category_id: item.category_id,
                            name: item.name,
                            description: item.description,
                            price: item.price ? parseFloat(item.price.replace(',', '.')) : 0,
                            price_type: item.price_type
                        }); })
                    }); });
                    return [2 /*return*/, menu];
                case 4:
                    err_2 = _a.sent();
                    console.error("Error fetching menu:", err_2);
                    throw err_2;
                case 5:
                    if (conn)
                        conn.release();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function createOrder(customerName, items, total) {
    return __awaiter(this, void 0, void 0, function () {
        var conn, basketContent, res, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    conn = _a.sent();
                    basketContent = JSON.stringify(items);
                    return [4 /*yield*/, conn.query("INSERT INTO client_orders (cname, cbasket_content, ctimestamp) VALUES (?, ?, NOW())", [customerName, basketContent])];
                case 2:
                    res = _a.sent();
                    return [2 /*return*/, { id: Number(res.insertId), customerName: customerName, total: total }];
                case 3:
                    err_3 = _a.sent();
                    console.error("Error creating order:", err_3);
                    throw err_3;
                case 4:
                    if (conn)
                        conn.release();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
