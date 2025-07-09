import { errorRes, isAuth, successRes } from "@/lib/auth";
import { db, userRoleDetails, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod/v4";
import sharp from "sharp";
import { uploadToR2 } from "@/lib/providers";

const upgradeRolePetshop = z.object({
  nik: z.string().min(16, "Invalid NIK number"),
  fullName: z.string().min(1, "full name is required"),
  file: z
    .custom<Blob>((val) => val instanceof Blob, {
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
      fullName: formData.get("full_name") as string,
      nik: formData.get("nik") as string,
      ktp: formData.get("ktp") as File,
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

    const { nik, fullName, file } = result.data;

    const buffer = Buffer.from(await file.arrayBuffer());
    const webpBuffer = await sharp(buffer).webp({ quality: 50 }).toBuffer();
    const key = `images/ktp/${nik}.webp`;

    const r2Up = await uploadToR2({ buffer: webpBuffer, key });

    if (!r2Up) return errorRes("Upload Failed", 400, r2Up);

    await db
      .update(users)
      .set({
        role: "PETSHOP",
      })
      .where(eq(users.id, userId));

    await db.update(userRoleDetails).set({
      userId,
      name: fullName,
      nik,
      role: "PETSHOP",
      status: "PENDING",
      fileKtp: key,
    });

    return successRes(null, "Document successfully submited");
  } catch (error) {
    console.log("ERROR_UPGRADE_ROLE_PETSHOP", error);
    return errorRes("Internal Error", 500);
  }
}
