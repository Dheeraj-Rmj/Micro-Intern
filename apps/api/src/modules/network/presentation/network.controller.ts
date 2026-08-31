import { Request, Response } from "express";
import { NetworkService } from "../application/NetworkService.js";
import { UnauthorizedError, BadRequestError } from "@/shared/errors/AppError.js";

export class NetworkController {
  constructor(private networkService: NetworkService) {}

  getFeed = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const pageStr = (req.query as any).page;
    const limitStr = (req.query as any).limit;
    const page = parseInt(pageStr as string) || 1;
    const limit = parseInt(limitStr as string) || 20;

    const feed = await this.networkService.getFeed(userId, page, limit);
    res.json({ success: true, data: feed });
  };

  createPost = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const { content, postType } = req.body;
    const post = await this.networkService.createPost(userId, content, postType || "INSIGHT");
    res.status(201).json({ success: true, data: post });
  };

  getMyPosts = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const pageStr = (req.query as any).page;
    const limitStr = (req.query as any).limit;
    const page = parseInt(pageStr as string) || 1;
    const limit = parseInt(limitStr as string) || 20;

    const posts = await this.networkService.getMyPosts(userId, page, limit);
    res.json({ success: true, data: posts });
  };

  getDiscoverProfiles = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const profiles = await this.networkService.getDiscoverProfiles(userId);
    res.json({ success: true, data: profiles });
  };

  sendConnectionRequest = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const { recipientId, note } = req.body;
    if (!recipientId) throw new BadRequestError("Recipient ID is required");

    const connection = await this.networkService.sendConnectionRequest(userId, recipientId, note);
    res.status(201).json({ success: true, data: connection });
  };

  getConnections = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const connections = await this.networkService.getConnections(userId);
    res.json({ success: true, data: connections });
  };

  respondConnectionRequest = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const { requesterId, status } = req.body;
    if (!requesterId || !status) throw new BadRequestError("Requester ID and Status are required");

    const connection = await this.networkService.respondConnectionRequest(requesterId, userId, status);
    res.json({ success: true, data: connection });
  };

  getPublicProfile = async (req: Request, res: Response) => {
    const username = req.params["username"];
    if (!username || typeof username !== "string") {
      throw new BadRequestError("Username is required");
    }
    const profile = await this.networkService.getPublicProfile(username);
    res.json({ success: true, data: profile });
  };

  addComment = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const postId = req.params["postId"];
    if (!postId || typeof postId !== "string") {
      throw new BadRequestError("Post ID is required");
    }

    const { content } = req.body;
    const comment = await this.networkService.addComment(userId, postId, content);
    res.status(201).json({ success: true, data: comment });
  };

  addReaction = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const postId = req.params["postId"];
    if (!postId || typeof postId !== "string") {
      throw new BadRequestError("Post ID is required");
    }

    const { type } = req.body;
    const reaction = await this.networkService.addReaction(userId, postId, type);
    res.status(201).json({ success: true, data: reaction });
  };
}
