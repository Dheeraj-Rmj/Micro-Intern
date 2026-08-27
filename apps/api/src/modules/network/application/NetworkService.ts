import type { PrismaClient } from "@microintern/database";
import { BadRequestError, NotFoundError } from "@/shared/errors/AppError.js";

export class NetworkService {
  constructor(private readonly db: PrismaClient) {}

  async getFeed(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // A real implementation might get posts from connections + global top posts
    // For now, we'll return a global feed of all posts ordered by date.
    const posts = await this.db.networkPost.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        reactions: {
          where: { userId }, // To check if the current user liked it
          select: { id: true, type: true },
        },
        _count: {
          select: { reactions: true, comments: true },
        },
      },
    });

    // Populate author details
    const authorIds = [...new Set(posts.map((p: any) => p.authorId))];
    const authors = await this.db.user.findMany({
      where: { id: { in: authorIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        candidateProfile: {
          select: { headline: true },
        },
      },
    });

    const authorMap = new Map(authors.map((a: any) => [a.id, a]));

    const feed = posts.map((post: any) => {
      const author = authorMap.get(post.authorId);
      return {
        ...post,
        author: author
          ? {
              id: author.id,
              name: `${author.firstName} ${author.lastName}`.trim(),
              avatar: author.avatarUrl,
              headline: author.candidateProfile?.headline,
            }
          : { name: "Unknown User" },
        hasReacted: post.reactions.length > 0,
      };
    });

    return {
      posts: feed,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    };
  }

  async createPost(userId: string, content: string, postType: any) {
    if (!content.trim()) {
      throw new BadRequestError("Post content cannot be empty");
    }
    
    return this.db.networkPost.create({
      data: {
        authorId: userId,
        content,
        postType,
      },
    });
  }

  async getDiscoverProfiles(userId: string) {
    // Get profiles that have at least some skills, ordered by completion or randomly.
    const candidates = await this.db.candidateProfile.findMany({
      where: { isPublic: true },
      take: 20,
      orderBy: { completionPercentage: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        skills: {
          take: 5,
          orderBy: { level: "desc" },
        },
      },
    });

    return candidates.map((c: any) => ({
      id: c.userId,
      name: c.user ? `${c.user.firstName} ${c.user.lastName}`.trim() : "Unknown User",
      headline: c.headline,
      avatar: c.user?.avatarUrl,
      trustScore: c.completionPercentage, // simplified
      skills: c.skills.map((s: any) => ({
        skill: s.skill,
        level: s.level,
        verified: s.verified,
      })),
    }));
  }

  async sendConnectionRequest(requesterId: string, recipientId: string, note?: string) {
    if (requesterId === recipientId) {
      throw new BadRequestError("Cannot connect with yourself");
    }

    const existing = await this.db.connection.findUnique({
      where: {
        requesterId_recipientId: {
          requesterId,
          recipientId,
        },
      },
    });

    if (existing) {
      throw new BadRequestError("Connection request already exists");
    }

    return this.db.connection.create({
      data: {
        requesterId,
        recipientId,
        note,
        status: "PENDING",
      },
    });
  }

  async getPublicProfile(username: string): Promise<any> {
    const profile = await this.db.candidateProfile.findFirst({
      where: {
        OR: [
          { userId: username },
        ],
      },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
        skills: true,
        experiences: true,
        educations: true,
        certificates: true,
      },
    });

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    return profile;
  }
}
