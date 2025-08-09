export const databaseUrl = process.env.DATABASE_URL!;
export const jwtSecret = process.env.JWT_SECRET!;

export const androidClientId = process.env.ANDROID_GOOGLE_CLIENT_ID!;
export const iosClientId = process.env.IOS_GOOGLE_CLIENT_ID!;

export const resendSecret = process.env.RESEND_API_KEY!;

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
export const apiUrl = `${baseUrl}/api`;

// config env r2
export const r2Public = process.env.CLOUDFLARE_PUBLIC_DOMAIN!;
export const r2AccountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
export const r2AccessId = process.env.CLOUDFLARE_ACCESS_KEY_ID!;
export const r2AccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY!;
export const r2bucket = process.env.CLOUDFLARE_BUCKET_NAME!;

export const apiGMaps = process.env.NEXT_PUBLIC_API_GMAPS!;
export const apiXenditDev = process.env.NEXT_PUBLIC_API_XENDIT!;

export const biteshipUrl = process.env.BITESHIP_URL!;

export const biteshipAPI = process.env.NEXT_PUBLIC_API_BITESHIP!;
