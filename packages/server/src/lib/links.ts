/**
 * In this file, we have define all the link types and their properties to use universally
 * across the app.
 *
 * We also have all the validations, and generation logic based on these properties here.
 */

import { DB } from "../database/index.js";
import { IUrl, ISession, IUltraCode } from "../database/types.js";
import crypto from "crypto";
import { LinkType } from "@weer/common";

const MAX_ATTEMPTS = 10; // Max number of retries for generating unique IDs (QR Code and Shortened URL id)

export const LINKS = {
  default: {
    name: "default",
    description: "A randomly generated 6-character code.",

    // Total combinations: 34^6  = 1,544,804,416 (around 1.5 billion combinations)
    characters: "abcdefghijkmnpqrstuvwxyz0123456789", // no o or l to avoid confusion
    maxLength: 6,
    minLength: 6,

    requiresAuth: false,
    conversions: {
      // This means convert the 'key' property to the 'value' property when redirecting (e.g. O -> 0, l -> i)
      o: "0",
      l: "i",
    },
    validFor: null, // permanent
  },
  ultra: {
    name: "Ultra Short Code (1–2 Characters)",
    example: "Examples: weer.pro/6 or weer.pro/1a",
    description: `
      Our magical shortest possible option, perfect for saying it out loud. Imagine you’re on a call, just say “Go to weer.pro/d, 
      it’s my demo link,” and that's it. Keep in mind that your link will be <strong>public</strong> and valid for <strong>only 30
      minutes</strong> and after someone else will claim it.
    `,

    characters: "0123456789abcdefghijkmnpqrstuvwxyz", // no o or l to avoid confusion
    maxLength: 2,
    minLength: 1,

    requiresAuth: true,
    conversions: {
      /**
       * Ultra codes do not use o or l, but in case user enters them, we will convert them
       * to 0 and i respectively for better user experience.
       */

      // This means convert the 'key' property to the 'value' property when redirecting (e.g. O -> 0, l -> i)
      o: "0",
      l: "i",
    },
    validFor: "30 minutes",
  },
};

/**
 * This function figures out the link type based on the code provided, and then
 * validates it and returns the clean up code.
 *
 * @param code
 * @returns object with type and cleaned code, or null if invalid
 */
export const processCode = (
  code: string
): { type: LinkType; code: string } | null => {
  // We first check type, then clean up, then validate
  if (isUltraCode(code)) {
    let cleanedCode = cleanUltraCode(code);
    if (!validateUltraCode(cleanedCode)) return null;
    return { type: "ultra", code: cleanedCode };
  } else if (isDefaultCode(code)) {
    let cleanedCode = cleanDefaultCode(code);
    if (!validateDefaultCode(cleanedCode)) return null;
    return { type: "default", code: cleanedCode };
  }
  return null;
};

// Check if a shortened URL code is an ultra code (before cleaning up)
const isUltraCode = (code: string): boolean => {
  // Check length
  if (
    code.length > LINKS.ultra.maxLength ||
    code.length < LINKS.ultra.minLength
  ) {
    return false;
  }

  return true;
};

// Clean ultra code (make lowercase & replace non-supported characters)
const cleanUltraCode = (code: string): string => {
  let cleanedCode = code.toLowerCase();

  // Replace characters based on conversions
  for (const [key, value] of Object.entries(LINKS.ultra.conversions)) {
    cleanedCode = cleanedCode.replace(new RegExp(key, "g"), value);
  }

  return cleanedCode;
};

// Validate ultra code after running isUltraCode and cleanUltraCode
const validateUltraCode = (code: string): boolean => {
  // Check length & that it only contains alphabets and digits
  if (!/^[a-z0-9]+$/.test(code)) {
    return false;
  }

  return true;
};

// Check if a shortened URL code is a default code
const isDefaultCode = (code: string): boolean => {
  return code.length === 6;
};

// Clean default code (e.g. make lowercase)
const cleanDefaultCode = (code: string): string => {
  let cleanedCode = code.toLowerCase();

  // Replace characters based on conversions
  for (const [key, value] of Object.entries(LINKS.default.conversions)) {
    cleanedCode = cleanedCode.replace(new RegExp(key, "g"), value);
  }

  return cleanedCode;
};

// Validate default code after running isDefaultCode and cleanDefaultCode
const validateDefaultCode = (code: string): boolean => {
  // Check length & that it only contains alphabets and digits
  if (!/^[a-z0-9]+$/.test(code)) {
    return false;
  }

  return true;
};

/**
 * Generates a unique "default" type shortened URL ID for the given database URL ID.
 * The default type is a 6-Character Code, only lowercase alphabets and digits, without o or l. In redirecting, o is treated as 0 and l as i.
 *
 * @param id The database URL ID to update with the generated shortened URL ID
 * @returns The generated shortened URL Code
 */
export const generateDefault = async (id: number) => {
  let updated = false;
  let attempts = 0;
  let shortenedCode;

  const possibleChars = LINKS.default.characters;
  const codeLength = LINKS.default.maxLength; // For now max and min are the same

  // We will retry updating the record just like before with the QR code id
  while (!updated && attempts <= MAX_ATTEMPTS) {
    // Generate a 6-character code to be used as url shortened id
    const bytes = crypto.randomBytes(codeLength);
    shortenedCode = "";
    for (let i = 0; i < codeLength; i++) {
      shortenedCode += possibleChars[bytes[i] % possibleChars.length];
    }

    try {
      await DB.update<IUrl>(
        "urls",
        {
          shortened_url_id: shortenedCode,
          link_type: "default",
        },
        `id = $3`,
        [id]
      );
      updated = true; // If update is successful, the ID is unique
      return shortenedCode;
    } catch (error: any) {
      // The official PostgreSQL error code for unique violations
      if (error.code === "23505") {
        // If there's a duplicate key error, generate a new ID and retry
        updated = false;
        attempts++;
      } else {
        throw error;
      }
    }
  }

  // Max attempts reached
  if (!updated) {
    throw new Error(
      `Could not generate a unique shortened URL ID after ${MAX_ATTEMPTS} attempts`
    );
  }
};

/**
 * Generates a unique "ultra" type shortened URL ID for the given database URL ID.
 * The ultra type is a 1 or 2 character code, only lowercase alphabets and digits.
 * Examples: a, b, z, 0, 5, az, 1z, z1, zl
 *
 * @param id The database URL ID to update with the generated shortened URL ID
 * @returns The generated shortened URL Code
 */
export const generateUltra = async (id: number) => {
  /**
   * Clean up the ultra_code table first:
   * - Set url_id of all records that have expired to NULL.
   * - Set assigned_at and expires_at to NULL for all ultra codes that have url_id NULL (unassigned).
   *   This usually happens when a user deletes an ultra code link before it expires.
   */
  await DB.query(`
      UPDATE ultra_codes
      SET
        url_id = CASE
          WHEN expires_at < NOW() THEN NULL
          ELSE url_id
        END,
        assigned_at = CASE
          WHEN (expires_at < NOW()) OR url_id IS NULL THEN NULL
          ELSE assigned_at
        END,
        expires_at = CASE
          WHEN (expires_at < NOW()) OR url_id IS NULL THEN NULL
          ELSE expires_at
        END;
  `);

  /**
   * Find the first available ultra code. And then update that ultra code to be linked
   * to this url id.
   * We do this atomically to avoid race conditions when many people are hitting this route.
   */
  try {
    const result = await DB.query(
      `
        UPDATE ultra_codes
        SET url_id = $1,
            assigned_at = NOW(),
            expires_at = NOW() + INTERVAL '3 minutes'
        WHERE id = (
          SELECT id FROM ultra_codes
          WHERE url_id IS NULL
          ORDER BY length(code), code
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        )
        RETURNING url_id, code;
      `,
      [id]
    );

    // Update the URL record to set its shortened_url_id and link_type
    await DB.update<IUrl>(
      "urls",
      {
        shortened_url_id: undefined,
        link_type: "ultra",
      },
      `id = $3`,
      [result[0].url_id]
    );

    return result[0].code;
  } catch (error: any) {
    if (error.code === "23505") {
      // If there's a duplicate key error
      throw {
        status: 400,
        message: "You can't have two ultra codes for the same link.",
      };
    }

    throw error;
  }
};

/**
 * Generates a unique QR Code ID for the given database URL ID.
 * @param id The database URL ID to update with the generated shortened URL ID
 * @returns a promise
 */
export const generateQRCode = async (id: number) => {
  /*                                FOR QR CODE ID:
    7 bytes (56 bits) gives 2^56 = 72,057,594,037,927,936 combination.
    The base65url encoding safely converts binary data into a URL valid string without losing entropy.

    Based on the Birthday Paradox, after generating around 1 billion random codes, there is roughly a 0.999 (99.9%) probability
    that at least one collision will occur somewhere in that entire set.

    This means that out of 1 billion inserts, we should expect only 
    a handful of duplicates (about 7 on average) due to random chance. There is a per-insert 
    collision probability of about 7×10⁻⁹ (0.0000007%).

    This is trivial though but we must still handle collisions in the database (we'll retry on unique constraint violation of Postgres).
  */

  let QRCodeId;
  let updated = false;
  let attempts = 0; // to avoid infinite loops, we will try only 10 times

  while (!updated && attempts < MAX_ATTEMPTS) {
    attempts++;
    QRCodeId = crypto.randomBytes(7).toString("base64url");

    try {
      await DB.update<IUrl>(
        "urls",
        {
          qr_code_id: QRCodeId,
        },
        `id = $2`,
        [id]
      );
      updated = true; // If update is successful. The ID is unique
    } catch (error: any) {
      // The official PostgreSQL error code for unique violations
      if (error.code === "23505") {
        // If there's a duplicate key error, generate a new ID and retry
        updated = false;
      } else {
        throw error;
      }
    }
  }

  // Max attempts reached
  if (!updated) {
    throw new Error(
      `Could not generate a unique QR code ID after ${MAX_ATTEMPTS} attempts`
    );
  }
};
