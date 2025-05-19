import "dotenv/config"; // Must be first, to load env variables
import dotenv from "dotenv";
dotenv.config();

import connectToDB from "../lib/db.js";
import Player from "../lib/models/player.js";
import Team from "../lib/models/team.js";
import AllPlayers from "./players_seed_data.json" assert { type: "json" };
import Bid from "../lib/models/bid.js";
import CuurentAuction from "../lib/models/currentauction.js";

async function seed() {
  await connectToDB();

  await Player.deleteMany({});
  await Team.deleteMany({});
  await Bid.deleteMany({});
  await CuurentAuction.deleteMany({});

  await Team.create([
    {
      name: "Champions -- Dream Big",
      logoUrl: "/logos/champion.jpg",
      purseLeft: 100000,
      squad: [],
    },
    {
      name: "Upadhyay Warriors",
      logoUrl: "/logos/upadhyay.jpg",
      purseLeft: 100000,
      squad: [],
    },
    {
      name: "Solanki Strikers",
      logoUrl: "/logos/solanki.jpg",
      purseLeft: 100000,
      squad: [],
    },
    {
      name: "AJ Turf Titans -- Play Bold",
      logoUrl: "/logos/ajturf.jpg",
      purseLeft: 100000,
      squad: [],
    },
    {
      name: "Oswal Avengers -- Conquer the game",
      logoUrl: "/logos/oswal.jpg",
      purseLeft: 100000,
      squad: [],
    },
    {
      name: "Kumar Waghresha Smashers",
      logoUrl: "/logos/kumar.jpg",
      purseLeft: 100000,
      squad: [],
    },
  ]);

  await Player.create(AllPlayers);

  console.log("Seed data created!");
  process.exit();
}

seed();
