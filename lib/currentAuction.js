// lib/currentAuction.js
import CurrentAuction from "@/lib/models/currentauction";

// ensures there's always a single document
async function getSingletonDoc() {
  let doc = await CurrentAuction.findOne();
  if (!doc) {
    doc = await CurrentAuction.create({
      player: null,
      bid: null,
    });
  }
  return doc;
}

export async function setCurrentPlayer({ player, amount }) {
  const doc = await getSingletonDoc();
  doc.player = player;
  doc.amount = amount;
  await doc.save();
}

export async function setCurrentBid({ amount }) {
  const doc = await getSingletonDoc();
  doc.amount = amount;
  await doc.save();
}

export async function getCurrentAuction() {
  let doc = await getSingletonDoc();
  return {
    player: doc.player,
    bid: doc.bid,
  };
}
