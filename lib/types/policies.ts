import {ObjectId} from "bson";

export type PolicyVoteType = "positive" | "negative";

export type Policy = {
  id: string;
  title: string;
  content: string;

  source?: string;

  createdBy: string;
  createdAt: Date;
  deprecatedAt?: Date;

  votes: {
    positive: number;
    negative: number;
    userVote?: PolicyVoteType;
  };
};

export type PolicyDb = {
  title: string;
  content: string;
  source?: string;
  createdBy: string;
  createdAt: Date;
  deprecatedAt?: Date;
}

export type PolicyVoteDb = {
  policyId: ObjectId;
  userId: ObjectId;
  vote: PolicyVoteType;
  createdAt: Date;
}