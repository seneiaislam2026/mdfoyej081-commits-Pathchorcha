export const COMMON_SUBJECTS = ["বাংলা", "ইংরেজি", "ICT"];

export const ARTS_SUBJECTS = [
  ...COMMON_SUBJECTS,
  "ইতিহাস",
  "ভূগোল",
  "অর্থনীতি",
  "পৌরনীতি",
  "সমাজবিজ্ঞান",
  "যুক্তিবিদ্যা",
  "ইসলামের ইতিহাস"
];

export const COMMERCE_SUBJECTS = [
  ...COMMON_SUBJECTS,
  "হিসাববিজ্ঞান",
  "ফিন্যান্স",
  "ব্যবসায় উদ্যোগ",
  "উৎপাদন ব্যবস্থাপনা",
  "ব্যবসায় সংগঠন ও ব্যবস্থাপনা"
];

// For Class 6 to 8
export const JUNIOR_SUBJECTS = [
  "বাংলা",
  "ইংরেজি",
  "গণিত",
  "বিজ্ঞান",
  "বাংলাদেশ ও বিশ্বপরিচয়",
  "ধর্ম",
  "ডিজিটাল প্রযুক্তি"
];

export const getSubjectsForUser = (userClass?: string | null, userGroup?: string | null) => {
  if (!userClass) return COMMON_SUBJECTS;
  if (userClass === 'c6' || userClass === 'c7' || userClass === 'c8' || userClass === 'c68') {
    return JUNIOR_SUBJECTS;
  }
  if (userGroup === 'arts') {
    return ARTS_SUBJECTS;
  }
  if (userGroup === 'commerce') {
    return COMMERCE_SUBJECTS;
  }
  return COMMON_SUBJECTS;
};
