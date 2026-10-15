import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PermissionMatrix {
  [role: string]: {
    [module: string]: {
      [permission: string]: boolean;
    };
  };
}

export interface RoleMeta {
  name: string;
  badge: string;
  color: string;
  description: string;
  usersCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccessControlService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/settings/permissions`;
  private storageKey = 'contech_access_control_permissions';

  defaultRoles: string[] = [
    'Super Admin',
    'Org Admin',
    'Owner / CXO',
    'Sales Head',
    'Marketing Head',
    'CRM Head',
    'Sales Manager',
    'Account Executive',
    'Inside Sales',
    'Site Visit Coordinator',
    'Driver',
    'Executive Viewer'
  ];

  roles: string[] = [
    'Super Admin',
    'Org Admin',
    'Owner / CXO',
    'Sales Head',
    'Marketing Head',
    'CRM Head',
    'Sales Manager',
    'Account Executive',
    'Inside Sales',
    'Site Visit Coordinator',
    'Driver',
    'Executive Viewer'
  ];

  roleMetadata: { [role: string]: RoleMeta } = {
    'Super Admin': {
      name: 'Super Admin',
      badge: 'Root',
      color: '#4f46e5',
      description: 'Universal platform super-administrator with root privileges across all accounts and tenants.',
      usersCount: 1
    },
    'Org Admin': {
      name: 'Org Admin',
      badge: 'Superuser',
      color: '#7c3aed',
      description: 'Universal administrative and security configuration authority across the entire organization.',
      usersCount: 2
    },
    'Owner / CXO': {
      name: 'Owner / CXO',
      badge: 'Executive',
      color: '#0284c7',
      description: 'Managing Director / Owner with high-level revenue radar, portfolio valuation and leakage alerts.',
      usersCount: 1
    },
    'Sales Head': {
      name: 'Sales Head',
      badge: 'Director',
      color: '#2563eb',
      description: 'Strategic leadership authority for pipeline oversight, approvals, team quotas, and scoring rules.',
      usersCount: 2
    },
    'Marketing Head': {
      name: 'Marketing Head',
      badge: 'Marketing',
      color: '#ec4899',
      description: 'Lead source attribution, campaign ROI analysis, and high-intent prospect influx tracking.',
      usersCount: 1
    },
    'CRM Head': {
      name: 'CRM Head',
      badge: 'Governance',
      color: '#8b5cf6',
      description: 'Customer journey governance, pipeline stage compliance, and long-term buyer retention.',
      usersCount: 1
    },
    'Sales Manager': {
      name: 'Sales Manager',
      badge: 'Management',
      color: '#0891b2',
      description: 'Team lead oversight for site visits, allocations, deal tracking, and daily follow-up escalation.',
      usersCount: 3
    },
    'Account Executive': {
      name: 'Account Executive',
      badge: 'Sales Rep',
      color: '#059669',
      description: 'Field & site sales representatives managing client visits, buyer qualification, and shortlisted flats.',
      usersCount: 6
    },
    'Inside Sales': {
      name: 'Inside Sales',
      badge: 'Pre-Sales',
      color: '#10b981',
      description: 'Telecalling team qualifying inbound inquiries, logging requirements, and scheduling site visits.',
      usersCount: 4
    },
    'Site Visit Coordinator': {
      name: 'Site Visit Coordinator',
      badge: 'Operations',
      color: '#d97706',
      description: 'Logistics and scheduling lead managing vehicle fleets, pickup dispatch, and coordinator tasks.',
      usersCount: 2
    },
    'Driver': {
      name: 'Driver',
      badge: 'Fleet',
      color: '#475569',
      description: 'Chauffeur and transport team focused on buyer transit execution, mileage logs, and trip statuses.',
      usersCount: 3
    },
    'Executive Viewer': {
      name: 'Executive Viewer',
      badge: 'Read Only',
      color: '#64748b',
      description: 'Board members and external stakeholders with analytical reporting and read-only audit oversight.',
      usersCount: 2
    }
  };

  readonly modules: string[] = [
    'Dashboard',
    'Prospects',
    'Buyer Persona',
    'AI Buyer Score',
    'Site Visits',
    'Visit Copilot',
    'Revenue Leakage',
    'Follow-ups',
    'Alerts',
    'Analytics',
    'Projects',
    'Fleet',
    'Team',
    'Access Control',
    'Settings',
    'Audit Logs'
  ];

  readonly moduleCategories: { [mod: string]: string } = {
    'Dashboard': 'Intelligence',
    'Prospects': 'Pipeline',
    'Buyer Persona': 'Pipeline',
    'AI Buyer Score': 'Intelligence',
    'Site Visits': 'Site Visit Ops',
    'Visit Copilot': 'Site Visit Ops',
    'Revenue Leakage': 'Intelligence',
    'Follow-ups': 'Pipeline',
    'Alerts': 'Pipeline',
    'Analytics': 'Intelligence',
    'Projects': 'Administration',
    'Fleet': 'Site Visit Ops',
    'Team': 'Administration',
    'Access Control': 'Administration',
    'Settings': 'Administration',
    'Audit Logs': 'Administration'
  };

  readonly permissionColumns: string[] = [
    'VIEW',
    'CREATE',
    'EDIT',
    'DELETE',
    'ASSIGN',
    'APPROVE',
    'EXPORT',
    'CONFIGURE'
  ];

  private permissionsSubject = new BehaviorSubject<PermissionMatrix>(this.getDefaultPermissions());
  permissions$ = this.permissionsSubject.asObservable();

  constructor() {
    this.loadInitialPermissions();
    this.fetchUserCounts();
  }

  getDefaultPermissions(): PermissionMatrix {
    const matrix: PermissionMatrix = {};

    // 1. Initialize all roles with false
    this.roles.forEach(role => {
      matrix[role] = {};
      this.modules.forEach(mod => {
        matrix[role][mod] = {};
        this.permissionColumns.forEach(col => {
          matrix[role][mod][col] = false;
        });
      });
    });

    // 2. Super Admin & Org Admin: All True
    ['Super Admin', 'Org Admin'].forEach(r => {
      this.modules.forEach(mod => {
        this.permissionColumns.forEach(col => {
          matrix[r][mod][col] = true;
        });
      });
    });

    // 2b. Owner / CXO
    this.modules.forEach(mod => {
      matrix['Owner / CXO'][mod]['VIEW'] = true;
      matrix['Owner / CXO'][mod]['EXPORT'] = true;
      matrix['Owner / CXO'][mod]['APPROVE'] = true;
      matrix['Owner / CXO'][mod]['ASSIGN'] = true;
      if (['Dashboard', 'Revenue Leakage', 'Analytics'].includes(mod)) {
        matrix['Owner / CXO'][mod]['CONFIGURE'] = true;
      }
    });

    // 2c. Marketing Head
    this.modules.forEach(mod => {
      matrix['Marketing Head'][mod]['VIEW'] = true;
      if (['Prospects', 'Buyer Persona', 'AI Buyer Score', 'Analytics'].includes(mod)) {
        matrix['Marketing Head'][mod]['CREATE'] = true;
        matrix['Marketing Head'][mod]['EDIT'] = true;
        matrix['Marketing Head'][mod]['EXPORT'] = true;
      }
    });

    // 2d. CRM Head
    this.modules.forEach(mod => {
      matrix['CRM Head'][mod]['VIEW'] = true;
      matrix['CRM Head'][mod]['EXPORT'] = true;
      if (['Prospects', 'Buyer Persona', 'Site Visits', 'Follow-ups', 'Alerts'].includes(mod)) {
        matrix['CRM Head'][mod]['CREATE'] = true;
        matrix['CRM Head'][mod]['EDIT'] = true;
        matrix['CRM Head'][mod]['APPROVE'] = true;
      }
    });

    // 2e. Inside Sales
    ['Dashboard', 'Prospects', 'Buyer Persona', 'AI Buyer Score', 'Site Visits', 'Follow-ups', 'Alerts'].forEach(mod => {
      matrix['Inside Sales'][mod]['VIEW'] = true;
    });
    ['Prospects', 'Buyer Persona', 'Site Visits', 'Follow-ups'].forEach(mod => {
      matrix['Inside Sales'][mod]['CREATE'] = true;
      matrix['Inside Sales'][mod]['EDIT'] = true;
      matrix['Inside Sales'][mod]['ASSIGN'] = true;
    });

    // 3. Sales Head
    this.modules.forEach(mod => {
      matrix['Sales Head'][mod]['VIEW'] = true;
      matrix['Sales Head'][mod]['CREATE'] = true;
      matrix['Sales Head'][mod]['EDIT'] = true;
      matrix['Sales Head'][mod]['ASSIGN'] = true;
      matrix['Sales Head'][mod]['APPROVE'] = true;
      matrix['Sales Head'][mod]['EXPORT'] = true;
      if (['AI Buyer Score', 'Projects', 'Settings', 'Access Control'].includes(mod)) {
        matrix['Sales Head'][mod]['CONFIGURE'] = true;
      }
    });

    // 4. Sales Manager
    const managerAllowedModules = [
      'Dashboard',
      'Prospects',
      'Buyer Persona',
      'AI Buyer Score',
      'Site Visits',
      'Visit Copilot',
      'Revenue Leakage',
      'Follow-ups',
      'Alerts',
      'Analytics',
      'Projects',
      'Team',
      'Access Control'
    ];
    managerAllowedModules.forEach(mod => {
      matrix['Sales Manager'][mod]['VIEW'] = true;
      matrix['Sales Manager'][mod]['CREATE'] = true;
      matrix['Sales Manager'][mod]['EDIT'] = true;
      matrix['Sales Manager'][mod]['ASSIGN'] = true;
      matrix['Sales Manager'][mod]['APPROVE'] = true;
      matrix['Sales Manager'][mod]['EXPORT'] = true;
    });

    // 5. Account Executive (matches Screenshot defaults: selective view/create/edit)
    const aeViewModules = [
      'Dashboard',
      'Prospects',
      'Buyer Persona',
      'AI Buyer Score',
      'Site Visits',
      'Visit Copilot',
      'Revenue Leakage',
      'Follow-ups',
      'Alerts',
      'Analytics'
    ];
    aeViewModules.forEach(mod => {
      matrix['Account Executive'][mod]['VIEW'] = true;
    });
    ['Prospects', 'Site Visits', 'Follow-ups'].forEach(mod => {
      matrix['Account Executive'][mod]['CREATE'] = true;
      matrix['Account Executive'][mod]['EDIT'] = true;
      matrix['Account Executive'][mod]['EXPORT'] = true;
    });

    // 6. Site Visit Coordinator
    ['Site Visits', 'Fleet', 'Follow-ups', 'Prospects', 'Dashboard'].forEach(mod => {
      matrix['Site Visit Coordinator'][mod]['VIEW'] = true;
    });
    ['Site Visits', 'Fleet'].forEach(mod => {
      matrix['Site Visit Coordinator'][mod]['CREATE'] = true;
      matrix['Site Visit Coordinator'][mod]['EDIT'] = true;
      matrix['Site Visit Coordinator'][mod]['ASSIGN'] = true;
      matrix['Site Visit Coordinator'][mod]['APPROVE'] = true;
    });

    // 7. Driver
    ['Site Visits', 'Fleet'].forEach(mod => {
      matrix['Driver'][mod]['VIEW'] = true;
    });

    // 8. Executive Viewer
    ['Dashboard', 'Prospects', 'Site Visits', 'Analytics', 'Revenue Leakage'].forEach(mod => {
      matrix['Executive Viewer'][mod]['VIEW'] = true;
      matrix['Executive Viewer'][mod]['EXPORT'] = true;
    });

    return matrix;
  }

  private loadInitialPermissions(): void {
    // Check localStorage first
    const local = localStorage.getItem(this.storageKey);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        const merged = this.mergeWithDefaults(parsed);
        this.permissionsSubject.next(merged);
        localStorage.setItem(this.storageKey, JSON.stringify(merged));
      } catch (e) {
        console.warn('Failed to parse local permissions, using defaults');
      }
    }

    // Attempt backend fetch
    this.http.get<{ success: boolean; permissions: PermissionMatrix }>(this.apiUrl)
      .pipe(
        catchError(() => of({ success: false, permissions: null as any }))
      )
      .subscribe(res => {
        if (res && res.success && res.permissions) {
          const merged = this.mergeWithDefaults(res.permissions);
          this.permissionsSubject.next(merged);
          localStorage.setItem(this.storageKey, JSON.stringify(merged));
        }
      });
  }

  private mergeWithDefaults(incoming: PermissionMatrix): PermissionMatrix {
    const defaults = this.getDefaultPermissions();
    const result: PermissionMatrix = JSON.parse(JSON.stringify(defaults));

    if (!incoming || typeof incoming !== 'object') return result;

    const allRoles = Array.from(new Set([...this.roles, ...Object.keys(incoming || {})]));
    for (const role of allRoles) {
      if (!this.roles.includes(role)) {
        this.roles.push(role);
      }
      if (!this.roleMetadata[role]) {
        this.roleMetadata[role] = {
          name: role,
          badge: 'Custom',
          color: '#4f46e5',
          description: 'Custom defined platform role profile.',
          usersCount: 0
        };
      }

      if (!result[role]) result[role] = {};
      for (const mod of this.modules) {
        if (!result[role][mod]) result[role][mod] = {};
        for (const col of this.permissionColumns) {
          if (incoming[role] && incoming[role][mod] && typeof incoming[role][mod][col] === 'boolean') {
            result[role][mod][col] = incoming[role][mod][col];
          }
        }
      }
    }

    return result;
  }

  getCurrentMatrix(): PermissionMatrix {
    return JSON.parse(JSON.stringify(this.permissionsSubject.value));
  }

  savePermissions(matrix: PermissionMatrix): Observable<any> {
    const cleanMatrix = this.mergeWithDefaults(matrix);
    this.permissionsSubject.next(cleanMatrix);
    localStorage.setItem(this.storageKey, JSON.stringify(cleanMatrix));

    return this.http.put<any>(this.apiUrl, { permissions: cleanMatrix }).pipe(
      tap(() => {
        console.log('Access Control permissions synced with server');
      }),
      catchError(err => {
        console.warn('Backend sync failed, saved locally in browser storage', err);
        return of({ success: true, localOnly: true });
      })
    );
  }

  addCustomRole(roleName: string, meta?: Partial<RoleMeta>, cloneFrom?: string): Observable<any> {
    if (!this.roles.includes(roleName)) {
      this.roles.push(roleName);
    }
    this.roleMetadata[roleName] = {
      name: roleName,
      badge: meta?.badge || 'Custom',
      color: meta?.color || '#0284c7',
      description: meta?.description || 'Custom defined role profile.',
      usersCount: 0
    };

    const matrix = this.getCurrentMatrix();
    matrix[roleName] = {};
    this.modules.forEach(mod => {
      matrix[roleName][mod] = {};
      this.permissionColumns.forEach(col => {
        matrix[roleName][mod][col] = cloneFrom && matrix[cloneFrom]?.[mod]?.[col] ? true : false;
      });
    });

    return this.savePermissions(matrix);
  }

  deleteCustomRole(roleName: string): Observable<any> {
    if (this.defaultRoles.includes(roleName)) {
      return of({ success: false, message: 'Default roles cannot be deleted' });
    }

    this.roles = this.roles.filter(r => r !== roleName);
    delete this.roleMetadata[roleName];

    const matrix = this.getCurrentMatrix();
    delete matrix[roleName];

    return this.savePermissions(matrix);
  }

  isCustomRole(roleName: string): boolean {
    return !this.defaultRoles.includes(roleName);
  }

  resetRoleToDefault(role: string): PermissionMatrix {
    const current = this.getCurrentMatrix();
    const defaults = this.getDefaultPermissions();
    if (defaults[role]) {
      current[role] = JSON.parse(JSON.stringify(defaults[role]));
      this.permissionsSubject.next(current);
      localStorage.setItem(this.storageKey, JSON.stringify(current));
    }
    return current;
  }

  resetAllToDefault(): PermissionMatrix {
    const defaults = this.getDefaultPermissions();
    this.permissionsSubject.next(defaults);
    localStorage.setItem(this.storageKey, JSON.stringify(defaults));
    return defaults;
  }

  updateRoleUserCounts(counts: { [role: string]: number }): void {
    // Reset all counts first
    for (const role of this.roles) {
      if (this.roleMetadata[role]) {
        this.roleMetadata[role].usersCount = 0;
      }
    }
    for (const [role, count] of Object.entries(counts)) {
      if (this.roleMetadata[role]) {
        this.roleMetadata[role].usersCount = count;
      }
    }
  }

  fetchUserCounts(): void {
    this.http.get<any>(`${environment.apiUrl}/users`).pipe(
      catchError(() => of({ success: false, users: [] }))
    ).subscribe(res => {
      if (res && res.success && res.users) {
        const counts: { [role: string]: number } = {};
        for (const u of res.users) {
          const rName = this.normalizeRoleName(u.role ? (u.role.name || u.role.code) : '');
          if (rName) {
            counts[rName] = (counts[rName] || 0) + 1;
          }
        }
        this.updateRoleUserCounts(counts);
      }
    });
  }

  normalizeRoleName(nameOrCode: string): string {
    if (!nameOrCode) return 'Account Executive';
    const upper = nameOrCode.toUpperCase();
    if (upper === 'ADMIN' || upper.includes('ADMINISTRATOR') || upper === 'ORG ADMIN') return 'Org Admin';
    if (upper === 'DIRECTOR' || upper.includes('MANAGING DIRECTOR') || upper === 'SALES HEAD') return 'Sales Head';
    if (upper === 'SALES_MANAGER' || upper.includes('SALES MANAGER')) return 'Sales Manager';
    if (upper === 'SALES_REP' || upper.includes('SALES REPRESENTATIVE') || upper === 'ACCOUNT EXECUTIVE') return 'Account Executive';
    if (upper === 'COORDINATOR' || upper.includes('LOGISTICS') || upper === 'SITE VISIT COORDINATOR') return 'Site Visit Coordinator';
    if (upper === 'DRIVER') return 'Driver';
    if (upper === 'VIEWER' || upper === 'EXECUTIVE VIEWER') return 'Executive Viewer';
    const found = this.roles.find(r => r.toLowerCase() === nameOrCode.toLowerCase());
    return found || nameOrCode;
  }

  getRoleSummary(role: string): { meta: RoleMeta; grantedModules: string[]; activeActions: string[] } {
    const meta = this.roleMetadata[role] || {
      name: role,
      badge: 'Custom',
      color: '#0284c7',
      description: 'Custom access profile.',
      usersCount: 0
    };

    const matrix = this.getCurrentMatrix();
    const rolePermissions = matrix[role] || {};
    const grantedModules: string[] = [];
    const activeActionsSet = new Set<string>();

    for (const mod of this.modules) {
      const perms = rolePermissions[mod];
      if (perms) {
        let hasAny = false;
        for (const col of this.permissionColumns) {
          if (perms[col]) {
            hasAny = true;
            activeActionsSet.add(col);
          }
        }
        if (hasAny) grantedModules.push(mod);
      }
    }

    return {
      meta,
      grantedModules,
      activeActions: Array.from(activeActionsSet)
    };
  }

  checkPermission(role: string, module: string, action: string): boolean {
    const matrix = this.permissionsSubject.value;
    return !!(matrix[role] && matrix[role][module] && matrix[role][module][action]);
  }
}
