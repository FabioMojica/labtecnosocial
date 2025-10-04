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
    console.error("Error obteniendo cuentas de X:", err);
    return res.status(500).json({
      success: false,
      message: "No se pudieron obtener las cuentas de X",
      error: err.data || err.message || err,
    });
  }
};

// import { TwitterApi } from 'twitter-api-v2';
// import { normalizeGetAPIsData } from "../../utils/normalizeGetAPIsData.js";

// export const getXAccounts = async (req, res) => {
//   try {
//     const client = new TwitterApi({
//       appKey: process.env.TWITTER_API_KEY,
//       appSecret: process.env.TWITTER_API_SECRET,
//       accessToken: process.env.TWITTER_ACCESS_TOKEN,
//       accessSecret: process.env.TWITTER_ACCESS_SECRET,
//     });

//     // 1️⃣ Obtener la cuenta autenticada
//     const user = await client.v2.me({
//       "user.fields": ["id","name","username","profile_image_url"]
//     });

//     // 2️⃣ Obtener últimos 10 tweets de la cuenta
//     const tweetsTimeline = await client.v2.userTimeline(user.data.id, {
//       max_results: 10,
//       "tweet.fields": ["id","text","public_metrics","created_at"]
//     });

//     // Mapear tweets para normalizarlos
//     const tweets = (tweetsTimeline.data || []).map(tweet => ({
//       id: tweet.id,
//       text: tweet.text,
//       created_at: tweet.created_at,
//       metrics: tweet.public_metrics // {retweet_count, reply_count, like_count, quote_count}
//     }));

//     const accounts = [
//       {
//         id: user.data.id,
//         name: user.data.name,
//         url: `https://x.com/${user.data.username}`,
//         image_url: user.data.profile_image_url,
//         tweets
//       },
//     ];

//     // Normalizar la info al mismo formato que otras APIs
//     const normalizedData = normalizeGetAPIsData("twitter", { pages: accounts });

//     return res.status(200).json(normalizedData);

//   } catch (err) {
//     console.error("Error obteniendo cuentas de X:", err);
//     return res.status(500).json({
//       success: false,
//       message: "No se pudieron obtener las cuentas de X",
//       error: err.data || err.message || err,
//     });
//   }
// };

// import { TwitterApi } from 'twitter-api-v2';
// import { normalizeGetAPIsData } from "../../utils/normalizeGetAPIsData.js";

// export const getXAccounts = async (req, res) => {
//   try {
//     const client = new TwitterApi({
//       appKey: process.env.TWITTER_API_KEY,
//       appSecret: process.env.TWITTER_API_SECRET,
//       accessToken: process.env.TWITTER_ACCESS_TOKEN,
//       accessSecret: process.env.TWITTER_ACCESS_SECRET,
//     });

//     // // 1️⃣ Obtener la cuenta autenticada
//     // const user = await client.v2.me({
//     //   "user.fields": ["id","name","username","profile_image_url"]
//     // });

//     // 2️⃣ Obtener últimos 10 tweets de la cuenta
//     const tweetsTimeline = await client.v2.userTimeline("1665965863", {
//       max_results: 5,
//       "tweet.fields": ["id","text","public_metrics","created_at"]
//     });

//     // Mapear tweets para normalizarlos
//     const tweets = (tweetsTimeline.data || []).map(tweet => ({
//       id: tweet.id,
//       text: tweet.text,
//       created_at: tweet.created_at,
//       metrics: tweet.public_metrics // {retweet_count, reply_count, like_count, quote_count}
//     }));

//     // const accounts = [
//     //   {
//     //     id: user.data.id,
//     //     name: user.data.name,
//     //     url: `https://x.com/${user.data.username}`,
//     //     image_url: user.data.profile_image_url,
//     //     tweets
//     //   },
//     // ];

//     // Normalizar la info al mismo formato que otras APIs
//     //const normalizedData = normalizeGetAPIsData("twitter", { pages: accounts });
//     console.log(tweets)

//     return res.status(200).json([]);

//   } catch (err) {
//     console.error("Error obteniendo cuentas de X:", err);
//     return res.status(500).json({
//       success: false,
//       message: "No se pudieron obtener las cuentas de X",
//       error: err.data || err.message || err,
//     });
//   }
// };
