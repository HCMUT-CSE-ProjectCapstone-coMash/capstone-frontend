export const DefaultPageRoute = "/";

// Auth routes
export const LoginPageRoute = "/dang-nhap";

// Role base routes
export const EmployeeBaseRoute = "/nhan-vien";
export const OwnerBaseRoute = "/chu-cua-hang";

// Employee routes
export const EmployeeHomePageRoute = EmployeeBaseRoute;
export const EmployeeProductPageRoute = `${EmployeeBaseRoute}/san-pham`;
export const EmployeeImportPageRoute = `${EmployeeBaseRoute}/nhap-hang`;
export const EmployeeSellPageRoute = `${EmployeeBaseRoute}/ban-hang`;
export const EmployeeSalePageRoute = `${EmployeeBaseRoute}/khuyen-mai`;
export const EmployeeOrderPageRoute = `${EmployeeBaseRoute}/don-hang`;

// Owner routes
export const OwnerHomePageRoute = OwnerBaseRoute;
export const OwnerProductPageRoute = `${OwnerBaseRoute}/san-pham`;
export const OwnerImportPageRoute = `${OwnerBaseRoute}/nhap-hang`;
export const OwnerSellPageRoute = `${OwnerBaseRoute}/ban-hang`;
export const OwnerSalePageRoute = `${OwnerBaseRoute}/khuyen-mai`;
export const OwnerOrderPageRoute = `${OwnerBaseRoute}/don-hang`;