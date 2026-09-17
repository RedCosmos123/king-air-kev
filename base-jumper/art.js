// Approved cast v1. Every shot containing the player has all three variants.
// Never fall back to another hair colour when an asset is unavailable.
const hairVariants = stem => Object.freeze({
  Blonde: `assets/cast-v1/${stem}-blonde.webp`,
  Brown: `assets/cast-v1/${stem}-brown.webp`,
  Ginger: `assets/cast-v1/${stem}-ginger.webp`,
});
const STORY_ART = Object.freeze({
  "brian-player.webp": hairVariants("brian-player"),
  "brian-reply.webp": hairVariants("brian-reply"),
  "dave-player.webp": hairVariants("dave-player"),
  "dave-reply.webp": hairVariants("dave-reply"),
  "parents-player-call.webp": hairVariants("parents-call"),
  "parents-reply.webp": "assets/cast-v1/parents-reply.webp",
  "parents-player-angry.webp": hairVariants("parents-angry"),
  "wife-announcement.webp": hairVariants("wife-01"),
  "wife-concern.webp": hairVariants("wife-02"),
  "wife-promise-hurt.webp": hairVariants("wife-03"),
  "wife-promise-careful.webp": hairVariants("wife-04"),
  "wife-promise-died.webp": hairVariants("wife-05"),
  "wife-promise-slow.webp": hairVariants("wife-06"),
  "wife-promise-skydiving.webp": hairVariants("wife-07"),
  "wife-promise-good-people.webp": hairVariants("wife-08"),
  "wife-promise-party.webp": hairVariants("wife-09"),
  "wife-promise-stop.webp": hairVariants("wife-10"),
  choice: hairVariants("choice"),
});
function storyArt(key, hair) {
  const shot = STORY_ART[key];
  const src = typeof shot === "string" ? shot : shot?.[hair];
  if (!src) throw new Error(`Missing cast artwork: ${key} / ${hair}`);
  return src;
}
