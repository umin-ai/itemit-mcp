interface AlertFeature {
  properties: {
    event?: string;
    areaDesc?: string;
    severity?: string;
    status?: string;
    headline?: string;
  };
}

interface ForecastPeriod {
  name?: string;
  temperature?: number;
  temperatureUnit?: string;
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
}

interface AlertsResponse {
  features: AlertFeature[];
}

interface PointsResponse {
  properties: {
    forecast?: string;
  };
}

interface ForecastResponse {
  properties: {
    periods: ForecastPeriod[];
  };
}

interface ItemitResponse {
  result: any[],
  total: number,
}

interface ILocation {
  attachments: {
    results: any[];
    total: number;
  };
  _commentCount: number;
  comments: {
    results: any[];
    total: number;
  };
  _fileCount: number;
  information: {
    results: any[];
    total: number;
  };
  _informationCount: number;
  _issueCount: number;
  issues: {
    results: any[];
    total: number;
  };
  _itemCount: number;
  items: {
    results: ITEM[];
    total: number;
  };
  _locationCount: number;
  locations: {
    results: any[];
    total: number;
  };
  photos: {
    results: any[];
    total: number;
  };
  _reminderCount: number;
  reminders: {
    results: any[];
    total: number;
  };
  _tagCount: number;
  tags: {
    results: any[];
    total: number;
  };
  colour: string;
  created: {
    at: {
      timestamp: string;
    };
    by: {
      id: string;
      name: string;
      type: string;
    };
  };
  createdAt: string;
  createdBy: string;
  id: string;
  name: string;
  type: string;
  workspace: string;
}

interface ITEM {
  attachments: {
    results: any[];
    total: number;
  };
  _bookingCount: number;
  bookings: {
    results: any[];
    total: number;
  };
  _collectionCount: number;
  collections: {
    results: any[];
    total: number;
  };
  _commentCount: number;
  comments: {
    results: any[];
    total: number;
  };
  _fileCount: number;
  information: {
    results: any[];
    total: number;
  };
  _informationCount: number;
  _issueCount: number;
  issues: {
    results: any[];
    total: number;
  };
  _itemCount: number;
  items: {
    results: any[];
    total: number;
  };
  location: {
    created: {
      at: {
        timestamp: string;
      };
      by: {
        id: string;
        name: string;
        type: string;
      };
    };
    createdAt: string;
    createdBy: string;
    workspace: string;
    colour: string;
    id: string;
    name: string;
    type: string;
  };
  photos: {
    results: any[];
    total: number;
  };
  _reminderCount: number;
  reminders: {
    results: any[];
    total: number;
  };
  _tagCount: number;
  tags: {
    results: any[];
    total: number;
  };
  archived: boolean;
  created: {
    at: {
      timestamp: string;
    };
    by: {
      id: string;
      name: string;
      type: string;
    };
  };
  createdAt: string;
  createdBy: string;
  description: string;
  id: string;
  name: string;
  serial: string;
  type: string;
  workspace: string;
}

export {
    AlertFeature,
    ForecastPeriod,
    AlertsResponse,
    PointsResponse,
    ForecastResponse,
    ItemitResponse,
    ITEM,
    ILocation,
}
