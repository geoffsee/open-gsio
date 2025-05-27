import { createRouter } from "./api-router";
import SiteCoordinator from "./durable_objects/SiteCoordinator";

// durable object
export { SiteCoordinator };

// worker
export default createRouter();
