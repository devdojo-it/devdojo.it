import YouTubeAPI from "./_youtube-api-wrapper.js";
import path from "path";
import fs from "fs";

const youTubeAPI = new YouTubeAPI(process.env.API_KEY);
const playlists = await youTubeAPI.listPlaylistsBasic(process.env.CHANNEL_ID);

for (const playlist of playlists) {
  const videos = await youTubeAPI.listPlaylistVideosDetailed(playlist.id);

  playlist.videos = videos;
}

const latest = await youTubeAPI.getLatestVideo(process.env.CHANNEL_ID);

const { mapping } = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "../../data/mapping.json"))
);

const orderMap = new Map(mapping.map((entry, idx) => [entry.id, idx]));
const sortedPlaylists = [...playlists].sort((a, b) => orderMap.get(a.id) - orderMap.get(b.id));

fs.writeFileSync(
  path.join(import.meta.dirname, "../../data/youtube.json"),
  JSON.stringify(
    {
      latest,
      playlists: sortedPlaylists,
    },
    null,
    2
  )
);
