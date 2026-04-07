import React from 'react';

/**
 * Checks if a string is a valid HEX color (e.g. #FFF, #FFFFFF, #000000CC).
 */
export const isHexColor = (color: string): boolean => {
    if (!color) return false;
    const trimmed = color.trim();
    // Match hex with 3, 4, 6, or 8 characters after #
    return /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(trimmed);
};

/**
 * Returns a text-shadow style object if the color is NOT a hex color (i.e. it's a gradient).
 */
export const TextShadowOrNot = (color: string): React.CSSProperties => {
    if (isHexColor(color)) {
        return { textShadow: 'none' };
    }
    // Default shadow for gradients
    return { textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)' };
};
