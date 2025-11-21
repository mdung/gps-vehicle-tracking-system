export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone?: string;
  email?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverRequest {
  name: string;
  licenseNumber: string;
  phone?: string;
  email?: string;
  status?: string;
}



