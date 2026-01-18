const BACKEND_URL = "https://api.animalsfeeds.online";

export const authApi = {
  loginGoogle() {
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
  },

  loginFacebook() {
    window.location.href = `${BACKEND_URL}/oauth2/authorization/facebook`;
  },

  loginZalo() {
    window.location.href = `${BACKEND_URL}/auth/zalo/login`;
  }
,

  async enrollFace(imageBase64: string, displayName?: string) {
    const res = await fetch(`${BACKEND_URL}/auth/face/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64, name: displayName })
    });
    return res.json();
  },

  async loginWithFace(imageBase64: string) {
    const res = await fetch(`${BACKEND_URL}/auth/face/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 })
    });
    return res.json();
  }
};
