export type Course = {
  id: number;
  objectId: string;
  title?: string;
  contentUri?: string;
  createdAtMs?: number;
};

export type Proposal = {
  id: number;
  objectId: string;
  title?: string;
  description?: string;
  budget?: number;
  yesVotes?: number;
  noVotes?: number;
  createdAtMs?: number;
};

export type Profile = {
  objectId: string;
  eduPoints: number;
  civicPoints: number;
  completedCourses: number[];
  votedProposals: number[];
};

export type CapIds = {
  teacherCapId?: string;
  adminCapId?: string;
  issuerCapId?: string;
};
