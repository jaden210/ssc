import {
  RouteReuseStrategy,
  DetachedRouteHandle,
  ActivatedRouteSnapshot,
  Route,
} from "@angular/router";

export class CustomRouteStrategy implements RouteReuseStrategy {
  storedRouteHandles = new Map<string, DetachedRouteHandle>();

  // Decides if the route should be stored
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return !!route.data.shouldReuse;
  }

  //Store the information for the route we're destructing
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    if (route.data.shouldReuse) {
      this.storedRouteHandles.set(route.data.key, handle);
    }
  }

  //Return true if we have a stored route object for the next route
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return (
      !!route.data.shouldReuse && !!this.storedRouteHandles.get(route.data.key)
    );
  }

  //If we returned true in shouldAttach(), now return the actual route data for restoration
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    if (!route.data["shouldReuse"]) {
      return null;
    }
    console.log("Attach cached page for: ", route.data["key"]);
    return this.storedRouteHandles.get(route.data["key"]);
  }

  //Reuse the route if we're going to and from the same route
  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return !!future.data.shouldReuse;
  }
}

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private handlers: Map<Route, DetachedRouteHandle> = new Map();

  constructor() {}

  // Decides if the route should be stored
  public shouldDetach(_route: ActivatedRouteSnapshot): boolean {
    return !!_route.data.shouldReuse;
  }

  // Store the information for the route we're destructing
  public store(
    route: ActivatedRouteSnapshot,
    handle: DetachedRouteHandle
  ): void {
    if (!route.routeConfig) return;
    this.handlers.set(route.routeConfig, handle);
  }

  // Return true if we have a stored route object for the next route
  public shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && !!this.handlers.get(route.routeConfig);
  }

  // If we returned true in shouldAttach(), now return the actual route data for restoration
  public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!route.routeConfig || !this.handlers.has(route.routeConfig))
      return null;
    return this.handlers.get(route.routeConfig)!;
  }

  // Reuse the route if we're going to and from the same route
  public shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
