import axios from "axios";

export const refreshTwitterToken = async (refreshToken) => {
  try {
    const resp = await axios.post(
      "https://api.twitter.com/oauth2/token",
      null,
      {
        params: {
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: process.env.TWITTER_CLIENT_ID,
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    return resp.data.access_token; // Nuevo token válido
  } catch (err) {
    //console.error("Error refrescando token de Twitter:", err.response?.data || err.message);
    throw err;
  }
};
