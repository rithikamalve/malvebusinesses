// ✏️ Edit this file to update listings. Admin panel changes override this via localStorage.

export type UnitStatus = "available" | "rented";

export interface Unit {
  id: string;
  name: string;
  area: number;
  seats: number;
  rent: number;
  bcm: number;
  specs: Record<string, string>;
  status: UnitStatus;
  images?: string[]; // urls or base64
  floorPlan?: string;
}

export interface Building {
  slug: string;
  name: string;
  location: string;
  metro: string;
  contact_name: string;
  contact_phone: string; // digits only, no +
  general_contact_name?: string;
  general_contact_phone?: string;
  maps?: string;
  heroImage?: string;
  gallery?: string[];
  units: Unit[];
}

export const SEED_BUILDINGS: Building[] = [
  {
    slug: "vandana-nivas",
    name: "Vandana Nivas",
    location: "West Marredpally, Secunderabad, Telangana",
    metro: "Parade Grounds Metro Station",
    contact_name: "Ashok",
    contact_phone: "919704244959",
    general_contact_name: "Laxminarayana",
    general_contact_phone: "919398850260",
    units: [
      {
        id: "vn-500",
        name: "VN 500 sft",
        area: 500,
        seats: 6,
        rent: 29990,
        bcm: 5000,
        status: "available",
        specs: {
          Workstations: "6 seater",
          "Manager Cabin": "1",
          Reception: "1",
          "Discussion Room": "1",
          Cafeteria: "1",
          Pantry: "1",
          Washroom: "1",
          "Optional Storage": "150 sft @ Rs.9000",
          GST: "18% ITC 100%",
          "Security Deposit": "6 months",
          Enhancement: "10% yearly",
          Lease: "5 yrs, 3 yr lock-in",
        },
      },
      {
        id: "vn-1200",
        name: "VN 1200 sft",
        area: 1200,
        seats: 20,
        rent: 59990,
        bcm: 6990,
        status: "available",
        specs: {
          Workstations: "20 seater",
          Conference: "8 seater",
          Cabin: "2 tables",
          Washrooms: "2",
          Pantry: "1",
          ACs: "1.5tr x3",
          Water: "24x7",
          Lift: "1",
          Parking: "10 bikes",
          GST: "18% B2B ITC",
          "Security Deposit": "6 months",
          Enhancement: "6% yearly",
          Lease: "5 yrs, 3 yr lock-in",
        },
      },
      {
        id: "vn-1650",
        name: "VN 1650 sft",
        area: 1650,
        seats: 31,
        rent: 99000,
        bcm: 9900,
        status: "available",
        specs: {
          Workstations: "31 seater",
          Conference: "10 seater",
          Cabin: "1 table",
          Washrooms: "2",
          Pantry: "1",
          ACs: "1.5tr x5",
          Water: "24x7",
          Lift: "1",
          Parking: "1 car + 10 bikes",
          GST: "18% B2B ITC",
          "Security Deposit": "6 months",
          Enhancement: "6% yearly",
          Lease: "5 yrs, 3 yr lock-in",
        },
      },
      {
        id: "vn-1800",
        name: "VN 1800 sft",
        area: 1800,
        seats: 31,
        rent: 108000,
        bcm: 10800,
        status: "available",
        specs: {
          Area: "Office 1650 sft + Optional 150 sft",
          Workstations: "31 seater",
          Conference: "10 seater",
          Cabin: "1 table",
          Washrooms: "2",
          Pantry: "1",
          ACs: "1.5tr x5",
          Water: "24x7",
          Lift: "1",
          Parking: "1 car + 10 bikes",
          GST: "18% B2B ITC",
          "Security Deposit": "6 months",
          Enhancement: "6% yearly",
          Lease: "5 yrs, 3 yr lock-in",
        },
      },
    ],
  },
  {
    slug: "gowra-klassic",
    name: "Gowra Klassic",
    location: "Behind Shoppers Stop, Begumpet, Telangana",
    metro: "Prakash Nagar Metro Station",
    contact_name: "Arun",
    contact_phone: "918179347109",
    maps: "https://maps.app.goo.gl/Hpwx9XSEQunKXsbM9",
    units: [
      {
        id: "gk-1500",
        name: "GK 5th Floor 1500 sft",
        area: 1500,
        seats: 30,
        rent: 89990,
        bcm: 9000,
        status: "available",
        specs: {
          Workstations: "24 nos",
          "Team Leaders": "3 nos",
          "Manager Cabin": "1",
          "Discussion Room": "6 seater",
          "Server Space": "1",
          "UPS Space": "1",
          Pantry: "1",
          Washroom: "1",
          Lift: "1",
          Parking: "12 bikes + 1 car",
          "DG Power": "Rs.9000/mo",
          GST: "18% B2B Invoice",
          "Security Deposit": "6 months",
          Enhancement: "6% yearly",
          Lease: "10 yrs, Lock-in 6 yrs",
        },
      },
    ],
  },
  {
    slug: "prakash-towers",
    name: "Prakash Towers",
    location: "Begumpet, Hyderabad, Telangana",
    metro: "Prakash Nagar Metro Station",
    contact_name: "Arun",
    contact_phone: "918179347109",
    units: [
      {
        id: "pt-1200",
        name: "PT 5th Floor 1200 sft",
        area: 1200,
        seats: 20,
        rent: 79990,
        bcm: 9600,
        status: "available",
        specs: {
          Workstations: "20 seater",
          Conference: "8 seater",
          Cabin: "1 table",
          Washrooms: "2",
          Pantry: "1",
          ACs: "3tr x2",
          Water: "24x7",
          Staircase: "1",
          Lift: "1",
          Parking: "1 car + 10 bikes",
          GST: "18% B2B ITC",
          "Security Deposit": "6 months",
          Enhancement: "6% yearly",
          Lease: "5 yrs, 3 yr lock-in",
        },
      },
    ],
  },
];
