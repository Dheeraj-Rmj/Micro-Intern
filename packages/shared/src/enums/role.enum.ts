/**
 * Role enum — defines every actor in the system.
 *
 * Design decisions:
 * - SUPER_ADMIN: Platform operator. Unrestricted access. Assigned only via DB seed.
 * - ADMIN: Platform staff. Can manage companies and candidates. Cannot impersonate.
 * - COMPANY_OWNER: Owns a company account. Manages company recruiters and trials.
 * - RECRUITER: Operates within a company. Creates and manages skill trials.
 * - CANDIDATE: Applies to and completes skill trials.
 *
 * The role hierarchy matters for permission inheritance — see RBAC permission map.
 */
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  COMPANY_OWNER = 'COMPANY_OWNER',
  RECRUITER = 'RECRUITER',
  CANDIDATE = 'CANDIDATE',
}

/**
 * Ordered role hierarchy — lower index = higher privilege.
 * Used to determine if a user "outranks" another.
 */
export const ROLE_HIERARCHY: Role[] = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.COMPANY_OWNER,
  Role.RECRUITER,
  Role.CANDIDATE,
];

/**
 * Returns true if roleA has equal or higher privilege than roleB.
 */
export function hasRoleOrHigher(roleA: Role, roleB: Role): boolean {
  return ROLE_HIERARCHY.indexOf(roleA) <= ROLE_HIERARCHY.indexOf(roleB);
}
