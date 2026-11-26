import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BuyerService } from '../buyer.service';
import { UserService } from '../../../users/user.service';
import { SettingsService } from '../../../settings/settings.service';
import { ErrorStateMatcher } from '@angular/material/core';

export class ImmediateErrorStateMatcher implements ErrorStateMatcher {
  constructor(private isInvalidFn?: () => boolean) {}

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    if (this.isInvalidFn && this.isInvalidFn()) {
      return true;
    }
    const isSubmitted = !!(form && form.submitted);
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted || !!control.value));
  }
}

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-buyer-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  templateUrl: './buyer-form.component.html',
  styleUrl: './buyer-form.component.css'
})
export class BuyerFormComponent implements OnInit {
  private buyerService = inject(BuyerService);
  private userService = inject(UserService);
  private settingsService = inject(SettingsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  salesReps: any[] = [];

  projects: any[] = [];

  defaultLeadSources: { value: string; label: string }[] = [
    { value: 'SimpliQualify', label: 'SimpliQualify AI Direct' },
    { value: 'Google Ads', label: 'Google Search Ads' },
    { value: 'Meta Ads', label: 'Meta / Instagram Ads' },
    { value: 'Referral', label: 'Customer Referral' },
    { value: 'Website', label: 'Developer Website Organic' },
    { value: 'Property Portal', label: 'MagicBricks / 99acres' },
    { value: 'Broker', label: 'Channel Partner / Broker' }
  ];
  leadSources: { value: string; label: string }[] = [];
  isCreatingCustomLeadSource = false;
  newCustomLeadSource = '';
  previousLeadSource = 'Google Ads';

  defaultOccupations: string[] = [
    'Salaried IT / Tech Corporate',
    'Business Owner / Entrepreneur',
    'Doctor / Healthcare Specialist',
    'Chartered Accountant / Finance',
    'NRI / Overseas Investor',
    'Government / PSU Officer',
    'Lawyer / Legal Professional',
    'Architect / Design Consultant',
    'Retired / Senior Citizen'
  ];
  occupations: string[] = [];
  isCreatingCustomOccupation = false;
  newCustomOccupation = '';
  previousOccupation = 'Salaried IT / Tech Corporate';

  defaultCountryCodes: { code: string; label: string }[] = [
    { code: '+91', label: '🇮🇳 +91 (India)' },
    { code: '+1', label: '🇺🇸 +1 (US / Canada)' },
    { code: '+971', label: '🇦🇪 +971 (UAE / Dubai)' },
    { code: '+44', label: '🇬🇧 +44 (UK)' },
    { code: '+65', label: '🇸🇬 +65 (Singapore)' },
    { code: '+61', label: '🇦🇺 +61 (Australia)' },
    { code: '+966', label: '🇸🇦 +966 (Saudi Arabia)' },
    { code: '+974', label: '🇶🇦 +974 (Qatar)' },
    { code: '+965', label: '🇰🇼 +965 (Kuwait)' },
    { code: '+968', label: '🇴🇲 +968 (Oman)' },
    { code: '+973', label: '🇧🇭 +973 (Bahrain)' },
    { code: '+49', label: '🇩🇪 +49 (Germany)' },
    { code: '+33', label: '🇫🇷 +33 (France)' },
    { code: '+60', label: '🇲🇾 +60 (Malaysia)' },
    { code: '+64', label: '🇳🇿 +64 (New Zealand)' },
    { code: '+81', label: '🇯🇵 +81 (Japan)' },
    { code: '+27', label: '🇿🇦 +27 (South Africa)' },
    { code: '+39', label: '🇮🇹 +39 (Italy)' },
    { code: '+34', label: '🇪🇸 +34 (Spain)' },
    { code: '+41', label: '🇨🇭 +41 (Switzerland)' },
    { code: '+31', label: '🇳🇱 +31 (Netherlands)' },
    { code: '+353', label: '🇮🇪 +353 (Ireland)' },
    { code: '+46', label: '🇸🇪 +46 (Sweden)' },
    { code: '+977', label: '🇳🇵 +977 (Nepal)' },
    { code: '+880', label: '🇧🇩 +880 (Bangladesh)' },
    { code: '+94', label: '🇱🇰 +94 (Sri Lanka)' },
    { code: '+62', label: '🇮🇩 +62 (Indonesia)' },
    { code: '+63', label: '🇵🇭 +63 (Philippines)' },
    { code: '+66', label: '🇹🇭 +66 (Thailand)' },
    { code: '+254', label: '🇰🇪 +254 (Kenya)' },
    { code: '+234', label: '🇳🇬 +234 (Nigeria)' },
    { code: '+55', label: '🇧🇷 +55 (Brazil)' },
    { code: '+52', label: '🇲🇽 +52 (Mexico)' },
    { code: '+86', label: '🇨🇳 +86 (China)' },
    { code: '+852', label: '🇭🇰 +852 (Hong Kong)' }
  ];
  countryCodes: { code: string; label: string }[] = [];
  isCreatingCustomCountryCode = false;
  newCustomCountryName = '';
  newCustomCountryDial = '';
  newCustomCountryFlag = '';
  previousCountryCode = '+91';

  buyerData: any = {
    full_name: '',
    phone: '',
    country_code: '+91',
    email: '',
    project_id: null,
    preferred_project: '',
    current_residence: '',
    workplace_location: '',
    budget_min_lacs: 120,
    budget_max_lacs: 180,
    preferred_bhk: '3 BHK',
    family_size: 4,
    buying_timeframe: '<30 days',
    lead_source: 'Google Ads',
    financing_readiness: 'Pre-approved Loan',
    occupation: 'Salaried IT / Tech Corporate',
    assigned_rep_id: null,
    notes: '',
    additional_info: '',
    allow_duplicate: false,
    duplicate_resolution_notes: ''
  };

  loading = false;
  errorMessage = '';
  isEditMode = false;
  buyerId: number | null = null;

  emailErrorMatcher = new ImmediateErrorStateMatcher(() => this.isEmailInvalid());

  isEmailInvalid(): boolean {
    if (!this.buyerData || !this.buyerData.email) return false;
    const email = (this.buyerData.email || '').trim();
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return !emailRegex.test(email);
  }

  getEmailErrorMessage(): string {
    if (this.isEmailInvalid()) {
      return 'Please enter a valid email address (e.g. name@example.com)';
    }
    return '';
  }

  isFakeOrSequentialPhone(phone: string): boolean {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, '');
    const sequentialPatterns = [
      '1234567890', '0123456789', '9876543210', '0987654321',
      '0000000000', '1111111111', '2222222222', '3333333333',
      '4444444444', '5555555555', '6666666666', '7777777777',
      '8888888888', '9999999999'
    ];
    if (sequentialPatterns.includes(digits)) return true;
    if (digits.length === 10 && /^(\d)\1{9}$/.test(digits)) return true;
    return false;
  }

  onPhoneInput(event: any): void {
    const val = event.target?.value || '';
    const maxLen = this.buyerData.country_code === '+91' ? 10 : 15;
    const clean = val.replace(/\D/g, '').slice(0, maxLen);
    this.buyerData.phone = clean;
    if (event.target) event.target.value = clean;
  }

  ngOnInit(): void {
    this.loadCountryCodes();
    this.loadLeadSources();
    this.loadOccupations();
    this.loadSalesReps();
    this.loadProjects();

    const routeId = this.route.snapshot.params['id'];
    if (routeId) {
      this.isEditMode = true;
      this.buyerId = Number(routeId);
      this.loadBuyerProfile(this.buyerId);
    } else {
      const paramProjectId = this.route.snapshot.queryParams['project_id'];
      if (paramProjectId) {
        this.buyerData.project_id = Number(paramProjectId);
      }
    }
  }

  loadBuyerProfile(id: number): void {
    this.loading = true;
    this.buyerService.getBuyer(id).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res && res.success && res.buyer) {
          const b = res.buyer;
          this.buyerData = {
            full_name: b.full_name || '',
            phone: (b.phone && b.phone.trim()) ? b.phone.trim() : '',
            country_code: b.country_code || '+91',
            email: b.email || '',
            project_id: b.project_id || (b.project ? b.project.project_id : null),
            preferred_project: b.preferred_project || (b.project ? b.project.name : ''),
            current_residence: b.current_residence || '',
            workplace_location: b.workplace_location || '',
            budget_min_lacs: b.budget_min_lacs !== undefined && b.budget_min_lacs !== null ? Number(b.budget_min_lacs) : 120,
            budget_max_lacs: b.budget_max_lacs !== undefined && b.budget_max_lacs !== null ? Number(b.budget_max_lacs) : 180,
            preferred_bhk: b.preferred_bhk || '3 BHK',
            family_size: b.family_size !== undefined && b.family_size !== null ? Number(b.family_size) : 4,
            buying_timeframe: b.buying_timeframe || '<30 days',
            lead_source: b.lead_source || 'Instagram',
            financing_readiness: b.financing_readiness || 'Pre-approved Loan',
            occupation: b.occupation || 'Salaried IT / Tech Corporate',
            assigned_rep_id: b.assigned_rep_id || (b.assignedRep ? b.assignedRep.user_id : null),
            notes: b.notes || '',
            additional_info: b.additional_info || '',
            allow_duplicate: false,
            duplicate_resolution_notes: b.duplicate_resolution_notes || ''
          };
          this.previousLeadSource = this.buyerData.lead_source;
          if (
            this.buyerData.lead_source &&
            !this.leadSources.some(s => s.value === this.buyerData.lead_source)
          ) {
            this.leadSources.unshift({
              value: this.buyerData.lead_source,
              label: this.buyerData.lead_source
            });
          }
          this.previousOccupation = this.buyerData.occupation;
          if (this.buyerData.occupation && !this.occupations.includes(this.buyerData.occupation)) {
            this.occupations.unshift(this.buyerData.occupation);
          }
          this.previousCountryCode = this.buyerData.country_code;
          if (
            this.buyerData.country_code &&
            !this.countryCodes.some(c => c.code === this.buyerData.country_code)
          ) {
            this.countryCodes.unshift({
              code: this.buyerData.country_code,
              label: `${this.buyerData.country_code} (Saved)`
            });
          }
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to load prospect details for editing.';
      }
    });
  }

  loadProjects(): void {
    this.settingsService.getSettings().subscribe({
      next: (res: any) => {
        if (res && res.projects && res.projects.length > 0) {
          this.projects = res.projects;
          if (!this.buyerData.project_id) {
            this.buyerData.project_id = this.projects[0].project_id || this.projects[0].id;
          }
          const matched = this.projects.find(p => (p.project_id || p.id) == this.buyerData.project_id);
          if (matched) this.buyerData.preferred_project = matched.name;
        }
      },
      error: () => { }
    });
  }

  onProjectSelect(projectId: number): void {
    const matched = this.projects.find(p => (p.project_id || p.id) == projectId);
    if (matched) {
      this.buyerData.preferred_project = matched.name;
    }
  }

  loadLeadSources(): void {
    try {
      const stored = localStorage.getItem('contech_custom_lead_sources');
      const custom: string[] = stored ? JSON.parse(stored) : [];
      const merged = [...this.defaultLeadSources];
      for (const item of custom) {
        if (
          item &&
          !merged.some(
            s =>
              s.value.toLowerCase() === item.toLowerCase() ||
              s.label.toLowerCase() === item.toLowerCase()
          )
        ) {
          merged.push({ value: item, label: item });
        }
      }
      this.leadSources = merged;
    } catch {
      this.leadSources = [...this.defaultLeadSources];
    }
  }

  onLeadSourceChange(val: string): void {
    if (val === '__create_new_source__') {
      this.isCreatingCustomLeadSource = true;
      this.newCustomLeadSource = '';
      setTimeout(() => {
        this.buyerData.lead_source = this.previousLeadSource;
      });
    } else {
      this.previousLeadSource = val;
      this.isCreatingCustomLeadSource = false;
    }
  }

  saveCustomLeadSource(event?: Event): void {
    if (event) event.preventDefault();
    const trimmed = this.newCustomLeadSource.trim();
    if (!trimmed) return;

    const existing = this.leadSources.find(
      s =>
        s.value.toLowerCase() === trimmed.toLowerCase() ||
        s.label.toLowerCase() === trimmed.toLowerCase()
    );

    if (existing) {
      this.buyerData.lead_source = existing.value;
      this.previousLeadSource = existing.value;
    } else {
      this.leadSources.push({ value: trimmed, label: trimmed });
      try {
        const stored = localStorage.getItem('contech_custom_lead_sources');
        const custom: string[] = stored ? JSON.parse(stored) : [];
        if (!custom.includes(trimmed)) {
          custom.push(trimmed);
          localStorage.setItem('contech_custom_lead_sources', JSON.stringify(custom));
        }
      } catch (e) {
        console.error('Failed to cache custom lead source', e);
      }
      this.buyerData.lead_source = trimmed;
      this.previousLeadSource = trimmed;
    }

    this.isCreatingCustomLeadSource = false;
    this.newCustomLeadSource = '';
  }

  cancelCustomLeadSource(): void {
    this.isCreatingCustomLeadSource = false;
    this.buyerData.lead_source = this.previousLeadSource;
    this.newCustomLeadSource = '';
  }

  loadOccupations(): void {
    try {
      const stored = localStorage.getItem('contech_custom_occupations');
      const custom: string[] = stored ? JSON.parse(stored) : [];
      this.occupations = Array.from(new Set([...this.defaultOccupations, ...custom]));
    } catch {
      this.occupations = [...this.defaultOccupations];
    }
  }

  onOccupationChange(val: string): void {
    if (val === '__create_new__') {
      this.isCreatingCustomOccupation = true;
      this.newCustomOccupation = '';
      setTimeout(() => {
        this.buyerData.occupation = this.previousOccupation;
      });
    } else {
      this.previousOccupation = val;
      this.isCreatingCustomOccupation = false;
    }
  }

  saveCustomOccupation(event?: Event): void {
    if (event) event.preventDefault();
    const trimmed = this.newCustomOccupation.trim();
    if (!trimmed) return;

    if (!this.occupations.includes(trimmed)) {
      this.occupations.push(trimmed);
      try {
        const stored = localStorage.getItem('contech_custom_occupations');
        const custom = stored ? JSON.parse(stored) : [];
        custom.push(trimmed);
        localStorage.setItem('contech_custom_occupations', JSON.stringify(custom));
      } catch (e) {
        console.error('Failed to cache custom occupation', e);
      }
    }
    this.buyerData.occupation = trimmed;
    this.previousOccupation = trimmed;
    this.isCreatingCustomOccupation = false;
    this.newCustomOccupation = '';
  }

  cancelCustomOccupation(): void {
    this.isCreatingCustomOccupation = false;
    this.buyerData.occupation = this.previousOccupation;
    this.newCustomOccupation = '';
  }

  loadCountryCodes(): void {
    try {
      const stored = localStorage.getItem('contech_custom_country_codes');
      const custom: { code: string; label: string }[] = stored ? JSON.parse(stored) : [];
      const combined = [...this.defaultCountryCodes];
      custom.forEach(item => {
        if (!combined.some(existing => existing.code === item.code)) {
          combined.push(item);
        }
      });
      this.countryCodes = combined;
    } catch {
      this.countryCodes = [...this.defaultCountryCodes];
    }
  }

  onCountryCodeChange(val: string): void {
    if (val === '__create_new_country__') {
      this.openCustomCountryCreator();
    } else {
      this.previousCountryCode = val;
      this.isCreatingCustomCountryCode = false;
    }
  }

  openCustomCountryCreator(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isCreatingCustomCountryCode = true;
    this.newCustomCountryName = '';
    this.newCustomCountryDial = '';
    this.newCustomCountryFlag = '';
    setTimeout(() => {
      this.buyerData.country_code = this.previousCountryCode;
    });
  }

  cancelCustomCountryCode(): void {
    this.isCreatingCustomCountryCode = false;
    this.buyerData.country_code = this.previousCountryCode;
    this.newCustomCountryName = '';
    this.newCustomCountryDial = '';
    this.newCustomCountryFlag = '';
  }

  get customCountryPreview(): string {
    const dial = this.formatDialCode(this.newCustomCountryDial);
    const name = this.newCustomCountryName.trim();
    const flag = this.newCustomCountryFlag.trim();
    if (!dial && !name) return '';
    return `${flag ? flag + ' ' : ''}${dial || '+...'} (${name || 'Country Name'})`;
  }

  private formatDialCode(dial: string): string {
    let clean = (dial || '').trim();
    if (!clean) return '';
    if (!clean.startsWith('+')) {
      clean = '+' + clean;
    }
    return clean;
  }

  saveCustomCountryCode(event?: Event): void {
    if (event) event.preventDefault();
    const name = this.newCustomCountryName.trim();
    let dial = this.formatDialCode(this.newCustomCountryDial);
    const flag = this.newCustomCountryFlag.trim();

    if (!name || !dial) {
      alert('Please enter both country name and dialing code.');
      return;
    }

    if (!/^\+\d{1,5}$/.test(dial)) {
      alert('Please enter a valid dialing code with digits (e.g. +965, +49, +230).');
      return;
    }

    const label = `${flag ? flag + ' ' : ''}${dial} (${name})`;
    const newEntry = { code: dial, label };

    const existingIndex = this.countryCodes.findIndex(c => c.code === dial);
    if (existingIndex >= 0) {
      this.countryCodes[existingIndex] = newEntry;
    } else {
      this.countryCodes.push(newEntry);
    }

    try {
      const stored = localStorage.getItem('contech_custom_country_codes');
      const custom: { code: string; label: string }[] = stored ? JSON.parse(stored) : [];
      const cIdx = custom.findIndex(c => c.code === dial);
      if (cIdx >= 0) {
        custom[cIdx] = newEntry;
      } else {
        custom.push(newEntry);
      }
      localStorage.setItem('contech_custom_country_codes', JSON.stringify(custom));
    } catch (e) {
      console.error('Failed to cache custom country code', e);
    }

    this.buyerData.country_code = dial;
    this.previousCountryCode = dial;
    this.isCreatingCustomCountryCode = false;
    this.newCustomCountryName = '';
    this.newCustomCountryDial = '';
    this.newCustomCountryFlag = '';
  }

  loadSalesReps(): void {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        if (res && res.success && res.users) {
          this.salesReps = res.users.filter((u: any) => u.is_active !== false);
          if (this.salesReps.length > 0 && !this.buyerData.assigned_rep_id) {
            const defaultRep = this.salesReps.find((u: any) => {
              const roleName = (u.role?.name || u.name || '').toLowerCase();
              return roleName.includes('executive') || roleName.includes('sales');
            }) || this.salesReps[0];
            this.buyerData.assigned_rep_id = defaultRep.user_id || defaultRep.id;
          }
        }
      }
    });
  }
  checkingDuplicate = false;
  duplicateInfo: any = null;

  checkDuplicateContact(): void {
    const phone = this.buyerData.phone?.trim();
    const email = this.buyerData.email?.trim();
    if (!phone && !email) return;

    this.checkingDuplicate = true;
    this.buyerService.checkDuplicate(phone, email).subscribe({
      next: (res) => {
        this.checkingDuplicate = false;
        if (res.success && res.is_duplicate) {
          this.duplicateInfo = res.duplicate;
        } else {
          this.duplicateInfo = null;
        }
      },
      error: () => {
        this.checkingDuplicate = false;
      }
    });
  }

  allowDuplicateProceed(): void {
    this.buyerData.allow_duplicate = true;
    this.buyerData.duplicate_resolution_notes = `Co-applicant / duplicate permitted resolution at ${new Date().toLocaleDateString()}`;
    this.duplicateInfo = null;
  }

  dismissDuplicateWarning(): void {
    this.duplicateInfo = null;
  }

  onSubmit() {
    this.errorMessage = '';

    // Bug 1 Fix: Target Project is required
    if (!this.buyerData.project_id) {
      this.errorMessage = 'Target Project is required. Please select a project for this prospect.';
      return;
    }

    if (!this.buyerData.full_name || !this.buyerData.full_name.trim()) {
      this.errorMessage = 'Full name is required.';
      return;
    }

    // Bug 3, 4, 5 Fix: Phone number validation
    if (!this.buyerData.phone || !this.buyerData.phone.trim()) {
      this.errorMessage = 'Phone number is required.';
      return;
    }

    const phoneDigits = this.buyerData.phone.replace(/\D/g, '');
    if (this.buyerData.country_code === '+91') {
      if (phoneDigits.length !== 10) {
        this.errorMessage = 'Phone number must be exactly 10 digits for Indian mobile numbers.';
        return;
      }
      if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
        this.errorMessage = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
        return;
      }
    } else if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      this.errorMessage = 'Please enter a valid phone number between 7 and 15 digits.';
      return;
    }

    if (this.isFakeOrSequentialPhone(phoneDigits)) {
      this.errorMessage = 'Invalid phone number. Sequential or placeholder phone numbers (e.g. 1234567890) are not permitted.';
      return;
    }

    // Bug 2 Fix: Email validation
    if (this.buyerData.email && this.buyerData.email.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(this.buyerData.email.trim())) {
        this.errorMessage = 'Please enter a valid email address (e.g. name@example.com).';
        return;
      }
    }

    // Bug 7 Fix: Minimum budget <= Maximum budget
    if (this.buyerData.budget_min_lacs !== null && this.buyerData.budget_max_lacs !== null) {
      const minB = Number(this.buyerData.budget_min_lacs);
      const maxB = Number(this.buyerData.budget_max_lacs);
      if (minB > maxB) {
        this.errorMessage = `Minimum budget (₹${minB} Lacs) cannot be greater than Maximum budget (₹${maxB} Lacs).`;
        return;
      }
    }

    this.loading = true;
    this.errorMessage = '';

    if (this.isEditMode && this.buyerId) {
      this.buyerService.updateBuyer(this.buyerId, this.buyerData).subscribe({
        next: (res) => {
          this.loading = false;
          this.router.navigate(['/buyers']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Failed to update buyer profile.';
        }
      });
      return;
    }

    this.buyerService.createBuyer(this.buyerData).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.buyer) {
          this.router.navigate(['/buyers', res.buyer.id]);
        } else {
          this.router.navigate(['/buyers']);
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409 && err.error?.is_duplicate) {
          this.duplicateInfo = err.error.existing_buyer;
          this.errorMessage = err.error.message || 'Duplicate prospect detected in database.';
        } else {
          this.errorMessage = err.error?.message || 'Failed to save buyer profile.';
        }
      }
    });
  }
}
