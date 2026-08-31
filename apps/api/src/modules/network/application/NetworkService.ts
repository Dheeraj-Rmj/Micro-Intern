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
        comments: {
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { reactions: true, comments: true },
        },
      },
    });

    // Populate author details for posts and comments
    const authorIds = new Set(posts.map((p: any) => p.authorId));
    posts.forEach((p: any) => {
      p.comments?.forEach((c: any) => authorIds.add(c.userId));
    });

    const authors = await this.db.user.findMany({
      where: { id: { in: Array.from(authorIds) } },
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
        comments: (post.comments || []).map((c: any) => {
          const cAuthor = authorMap.get(c.userId);
          return {
            id: c.id,
            name: cAuthor ? `${cAuthor.firstName} ${cAuthor.lastName}`.trim() : "Unknown User",
            avatar: cAuthor?.avatarUrl,
            text: c.content,
            timeAgo: c.createdAt,
          };
        }),
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
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            candidateProfile: {
              select: { headline: true },
            },
          },
        },
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

  async getMyPosts(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const posts = await this.db.networkPost.findMany({
      where: { authorId: userId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            candidateProfile: { select: { headline: true } },
          },
        },
        reactions: {
          where: { userId },
          select: { id: true, type: true },
        },
        comments: {
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { reactions: true, comments: true },
        },
      },
    });

    const commentAuthorIds = new Set<string>();
    posts.forEach((p: any) => {
      p.comments?.forEach((c: any) => commentAuthorIds.add(c.userId));
    });

    const commentAuthors = await this.db.user.findMany({
      where: { id: { in: Array.from(commentAuthorIds) } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    });

    const commentAuthorMap = new Map(commentAuthors.map((a: any) => [a.id, a]));

    return posts.map((post: any) => ({
      ...post,
      author: post.author
        ? {
            id: post.author.id,
            name: `${post.author.firstName} ${post.author.lastName}`.trim(),
            avatar: post.author.avatarUrl,
            headline: post.author.candidateProfile?.headline,
          }
        : null,
      hasReacted: post.reactions.length > 0,
      comments: (post.comments || []).map((c: any) => {
        const cAuthor = commentAuthorMap.get(c.userId);
        return {
          id: c.id,
          name: cAuthor ? `${cAuthor.firstName} ${cAuthor.lastName}`.trim() : "Unknown User",
          avatar: cAuthor?.avatarUrl,
          text: c.content,
          timeAgo: c.createdAt,
        };
      }),
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

  async respondConnectionRequest(requesterId: string, recipientId: string, status: "ACCEPTED" | "BLOCKED") {
    const existing = await this.db.connection.findUnique({
      where: {
        requesterId_recipientId: {
          requesterId,
          recipientId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundError("Connection request not found");
    }

    return this.db.connection.update({
      where: { id: existing.id },
      data: { status },
    });
  }

  async getConnections(userId: string) {
    const connections = await this.db.connection.findMany({
      where: {
        OR: [{ requesterId: userId }, { recipientId: userId }]
      },
    });

    const peerIds = connections.map((c: any) => c.requesterId === userId ? c.recipientId : c.requesterId);
    
    if (peerIds.length === 0) return [];

    const peers = await this.db.user.findMany({
      where: { id: { in: peerIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        candidateProfile: {
          select: { headline: true, completionPercentage: true, skills: true },
        },
      },
    });

    const peerMap = new Map(peers.map((p: any) => [p.id, p]));

    return connections.map((c: any) => {
      const peerId = c.requesterId === userId ? c.recipientId : c.requesterId;
      const peer = peerMap.get(peerId) as any;
      
      return {
        id: peer?.id || peerId,
        name: peer ? `${peer.firstName} ${peer.lastName}`.trim() : "Unknown User",
        avatar: peer?.avatarUrl,
        headline: peer?.candidateProfile?.headline || "MicroIntern User",
        trustScore: peer?.candidateProfile?.completionPercentage || 0,
        skills: peer?.candidateProfile?.skills?.map((s: any) => ({
          name: s.skill,
          endorsedCount: 0,
          endorsedByMe: false,
          status: s.verified ? "VERIFIED" : "CLAIMED"
        })) || [],
        status: c.status === "PENDING" ? (c.requesterId === userId ? "pending_sent" : "pending_received") : c.status.toLowerCase(),
        mutualCount: 0,
      };
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

    const portfolio = await this.db.candidatePortfolio.findUnique({
      where: { candidateId: profile.id },
      include: { projects: true, achievements: true },
    });

    const evidence = await this.db.evidence.findMany({
      where: { candidateId: profile.id },
    });

    return { ...profile, portfolio, evidence };
  }

  async addComment(userId: string, postId: string, content: string) {
    if (!content || !content.trim()) {
      throw new BadRequestError("Comment content cannot be empty");
    }
    
    const post = await this.db.networkPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundError("Post not found");

    return this.db.postComment.create({
      data: {
        userId,
        postId,
        content,
      },
    });
  }

  async addReaction(userId: string, postId: string, type: string) {
    if (!type || !type.trim()) {
      throw new BadRequestError("Reaction type cannot be empty");
    }
    
    const post = await this.db.networkPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundError("Post not found");

    const existing = await this.db.postReaction.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existing) {
      if (existing.type === type) {
        // Toggle off if clicking the same reaction
        await this.db.postReaction.delete({ where: { id: existing.id } });
        return { message: "Reaction removed", reacted: false };
      } else {
        // Update type if clicking a different reaction
        const updated = await this.db.postReaction.update({
          where: { id: existing.id },
          data: { type },
        });
        return { message: "Reaction updated", reacted: true, reaction: updated };
      }
    }

    const created = await this.db.postReaction.create({
      data: {
        userId,
        postId,
        type,
      },
    });
    return { message: "Reaction added", reacted: true, reaction: created };
  }
}
