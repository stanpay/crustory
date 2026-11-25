import { getSiteUrl } from "@/lib/env";

const KAKAO_AUTH = "https://kauth.kakao.com";
const KAKAO_API = "https://kapi.kakao.com";

export function getKakaoConfig(siteUrl = getSiteUrl()) {
  const restApiKey = process.env.KAKAO_REST_API_KEY;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  const origin = siteUrl.replace(/\/$/, "");
  const redirectUri = `${origin}/api/auth/kakao/callback`;

  if (!restApiKey) {
    throw new Error("KAKAO_REST_API_KEY is not configured");
  }

  return { restApiKey, clientSecret, redirectUri, siteUrl: origin };
}

export function buildKakaoAuthorizeUrl(state: string, siteUrl?: string) {
  const { restApiKey, redirectUri } = getKakaoConfig(siteUrl);
  const params = new URLSearchParams({
    client_id: restApiKey,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
  });
  return `${KAKAO_AUTH}/oauth/authorize?${params.toString()}`;
}

type KakaoTokenResponse = {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
};

export async function exchangeKakaoCode(
  code: string,
  siteUrl?: string,
): Promise<KakaoTokenResponse> {
  const { restApiKey, clientSecret, redirectUri } = getKakaoConfig(siteUrl);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: restApiKey,
    redirect_uri: redirectUri,
    code,
  });
  if (clientSecret) {
    body.set("client_secret", clientSecret);
  }

  const res = await fetch(`${KAKAO_AUTH}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kakao token exchange failed: ${text}`);
  }

  return res.json() as Promise<KakaoTokenResponse>;
}

export type KakaoProfile = {
  kakaoId: string;
  email: string | null;
  name: string | null;
  profileImage: string | null;
};

export async function fetchKakaoProfile(accessToken: string): Promise<KakaoProfile> {
  const res = await fetch(`${KAKAO_API}/v2/user/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kakao profile fetch failed: ${text}`);
  }

  const data = (await res.json()) as {
    id: number | string;
    kakao_account?: {
      email?: string;
      profile?: {
        nickname?: string;
        profile_image_url?: string;
      };
    };
    properties?: {
      nickname?: string;
      profile_image?: string;
    };
  };

  const account = data.kakao_account;
  return {
    kakaoId: String(data.id),
    email: account?.email || null,
    name: account?.profile?.nickname || data.properties?.nickname || null,
    profileImage:
      account?.profile?.profile_image_url || data.properties?.profile_image || null,
  };
}
