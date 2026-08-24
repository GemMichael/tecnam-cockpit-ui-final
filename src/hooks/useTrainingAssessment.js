import {
  useSyncExternalStore,
} from "react";

import {
  getTrainingAssessmentSnapshot,
  subscribeTrainingAssessment,
} from "../services/trainingAssessment";


/* ============================================================
   TRAINING ASSESSMENT REACT HOOK

   This hook lets any React component access:

   session
   summary

   Example:

   const {
     session,
     summary,
   } = useTrainingAssessment();

   console.log(
     summary.overall
   );
   ============================================================ */

export function useTrainingAssessment() {
  return useSyncExternalStore(
    subscribeTrainingAssessment,

    getTrainingAssessmentSnapshot,

    getTrainingAssessmentSnapshot
  );
}