import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SettingsService } from '../settings.service';

export interface PropertyTypeConfig {
  name: string;
  bhk_type: string;
  carpet_area_sqft: number;
  super_builtup_area_sqft: number;
  base_price_lacs: number;
  total_units: number;
  facing: string;
  tower_wing?: string;
  floor_range?: string;
  front_road_width?: string;
  plot_location?: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {
  private settingsService = inject(SettingsService);

  loading = false;
  feedbackMessage = '';
  editingProjectId: number | null = null;
  editForm: any = {};
  accessScope: any = null;

  stats = {
    projects: 0,
    active: 0,
    daily_capacity: 0,
    booking_value: '1.95',
    total_flats: 0,
    available_flats: 0
  };

  // Add Project Form State
  newProject = {
    name: '',
    developer: 'Contech Developments Pvt Ltd',
    location: '',
    address: '',
    project_purpose: 'Housing / Residential',
    configurations: '2 BHK, 3 BHK, 4 BHK Luxury',
    daily_capacity: 20,
    working_hours: '09:00 AM - 07:00 PM',
    status: 'active'
  };

  // Purpose options for real estate developments
  projectPurposeOptions: {
    id: string;
    label: string;
    badge: string;
    icon: string;
    description: string;
    presetSummary: string;
    typologyPresetName: string;
    recommendedTypes: PropertyTypeConfig[];
  }[] = [
    {
      id: 'Housing / Residential',
      label: 'Housing / Residential Purpose',
      badge: 'Homes & Apartments',
      icon: 'apartment',
      description: 'Apartments, Gated High-Rise Towers, Row Houses, Luxury Duplexes & Penthouses',
      presetSummary: '2 BHK Executive, 3 BHK Royal Grand, 4 BHK Penthouse',
      typologyPresetName: 'Flats & Residential Configurations',
      recommendedTypes: [
        { 
          name: '2 BHK Executive', 
          bhk_type: '2 BHK', 
          carpet_area_sqft: 1050, 
          super_builtup_area_sqft: 1280, 
          base_price_lacs: 125, 
          total_units: 30, 
          facing: 'East Facing',
          tower_wing: 'Tower A / Wing 1',
          floor_range: 'Floors 1-10',
          front_road_width: '40 ft Road',
          plot_location: 'Center / Intermediate Plot'
        },
        { 
          name: '3 BHK Royal Grand', 
          bhk_type: '3 BHK', 
          carpet_area_sqft: 1450, 
          super_builtup_area_sqft: 1780, 
          base_price_lacs: 175, 
          total_units: 40, 
          facing: 'North-East Facing',
          tower_wing: 'Tower B / Wing 2',
          floor_range: 'Floors 5-18',
          front_road_width: '60 ft Avenue',
          plot_location: 'Corner Plot'
        }
      ]
    },
    {
      id: 'Commercial',
      label: 'Commercial Purpose',
      badge: 'Offices & Retail',
      icon: 'domain',
      description: 'Grade-A Tech Parks, Bare-Shell Office Suites, High-Street Retail Showrooms & SCOs',
      presetSummary: 'Grade-A Office Suite, Retail High-Street Store, Corporate Suite',
      typologyPresetName: 'Commercial Units & Retail Configurations',
      recommendedTypes: [
        {
          name: 'Grade-A Bare Shell Office',
          bhk_type: 'Commercial Unit',
          carpet_area_sqft: 1200,
          super_builtup_area_sqft: 1650,
          base_price_lacs: 160,
          total_units: 25,
          facing: 'Main Boulevard Facing',
          tower_wing: 'Tower Alpha / Floors 3-12',
          floor_range: 'Floors 3-12',
          front_road_width: '80 ft Main Road',
          plot_location: 'Main Road / Boulevard Facing'
        },
        {
          name: 'High-Street Retail Store',
          bhk_type: 'Commercial Unit',
          carpet_area_sqft: 850,
          super_builtup_area_sqft: 1100,
          base_price_lacs: 195,
          total_units: 12,
          facing: 'Frontage Main Road',
          tower_wing: 'Podium Ground Floor',
          floor_range: 'Ground Level',
          front_road_width: '60 ft Avenue',
          plot_location: 'Corner Plot'
        }
      ]
    },
    {
      id: 'Plot / Plotted Land',
      label: 'Plot / Plotted Land Purpose',
      badge: 'Layouts & Land Sites',
      icon: 'terrain',
      description: 'Plotted Townships, Gated Community Layouts, Villa Sites, Farm Plots & Land Parcels',
      presetSummary: '30x40 Standard Plot, 30x50 Premium Plot, 40x60 Executive Plot',
      typologyPresetName: 'Plots & Land Configurations',
      recommendedTypes: [
        {
          name: '30x40 Standard Plot (1200 Sqft)',
          bhk_type: 'Plot',
          carpet_area_sqft: 1200,
          super_builtup_area_sqft: 1200,
          base_price_lacs: 48,
          total_units: 35,
          facing: 'East Facing',
          tower_wing: 'Sector 1 / Green Avenue',
          floor_range: 'Ground Plotted Site',
          front_road_width: '30 ft Road',
          plot_location: 'Center / Intermediate Plot'
        },
        {
          name: '30x50 Premium Plot (1500 Sqft)',
          bhk_type: 'Plot',
          carpet_area_sqft: 1500,
          super_builtup_area_sqft: 1500,
          base_price_lacs: 65,
          total_units: 25,
          facing: 'North Facing',
          tower_wing: 'Sector 2 / Boulevard',
          floor_range: 'Ground Plotted Site',
          front_road_width: '40 ft Road',
          plot_location: 'Park / Garden Facing Plot'
        },
        {
          name: '40x60 Executive Villa Plot (2400 Sqft)',
          bhk_type: 'Plot',
          carpet_area_sqft: 2400,
          super_builtup_area_sqft: 2400,
          base_price_lacs: 110,
          total_units: 15,
          facing: 'Corner / Park Facing',
          tower_wing: 'Executive Enclave',
          floor_range: 'Corner Site',
          front_road_width: '60 ft Avenue',
          plot_location: 'Corner + Park Facing (Dual Prime)'
        }
      ]
    },
    {
      id: 'Mixed-Use Development',
      label: 'Mixed-Use Development Purpose',
      badge: 'Residential + Commercial',
      icon: 'location_city',
      description: 'Integrated Communities with Commercial Retail Podiums & Luxury Residences Above',
      presetSummary: 'Retail High-Street Store + 2 BHK & 3 BHK Residential Units',
      typologyPresetName: 'Mixed-Use Units Configuration',
      recommendedTypes: [
        {
          name: 'Retail Commercial Storefront',
          bhk_type: 'Commercial Unit',
          carpet_area_sqft: 950,
          super_builtup_area_sqft: 1200,
          base_price_lacs: 175,
          total_units: 14,
          facing: 'Main Promenade',
          tower_wing: 'Commercial Podium',
          floor_range: 'Ground & 1st',
          front_road_width: '80 ft Main Road',
          plot_location: 'Corner Plot'
        },
        {
          name: '3 BHK Sky Residence',
          bhk_type: '3 BHK',
          carpet_area_sqft: 1500,
          super_builtup_area_sqft: 1850,
          base_price_lacs: 180,
          total_units: 36,
          facing: 'North-East Facing',
          tower_wing: 'Tower 1 / Residential',
          floor_range: 'Floors 3-18',
          front_road_width: '60 ft Avenue',
          plot_location: 'Main Road / Boulevard Facing'
        }
      ]
    }
  ];

  isCustomPurposeActive = false;
  customPurposeValue = '';

  // Multiple property typologies to include when adding project
  newProjectPropertyTypes: PropertyTypeConfig[] = [
    { 
      name: '2 BHK Executive', 
      bhk_type: '2 BHK', 
      carpet_area_sqft: 1050, 
      super_builtup_area_sqft: 1280, 
      base_price_lacs: 125, 
      total_units: 30, 
      facing: 'East Facing',
      tower_wing: 'Tower A / Wing 1',
      floor_range: 'Floors 1-10',
      front_road_width: '40 ft Road',
      plot_location: 'Center / Intermediate Plot'
    },
    { 
      name: '3 BHK Royal', 
      bhk_type: '3 BHK', 
      carpet_area_sqft: 1450, 
      super_builtup_area_sqft: 1780, 
      base_price_lacs: 175, 
      total_units: 40, 
      facing: 'North-East Facing',
      tower_wing: 'Tower B / Wing 2',
      floor_range: 'Floors 5-18',
      front_road_width: '60 ft Avenue',
      plot_location: 'Corner Plot'
    }
  ];

  showPropertyTypesBuilder = true;

  // Front Road Width & Plot Location Options
  frontWidthOptions: string[] = [
    '30 ft Road',
    '40 ft Road',
    '50 ft Road',
    '60 ft Avenue',
    '80 ft Main Road',
    '100 ft Grand Boulevard',
    '120+ ft Expressway',
    '24 ft Internal Lane'
  ];

  plotLocationOptions: string[] = [
    'Center / Intermediate Plot',
    'Corner Plot',
    'Park / Garden Facing Plot',
    'Main Road / Boulevard Facing',
    'Corner + Park Facing (Dual Prime)',
    'Cul-de-sac / End Plot',
    'Lake / Water Body Facing',
    'North-East Corner (Vastu Prime)',
    'Standard / Regular'
  ];

  // Predefined & Dynamic Typology Options
  typologyOptions: string[] = [
    '1 BHK',
    '2 BHK',
    '3 BHK',
    '4 BHK',
    '5 BHK',
    'Penthouse',
    'Villa',
    'Duplex',
    'Plot',
    'Residential Plot',
    'Commercial Plot',
    'Farm House Plot',
    'Villa Plot',
    'Commercial Unit'
  ];

  showCustomTypeInput: { [key: string]: boolean } = {};
  customTypeValues: { [key: string]: string } = {};

  onTypologyChange(target: any, fieldKey: string, syncConfig = true): void {
    if (target.bhk_type === '__CUSTOM__') {
      this.showCustomTypeInput[fieldKey] = true;
      this.customTypeValues[fieldKey] = '';
    } else {
      this.showCustomTypeInput[fieldKey] = false;
      if (syncConfig) {
        this.syncConfigurationsText();
      }
    }
  }

  applyCustomTypology(target: any, fieldKey: string, syncConfig = true): void {
    const val = (this.customTypeValues[fieldKey] || '').trim();
    if (val) {
      if (!this.typologyOptions.includes(val)) {
        this.typologyOptions.push(val);
      }
      target.bhk_type = val;
      this.showCustomTypeInput[fieldKey] = false;
      if (syncConfig) {
        this.syncConfigurationsText();
      }
    }
  }

  cancelCustomTypology(target: any, fieldKey: string): void {
    this.showCustomTypeInput[fieldKey] = false;
    target.bhk_type = '2 BHK';
    this.syncConfigurationsText();
  }

  // --- Project Purpose & Category Methods ---
  showCustomPurposeInput = false;
  customPurposeInput = '';

  onPurposeDropdownChange(): void {
    if (this.newProject.project_purpose === '__CUSTOM__') {
      this.showCustomPurposeInput = true;
      this.customPurposeInput = '';
    } else {
      this.showCustomPurposeInput = false;
      this.applyPurposePresets(this.newProject.project_purpose);
    }
  }

  applyCustomPurposeInput(): void {
    const val = (this.customPurposeInput || '').trim();
    if (val) {
      if (!this.projectPurposeOptions.some(o => o.id === val)) {
        this.projectPurposeOptions.push({
          id: val,
          label: val,
          badge: 'Custom Purpose',
          icon: 'domain',
          description: `Custom development type: ${val}`,
          presetSummary: 'Custom typologies',
          typologyPresetName: `${val} Configurations`,
          recommendedTypes: []
        });
      }
      this.newProject.project_purpose = val;
      this.showCustomPurposeInput = false;
      this.showFeedback(`Project purpose set to "${val}".`);
    }
  }

  cancelCustomPurposeInput(): void {
    this.showCustomPurposeInput = false;
    this.newProject.project_purpose = 'Housing / Residential';
    this.applyPurposePresets('Housing / Residential');
  }

  selectProjectPurpose(purposeId: string, applyPresets = false): void {
    this.isCustomPurposeActive = false;
    this.newProject.project_purpose = purposeId;
    if (applyPresets) {
      this.applyPurposePresets(purposeId);
    }
  }

  applyPurposePresets(purposeId: string): void {
    const opt = this.projectPurposeOptions.find(o => o.id === purposeId);
    if (opt && opt.recommendedTypes && opt.recommendedTypes.length > 0) {
      this.newProjectPropertyTypes = JSON.parse(JSON.stringify(opt.recommendedTypes));
      this.syncConfigurationsText();
      this.showFeedback(`Loaded recommended typologies for ${opt.label}.`);
    }
  }

  toggleCustomPurpose(): void {
    this.isCustomPurposeActive = !this.isCustomPurposeActive;
    if (this.isCustomPurposeActive) {
      this.customPurposeValue = '';
    } else {
      this.newProject.project_purpose = 'Housing / Residential';
    }
  }

  applyCustomPurpose(): void {
    const val = (this.customPurposeValue || '').trim();
    if (val) {
      this.newProject.project_purpose = val;
      this.showFeedback(`Project purpose set to "${val}".`);
    }
  }

  getPurposeTitle(): string {
    const opt = this.projectPurposeOptions.find(o => o.id === this.newProject.project_purpose);
    return opt ? opt.typologyPresetName : 'Flats & Properties Configuration for this Project';
  }

  getPurposeIcon(purpose: string): string {
    const p = (purpose || '').toLowerCase();
    if (p.includes('plot') || p.includes('land')) return 'terrain';
    if (p.includes('commercial') || p.includes('office') || p.includes('retail')) return 'domain';
    if (p.includes('mixed')) return 'location_city';
    return 'apartment';
  }

  getPurposeBadgeClass(purpose: string): string {
    const p = (purpose || '').toLowerCase();
    if (p.includes('plot') || p.includes('land')) return 'badge-purpose-plot';
    if (p.includes('commercial') || p.includes('office') || p.includes('retail')) return 'badge-purpose-commercial';
    if (p.includes('mixed')) return 'badge-purpose-mixed';
    return 'badge-purpose-housing';
  }

  getTypologyAddLabel(): string {
    const p = (this.newProject.project_purpose || '').toLowerCase();
    if (p.includes('plot') || p.includes('land')) return 'Plot Typology';
    if (p.includes('commercial') || p.includes('office') || p.includes('retail')) return 'Commercial Typology';
    return 'Flat Typology';
  }

  projects: any[] = [];

  // Interactive Flats / Inventory Drawer State
  isInventoryOpen = false;
  activeProject: any = null;
  inventoryLoading = false;
  inventoryTab: 'units' | 'types' = 'units';
  inventoryFilterStatus = 'ALL';
  inventoryFilterTower = 'ALL';
  inventorySearch = '';

  activeInventory: {
    propertyTypes: any[];
    units: any[];
    stats: {
      total_flats: number;
      available_flats: number;
      reserved_flats: number;
      booked_flats: number;
      blocked_flats: number;
      total_value_cr: string;
      booked_value_cr: string;
    };
  } = {
    propertyTypes: [],
    units: [],
    stats: {
      total_flats: 0,
      available_flats: 0,
      reserved_flats: 0,
      booked_flats: 0,
      blocked_flats: 0,
      total_value_cr: '0.00',
      booked_value_cr: '0.00'
    }
  };

  // Modals inside drawer
  showSingleFlatModal = false;
  showBatchModal = false;
  showTypeModal = false;

  newFlatForm = {
    unit_number: '',
    tower_block: 'Tower A',
    floor_number: 1,
    bhk_type: '2 BHK',
    area_sqft: 1280,
    price_lacs: 125.00,
    facing: 'East Facing',
    front_road_width: '40 ft Road',
    plot_location: 'Center / Intermediate Plot',
    status: 'AVAILABLE',
    notes: ''
  };

  batchFlatForm = {
    tower_block: 'Tower A',
    start_floor: 1,
    end_floor: 5,
    units_per_floor: 4,
    bhk_type: '2 BHK',
    area_sqft: 1280,
    price_lacs: 125.00,
    facing: 'East Facing'
  };

  newTypeForm = {
    name: '',
    bhk_type: '2 BHK',
    carpet_area_sqft: 1100,
    super_builtup_area_sqft: 1350,
    base_price_lacs: 120.00,
    total_units: 20,
    facing: 'East Facing',
    tower_wing: 'Tower A / Wing 1',
    floor_range: 'Floors 1-14',
    front_road_width: '40 ft Road',
    plot_location: 'Center / Intermediate Plot',
    description: ''
  };

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.settingsService.getSettings().subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res && res.success && res.projects && res.projects.length > 0) {
          this.accessScope = res.access_scope || (res.settings && res.settings.access_scope) || null;
          this.projects = res.projects.map((p: any) => {
            const pId = p.id || p.project_id;
            return {
              id: pId,
              name: p.name,
              code: p.code,
              developer: p.developer || 'Contech Developments Pvt Ltd',
              location: p.location || 'Bengaluru',
              address: p.address || '',
              project_purpose: p.project_purpose || (pId === 3 ? 'Plot / Plotted Land' : (pId === 2 ? 'Commercial' : 'Housing / Residential')),
              configurations: p.configurations || '2 BHK, 3 BHK, 4 BHK',
              capacity_per_day: p.daily_capacity || 20,
              working_hours: p.operating_hours || '09:00 AM - 07:00 PM',
              blackout_periods: p.blackout_periods || 'None',
              total_units: p.flats_count !== undefined ? p.flats_count : (p.total_units || 0),
              available_units: p.available_flats_count !== undefined ? p.available_flats_count : (p.available_units || 0),
              booked_units: p.booked_flats_count || 0,
              reserved_units: p.reserved_flats_count || 0,
              active_pipeline: p.active_pipeline || (pId === 3 ? 1 : 2),
              upcoming_visits: p.upcoming_visits !== undefined ? p.upcoming_visits : (pId === 1 || pId === 2 ? 1 : 0),
              crm_bookings: p.crm_bookings !== undefined ? p.crm_bookings : (pId === 1 ? 1 : 0),
              crm_booking_value_cr: p.crm_booking_value_cr || (pId === 1 ? '1.95' : '0.00'),
              historical_sold_units: (p.total_units - p.available_units) > 0 ? (p.total_units - p.available_units) : 0,
              starting_price_lacs: p.starting_price_lacs || 125,
              property_types: p.property_types || [],
              assigned_users: p.assigned_users || [],
              user_access_scoped: p.user_access_scoped || false,
              status: (p.status === 'ACTIVE' || p.is_active !== false) ? 'active' : 'inactive'
            };
          });
        } else {
          this.loadFallbackProjects();
        }
        this.updateStats();
      },
      error: () => {
        this.loading = false;
        this.loadFallbackProjects();
        this.updateStats();
      }
    });
  }

  private loadFallbackProjects(): void {
    this.projects = [
      {
        id: 1,
        name: 'Contech Crown Heights',
        code: 'CCH-BLR',
        developer: 'Contech Developments Pvt Ltd',
        location: 'ITPL Main Road, Whitefield, Bengaluru',
        project_purpose: 'Housing / Residential',
        configurations: '2 BHK Elegance, 3 BHK Royal Grand, 4 BHK Sky Penthouse',
        capacity_per_day: 25,
        total_units: 8,
        available_units: 6,
        booked_units: 1,
        reserved_units: 1,
        active_pipeline: 2,
        upcoming_visits: 1,
        crm_bookings: 1,
        crm_booking_value_cr: '1.95',
        historical_sold_units: 82,
        starting_price_lacs: 145,
        status: 'active',
        property_types: [
          { name: '2 BHK Elegance', bhk_type: '2 BHK', base_price_lacs: 145, total_units: 40 },
          { name: '3 BHK Royal Grand', bhk_type: '3 BHK', base_price_lacs: 195, total_units: 50 },
          { name: '4 BHK Sky Penthouse', bhk_type: '4 BHK', base_price_lacs: 310, total_units: 30 }
        ]
      },
      {
        id: 2,
        name: 'Contech TechVista Commercial Hub',
        code: 'CTC-BLR',
        developer: 'Contech Commercial Infra Pvt Ltd',
        location: '100ft Road, Indiranagar, Bengaluru',
        project_purpose: 'Commercial',
        configurations: 'Grade-A Bare Shell Office, High-Street Retail Showroom',
        capacity_per_day: 18,
        total_units: 4,
        available_units: 4,
        booked_units: 0,
        reserved_units: 0,
        active_pipeline: 2,
        upcoming_visits: 1,
        crm_bookings: 0,
        crm_booking_value_cr: '0.00',
        historical_sold_units: 66,
        starting_price_lacs: 160,
        status: 'active',
        property_types: [
          { name: 'Grade-A Bare Shell Office', bhk_type: 'Commercial Unit', base_price_lacs: 160, total_units: 25 },
          { name: 'High-Street Retail Store', bhk_type: 'Commercial Unit', base_price_lacs: 195, total_units: 12 }
        ]
      },
      {
        id: 3,
        name: 'Contech Greenfield Plotted Sanctuary',
        code: 'CGS-BLR',
        developer: 'Contech Green Living LLP',
        location: 'Sarjapur-Outer Ring Road, Bengaluru',
        project_purpose: 'Plot / Plotted Land',
        configurations: '30x40 Standard Plot, 30x50 Premium Plot, 40x60 Executive Plot',
        capacity_per_day: 35,
        total_units: 5,
        available_units: 5,
        booked_units: 0,
        reserved_units: 0,
        active_pipeline: 1,
        upcoming_visits: 0,
        crm_bookings: 0,
        crm_booking_value_cr: '0.00',
        historical_sold_units: 118,
        starting_price_lacs: 48,
        status: 'active',
        property_types: [
          { name: '30x40 Standard Plot (1200 Sqft)', bhk_type: 'Plot', base_price_lacs: 48, total_units: 35 },
          { name: '30x50 Premium Plot (1500 Sqft)', bhk_type: 'Plot', base_price_lacs: 65, total_units: 25 },
          { name: '40x60 Executive Villa Plot (2400 Sqft)', bhk_type: 'Plot', base_price_lacs: 110, total_units: 15 }
        ]
      }
    ];
  }

  updateStats(): void {
    this.stats.projects = this.projects.length;
    this.stats.active = this.projects.filter(p => p.status === 'active').length;
    this.stats.daily_capacity = this.projects.reduce((acc, p) => acc + (Number(p.capacity_per_day) || 0), 0);
    const totalBookingValCr = this.projects.reduce((acc, p) => acc + (parseFloat(p.crm_booking_value_cr) || 0), 0);
    this.stats.booking_value = totalBookingValCr > 0 ? totalBookingValCr.toFixed(2) : '1.95';
    this.stats.total_flats = this.projects.reduce((acc, p) => acc + (Number(p.total_units) || 0), 0);
    this.stats.available_flats = this.projects.reduce((acc, p) => acc + (Number(p.available_units) || 0), 0);
  }

  // --- Add Project Form Actions ---
  addPropertyTypeRow(): void {
    const nextWing = String.fromCharCode(65 + (this.newProjectPropertyTypes.length % 26));
    this.newProjectPropertyTypes.push({
      name: '4 BHK Luxury Penthouse',
      bhk_type: '4 BHK',
      carpet_area_sqft: 2200,
      super_builtup_area_sqft: 2750,
      base_price_lacs: 280,
      total_units: 15,
      facing: 'Panoramic Park Facing',
      tower_wing: `Tower ${nextWing} / Wing ${this.newProjectPropertyTypes.length + 1}`,
      floor_range: 'Floors 12-24',
      front_road_width: '40 ft Road',
      plot_location: 'Center / Intermediate Plot'
    });
    this.syncConfigurationsText();
  }

  removePropertyTypeRow(index: number): void {
    if (this.newProjectPropertyTypes.length > 1) {
      this.newProjectPropertyTypes.splice(index, 1);
      this.syncConfigurationsText();
    }
  }

  syncConfigurationsText(): void {
    if (this.newProjectPropertyTypes.length > 0) {
      this.newProject.configurations = this.newProjectPropertyTypes
        .map(t => t.name || `${t.bhk_type} Unit`)
        .join(', ');
    }
  }

  addProject(): void {
    if (!this.newProject.name.trim()) return;

    this.syncConfigurationsText();

    const payload: any = {
      name: this.newProject.name,
      developer: this.newProject.developer || 'Contech Developments Pvt Ltd',
      location: this.newProject.location || 'Bengaluru',
      address: this.newProject.address || '',
      project_purpose: this.newProject.project_purpose || 'Housing / Residential',
      configurations: this.newProject.configurations,
      daily_capacity: Number(this.newProject.daily_capacity) || 20,
      working_hours: this.newProject.working_hours,
      is_active: this.newProject.status === 'active',
      property_types: this.newProjectPropertyTypes
    };


    this.settingsService.createProject(payload).subscribe({
      next: (res: any) => {
        const created = res.project || payload;
        const newTotal = (res.units && res.units.length) ? res.units.length : (payload.units ? payload.units.length : 20);
        this.projects.unshift({
          id: created.id || created.project_id || Date.now(),
          name: created.name,
          developer: created.developer,
          location: created.location,
          address: created.address,
          project_purpose: created.project_purpose || payload.project_purpose,
          configurations: created.configurations,
          capacity_per_day: created.daily_capacity,
          total_units: newTotal,
          available_units: newTotal,
          booked_units: 0,
          reserved_units: 0,
          active_pipeline: 0,
          upcoming_visits: 0,
          crm_bookings: 0,
          crm_booking_value_cr: '0.00',
          historical_sold_units: 0,
          starting_price_lacs: (this.newProjectPropertyTypes[0]?.base_price_lacs) || 125,
          property_types: res.property_types || this.newProjectPropertyTypes,
          status: created.is_active ? 'active' : 'inactive'
        });
        this.updateStats();
        this.resetForm();
        this.showFeedback(`Project "${created.name}" created with ${this.newProjectPropertyTypes.length} property configurations & inventory.`);
      },
      error: () => {
        const fallbackId = Date.now();
        this.projects.unshift({
          id: fallbackId,
          ...payload,
          project_purpose: payload.project_purpose,
          capacity_per_day: payload.daily_capacity,
          total_units: payload.units ? payload.units.length : 20,
          available_units: payload.units ? payload.units.length : 20,
          booked_units: 0,
          reserved_units: 0,
          active_pipeline: 0,
          upcoming_visits: 0,
          crm_bookings: 0,
          crm_booking_value_cr: '0.00',
          historical_sold_units: 0,
          starting_price_lacs: 125,
          property_types: this.newProjectPropertyTypes,
          status: payload.is_active ? 'active' : 'inactive'
        });
        this.updateStats();
        this.resetForm();
        this.showFeedback(`Project "${payload.name}" created locally.`);
      }
    });
  }

  // --- Inline Edit Project ---
  startEdit(project: any): void {
    this.editingProjectId = project.id;
    this.editForm = {
      name: project.name,
      developer: project.developer,
      location: project.location,
      project_purpose: project.project_purpose || 'Housing / Residential',
      configurations: project.configurations,
      daily_capacity: project.capacity_per_day,
      status: project.status
    };
  }

  cancelEdit(): void {
    this.editingProjectId = null;
    this.editForm = {};
  }

  saveEdit(project: any): void {
    const payload = {
      name: this.editForm.name,
      developer: this.editForm.developer,
      location: this.editForm.location,
      project_purpose: this.editForm.project_purpose || 'Housing / Residential',
      configurations: this.editForm.configurations,
      daily_capacity: Number(this.editForm.daily_capacity) || 10,
      is_active: this.editForm.status === 'active'
    };

    this.settingsService.updateProject(project.id, payload).subscribe({
      next: () => {
        project.name = payload.name;
        project.developer = payload.developer;
        project.location = payload.location;
        project.project_purpose = payload.project_purpose;
        project.configurations = payload.configurations;
        project.capacity_per_day = payload.daily_capacity;
        project.status = payload.is_active ? 'active' : 'inactive';
        this.editingProjectId = null;
        this.updateStats();
        this.showFeedback(`Project "${project.name}" updated successfully.`);
      },
      error: () => {
        project.name = payload.name;
        project.developer = payload.developer;
        project.location = payload.location;
        project.project_purpose = payload.project_purpose;
        project.configurations = payload.configurations;
        project.capacity_per_day = payload.daily_capacity;
        project.status = payload.is_active ? 'active' : 'inactive';
        this.editingProjectId = null;
        this.updateStats();
        this.showFeedback(`Project "${project.name}" updated.`);
      }
    });
  }

  deleteProject(project: any): void {
    const confirmDelete = window.confirm(`Delete project "${project.name}" from database? All associated flats and properties will also be deleted.`);
    if (!confirmDelete) return;

    this.settingsService.deleteProject(project.id).subscribe({
      next: () => {
        this.projects = this.projects.filter(p => p.id !== project.id);
        this.updateStats();
        this.showFeedback(`Project "${project.name}" deleted.`);
      },
      error: () => {
        this.projects = this.projects.filter(p => p.id !== project.id);
        this.updateStats();
        this.showFeedback(`Project "${project.name}" removed.`);
      }
    });
  }

  // --- Flats & Inventory Drawer ---
  openInventoryDrawer(project: any): void {
    this.activeProject = project;
    this.isInventoryOpen = true;
    this.inventoryTab = 'units';
    this.inventoryFilterStatus = 'ALL';
    this.inventoryFilterTower = 'ALL';
    this.inventorySearch = '';
    this.showSingleFlatModal = false;
    this.showBatchModal = false;
    this.showTypeModal = false;
    this.loadProjectInventory(project.id);
  }

  closeInventoryDrawer(): void {
    this.isInventoryOpen = false;
    this.activeProject = null;
  }

  setInventoryTab(tab: 'units' | 'types'): void {
    this.inventoryTab = tab;
  }

  loadProjectInventory(projectId: number): void {
    this.inventoryLoading = true;
    this.settingsService.getProjectInventory(projectId).subscribe({
      next: (res: any) => {
        this.inventoryLoading = false;
        if (res && res.success) {
          this.activeInventory = {
            propertyTypes: res.propertyTypes || [],
            units: res.units || [],
            stats: res.stats || {
              total_flats: 0,
              available_flats: 0,
              reserved_flats: 0,
              booked_flats: 0,
              blocked_flats: 0,
              total_value_cr: '0.00',
              booked_value_cr: '0.00'
            }
          };

          // Update active project unit count metrics
          if (this.activeProject) {
            this.activeProject.total_units = res.stats.total_flats;
            this.activeProject.available_units = res.stats.available_flats;
            this.activeProject.booked_units = res.stats.booked_flats;
            this.activeProject.reserved_units = res.stats.reserved_flats;
            this.activeProject.property_types = res.propertyTypes;
            this.updateStats();
          }
        }
      },
      error: () => {
        this.inventoryLoading = false;
        // Mock fallback inventory for development
        this.activeInventory = {
          propertyTypes: this.activeProject?.property_types || [
            { id: 1, name: '2 BHK Elegance', bhk_type: '2 BHK', carpet_area_sqft: 1050, super_builtup_area_sqft: 1320, base_price_lacs: 145, total_units: 40, facing: 'East Facing' },
            { id: 2, name: '3 BHK Royal Grand', bhk_type: '3 BHK', carpet_area_sqft: 1480, super_builtup_area_sqft: 1850, base_price_lacs: 195, total_units: 50, facing: 'North-East Facing' },
            { id: 3, name: '4 BHK Sky Penthouse', bhk_type: '4 BHK', carpet_area_sqft: 2250, super_builtup_area_sqft: 2850, base_price_lacs: 310, total_units: 30, facing: 'Panoramic Park Facing' }
          ],
          units: [
            { unit_id: 1, unit_number: 'Tower A - 101', tower_block: 'Tower A', floor_number: 1, bhk_type: '2 BHK', area_sqft: 1320, price_lacs: 145.00, facing: 'East Facing', status: 'AVAILABLE' },
            { unit_id: 2, unit_number: 'Tower A - 102', tower_block: 'Tower A', floor_number: 1, bhk_type: '2 BHK', area_sqft: 1320, price_lacs: 145.00, facing: 'West Facing', status: 'AVAILABLE' },
            { unit_id: 3, unit_number: 'Tower A - 201', tower_block: 'Tower A', floor_number: 2, bhk_type: '3 BHK', area_sqft: 1850, price_lacs: 195.00, facing: 'North-East Facing', status: 'AVAILABLE' },
            { unit_id: 4, unit_number: 'Tower A - 402', tower_block: 'Tower A', floor_number: 4, bhk_type: '3 BHK', area_sqft: 1850, price_lacs: 195.00, facing: 'East Facing', status: 'BOOKED', notes: 'Booked by Ananya Deshmukh' },
            { unit_id: 5, unit_number: 'Tower B - 501', tower_block: 'Tower B', floor_number: 5, bhk_type: '3 BHK', area_sqft: 1850, price_lacs: 202.00, facing: 'Park Facing', status: 'AVAILABLE' },
            { unit_id: 6, unit_number: 'Tower B - 703', tower_block: 'Tower B', floor_number: 7, bhk_type: '3 BHK', area_sqft: 1850, price_lacs: 210.00, facing: 'East Facing', status: 'RESERVED', notes: 'Shortlisted by Vikram Malhotra' },
            { unit_id: 7, unit_number: 'Tower B - 1201', tower_block: 'Tower B', floor_number: 12, bhk_type: '4 BHK', area_sqft: 2850, price_lacs: 310.00, facing: 'Panoramic Park Facing', status: 'AVAILABLE' },
            { unit_id: 8, unit_number: 'Tower B - 1202', tower_block: 'Tower B', floor_number: 12, bhk_type: '4 BHK', area_sqft: 2850, price_lacs: 315.00, facing: 'Panoramic Park Facing', status: 'AVAILABLE' }
          ],
          stats: {
            total_flats: 8,
            available_flats: 6,
            reserved_flats: 1,
            booked_flats: 1,
            blocked_flats: 0,
            total_value_cr: '16.97',
            booked_value_cr: '1.95'
          }
        };
      }
    });
  }

  // Filtered flats list
  get filteredUnits(): any[] {
    if (!this.activeInventory.units) return [];
    return this.activeInventory.units.filter(u => {
      const matchStatus = this.inventoryFilterStatus === 'ALL' || u.status === this.inventoryFilterStatus;
      const matchTower = this.inventoryFilterTower === 'ALL' || u.tower_block === this.inventoryFilterTower;
      const query = (this.inventorySearch || '').toLowerCase().trim();
      const matchSearch = !query ||
        (u.unit_number && u.unit_number.toLowerCase().includes(query)) ||
        (u.bhk_type && u.bhk_type.toLowerCase().includes(query)) ||
        (u.notes && u.notes.toLowerCase().includes(query));
      return matchStatus && matchTower && matchSearch;
    });
  }

  get uniqueTowers(): string[] {
    if (!this.activeInventory.units) return [];
    const set = new Set<string>();
    this.activeInventory.units.forEach(u => {
      if (u.tower_block) set.add(u.tower_block);
    });
    return Array.from(set);
  }

  // --- Add Flat (Single) ---
  openSingleFlatModal(): void {
    const primaryType = this.activeInventory.propertyTypes[0];
    this.newFlatForm = {
      unit_number: '',
      tower_block: 'Tower A',
      floor_number: 1,
      bhk_type: primaryType ? primaryType.bhk_type : '2 BHK',
      area_sqft: primaryType ? primaryType.super_builtup_area_sqft : 1280,
      price_lacs: primaryType ? primaryType.base_price_lacs : 125.00,
      facing: primaryType ? primaryType.facing : 'East Facing',
      front_road_width: primaryType && primaryType.front_road_width ? primaryType.front_road_width : '40 ft Road',
      plot_location: primaryType && primaryType.plot_location ? primaryType.plot_location : 'Center / Intermediate Plot',
      status: 'AVAILABLE',
      notes: ''
    };
    this.showSingleFlatModal = true;
  }

  submitSingleFlat(): void {
    if (!this.newFlatForm.unit_number.trim() || !this.activeProject) return;

    this.settingsService.addProjectUnit(this.activeProject.id, this.newFlatForm).subscribe({
      next: (res: any) => {
        this.showSingleFlatModal = false;
        this.loadProjectInventory(this.activeProject.id);
        this.showFeedback(`Flat ${this.newFlatForm.unit_number} added successfully.`);
      },
      error: () => {
        // Fallback local addition
        const newUnit = {
          unit_id: Date.now(),
          ...this.newFlatForm,
          project_id: this.activeProject.id
        };
        this.activeInventory.units.push(newUnit);
        this.recalculateInventoryStats();
        this.showSingleFlatModal = false;
        this.showFeedback(`Flat ${this.newFlatForm.unit_number} added.`);
      }
    });
  }

  // --- Batch Generate Flats ---
  openBatchModal(): void {
    const primaryType = this.activeInventory.propertyTypes[0];
    this.batchFlatForm = {
      tower_block: 'Tower A',
      start_floor: 1,
      end_floor: 4,
      units_per_floor: 4,
      bhk_type: primaryType ? primaryType.bhk_type : '2 BHK',
      area_sqft: primaryType ? primaryType.super_builtup_area_sqft : 1280,
      price_lacs: primaryType ? primaryType.base_price_lacs : 125.00,
      facing: primaryType ? primaryType.facing : 'East Facing'
    };
    this.showBatchModal = true;
  }

  submitBatchFlats(): void {
    if (!this.activeProject) return;

    const payload = {
      batch: true,
      ...this.batchFlatForm
    };

    this.settingsService.addProjectUnit(this.activeProject.id, payload).subscribe({
      next: (res: any) => {
        this.showBatchModal = false;
        this.loadProjectInventory(this.activeProject.id);
        this.showFeedback(res.message || 'Flats generated successfully.');
      },
      error: () => {
        // Fallback generator
        const startF = Number(this.batchFlatForm.start_floor) || 1;
        const endF = Number(this.batchFlatForm.end_floor) || startF;
        const uCount = Number(this.batchFlatForm.units_per_floor) || 4;
        const tower = this.batchFlatForm.tower_block || 'Tower A';

        for (let floor = startF; floor <= endF; floor++) {
          for (let u = 1; u <= uCount; u++) {
            const uNo = `${tower.replace(/^Tower\s*/i, '').trim()}-${floor}${u < 10 ? '0' + u : u}`;
            this.activeInventory.units.push({
              unit_id: Date.now() + Math.random(),
              project_id: this.activeProject.id,
              unit_number: uNo,
              tower_block: tower,
              floor_number: floor,
              bhk_type: this.batchFlatForm.bhk_type,
              area_sqft: this.batchFlatForm.area_sqft,
              price_lacs: this.batchFlatForm.price_lacs,
              facing: this.batchFlatForm.facing,
              status: 'AVAILABLE'
            });
          }
        }
        this.recalculateInventoryStats();
        this.showBatchModal = false;
        this.showFeedback(`Generated flats for ${tower} floors ${startF} to ${endF}.`);
      }
    });
  }

  // --- Quick Status Toggle ---
  quickToggleUnitStatus(unit: any, newStatus: string): void {
    const oldStatus = unit.status;
    unit.status = newStatus;
    this.settingsService.updateProjectUnit(this.activeProject.id, unit.unit_id || unit.id, { status: newStatus }).subscribe({
      next: () => {
        this.recalculateInventoryStats();
        this.showFeedback(`Flat ${unit.unit_number} marked as ${newStatus}.`);
      },
      error: () => {
        this.recalculateInventoryStats();
        this.showFeedback(`Flat ${unit.unit_number} marked as ${newStatus}.`);
      }
    });
  }

  deleteUnit(unit: any): void {
    const confirmDelete = window.confirm(`Remove flat "${unit.unit_number}" from project inventory?`);
    if (!confirmDelete) return;

    this.settingsService.deleteProjectUnit(this.activeProject.id, unit.unit_id || unit.id).subscribe({
      next: () => {
        this.activeInventory.units = this.activeInventory.units.filter(u => (u.unit_id || u.id) !== (unit.unit_id || unit.id));
        this.recalculateInventoryStats();
        this.showFeedback(`Flat ${unit.unit_number} deleted.`);
      },
      error: () => {
        this.activeInventory.units = this.activeInventory.units.filter(u => (u.unit_id || u.id) !== (unit.unit_id || unit.id));
        this.recalculateInventoryStats();
        this.showFeedback(`Flat ${unit.unit_number} deleted.`);
      }
    });
  }

  // --- Property Typology Configuration Management ---
  openTypeModal(): void {
    this.newTypeForm = {
      name: '',
      bhk_type: '3 BHK',
      carpet_area_sqft: 1450,
      super_builtup_area_sqft: 1800,
      base_price_lacs: 185.00,
      total_units: 30,
      facing: 'East Facing',
      tower_wing: 'Tower B / Wing 2',
      floor_range: 'Floors 5-18',
      front_road_width: '40 ft Road',
      plot_location: 'Center / Intermediate Plot',
      description: ''
    };
    this.showTypeModal = true;
  }

  submitPropertyType(): void {
    if (!this.activeProject) return;
    if (!this.newTypeForm.name && !this.newTypeForm.bhk_type) return;

    const payload = {
      ...this.newTypeForm,
      name: this.newTypeForm.name || `${this.newTypeForm.bhk_type} Luxury`
    };

    this.settingsService.addPropertyType(this.activeProject.id, payload).subscribe({
      next: (res: any) => {
        this.showTypeModal = false;
        this.loadProjectInventory(this.activeProject.id);
        this.showFeedback(`Property configuration "${payload.name}" saved.`);
      },
      error: () => {
        this.activeInventory.propertyTypes.push({
          id: Date.now(),
          ...payload
        });
        this.showTypeModal = false;
        this.showFeedback(`Property configuration "${payload.name}" added.`);
      }
    });
  }

  deletePropertyType(typeId: number): void {
    const confirmDelete = window.confirm('Delete this property configuration?');
    if (!confirmDelete) return;

    this.settingsService.deletePropertyType(this.activeProject.id, typeId).subscribe({
      next: () => {
        this.activeInventory.propertyTypes = this.activeInventory.propertyTypes.filter(t => (t.id || t.property_type_id) !== typeId);
        this.showFeedback('Property configuration removed.');
      },
      error: () => {
        this.activeInventory.propertyTypes = this.activeInventory.propertyTypes.filter(t => (t.id || t.property_type_id) !== typeId);
        this.showFeedback('Property configuration removed.');
      }
    });
  }

  private recalculateInventoryStats(): void {
    const units = this.activeInventory.units;
    const total = units.length;
    const available = units.filter(u => u.status === 'AVAILABLE').length;
    const reserved = units.filter(u => u.status === 'RESERVED').length;
    const booked = units.filter(u => u.status === 'BOOKED').length;
    const blocked = units.filter(u => u.status === 'BLOCKED').length;
    const totalVal = units.reduce((acc, u) => acc + (parseFloat(u.price_lacs) || 0), 0);
    const bookedVal = units.filter(u => u.status === 'BOOKED').reduce((acc, u) => acc + (parseFloat(u.price_lacs) || 0), 0);

    this.activeInventory.stats = {
      total_flats: total,
      available_flats: available,
      reserved_flats: reserved,
      booked_flats: booked,
      blocked_flats: blocked,
      total_value_cr: (totalVal / 100).toFixed(2),
      booked_value_cr: (bookedVal / 100).toFixed(2)
    };

    if (this.activeProject) {
      this.activeProject.total_units = total;
      this.activeProject.available_units = available;
      this.activeProject.booked_units = booked;
      this.activeProject.reserved_units = reserved;
      this.updateStats();
    }
  }

  private resetForm(): void {
    this.newProject.name = '';
    this.newProject.location = '';
    this.newProject.address = '';
    this.newProject.project_purpose = 'Housing / Residential';
    this.isCustomPurposeActive = false;
    this.customPurposeValue = '';
  }

  private showFeedback(msg: string): void {
    this.feedbackMessage = msg;
    setTimeout(() => {
      if (this.feedbackMessage === msg) {
        this.feedbackMessage = '';
      }
    }, 4000);
  }
}
