# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0] - 2026-02-16

### Added
- **Admin General Settings**:
    - New tab for managing system-wide settings like Tax Percentage and Delivery Costs.
    - Automated formatting (metric commas, symbols) and advanced keyboard controls (Enter to save, Ctrl+Enter for newline).
    - Real-time toast notifications with detailed update information.
- **Cart & UI Enhancements**:
    - Refactored cart items into a reusable component with improved layout and button positioning.
    - Added "Remove 1" and "Remove All" buttons with contextual visibility and hover hints.
    - Support for Rich Text (`sup`, `br`, markdown bold) in menu names and descriptions via `preprocess_html`.
- **Admin UI Polish**:
    - Restricted category preview images to container width.
    - Improved stacking and z-index for system notifications.
- **Database Tracking**:
    - Integrated `settings` table for persistent system configuration.

### Fixed
- **Admin Dashboard**: Resolved SCSS syntax errors and `contenteditable` behavior issues (unwanted newlines).

## [0.2.0] - 2026-02-16

### Added
- **Translation System V6**: Implemented a scalable, row-based translation schema.
    - `translations_items`: Translations for Menu Items (name, description).
    - `translations_itemcats`: Translations for Categories (name, description, additional_text).
    - `translations_pizza_zutaten`: Translations for Ingredients.
    - `translations_food_variants`: Translations for Food Variants.
    - `translation_languages`: Management of available languages (e.g., 'de', 'en').
- **Admin Panel improvements**:
    - **Grid Layout**: Refactored `MenuEditor` table to use a responsive CSS Grid (`div`-based) layout instead of HTML tables, enabling better styling and rich content support.
    - **WYSIWYG Editing**: Replaced `textarea` inputs with a custom `EditableCell` component that supports rich text (bold, italic, headers) and renders HTML tags directly.
    - **Backup & Restore**: Added full support for database and file backups via the Admin UI and command-line scripts.
- **Scripts**:
    - `scripts/backup_full.ts`: Generates a complete backup (SQL dump + project files).
    - `scripts/run_migration_v6.ts`: Orchestrates the V6 database migration.
    - `scripts/verify_structure.ts`: Verifies database integrity.

### Changed
- **Database Schema**: Normalized translation tables to use `field_type` discriminators (e.g., 1=Name, 2=Description) instead of separate columns.
- **Admin UI**:
    - Updated `MenuEditor.tsx` to conditionally show/hide price inputs based on `price_type` (Single vs. Multi-size).
    - Standardized column widths in the Admin Grid.

### Fixed
- **Input Warnings**: Resolved React warnings regarding controlled/uncontrolled inputs by ensuring default values for all form fields.
