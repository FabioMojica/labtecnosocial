import { TwitterApi } from 'twitter-api-v2';
import { normalizeGetAPIsData } from "../../utils/normalizeGetAPIsData.js";

export const getXAccounts = async (req, res) => {
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    const user = await client.v2.me({
      "user.fields": ["id","name","username","profile_image_url"]
    });

    const accounts = [
      {
        id: user.data.id,
        name: user.data.name,
        url: `https://x.com/${user.data.username}`,
        image_url: user.data.profile_image_url,
      },
    ];

    const normalizedData = normalizeGetAPIsData("twitter", { pages: accounts });
    return res.status(200).json(normalizedData);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "No se pudieron obtener las cuentas de X",
      error: err.data || err.message || err,
    });
  }
};
