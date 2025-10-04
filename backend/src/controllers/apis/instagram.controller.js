import axios from "axios";
import dotenv from "dotenv";
import { normalizeGetAPIsData } from "../../utils/normalizeGetAPIsData.js";

dotenv.config();

const { INSTAGRAM_TOKEN } = process.env;

export const getInstagramPages = async (req, res) => {
  try {
    const fbResponse = await axios.get(
      `https://graph.facebook.com/v17.0/me/accounts`,
      {
        params: {
          access_token: INSTAGRAM_TOKEN,
          fields: "id,name,instagram_business_account",
        },
      }
    );

    const pages = fbResponse.data.data || [];

    const igPages = pages.filter(page => page.instagram_business_account?.id);

    const instagramPages = await Promise.all(
      igPages.map(async (page) => {
        try {
          const igId = page.instagram_business_account.id;
          const igResponse = await axios.get(
            `https://graph.facebook.com/v17.0/${igId}`,
            {
              params: {
                // fields: "username",
                fields: "username,profile_picture_url",
                access_token: INSTAGRAM_TOKEN,
              },
            }
          );

          const username = igResponse.data.username;
          const image_url = igResponse.data.profile_picture_url;

          return {
            id: igId,
            name: page.name,
            url: `https://www.instagram.com/${username}`,
            image_url: image_url
          };
        } catch (err) {
          console.error(`Error obteniendo username de ${page.name}:`, err.response?.data || err.message);
          return {
            id: page.instagram_business_account.id,
            name: page.name,
            url: `https://www.instagram.com/${page.name.replace(/\s+/g, '').toLowerCase()}`,
          };
        }
      })
    );

    const normalizedData = normalizeGetAPIsData("instagram", { pages: instagramPages });

    return res.status(200).json(normalizedData);

  } catch (error) {
    console.error("Error obteniendo páginas de Instagram:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "No se pudieron obtener las páginas de Instagram",
      error: error.response?.data || error.message,
    });
  }
};
