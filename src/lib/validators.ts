import { IMAGE_SOURCE_PATTERN, PIN_PATTERN, WEB_LINK_PATTERN } from "@/config/validation";

export const isFilled = (value: string) => value.trim().length > 0;

export const isOptionalWebLink = (value: string) =>
  value === "" || WEB_LINK_PATTERN.test(value);

export const isOptionalImageUrl = (value: string) =>
  value === "" || IMAGE_SOURCE_PATTERN.test(value);

export const isPin = (value: string) => PIN_PATTERN.test(value);
