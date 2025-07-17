import { errorRes, isAuth, successRes } from "@/lib/auth";
import { db, userRoleDetails, users } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";
import { uploadToR2 } from "@/lib/providers";
import { convertToWebP } from "@/lib/convert-image";

const upgradeRolePetshop = z.object({
  nik: z.string().min(16, "Invalid NIK number"),
  no_kta: z.string().min(1, "KTA number is required"),
  full_name: z.string().min(1, "full name is required"),
  ktp: z
    .custom<File>((val) => val instanceof File, {
      message: "File is required",
    })
    .refine((file) => file.size > 0, {
      message: "File is empty",
    })
    .refine((file) => file.type.startsWith("image/"), {
      message: "Only image files are allowed",
    }),
  kta: z
    .custom<File>((val) => val instanceof File, {
      message: "File is required",
    })
    .refine((file) => file.size > 0, {
      message: "File is empty",
    })
    .refine((file) => file.type.startsWith("image/"), {
      message: "Only image files are allowed",
    }),
});

export async function PUT(req: NextRequest) {
  try {
    const auth = await isAuth(req);
    if (!auth || auth.email || auth.password || !auth.sub)
      return errorRes("Unauthorized", 401);

    const { sub: userId } = auth;

    const formData = await req.formData();

    const body = {
      full_name: formData.get("full_name") as string,
      nik: formData.get("nik") as string,
      no_kta: formData.get("no_kta") as string,
      ktp: formData.get("ktp") as File,
      kta: formData.get("kta") as File,
    };

    const result = upgradeRolePetshop.safeParse(body);

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      return errorRes("Validation failed", 400, errors);
    }

    const { nik, no_kta, full_name, ktp, kta } = result.data;

    const baseKey = `images/roles/veterinarian/${userId}`;

    // upload KTP
    const webpBufferKtp = await convertToWebP(ktp);

    const keyKtp = `${baseKey}/ktp.webp`;

    const r2UpKtp = await uploadToR2({ buffer: webpBufferKtp, key: keyKtp });

    if (!r2UpKtp) return errorRes("Upload Failed", 400, r2UpKtp);

    // upload KTP
    const webpBufferKta = await convertToWebP(kta);

    const keyKta = `${baseKey}/kta.webp`;

    const r2UpKta = await uploadToR2({ buffer: webpBufferKta, key: keyKta });

    if (!r2UpKta) return errorRes("Upload Failed", 400, r2UpKta);

    const [user] = await db
      .update(users)
      .set({
        role: "VETERINARIAN",
        updatedAt: sql`NOW()`,
      })
      .where(eq(users.id, userId))
      .returning({ name: users.name });

    const [role] = await db
      .update(userRoleDetails)
      .set({
        userId,
        name: full_name,
        nik,
        no_kta,
        role: "VETERINARIAN",
        status: "PENDING",
        fileKtp: keyKtp,
        fileKta: keyKta,
        updatedAt: sql`NOW()`,
      })
      .where(eq(userRoleDetails.userId, userId))
      .returning({
        role: userRoleDetails.role,
        status: userRoleDetails.status,
      });

    const response = {
      id: userId,
      name: user.name,
      role: role.role,
      status_role: role.status,
    };

    return successRes(response, "Document successfully submited");
  } catch (error) {
    console.log("ERROR_UPGRADE_ROLE_VETERINARIAN", error);
    return errorRes("Internal Error", 500);
  }
}
