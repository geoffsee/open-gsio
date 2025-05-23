import { createRouter } from "./api-router";
import SiteCoordinator from "./durable_objects/SiteCoordinator";

// exports durable object
export { SiteCoordinator };

// exports worker
export default createRouter();
