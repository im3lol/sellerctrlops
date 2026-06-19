import { describe, it, expect } from "vitest";
import { can, canAny, isStaff, ROLE_LABELS_AR } from "../rbac";

describe("rbac.can", () => {
  it("system_admin has full access", () => {
    expect(can("system_admin", "workspace.manage")).toBe(true);
    expect(can("system_admin", "product.distribute")).toBe(true);
    expect(can("system_admin", "role.manage")).toBe(true);
  });

  it("employees can edit products but not assign/distribute/review", () => {
    expect(can("employee", "product.edit")).toBe(true);
    expect(can("employee", "product.review")).toBe(false);
    expect(can("employee", "product.distribute")).toBe(false);
    expect(can("employee", "workspace.manage")).toBe(false);
  });

  it("team_lead can review but not distribute or manage workspaces", () => {
    expect(can("team_lead", "product.review")).toBe(true);
    expect(can("team_lead", "product.distribute")).toBe(false);
    expect(can("team_lead", "workspace.manage")).toBe(false);
  });

  it("ops_manager can distribute and review", () => {
    expect(can("ops_manager", "product.distribute")).toBe(true);
    expect(can("ops_manager", "product.review")).toBe(true);
  });

  it("clients are confined to the portal", () => {
    expect(can("client", "client.portal")).toBe(true);
    expect(can("client", "product.edit")).toBe(false);
    expect(can("client", "workspace.viewAll")).toBe(false);
  });

  it("null/undefined role has no capabilities", () => {
    expect(can(null, "product.edit")).toBe(false);
    expect(can(undefined, "product.edit")).toBe(false);
  });
});

describe("rbac.canAny", () => {
  it("returns true if any capability is granted", () => {
    expect(canAny("employee", ["workspace.manage", "product.edit"])).toBe(true);
    expect(canAny("employee", ["workspace.manage", "role.manage"])).toBe(false);
  });
});

describe("rbac.isStaff", () => {
  it("everyone except client is staff", () => {
    expect(isStaff("system_admin")).toBe(true);
    expect(isStaff("employee")).toBe(true);
    expect(isStaff("client")).toBe(false);
    expect(isStaff(null)).toBe(false);
  });
});

describe("ROLE_LABELS_AR", () => {
  it("labels the client as partner (شريك)", () => {
    expect(ROLE_LABELS_AR.client).toBe("شريك");
  });
});
