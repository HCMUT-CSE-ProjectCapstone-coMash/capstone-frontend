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
export const OwnerProductsOrderPageRoute = `${OwnerBaseRoute}/san-pham/cho-duyet`;
export const OwnerProductsInProductsOrderPageRoute = (productsOrdersId: string) => 
    `${OwnerBaseRoute}/san-pham/cho-duyet/chi-tiet/${productsOrdersId}`;

export const OwnerEmployeeManagementPageRoute = `${OwnerBaseRoute}/quan-ly-nhan-vien`;
export const OwnerEmployeeByIdPageRoute = (employeeId: string) => 
    `${OwnerEmployeeManagementPageRoute}/chi-tiet/${employeeId}`;
export const OwnerAddEmployeePageRoute = `${OwnerEmployeeManagementPageRoute}/them-nhan-vien`;
export const OwnerImportPageRoute = `${OwnerBaseRoute}/nhap-hang`;
export const OwnerSellPageRoute = `${OwnerBaseRoute}/ban-hang`;
export const OwnerSalePageRoute = `${OwnerBaseRoute}/khuyen-mai`;
export const OwnerOrderPageRoute = `${OwnerBaseRoute}/don-hang`;
export const OwnerCustomerPageRoute = `${OwnerBaseRoute}/khach-hang`;
export const OwnerCustomerByIdPageRoute = (customerId: string) => 
    `${OwnerCustomerPageRoute}/chi-tiet/${customerId}`;