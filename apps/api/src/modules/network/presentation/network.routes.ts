import { Router } from "express";
import { getContainer } from "@/core/container.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { NetworkService } from "../application/NetworkService.js";
import { NetworkController } from "./network.controller.js";

export function registerNetworkModuleDependencies(): void {
  const container = getContainer();

  // Ensure idempotency
  try {
    container.get("NetworkService");
    return; // Already registered
  } catch {
    // Expected if not registered
  }

  container.register("NetworkService", (infra) => new NetworkService(infra.db));
  
  container.register("NetworkController", () => {
    const networkService = container.get<NetworkService>("NetworkService");
    return new NetworkController(networkService);
  });
}

export function createNetworkRouter(): Router {
  registerNetworkModuleDependencies();
  const container = getContainer();
  const controller = container.get<NetworkController>("NetworkController");

  const router = Router();

router.use(authMiddleware);

router.get("/feed", controller.getFeed);
router.get("/my-posts", controller.getMyPosts);
router.post("/posts", controller.createPost);
router.post("/posts/:postId/comments", controller.addComment);
router.post("/posts/:postId/reactions", controller.addReaction);
router.get("/discover", controller.getDiscoverProfiles);
router.get("/connections", controller.getConnections);
router.post("/connections", controller.sendConnectionRequest);
router.put("/connections/respond", controller.respondConnectionRequest);
router.get("/profile/:username", controller.getPublicProfile);

  return router;
}
