/** One beat of the narrative flow shown in the full-screen flow. */
export interface FollowUpScene {
  /** Small line shown above the headline (used mainly on the opening scene). */
  kicker?: string;
  headline: string;
  /** Quoted line, rendered with its citation via `reference` when both are set. */
  verse?: string;
  reference?: string;
}

/** All localized copy for one language: the teaser popup, the two final
 * response buttons, and the five narrative scenes. */
export interface FollowUpStrings {
  popupHeadline: string;
  popupBody: string;
  learnMoreButton: string;
  interestedButton: string;
  notNowButton: string;
  scenes: [FollowUpScene, FollowUpScene, FollowUpScene, FollowUpScene, FollowUpScene];
}
