export type CreatedListBanner =
  | {
      kind: "asset";
      id: string;
      name: string;
      size: number;
      type: string;
    }
  | {
      kind: "path";
      src: string;
    };

export type CreatedListAdditionalDetail = {
  label: string;
  value: string;
};

export type CreatedListItem = {
  active: boolean;
  additionalDetails: CreatedListAdditionalDetail[];
  banner: CreatedListBanner | null;
  country: string;
  createdAt: string;
  description: string;
  fundingTarget: string;
  id: string;
  keyword: string;
  sector: string;
  stage: string;
  title: string;
  viewCount?: number;
};

const CREATED_LISTS_STORAGE_KEY = "earlyn.dashboard.createdLists";
const CREATED_LISTS_DB_NAME = "earlyn-created-lists";
const CREATED_LISTS_STORE_NAME = "banner-assets";
const MAX_CREATED_LISTS = 5;
const MAX_ACTIVE_CREATED_LISTS = 3;

const seededCreatedLists: CreatedListItem[] = [
  {
    id: "created-carbonledger",
    title: "CarbonLedger AI Project for windmill",
    country: "United Kingdom",
    stage: "Series A",
    sector: "Climate Tech",
    fundingTarget: "£4.0M",
    keyword: "carbon analytics",
    description:
      "AI-powered carbon accounting for SMEs with investor-ready reporting, automated emissions workflows, and audit-friendly summaries.",
    createdAt: "2026-04-22T08:00:00.000Z",
    active: true,
    banner: { kind: "path", src: "/howitwork.png" },
    additionalDetails: [
      { label: "Asking Price", value: "$45,000" },
      { label: "Region", value: "United Kingdom" },
      { label: "Revenue Model", value: "Subscription" },
    ],
  },
  {
    id: "created-solarroot",
    title: "SolarRoot Systems Grid Financing Suite",
    country: "United Kingdom",
    stage: "Seed",
    sector: "Clean Energy",
    fundingTarget: "£2.5M",
    keyword: "solar financing",
    description:
      "Distributed solar infrastructure financing platform for industrial estates with visibility, performance tracking, and blended capital workflows.",
    createdAt: "2026-04-23T08:00:00.000Z",
    active: true,
    banner: { kind: "path", src: "/howitwork.png" },
    additionalDetails: [
      { label: "Deployment Stage", value: "Pilot" },
      { label: "Revenue Model", value: "Subscription + Success Fees" },
      { label: "Investor Access", value: "Open" },
    ],
  },
  {
    id: "created-harvest-loop",
    title: "Harvest Loop Climate Supply Network",
    country: "Kenya",
    stage: "Seed",
    sector: "Sustainable Agriculture",
    fundingTarget: "£1.8M",
    keyword: "climate supply chain",
    description:
      "Climate-smart supply network connecting growers and buyers with traceability, logistics coordination, and fair-value market access.",
    createdAt: "2026-04-24T08:00:00.000Z",
    active: true,
    banner: { kind: "path", src: "/howitwork.png" },
    additionalDetails: [
      { label: "Primary Users", value: "Growers & Buyers" },
      { label: "Model", value: "B2B Marketplace" },
      { label: "Pilot Status", value: "Live" },
    ],
  },
];

function openCreatedListsDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(CREATED_LISTS_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(CREATED_LISTS_STORE_NAME)) {
        db.createObjectStore(CREATED_LISTS_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function isCreatedListBanner(value: unknown): value is CreatedListBanner {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  if (candidate.kind === "path") {
    return typeof candidate.src === "string";
  }

  return (
    candidate.kind === "asset" &&
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.size === "number"
  );
}

function isCreatedListAdditionalDetail(value: unknown): value is CreatedListAdditionalDetail {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.label === "string" && typeof candidate.value === "string";
}

function hydrateCreatedList(raw: unknown): CreatedListItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const source = raw as Record<string, unknown>;

  if (
    typeof source.id !== "string" ||
    typeof source.title !== "string" ||
    typeof source.country !== "string" ||
    typeof source.stage !== "string" ||
    typeof source.sector !== "string" ||
    typeof source.fundingTarget !== "string" ||
    typeof source.keyword !== "string" ||
    typeof source.description !== "string" ||
    typeof source.createdAt !== "string" ||
    typeof source.active !== "boolean"
  ) {
    return null;
  }

  const additionalDetails = Array.isArray(source.additionalDetails)
    ? source.additionalDetails.filter(isCreatedListAdditionalDetail)
    : [];

  return {
    id: source.id,
    title: source.title,
    country: source.country,
    stage: source.stage,
    sector: source.sector,
    fundingTarget: source.fundingTarget,
    keyword: source.keyword,
    description: source.description,
    createdAt: source.createdAt,
    active: source.active,
    additionalDetails,
    banner: isCreatedListBanner(source.banner) ? source.banner : null,
  };
}

function sortCreatedLists(items: CreatedListItem[]) {
  return [...items].sort((a, b) => {
    const first = Date.parse(b.createdAt);
    const second = Date.parse(a.createdAt);

    if (Number.isNaN(first) || Number.isNaN(second)) {
      return 0;
    }

    return first - second;
  });
}

function normalizeActiveState(items: CreatedListItem[]) {
  let activeCount = 0;

  return items.map((item) => {
    if (item.active && activeCount < MAX_ACTIVE_CREATED_LISTS) {
      activeCount += 1;
      return item;
    }

    return {
      ...item,
      active: false,
    };
  });
}

export function getMaxCreatedLists() {
  return MAX_CREATED_LISTS;
}

export function getMaxActiveCreatedLists() {
  return MAX_ACTIVE_CREATED_LISTS;
}

export function loadCreatedLists() {
  if (typeof window === "undefined") {
    return seededCreatedLists;
  }

  const stored = window.localStorage.getItem(CREATED_LISTS_STORAGE_KEY);

  if (!stored) {
    persistCreatedLists(seededCreatedLists);
    return seededCreatedLists;
  }

  try {
    const parsed = JSON.parse(stored);
    const items = Array.isArray(parsed) ? parsed.map(hydrateCreatedList).filter(Boolean) as CreatedListItem[] : [];

    if (!items.length) {
      persistCreatedLists(seededCreatedLists);
      return seededCreatedLists;
    }

    return normalizeActiveState(sortCreatedLists(items));
  } catch {
    persistCreatedLists(seededCreatedLists);
    return seededCreatedLists;
  }
}

export function persistCreatedLists(items: CreatedListItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = normalizeActiveState(sortCreatedLists(items)).slice(0, MAX_CREATED_LISTS);
  window.localStorage.setItem(CREATED_LISTS_STORAGE_KEY, JSON.stringify(normalized));
}

export function createCreatedListId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `created-list-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createCreatedListBannerId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `created-list-banner-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function saveCreatedListBanner(file: File) {
  const id = createCreatedListBannerId();
  const db = await openCreatedListsDb();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(CREATED_LISTS_STORE_NAME, "readwrite");
    const store = transaction.objectStore(CREATED_LISTS_STORE_NAME);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    store.put(file, id);
  });

  return {
    kind: "asset" as const,
    id,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
  };
}

export async function getCreatedListBannerBlob(id: string) {
  const db = await openCreatedListsDb();

  return new Promise<Blob | null>((resolve, reject) => {
    const transaction = db.transaction(CREATED_LISTS_STORE_NAME, "readonly");
    const store = transaction.objectStore(CREATED_LISTS_STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      db.close();
      resolve(request.result instanceof Blob ? request.result : null);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function deleteCreatedListBanner(banner: CreatedListBanner | null) {
  if (!banner || banner.kind !== "asset") {
    return;
  }

  const db = await openCreatedListsDb();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(CREATED_LISTS_STORE_NAME, "readwrite");
    const store = transaction.objectStore(CREATED_LISTS_STORE_NAME);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    store.delete(banner.id);
  });
}
