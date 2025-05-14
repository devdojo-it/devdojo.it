/*
 * YouTube Data API v3 — Vanilla JS Wrapper (ES Module)
 * ===================================================
 * Pure ECMAScript‑module version (no IIFE, no UMD). Import it with:
 *
 *   import YouTubeAPI from "./youtube_api_wrapper.js";
 *
 * The public surface is unchanged:
 *   • listPlaylists(channelId)
 *   • listPlaylistsBasic(channelId)
 *   • listPlaylistVideosDetailed(playlistId)
 *   • listAllUploadedVideos(channelId)
 *   • getLatestVideo(channelId)
 *   • searchVideos(channelId, opts)
 *   • static collectAll(requestFn)
 *
 * Author: ChatGPT — May 2025
 */

export default class YouTubeAPI {
  /**
   * @param {string} apiKey           YouTube Data API v3 key
   * @param {object} [options]
   * @param {string} [options.baseUrl]  Override base endpoint
   * @param {function} [options.fetch]  Custom fetch implementation (e.g. node‑fetch)
   */
  constructor(
    apiKey,
    { baseUrl = "https://www.googleapis.com/youtube/v3", fetch: fetchImpl } = {}
  ) {
    if (!apiKey) throw new Error("You must provide a YouTube Data API v3 key.");
    this.apiKey = apiKey;
    this.base = baseUrl;
  }

  /** Internal helper for GET requests */
  async _request(endpoint, params) {
    const sp = new URLSearchParams({ ...params, key: this.apiKey });
    const res = await fetch(`${this.base}/${endpoint}?${sp}`);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`YouTube API error ${res.status}: ${res.statusText} ${body}`);
    }
    return res.json();
  }

  /* ------------------------------------------------------------------ *
   *  Static helpers
   * ------------------------------------------------------------------ */

  static videoUrl(id) {
    return `https://www.youtube.com/watch?v=${id}`;
  }
  static playlistUrl(id) {
    return `https://www.youtube.com/playlist?list=${id}`;
  }

  /* ------------------------------------------------------------------ *
   *  Playlist‑level operations
   * ------------------------------------------------------------------ */

  listPlaylists(
    channelId,
    { part = "snippet,contentDetails", maxResults = 50, pageToken = "" } = {}
  ) {
    return this._request("playlists", { part, channelId, maxResults, pageToken });
  }

  async listPlaylistsBasic(channelId, opts = {}) {
    const resp = await this.listPlaylists(channelId, opts);
    return resp.items.map((pl) => ({
      id: pl.id,
      url: YouTubeAPI.playlistUrl(pl.id),
      title: pl.snippet.title,
      description: pl.snippet.description,
      itemCount: pl.contentDetails.itemCount,
      ...pl,
    }));
  }

  /* ------------------------------------------------------------------ *
   *  Video‑level operations
   * ------------------------------------------------------------------ */

  async _getUploadsPlaylistId(channelId) {
    const data = await this._request("channels", { part: "contentDetails", id: channelId });
    const uploadsId = data?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsId) throw new Error(`Uploads playlist not found for ${channelId}`);
    return uploadsId;
  }

  async listAllUploadedVideos(channelId, { maxResults = 50, onPage } = {}) {
    const uploadsId = await this._getUploadsPlaylistId(channelId);
    return this.listPlaylistVideosDetailed(uploadsId, { maxResults, onPage });
  }

  async _getVideoStats(ids) {
    const resp = await this._request("videos", {
      part: "snippet,statistics",
      id: ids.join(","),
      maxResults: 50,
    });
    const map = new Map();
    resp.items.forEach((v) => map.set(v.id, { snippet: v.snippet, stats: v.statistics }));
    return map;
  }

  async listPlaylistVideosDetailed(playlistId, { maxResults = 50, onPage } = {}) {
    const videos = [];
    let pageToken = "";
    do {
      const page = await this._request("playlistItems", {
        part: "snippet,contentDetails",
        playlistId,
        maxResults,
        pageToken,
      });
      const ids = page.items.map((it) => it.contentDetails.videoId);
      const statsMap = await this._getVideoStats(ids);
      page.items.forEach((it) => {
        const vidId = it.contentDetails.videoId;
        const meta = statsMap.get(vidId) || {};
        const s = meta.stats || {};
        const sn = meta.snippet || it.snippet;
        videos.push({
          id: vidId,
          url: YouTubeAPI.videoUrl(vidId),
          title: sn.title,
          description: sn.description,
          viewCount: Number(s.viewCount || 0),
          likeCount: Number(s.likeCount || 0),
          commentCount: Number(s.commentCount || 0),
          publishedAt: sn.publishedAt || it.contentDetails.videoPublishedAt,
        });
      });
      if (typeof onPage === "function") onPage(page);
      pageToken = page.nextPageToken;
    } while (pageToken);
    return videos;
  }

  searchVideos(
    channelId,
    { q = "", order = "date", maxResults = 50, pageToken, part = "snippet", type = "video" } = {}
  ) {
    return this._request("search", { part, channelId, type, order, q, maxResults, pageToken });
  }

  async getLatestVideo(channelId) {
    const search = await this.searchVideos(channelId, { order: "date", maxResults: 1 });
    if (!search.items.length) return null;
    const vidId = search.items[0].id.videoId;
    const meta = (await this._getVideoStats([vidId])).get(vidId);
    if (!meta) return null;
    const { snippet: sn, stats: s } = meta;
    return {
      id: vidId,
      url: YouTubeAPI.videoUrl(vidId),
      title: sn.title,
      description: sn.description,
      viewCount: Number(s.viewCount || 0),
      likeCount: Number(s.likeCount || 0),
      commentCount: Number(s.commentCount || 0),
      publishedAt: sn.publishedAt,
    };
  }

  /* ------------------------------------------------------------------ *
   *  Misc helpers
   * ------------------------------------------------------------------ */

  static async collectAll(requestFn, onPage) {
    const items = [];
    let token;
    do {
      const page = await requestFn(token);
      items.push(...page.items);
      if (typeof onPage === "function") onPage(page);
      token = page.nextPageToken;
    } while (token);
    return items;
  }
}
