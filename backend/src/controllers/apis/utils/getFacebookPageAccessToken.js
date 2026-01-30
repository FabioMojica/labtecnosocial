import dotenv from "dotenv";

dotenv.config();

export const getFacebookPageAccessToken = (pageId) => {
  const entries = Object.entries(process.env);
  
  const match = entries.find(([key]) =>
    key.includes(`_${pageId}`)
  );

  if (!match) {
    throw new Error(`No se encontró token para la página ${pageId}`);
  }

  const [, token] = match; 
  return token;
};
