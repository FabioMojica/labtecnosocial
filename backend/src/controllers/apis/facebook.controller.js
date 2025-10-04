import axios from "axios";
import dotenv from "dotenv";
import { normalizeGetAPIsData } from "../../utils/normalizeGetAPIsData.js";
 
dotenv.config();

const { FACEBOOK_TOKEN } = process.env;

export const getFacebookPages = async (req, res) => {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v17.0/me/accounts`, 
      {
        params: {
          access_token: FACEBOOK_TOKEN, 
          // fields: "id,name,link" 
          fields: "id,name,link,picture{url}"
        }
      }
    );

    const normalized = normalizeGetAPIsData('facebook', { pages: response.data.data });
    
    return res.status(200).json(normalized);
  } catch (error) {
    console.error("Error obteniendo páginas de Facebook:", error.response?.data || error.message);
    return res.status(500).json({ error: "No se pudieron obtener las páginas" });
  }
};