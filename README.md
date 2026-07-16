# Project Bali v1.4

Adds a searchable generic food catalog with grams, ounces, and serving inputs. Catalog foods add estimated calories, protein, carbs, fat, and fiber to the current day and flow into Today totals.

Also adds persistent completion status controls for workouts and days, plus automatic day completion when workout/rest, steps, protein, and water are complete.

Existing barcode scanning, nutrition, alcohol tracking, morning check-in, recipes, workouts, and local data storage are preserved.

## v1.4.1 USDA food search
The searchable food catalog now queries USDA FoodData Central for generic foods. If the USDA API is unavailable, the app falls back to its small offline catalog. Packaged food barcode lookup continues to use the existing scanner.
