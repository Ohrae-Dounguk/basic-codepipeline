import bcrypt from "bcrypt";
import crypto from "crypto";

export async function hashPassword(
    unencryptedPassword: string,
): Promise<string> {
    return await bcrypt.hash(unencryptedPassword, 10);
}

export function hex(bytes: number): string {
    const buf = crypto.randomBytes(bytes);
    return buf.toString("hex");
}
