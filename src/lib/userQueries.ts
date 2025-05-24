import {
  users,
  changeEmailToken,
  verificationTokens,
  passwordResetToken,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";

export async function getUserByEmail(email: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute()
      .then((res) => res[0] ?? null);

    return user;
  } catch {
    return null;
  }
}

export async function getUserById(id: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .execute()
      .then((res) => res[0] ?? null);

    return user;
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
}

export const getVerificationTokenByToken = async (token: string) => {
  try {
    const vToken = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, token))
      .execute()
      .then((res) => res[0] ?? null);

    return vToken;
  } catch {
    return null;
  }
};

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const token = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.email, email))
      .execute()
      .then((res) => res[0] ?? null);

    return token;
  } catch {
    return null;
  }
};

export const getPasswordResertTokenByToken = async (token: string) => {
  try {
    const passResetToken = await db
      .select()
      .from(passwordResetToken)
      .where(eq(passwordResetToken.token, token))
      .execute()
      .then((res) => res[0] ?? null);

    return passResetToken;
  } catch {
    return null;
  }
};

export const getPasswordResertTokenByEmail = async (email: string) => {
  try {
    const token = await db
      .select()
      .from(passwordResetToken)
      .where(eq(passwordResetToken.email, email))
      .execute()
      .then((res) => res[0] ?? null);

    return token;
  } catch {
    return null;
  }
};

export const getChangeEmailTokenByEmail = async (email: string) => {
  try {
    const token = await db
      .select()
      .from(changeEmailToken)
      .where(eq(changeEmailToken.email, email))
      .execute()
      .then((res) => res[0] ?? null);

    return token;
  } catch {
    return null;
  }
};

export const getChangeEmailTokenByToken = async (token: string) => {
  try {
    const eToken = await db
      .select()
      .from(changeEmailToken)
      .where(eq(changeEmailToken.token, token))
      .execute()
      .then((res) => res[0] ?? null);

    return eToken;
  } catch {
    return null;
  }
};
