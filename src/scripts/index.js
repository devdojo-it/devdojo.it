import "./_youtube-embed";
import "./_youtube-carousel";

// addEventListener("DOMContentLoaded", async () => {
//   const playlists = await youTubeAPI.listPlaylistsBasic("UC9LJK6XUUgd-zf-Gwmkp_Uw");

//   const partnersContainer = document.querySelector("#partners");

//   const nav = document.querySelector("header + nav");

//   const partnersLink = nav.querySelector('a[href="#partners"]');

//   let playlistsLinksHTML = "";
//   let playlistsHTML = "";

//   for (const playlist of playlists) {
//     const videos = await youTubeAPI.listPlaylistVideosDetailed(playlist.id);

//     playlistsLinksHTML += `
//       <a href="#playlist-${playlist.id}">${playlist.title}</a>
//     `;

//     playlistsHTML += `
//       <section id="playlist-${playlist.id}" video-playlist>
//         <section>
//           <h3>${playlist.title}</h3>
//           <p>
//             ${playlist.description}
//           </p>
//         </section>
//         <slider>
//           <stage>
//             <slides>
//               ${videos
//                 .map(
//                   (video) => `
//                   <slide>
//                     <figure tabindex="0">
//                       <youtube-embed video-id="${video.id}"></youtube-embed>
//                       <figcaption>${video.title}</figcaption>
//                     </figure>
//                   </slide>
//                 `
//                 )
//                 .join("")}
//             </slides>
//           </stage>
//         </slider>
//       </section>
//     `;
//   }

//   partnersLink.insertAdjacentHTML("beforebegin", playlistsLinksHTML);
//   partnersContainer.insertAdjacentHTML("beforebegin", playlistsHTML);

//   nav.style.setProperty("--nav-opacity", "1");

//   console.log(playlists);
// });
