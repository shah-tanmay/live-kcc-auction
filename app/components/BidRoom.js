// "use client";

// import { useEffect } from "react";
// import { io } from "socket.io-client";

// let socket;

// export default function BidRoom() {
//   useEffect(() => {
//     socket = io({
//       path: "/api/socket",
//     });

//     socket.on("connect", () => {
//       console.log("🔗 Connected to socket.io server");
//     });

//     socket.on("newBid", (data) => {
//       console.log("💸 New bid received:", data);
//     });

//     return () => socket.disconnect();
//   }, []);

//   return <div>Welcome to the Bid Room</div>;
// }
