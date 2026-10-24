/** Shared by the zod schema and the editor so both agree on what is valid. */
export const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
export const WEB_LINK_PATTERN = /^https?:\/\//i;
export const IMAGE_SOURCE_PATTERN = /^(https?:\/\/|data:image\/)/i;
export const PIN_PATTERN = /^\d{4,8}$/;
