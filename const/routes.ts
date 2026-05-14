export const DefaultPageRoute = "/";

// Auth routes
export const LoginPageRoute = "/dang-nhap";
export const ChangePasswordPageRoute = "/doi-mat-khau";

// Role base routes
export const EmployeeBaseRoute = "/nhan-vien";
export const OwnerBaseRoute = "/chu-cua-hang";

// Employee routes
export const EmployeeHomePageRoute = EmployeeBaseRoute;

// Link sản phẩm ----------------------------------------------

export const EmployeeProductPageRoute = `${EmployeeBaseRoute}/san-pham`;

// Link nhập hàng ----------------------------------------------

export const EmployeeImportPageRoute = `${EmployeeBaseRoute}/nhap-hang`;

// Link bán hàng ----------------------------------------------

export const EmployeeSellPageRoute = `${EmployeeBaseRoute}/ban-hang`;
export const EmployeeExchangePageRoute = (saleOrderId: string) => `${EmployeeSellPageRoute}/doi-hang/${saleOrderId}`;

// Link khuyến mãi ----------------------------------------------

export const EmployeeSalePageRoute = `${EmployeeBaseRoute}/khuyen-mai`;
export const EmployeeSaleByIdPageRoute = (promotionId: string) => `${EmployeeSalePageRoute}/chi-tiet/${promotionId}`;

// Link đơn hàng ----------------------------------------------

export const EmployeeOrderPageRoute = `${EmployeeBaseRoute}/don-hang`;
export const EmployeeSaleOrdersByIdPageRoute = (promotionId: string) => `${EmployeeOrderPageRoute}/chi-tiet/${promotionId}`;

export const EmployeeCustomerPageRoute = `${EmployeeBaseRoute}/khach-hang`;
export const EmployeeCustomerByIdPageRoute = (customerId: string) => `${EmployeeCustomerPageRoute}/chi-tiet/${customerId}`;
export const EmployeeCustomerSaleOrderPageRoute = (customerId: string, saleOrderId: string) => `${EmployeeCustomerByIdPageRoute(customerId)}/don-hang/${saleOrderId}`;


// Owner routes
export const OwnerHomePageRoute = OwnerBaseRoute;

// Link sản phẩm ----------------------------------------------
export const OwnerProductPageRoute = `${OwnerBaseRoute}/san-pham`;

export const OwnerProductsOrderPageRoute = `${OwnerBaseRoute}/san-pham/cho-duyet`;

export const OwnerProductsInProductsOrderPageRoute = (productsOrdersId: string) => 
    `${OwnerBaseRoute}/san-pham/cho-duyet/chi-tiet/${productsOrdersId}`;

export const OwnerProductsOrderHistoryPageRoute = (productsOrdersId: string) => 
    `${OwnerBaseRoute}/san-pham/cho-duyet/lich-su/${productsOrdersId}`;

// Link nhân viên ----------------------------------------------

export const OwnerEmployeeManagementPageRoute = `${OwnerBaseRoute}/quan-ly-nhan-vien`;

export const OwnerEmployeeByIdPageRoute = (employeeId: string) => 
    `${OwnerEmployeeManagementPageRoute}/chi-tiet/${employeeId}`;

export const OwnerAddEmployeePageRoute = `${OwnerEmployeeManagementPageRoute}/them-nhan-vien`;

export const OwerEmployeeSaleOrderDetail = (employeeId: string, saleorderId: string) => 
    `${OwnerEmployeeByIdPageRoute(employeeId)}/don-hang/${saleorderId}`;

// Link khách hàng ----------------------------------------------

export const OwnerCustomerPageRoute = `${OwnerBaseRoute}/khach-hang`;
export const OwnerCustomerByIdPageRoute = (customerId: string) => `${OwnerCustomerPageRoute}/chi-tiet/${customerId}`;
export const OwnerCustomerSaleOrderPageRoute = (customerId: string, saleOrderId: string) => `${OwnerCustomerByIdPageRoute(customerId)}/don-hang/${saleOrderId}`;

// Link bán hàng ----------------------------------------------

export const OwnerSellPageRoute = `${OwnerBaseRoute}/ban-hang`;
export const OwnerExchangePageRoute = (saleOrderId: string) => `${OwnerSellPageRoute}/doi-hang/${saleOrderId}`;

// Link nhập hàng ----------------------------------------------

export const OwnerImportPageRoute = `${OwnerBaseRoute}/nhap-hang`;

// Link khuyến mãi ----------------------------------------------

export const OwnerSalePageRoute = `${OwnerBaseRoute}/khuyen-mai`;
export const OwnerCreateSalePageRoute = `${OwnerSalePageRoute}/tao-khuyen-mai`;
export const OwnerSaleByIdPageRoute = (promotionId: string) => `${OwnerSalePageRoute}/chi-tiet/${promotionId}`;

// Link đơn hàng ----------------------------------------------

export const OwnerOrderPageRoute = `${OwnerBaseRoute}/don-hang`;
export const OwnerSaleOrdersByIdPageRoute = (saleOrderId: string) => `${OwnerOrderPageRoute}/chi-tiet/${saleOrderId}`;
