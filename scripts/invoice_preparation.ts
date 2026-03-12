import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local'), quiet: true });

async function invoicePreparation() {
    const { default: pool } = await import('../src/db.js');
    let conn;
    
    // Get IDs from command line arguments
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("Please provide at least one item ID.");
        process.exit(1);
    }
    
    try {
        conn = await pool.getConnection();
        
        // Count frequencies of IDs
        const idCounts: Record<string, number> = {};
        args.forEach(id => {
            idCounts[id] = (idCounts[id] || 0) + 1;
        });
        const uniqueIds = Object.keys(idCounts);
        
        // Use IN clause for multiple IDs
        const placeholders = uniqueIds.map(() => "?").join(",");
        const query = `
            SELECT i.id, i.name, i.description, i.category_id, i.price_type, i.price, i.price_s, i.price_m, i.price_l, i.price_xl, i.drink, c.name as category_name
            FROM items i
            LEFT JOIN itemcats c ON i.category_id = c.order_id
            WHERE i.id IN (${placeholders})
        `;
        
        // Cast uniqueIds to numbers if possible
        const params = uniqueIds.map(id => isNaN(Number(id)) ? id : Number(id));
        
        const items: any[] = await conn.query(query, params);
        
        // Fetch settings
        const settingsRows = await conn.query("SELECT s_key, s_val FROM settings WHERE s_key IN ('tax_food', 'tax_drinks', 'delivery_costs')");
        const settingsMap: Record<string, string> = {};
        settingsRows.forEach((row: any) => {
            settingsMap[row.s_key] = row.s_val;
        });

        const taxFoodRate = settingsMap['tax_food'] ? parseFloat(settingsMap['tax_food'].replace(',', '.')) : 7;
        const taxDrinksRate = settingsMap['tax_drinks'] ? parseFloat(settingsMap['tax_drinks'].replace(',', '.')) : 19;
        const deliveryCosts = settingsMap['delivery_costs'] ? parseFloat(settingsMap['delivery_costs'].replace(',', '.')) : 0;
        
        const taxFoodPercentage = taxFoodRate / 100;
        const taxDrinksPercentage = taxDrinksRate / 100;
        
        // Add affected_price logic and calculate totals
        let sum_elements = 0;
        let total_tax_value = 0;
        let tax_food_applied_value = 0;
        let tax_drinks_applied_value = 0;
        
        const processedItems = items.map(item => {
            const count = idCounts[item.id.toString()];
            let affected_price_str = null;
            if (item.price_type == 1) {
                affected_price_str = item.price;
            } else if (item.price_type == 2) {
                if (item.category_id == 4) {
                    affected_price_str = item.price_s;
                } else if (item.category_id == 5) {
                    affected_price_str = item.price_m;
                }
            }
            
            let unit_price_val = 0;
            if (affected_price_str) {
                unit_price_val = parseFloat(affected_price_str.replace(',', '.'));
            }
            const line_price_val = unit_price_val * count;
            
            // Per-item tax calculation
            const isDrink = !!item.drink;
            const itemTaxRate = isDrink ? taxDrinksPercentage : taxFoodPercentage;
            const lineTaxValue = line_price_val * itemTaxRate;
            
            sum_elements += line_price_val;
            total_tax_value += lineTaxValue;
            
            if (isDrink) {
                tax_drinks_applied_value += lineTaxValue;
            } else {
                tax_food_applied_value += lineTaxValue;
            }
            
            let price_column_used = "";
            if (item.price_type == 1) {
                price_column_used = "price";
            } else if (item.price_type == 2) {
                if (item.category_id == 4) {
                    price_column_used = "price_s";
                } else if (item.category_id == 5) {
                    price_column_used = "price_m";
                }
            }

            return {
                ...item,
                category: item.category_name || "",
                count: count,
                price_column_used,
                unit_price: affected_price_str,
                affected_price: line_price_val.toFixed(2).replace('.', ','),
                tax_applied: itemTaxRate
            };
        });
        
        const total = sum_elements + total_tax_value + deliveryCosts;
        
        const output = {
            items: processedItems,
            summary: {
                client: {
                    name: "Test-Kunde GmbH",
                    email: "mocked@pizzaservice-illmensee.de",
                    tel: ["+49 123 4567890"],
                    address: {
                        client_address_line_1: "Industriepark 12",
                        client_address_line_2: "Halle 4",
                        client_address_plz: 70173,
                        client_address_city: "Stuttgart"
                    }
                },
                sum_elements: Math.round(sum_elements * 100) / 100,
                delivery_costs: Math.round(deliveryCosts * 100) / 100,
                tax_food_percentage: taxFoodPercentage,
                tax_drinks_percentage: taxDrinksPercentage,
                tax_food_applied_value: Math.round(tax_food_applied_value * 100) / 100,
                tax_drinks_applied_value: Math.round(tax_drinks_applied_value * 100) / 100,
                tax_value: Math.round(total_tax_value * 100) / 100,
                total: Math.round(total * 100) / 100
            }
        };
        
        // Output as JSON
        console.log(JSON.stringify(output, null, 2));
        
    } catch (err) {
        console.error("Failed to prepare invoice data:", err);
    } finally {
        if (conn) conn.release();
        await pool.end();
        process.exit(0);
    }
}

invoicePreparation();
